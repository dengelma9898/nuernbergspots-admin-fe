import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { glassCard, glassInput } from '@/lib/glassmorphism';

import {
  useEventService,
  CsvImportResult,
  CsvImportRowResult,
} from '@/services/eventService';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';

import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, defaultTransition } from '@/lib/animations';

import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Download,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const CSV_COLUMNS = [
  { name: 'Titel', required: true, format: 'Freitext' },
  { name: 'Beschreibung', required: false, format: 'Freitext' },
  { name: 'Startdatum', required: true, format: 'YYYY-MM-DD (z.B. 2026-02-09)' },
  { name: 'Enddatum', required: false, format: 'YYYY-MM-DD (wenn leer = Startdatum)' },
  { name: 'Startzeit', required: false, format: 'HH:mm (z.B. 19:45)' },
  { name: 'Endzeit', required: false, format: 'HH:mm (z.B. 22:00)' },
  { name: 'Veranstaltungsort', required: false, format: 'Freitext' },
  { name: 'Kategorien', required: false, format: 'Freitext (automatisches Mapping)' },
  { name: 'Preis', required: false, format: 'Kostenlos, 15, ab 10,00€' },
  { name: 'Tickets', required: false, format: 'ja / nein' },
  { name: 'E-Mail', required: false, format: 'Gültige E-Mail-Adresse' },
  { name: 'Telefon', required: false, format: 'Telefonnummer' },
  { name: 'Webseite', required: false, format: 'URL' },
  { name: 'Social Media', required: false, format: 'URL' },
  { name: 'Bild-URL', required: false, format: 'URL (wird aktuell nicht verarbeitet)' },
  { name: 'Detail-URL', required: false, format: 'URL (Webseite-Fallback)' },
];

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
  const [eventTitles, setEventTitles] = useState<Map<string, string>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const eventService = useEventService();

  /**
   * Validiert die ausgewählte Datei
   */
  const validateFile = useCallback((file: File): string => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Ungültiger Dateityp. Nur CSV-Dateien (.csv) sind erlaubt.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Die Datei ist zu groß (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximale Größe: 5 MB.`;
    }
    return '';
  }, []);

  /**
   * Verarbeitet die Dateiauswahl
   */
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    setFileError(error);
    setSelectedFile(error ? null : file);
    setImportResult(null);
    setEventTitles(new Map());
  }, [validateFile]);

  /**
   * File-Input Change Handler
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Drag & Drop Handlers
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Datei entfernen
   */
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileError('');
    setImportResult(null);
    setEventTitles(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Extrahiert den Event-Titel aus einer Fehlermeldung
   */
  const extractTitleFromError = useCallback((row: CsvImportRowResult): string | null => {
    if (row.errors && Array.isArray(row.errors) && row.errors.length > 0) {
      // Suche nach Titel in Fehlermeldungen
      for (const err of row.errors) {
        if (err.field === 'Titel' && err.value) {
          return String(err.value);
        }
        // Versuche Titel aus Fehlermeldung zu extrahieren (z.B. "Event mit Titel 'XYZ'")
        const titleMatch = err.message.match(/Titel ['"]([^'"]+)['"]/i);
        if (titleMatch) {
          return titleMatch[1];
        }
      }
    }
    return null;
  }, []);

  /**
   * Lädt Event-Titel für erfolgreiche und übersprungene Events
   */
  const loadEventTitles = useCallback(async (result: CsvImportResult) => {
    const titlesMap = new Map<string, string>();
    const eventIdsToLoad: string[] = [];

    // Sammle alle Event-IDs, die geladen werden müssen
    for (const row of result.results) {
      if (row.success && row.eventId) {
        eventIdsToLoad.push(row.eventId);
      }
      if (row.skipped && row.duplicateEventId) {
        eventIdsToLoad.push(row.duplicateEventId);
      }
    }

    // Lade Events parallel
    const loadPromises = eventIdsToLoad.map(async (eventId) => {
      try {
        const event = await eventService.getEvent(eventId);
        titlesMap.set(eventId, event.title);
      } catch (error) {
        console.error(`Fehler beim Laden des Events ${eventId}:`, error);
        // Verwende ID als Fallback
        titlesMap.set(eventId, eventId);
      }
    });

    await Promise.all(loadPromises);
    setEventTitles(titlesMap);
  }, [eventService]);

  /**
   * CSV-Upload ausführen
   */
  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    try {
      setUploading(true);
      setImportResult(null);
      setEventTitles(new Map());

      const result = await eventService.importEventsFromCsv(selectedFile);
      
      // Stelle sicher, dass results immer ein Array ist
      const safeResult: CsvImportResult = {
        totalRows: result.totalRows || 0,
        successful: result.successful || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        results: Array.isArray(result.results) ? result.results : [],
      };

      setImportResult(safeResult);

      // Lade Event-Titel für erfolgreiche und übersprungene Events
      await loadEventTitles(safeResult);

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
    } catch (error) {
      showUserFriendlyError(error, toast, () => handleUpload(), 'save-event');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Beispiel-CSV herunterladen
   */
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

  /**
   * Ergebnis-Badge für eine Zeile
   */
  const getRowBadge = (row: CsvImportRowResult) => {
    if (row.success) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Erstellt
        </Badge>
      );
    }
    if (row.skipped) {
      return (
        <Badge variant="secondary" className="bg-yellow-600 text-white">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Duplikat
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Fehler
      </Badge>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-4 sm:p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/events')}
              >
                <ArrowLeft className="h-5 w-5" />
              </AnimatedButton>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  CSV Event Import
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Importiere mehrere Events gleichzeitig aus einer CSV-Datei
                </p>
              </div>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => setShowFormatInfo(!showFormatInfo)}
                className={cn(glassInput)}
              >
                <Info className="h-4 w-4 mr-2" />
                CSV-Format
              </AnimatedButton>
            </div>
          </motion.div>

          {/* CSV-Format Info */}
          <AnimatePresence>
            {showFormatInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={defaultTransition}
                className="mb-6 overflow-hidden"
              >
                <Card className={cn(glassCard)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        CSV-Format Spezifikation
                      </CardTitle>
                      <AnimatedButton
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFormatInfo(false)}
                      >
                        <X className="h-4 w-4" />
                      </AnimatedButton>
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
                            <th className="text-left py-2 pr-4 text-foreground font-semibold">Spalte</th>
                            <th className="text-left py-2 pr-4 text-foreground font-semibold">Pflicht</th>
                            <th className="text-left py-2 text-foreground font-semibold">Format / Beispiel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CSV_COLUMNS.map((col) => (
                            <tr key={col.name} className="border-b border-secondary/50">
                              <td className="py-2 pr-4 text-foreground font-medium">{col.name}</td>
                              <td className="py-2 pr-4">
                                {col.required ? (
                                  <Badge variant="default" className="bg-red-600 text-white text-xs">Ja</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Nein</Badge>
                                )}
                              </td>
                              <td className="py-2 text-muted-foreground text-xs sm:text-sm">{col.format}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className={cn(glassInput)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Beispiel-CSV herunterladen
                      </AnimatedButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload-Bereich */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(glassCard, 'mb-6')}>
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
                {/* Drag & Drop Zone */}
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
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Datei entfernen
                      </AnimatedButton>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-foreground font-medium">
                          CSV-Datei hierher ziehen
                        </p>
                        <p className="text-sm text-muted-foreground">
                          oder klicken zum Auswählen
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fehleranzeige */}
                {fileError && (
                  <Alert variant="destructive" className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}

                {/* Upload-Button */}
                <div className="mt-4 flex justify-end">
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Loading Skeleton */}
          {uploading && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'mb-6')}>
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

          {/* Import-Ergebnis */}
          <AnimatePresence>
            {importResult && !uploading && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={defaultTransition}
              >
                {/* Zusammenfassung */}
                <Card className={cn(glassCard, 'mb-6')}>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Import-Ergebnis
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {importResult.totalRows} Zeilen verarbeitet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {/* Erfolgreich */}
                      <motion.div variants={staggerItem}>
                        <Card className={cn(
                          'border transition-all duration-300',
                          importResult.successful > 0
                            ? 'border-green-500/50 bg-green-500/5'
                            : 'border-secondary'
                        )}>
                          <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/10">
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {importResult.successful}
                              </p>
                              <p className="text-sm text-muted-foreground">Erfolgreich</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Übersprungen */}
                      <motion.div variants={staggerItem}>
                        <Card className={cn(
                          'border transition-all duration-300',
                          importResult.skipped > 0
                            ? 'border-yellow-500/50 bg-yellow-500/5'
                            : 'border-secondary'
                        )}>
                          <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-500/10">
                              <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {importResult.skipped}
                              </p>
                              <p className="text-sm text-muted-foreground">Duplikate</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Fehlgeschlagen */}
                      <motion.div variants={staggerItem}>
                        <Card className={cn(
                          'border transition-all duration-300',
                          importResult.failed > 0
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-secondary'
                        )}>
                          <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/10">
                              <XCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {importResult.failed}
                              </p>
                              <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>

                {/* Detail-Ergebnis pro Zeile */}
                <Card className={cn(glassCard)}>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Details pro Zeile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!importResult.results || importResult.results.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Keine Ergebnisse verfügbar.
                      </p>
                    ) : (
                      <motion.div
                        className="space-y-2"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {[...importResult.results]
                          .sort((a, b) => {
                            // Erfolgreiche Events zuerst
                            if (a.success && !b.success) return -1;
                            if (!a.success && b.success) return 1;
                            // Dann Duplikate
                            if (a.skipped && !b.skipped) return -1;
                            if (!a.skipped && b.skipped) return 1;
                            // Ansonsten nach Zeilen-Index sortieren
                            return a.rowIndex - b.rowIndex;
                          })
                          .map((row) => {
                            // Extrahiere Titel für verschiedene Fälle
                            let eventTitle: string | null = null;
                            if (row.success && row.eventId) {
                              eventTitle = eventTitles.get(row.eventId) || null;
                            } else if (row.skipped && row.duplicateEventId) {
                              eventTitle = eventTitles.get(row.duplicateEventId) || null;
                            } else {
                              // Versuche Titel aus Fehlermeldungen zu extrahieren
                              eventTitle = extractTitleFromError(row);
                            }

                            return (
                              <motion.div
                                key={row.rowIndex}
                                variants={staggerItem}
                                className={cn(
                                  'flex flex-col gap-3 p-4 rounded-lg border transition-all duration-300',
                                  row.success && 'border-green-500/30 bg-green-500/5',
                                  row.skipped && 'border-yellow-500/30 bg-yellow-500/5',
                                  !row.success && !row.skipped && 'border-red-500/30 bg-red-500/5'
                                )}
                              >
                                {/* Header: Titel/Status & Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {eventTitle ? (
                                      <h3 className="text-base font-semibold text-foreground truncate">
                                        {eventTitle}
                                      </h3>
                                    ) : (
                                      <span className="text-sm text-muted-foreground italic">
                                        Titel nicht verfügbar
                                      </span>
                                    )}
                                    {getRowBadge(row)}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {row.success && row.eventId && (
                                      <AnimatedButton
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/events/${row.eventId}`)}
                                        className={cn(glassInput, 'gap-2')}
                                      >
                                        <Edit className="h-4 w-4" />
                                        Bearbeiten
                                      </AnimatedButton>
                                    )}
                                    {row.skipped && row.duplicateEventId && (
                                      <AnimatedButton
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/events/${row.duplicateEventId}`)}
                                        className={cn(glassInput, 'gap-2')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Zum Event
                                      </AnimatedButton>
                                    )}
                                  </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2">
                                  {row.skipped && row.errors && Array.isArray(row.errors) && row.errors.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                      {row.errors.map((err, errIdx) => (
                                        <div key={errIdx} className="mt-1">
                                          {err.message}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {!row.success && !row.skipped && row.errors && Array.isArray(row.errors) && row.errors.length > 0 && (
                                    <div className="space-y-1">
                                      {row.errors.map((err, errIdx) => (
                                        <p key={errIdx} className="text-sm text-destructive">
                                          {err.field && (
                                            <span className="font-medium">[{err.field}] </span>
                                          )}
                                          {err.message}
                                          {err.value !== undefined && err.value !== null && (
                                            <span className="text-muted-foreground ml-1">
                                              (Wert: &quot;{String(err.value)}&quot;)
                                            </span>
                                          )}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};
