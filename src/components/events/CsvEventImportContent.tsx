import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { motion, AnimatePresence } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

import { LoadingButton } from '@/components/LoadingButton';
import { CsvImportPreview } from '@/components/events/CsvImportPreview';
import { CsvImportResults } from '@/components/events/CsvImportResults';
import { CsvEventImportingSkeleton } from '@/components/events/CsvEventImportSkeletons';
import { useCsvEventImport } from '@/hooks/useCsvEventImport';

import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  XCircle,
  Info,
  X,
  Download,
} from 'lucide-react';

export function CsvEventImportContent() {
  const {
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
  } = useCsvEventImport();

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

        {step === 'importing' && uploading && <CsvEventImportingSkeleton />}

        <AnimatePresence>
          {showResults && importResult && (
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
}
