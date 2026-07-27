import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedButton } from '@/components/AnimatedButton';
import { CsvImportDataGrid } from '@/components/events/CsvImportDataGrid';
import {
  CsvImportEventCard,
  buildCsvHighlights,
  buildEventHighlights,
} from '@/components/events/CsvImportEventCard';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { CsvImportResult, CsvImportRowResult } from '@/services/eventService';
import { csvDataFromImportErrors } from '@/utils/csvEventParser';
import { cn } from '@/lib/utils';
import { glassCard, glassInput } from '@/lib/glassmorphism';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, defaultTransition } from '@/lib/animations';
import { CheckCircle2, XCircle, AlertTriangle, Edit, ExternalLink } from 'lucide-react';

interface CsvImportResultsProps {
  importResult: CsvImportResult;
  importedEvents: Map<string, Event>;
  categories: EventCategory[];
}

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

const getRowVariant = (row: CsvImportRowResult): 'success' | 'warning' | 'error' => {
  if (row.success) return 'success';
  if (row.skipped) return 'warning';
  return 'error';
};

const getEventForRow = (
  row: CsvImportRowResult,
  importedEvents: Map<string, Event>
): Event | undefined => {
  if (row.success && row.eventId) {
    return importedEvents.get(row.eventId);
  }
  if (row.skipped && row.duplicateEventId) {
    return importedEvents.get(row.duplicateEventId);
  }
  return undefined;
};

export const CsvImportResults: React.FC<CsvImportResultsProps> = ({
  importResult,
  importedEvents,
  categories,
}) => {
  const navigate = useNavigate();

  const sortedResults = [...importResult.results].sort((a, b) => {
    if (a.success && !b.success) return -1;
    if (!a.success && b.success) return 1;
    if (a.skipped && !b.skipped) return -1;
    if (!a.skipped && b.skipped) return 1;
    return a.rowIndex - b.rowIndex;
  });

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={defaultTransition}
      className="space-y-6"
    >
      <Card className={cn(glassCard)}>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Import-Ergebnis</CardTitle>
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
            <motion.div variants={staggerItem}>
              <Card
                className={cn(
                  'border transition-all duration-300',
                  importResult.successful > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-secondary'
                )}
              >
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{importResult.successful}</p>
                    <p className="text-sm text-muted-foreground">Erfolgreich</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card
                className={cn(
                  'border transition-all duration-300',
                  importResult.skipped > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-secondary'
                )}
              >
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{importResult.skipped}</p>
                    <p className="text-sm text-muted-foreground">Duplikate</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card
                className={cn(
                  'border transition-all duration-300',
                  importResult.failed > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-secondary'
                )}
              >
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-500/10">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{importResult.failed}</p>
                    <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground px-1">Importierte Events</h2>

        {sortedResults.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Ergebnisse verfügbar.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sortedResults.map(row => {
              const event = getEventForRow(row, importedEvents);
              const category = event
                ? categories.find(cat => cat.id === event.categoryId)
                : undefined;
              const errorCsvData =
                !row.success && !row.skipped ? csvDataFromImportErrors(row.errors) : undefined;
              const title =
                event?.title ||
                errorCsvData?.Titel ||
                `Event Zeile ${row.rowIndex}`;

              const actionButtons = (
                <>
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
                </>
              );

              const errorMessages = (
                <>
                  {row.skipped && row.errors?.length > 0 && (
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      {row.errors.map((err, errIdx) => (
                        <div key={errIdx}>{err.message}</div>
                      ))}
                    </div>
                  )}
                  {!row.success && !row.skipped && row.errors?.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {row.errors.map((err, errIdx) => (
                        <p key={errIdx} className="text-sm text-destructive">
                          {err.field && <span className="font-medium">[{err.field}] </span>}
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
                </>
              );

              return (
                <motion.div key={row.rowIndex} variants={staggerItem} className="h-full">
                  <CsvImportEventCard
                    title={title}
                    rowLabel={`Zeile ${row.rowIndex}`}
                    statusBadge={getRowBadge(row)}
                    variant={getRowVariant(row)}
                    actionButtons={actionButtons}
                    highlights={
                      event
                        ? buildEventHighlights(event, category)
                        : errorCsvData
                          ? buildCsvHighlights(errorCsvData)
                          : []
                    }
                    defaultExpanded={!row.success}
                    details={
                      <>
                        {errorMessages}
                        {event ? (
                          <CsvImportDataGrid mode="event" event={event} category={category} />
                        ) : errorCsvData ? (
                          <CsvImportDataGrid mode="csv" csvData={errorCsvData} />
                        ) : null}
                      </>
                    }
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
