import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { cn } from '@/lib/utils';
import { cardPreset, inputPreset } from '@/lib/designTokens';

import { useEventService, CsvImportResult } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';

import { LoadingButton } from '@/components/LoadingButton';
import { CsvImportPreview } from '@/components/events/CsvImportPreview';
import { CsvImportResults } from '@/components/events/CsvImportResults';

import { motion, AnimatePresence } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';

import { ArrowLeft, Upload, FileSpreadsheet, XCircle, Info, X, Download } from 'lucide-react';
import { toast } from 'sonner';
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

/**
 * CsvEventImport - Seite zum Importieren von Events aus CSV-Dateien
 */
export const CsvEventImport: React.FC = () => {
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
        <motion.div
          className={cn(cardPreset, 'p-4 sm:p-6 mb-6')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <LoadingButton variant="ghost" size="icon" onClick={() => navigate('/events')}>
              <ArrowLeft className="h-5 w-5" />
            </LoadingButton>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">CSV Event Import</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Importiere mehrere Events gleichzeitig aus einer CSV-Datei
              </p>
            </div>
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => setShowFormatInfo(!showFormatInfo)}
              className={cn(inputPreset)}
            >
              <Info className="h-4 w-4 mr-2" />
              CSV-Format
            </LoadingButton>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFormatInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={defaultTransition}
              className="mb-6 overflow-hidden"
            >
              <Card className={cn(cardPreset)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      CSV-Format Spezifikation
                    </CardTitle>
                    <LoadingButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFormatInfo(false)}
                    >
                      <X className="h-4 w-4" />
                    </LoadingButton>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Die CSV-Datei muss folgende Spalten als Header-Zeile enthalten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-secondary">
                          <th className="text-left py-2 pr-4 text-foreground font-semibold">
                            Spalte
                          </th>
                          <th className="text-left py-2 pr-4 text-foreground font-semibold">
                            Pflicht
                          </th>
                          <th className="text-left py-2 text-foreground font-semibold">
                            Format / Beispiel
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {CSV_COLUMNS.map(col => (
                          <tr key={col.name} className="border-b border-secondary/50">
                            <td className="py-2 pr-4 text-foreground font-medium">{col.name}</td>
                            <td className="py-2 pr-4">
                              {col.required ? (
                                <Badge variant="default" className="bg-red-600 text-white text-xs">
                                  Ja
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Nein
                                </Badge>
                              )}
                            </td>
                            <td className="py-2 text-muted-foreground text-xs sm:text-sm">
                              {col.format}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <LoadingButton
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      className={cn(inputPreset)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Beispiel-CSV herunterladen
                    </LoadingButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {showUploadCard && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(cardPreset, 'mb-6')}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CSV-Datei hochladen
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Wähle eine CSV-Datei aus oder ziehe sie hierher (max. 5 MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 sm:p-10 text-center transition-all duration-300 cursor-pointer',
                    isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary hover:border-secondary/80',
                    selectedFile && !fileError && 'border-green-500/50 bg-green-500/5'
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {selectedFile && !fileError ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileSpreadsheet className="h-12 w-12 text-green-500" />
                      <div>
                        <p className="text-foreground font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <LoadingButton
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Datei entfernen
                      </LoadingButton>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-foreground font-medium">CSV-Datei hierher ziehen</p>
                        <p className="text-sm text-muted-foreground">oder klicken zum Auswählen</p>
                      </div>
                    </div>
                  )}
                </div>

                {fileError && (
                  <Alert variant="destructive" className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="enable-preview"
                      checked={enablePreview}
                      onCheckedChange={handlePreviewToggle}
                      disabled={uploading}
                    />
                    <Label
                      htmlFor="enable-preview"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Vorschau vor Import
                    </Label>
                  </div>

                  {!enablePreview && (
                    <LoadingButton
                      onClick={handleUpload}
                      disabled={!selectedFile || !!fileError || uploading}
                      isLoading={uploading}
                      loadingText="Importiere..."
                      size="lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Events importieren
                    </LoadingButton>
                  )}

                  {enablePreview && selectedFile && step === 'upload' && (
                    <LoadingButton
                      onClick={() => void loadPreview(selectedFile)}
                      disabled={!!fileError || parsing || uploading}
                      isLoading={parsing}
                      loadingText="Lade Vorschau..."
                      size="lg"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Vorschau anzeigen
                    </LoadingButton>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showPreview && (
          <CsvImportPreview
            rows={parsedRows}
            selectedRowIndices={selectedRowIndices}
            onToggleRow={handleToggleRow}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBack={handleBackFromPreview}
            onImport={handleUpload}
            uploading={uploading}
          />
        )}

        {step === 'importing' && uploading && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset, 'mb-6')}>
              <CardHeader>
                <Skeleton className="bg-muted h-6 w-48 rounded" />
                <Skeleton className="bg-muted h-4 w-64 mt-2 rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="bg-muted h-24 rounded-lg" />
                  ))}
                </div>
                <div className="space-y-3 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="bg-muted h-14 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {showResults && (
            <CsvImportResults
              importResult={importResult}
              importedEvents={importedEvents}
              categories={categories}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
