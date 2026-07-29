import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useAdventCalendarForm } from '@/hooks/useAdventCalendarForm';
import { AdventCalendarFormSkeleton } from '@/components/advent-calendar/AdventCalendarSkeletons';
import { ArrowLeft, Image as ImageIcon, Upload, X, Link as LinkIcon, AlertCircle } from 'lucide-react';

export function AdventCalendarFormContent() {
  const {
    id,
    navigate,
    isLoading,
    isSaving,
    isUploadingImage,
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    validationErrorsRef,
    imageUpload,
    originalImageUrl,
    handleImageSelect,
    removeImage,
    handleSubmit,
  } = useAdventCalendarForm();

  if (isLoading) {
    return <AdventCalendarFormSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <div className="flex flex-row items-center gap-4">
                  <LoadingButton
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/advent-calendar')}
                    className={cn(buttonPreset, 'rounded-full')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Zurück</span>
                  </LoadingButton>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                    {id
                      ? 'Adventskalender-Eintrag bearbeiten'
                      : 'Neuen Adventskalender-Eintrag erstellen'}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(cardPreset)}>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {validationErrors.length > 0 && (
                  <Alert
                    ref={validationErrorsRef}
                    variant="destructive"
                    className={cn(cardPreset, 'border-destructive/50')}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
                    <AlertDescription className="mt-2">
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="number" className="text-foreground">
                    Adventstürchen *
                  </Label>
                  <Input
                    id="number"
                    type="number"
                    min="1"
                    max="999"
                    value={formData.number}
                    onChange={e => {
                      const value = parseInt(e.target.value) || 1;
                      setFormData(prev => ({ ...prev, number: value }));
                    }}
                    placeholder="Nummer für Sortierung"
                    className={cn(inputPreset)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Diese Nummer wird für die Sortierung der Einträge verwendet.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground">
                    Datum *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className={cn(inputPreset)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Beschreibung *
                  </Label>
                  <MarkdownEditor
                    value={formData.description}
                    onChange={value => {
                      setFormData(prev => ({ ...prev, description: value }));
                      if (validationErrors.length > 0) {
                        setValidationErrors(prev =>
                          prev.filter(err => !err.includes('Beschreibung'))
                        );
                      }
                    }}
                    placeholder="Beschreibung des Adventskalender-Eintrags (Markdown wird unterstützt)"
                    minHeight="min-h-[200px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Du kannst Markdown verwenden, um Links, Formatierungen und Listen einzufügen.
                    Nutze die Toolbar-Buttons oder die Markdown-Syntax direkt.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkUrl" className="text-foreground">
                    Link URL (optional)
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkUrl"
                      type="text"
                      value={formData.linkUrl || ''}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, linkUrl: e.target.value || undefined }));
                        if (validationErrors.length > 0) {
                          setValidationErrors(prev => prev.filter(err => !err.includes('URL')));
                        }
                      }}
                      placeholder="www.example.com oder https://example.com"
                      className={cn(inputPreset, 'pl-10')}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional: URL zu einem externen Link für diesen Eintrag. Protokoll (https://)
                    wird automatisch hinzugefügt, falls nicht vorhanden.
                  </p>
                </div>

                <div className="space-y-4">
                  <Card className={cn(cardPreset, 'p-4')}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="canParticipate" className="text-foreground">
                          Teilnahme möglich
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Benutzer können an diesem Tag teilnehmen
                        </p>
                      </div>
                      <Switch
                        id="canParticipate"
                        checked={formData.canParticipate}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, canParticipate: checked }))
                        }
                      />
                    </div>
                  </Card>

                  <Card className={cn(cardPreset, 'p-4')}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive" className="text-foreground">
                          Aktiv
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Eintrag ist aktiv und wird angezeigt
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, isActive: checked }))
                        }
                      />
                    </div>
                  </Card>

                  <Card className={cn(cardPreset, 'p-4')}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isSpecial" className="text-foreground">
                          Spezieller Eintrag
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Markiert diesen Eintrag als besonders
                        </p>
                      </div>
                      <Switch
                        id="isSpecial"
                        checked={formData.isSpecial}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, isSpecial: checked }))
                        }
                      />
                    </div>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Bild</Label>
                  {imageUpload.error && (
                    <Alert
                      variant="destructive"
                      className={cn(cardPreset, 'border-destructive/50')}
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{imageUpload.error.title}</AlertTitle>
                      <AlertDescription className="mt-2">
                        <p>{imageUpload.error.message}</p>
                        {imageUpload.error.actionHint && (
                          <p className="mt-2 text-sm opacity-90">{imageUpload.error.actionHint}</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4">
                    {imageUpload.previewUrls.length > 0 || originalImageUrl ? (
                      <div className="relative group">
                        <div
                          className={cn(
                            cardPreset,
                            'relative w-full h-48 sm:h-64 rounded-lg overflow-hidden p-2'
                          )}
                        >
                          <img
                            src={imageUpload.previewUrls[0] || originalImageUrl}
                            alt="Vorschau"
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full h-8 w-8 z-10 flex items-center justify-center"
                            title="Bild entfernen"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={cn(cardPreset, 'border-2 border-dashed p-8 text-center')}>
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Kein Bild ausgewählt</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <LoadingButton
                          type="button"
                          variant="outline"
                          asChild
                          className={cn(buttonPreset)}
                        >
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Bild auswählen
                          </label>
                        </LoadingButton>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <LoadingButton
                    type="submit"
                    disabled={isSaving || isUploadingImage}
                    isLoading={isSaving || isUploadingImage}
                    loadingText={
                      isUploadingImage
                        ? 'Bild wird hochgeladen...'
                        : id
                          ? 'Wird aktualisiert...'
                          : 'Wird erstellt...'
                    }
                    className="flex-1"
                  >
                    {id ? 'Eintrag aktualisieren' : 'Eintrag erstellen'}
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/advent-calendar')}
                    className={cn(buttonPreset, 'flex-1')}
                  >
                    Abbrechen
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
