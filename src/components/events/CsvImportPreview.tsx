import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { CsvImportDataGrid } from '@/components/events/CsvImportDataGrid';
import {
  CsvImportEventCard,
  buildCsvHighlights,
} from '@/components/events/CsvImportEventCard';
import { CsvEventRow } from '@/utils/csvEventParser';
import { cn } from '@/lib/utils';
import { glassCard, glassInput } from '@/lib/glassmorphism';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, defaultTransition } from '@/lib/animations';
import { ArrowLeft, Upload } from 'lucide-react';

interface CsvImportPreviewProps {
  rows: CsvEventRow[];
  selectedRowIndices: Set<number>;
  onToggleRow: (rowIndex: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBack: () => void;
  onImport: () => void;
  uploading: boolean;
}

export const CsvImportPreview: React.FC<CsvImportPreviewProps> = ({
  rows,
  selectedRowIndices,
  onToggleRow,
  onSelectAll,
  onDeselectAll,
  onBack,
  onImport,
  uploading,
}) => {
  const selectedCount = selectedRowIndices.size;

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
      className="space-y-6"
    >
      <Card className={cn(glassCard)}>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Vorschau</CardTitle>
          <CardDescription className="text-muted-foreground">
            {selectedCount} von {rows.length} Events ausgewählt — jedes Event ist als eigene Karte
            dargestellt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <AnimatedButton variant="outline" size="sm" onClick={onSelectAll} className={cn(glassInput)}>
                Alle auswählen
              </AnimatedButton>
              <AnimatedButton variant="outline" size="sm" onClick={onDeselectAll} className={cn(glassInput)}>
                Alle abwählen
              </AnimatedButton>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <AnimatedButton variant="outline" onClick={onBack} disabled={uploading} className={cn(glassInput)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </AnimatedButton>
              <LoadingButton
                onClick={onImport}
                disabled={selectedCount === 0 || uploading}
                isLoading={uploading}
                loadingText="Importiere..."
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedCount} Event{selectedCount === 1 ? '' : 's'} importieren
              </LoadingButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {rows.map(row => {
          const isSelected = selectedRowIndices.has(row.rowIndex);
          const title = row.data.Titel || `Event Zeile ${row.rowIndex}`;

          return (
            <motion.div key={row.rowIndex} variants={staggerItem} className="h-full">
              <CsvImportEventCard
                title={title}
                rowLabel={`Zeile ${row.rowIndex}`}
                selectable
                isSelected={isSelected}
                onToggleSelect={() => onToggleRow(row.rowIndex)}
                disabled={uploading}
                highlights={buildCsvHighlights(row.data)}
                details={<CsvImportDataGrid mode="csv" csvData={row.data} />}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
