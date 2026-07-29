import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useEventService, CsvImportResult } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { showUserFriendlyError } from '@/utils/errorUtils';
import {
  CSV_COLUMNS,
  CsvEventRow,
  CsvParseError,
  parseCsvFile,
  buildCsvFile,
} from '@/utils/csvEventParser';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type ImportStep = 'upload' | 'preview' | 'importing' | 'results';

export function useCsvEventImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [importedEvents, setImportedEvents] = useState<Map<string, Event>>(new Map());
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [enablePreview, setEnablePreview] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [parsedRows, setParsedRows] = useState<CsvEventRow[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [parsing, setParsing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const loadedCategories = await eventCategoryService.getCategories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetImportState = useCallback(() => {
    setImportResult(null);
    setImportedEvents(new Map());
    setParsedRows([]);
    setSelectedRowIndices(new Set());
    setStep('upload');
  }, []);

  const validateFile = useCallback((file: File): string => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Ungültiger Dateityp. Nur CSV-Dateien (.csv) sind erlaubt.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Die Datei ist zu groß (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximale Größe: 5 MB.`;
    }
    return '';
  }, []);

  const loadPreview = useCallback(async (file: File) => {
    setParsing(true);
    setFileError('');
    try {
      const rows = await parseCsvFile(file);
      setParsedRows(rows);
      setSelectedRowIndices(new Set(rows.map(row => row.rowIndex)));
      setStep('preview');
    } catch (parseError) {
      const message =
        parseError instanceof CsvParseError
          ? parseError.message
          : 'Die CSV-Datei konnte nicht gelesen werden.';
      setFileError(message);
      toast.error('CSV-Fehler', { description: message });
    } finally {
      setParsing(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      setFileError(error);
      if (error) {
        setSelectedFile(null);
        resetImportState();
        return;
      }

      setSelectedFile(file);
      resetImportState();

      if (enablePreview) {
        await loadPreview(file);
      }
    },
    [validateFile, enablePreview, resetImportState, loadPreview]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        void handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileError('');
    resetImportState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetImportState]);

  const handleBackFromPreview = useCallback(() => {
    handleRemoveFile();
  }, [handleRemoveFile]);

  const handleToggleRow = useCallback((rowIndex: number) => {
    setSelectedRowIndices(prev => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedRowIndices(new Set(parsedRows.map(row => row.rowIndex)));
  }, [parsedRows]);

  const handleDeselectAll = useCallback(() => {
    setSelectedRowIndices(new Set());
  }, []);

  const loadImportedEvents = useCallback(
    async (result: CsvImportResult) => {
      const eventsMap = new Map<string, Event>();
      const eventIdsToLoad: string[] = [];

      for (const row of result.results) {
        if (row.success && row.eventId) {
          eventIdsToLoad.push(row.eventId);
        }
        if (row.skipped && row.duplicateEventId) {
          eventIdsToLoad.push(row.duplicateEventId);
        }
      }

      const loadPromises = eventIdsToLoad.map(async eventId => {
        try {
          const event = await eventService.getEvent(eventId);
          eventsMap.set(eventId, event);
        } catch (error) {
          console.error(`Fehler beim Laden des Events ${eventId}:`, error);
        }
      });

      await Promise.all(loadPromises);
      setImportedEvents(eventsMap);
    },
    [eventService]
  );

  const showImportToasts = useCallback((result: CsvImportResult) => {
    if (result.successful > 0 && result.failed === 0) {
      toast.success('Import erfolgreich', {
        description: `${result.successful} von ${result.totalRows} Events wurden erstellt.${result.skipped > 0 ? ` ${result.skipped} Duplikate übersprungen.` : ''}`,
      });
    } else if (result.successful > 0) {
      toast.warning('Import teilweise erfolgreich', {
        description: `${result.successful} erstellt, ${result.failed} fehlgeschlagen, ${result.skipped} übersprungen.`,
      });
    } else if (result.totalRows > 0) {
      toast.error('Import fehlgeschlagen', {
        description: `Keine Events konnten erstellt werden. ${result.failed} fehlgeschlagen, ${result.skipped} Duplikate.`,
      });
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    if (enablePreview && selectedRowIndices.size === 0) {
      toast.error('Keine Auswahl', {
        description: 'Bitte wähle mindestens ein Event zum Importieren aus.',
      });
      return;
    }

    try {
      setUploading(true);
      setStep('importing');
      setImportResult(null);
      setImportedEvents(new Map());

      const fileToUpload =
        enablePreview && parsedRows.length > 0
          ? buildCsvFile(
              parsedRows.filter(row => selectedRowIndices.has(row.rowIndex)),
              selectedFile.name
            )
          : selectedFile;

      const result = await eventService.importEventsFromCsv(fileToUpload);

      const safeResult: CsvImportResult = {
        totalRows: result.totalRows || 0,
        successful: result.successful || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        results: Array.isArray(result.results) ? result.results : [],
      };

      setImportResult(safeResult);
      await loadImportedEvents(safeResult);
      showImportToasts(safeResult);
      setStep('results');
    } catch (error) {
      setStep(enablePreview ? 'preview' : 'upload');
      showUserFriendlyError(error, toast, () => handleUpload(), 'save-event');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = useCallback(() => {
    const header = CSV_COLUMNS.map(c => c.name).join(',');
    const exampleRow = [
      'Konzert im Park',
      'Ein tolles Open-Air-Konzert',
      '2026-03-15',
      '2026-03-15',
      '19:00',
      '22:00',
      'Stadtpark Nürnberg',
      'Musik',
      '15',
      'ja',
      'info@konzert.de',
      '+49 911 123456',
      'https://www.konzert.de',
      '',
      '',
      'https://www.konzert.de/event/1',
    ].join(',');

    const csvContent = `${header}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events-vorlage.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handlePreviewToggle = useCallback(
    (checked: boolean) => {
      setEnablePreview(checked);
      if (!checked && step === 'preview') {
        setStep('upload');
        setParsedRows([]);
        setSelectedRowIndices(new Set());
        return;
      }
      if (checked && selectedFile) {
        void loadPreview(selectedFile);
      }
    },
    [step, selectedFile, loadPreview]
  );

  const showUploadCard = step === 'upload';
  const showPreview = step === 'preview' && enablePreview && parsedRows.length > 0;
  const showResults = step === 'results' && importResult && !uploading;

  return {
    navigate,
    selectedFile,
    fileError,
    uploading,
    importResult,
    isDragOver,
    showFormatInfo,
    setShowFormatInfo,
    importedEvents,
    categories,
    enablePreview,
    step,
    parsedRows,
    selectedRowIndices,
    parsing,
    fileInputRef,
    showUploadCard,
    showPreview,
    showResults,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    handleBackFromPreview,
    handleToggleRow,
    handleSelectAll,
    handleDeselectAll,
    handleUpload,
    handleDownloadTemplate,
    handlePreviewToggle,
    loadPreview,
    CSV_COLUMNS,
  };
}
