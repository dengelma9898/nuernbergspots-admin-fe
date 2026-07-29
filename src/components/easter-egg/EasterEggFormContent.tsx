import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LocationSelector } from '@/components/ui/LocationSelector';
import { Textarea } from '@/components/ui/textarea';
import { motion } from '@/components/motion';
import { ArrowLeft, Image as ImageIcon, Upload, X, AlertCircle } from 'lucide-react';

import { LoadingButton } from '@/components/LoadingButton';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

import { useEasterEggForm } from '@/hooks/useEasterEggForm';
import { EasterEggFormSkeleton } from '@/components/easter-egg/EasterEggFormSkeletons';

export type EasterEggFormContentProps = ReturnType<typeof useEasterEggForm>;

export function EasterEggFormContent({
  id,
  navigate,
  isLoading,
  isSaving,
  isUploadingImage,
  originalImageUrl,
  validationErrors,
  validationErrorsRef,
  imageUpload,
  formData,
  setFormData,
  locationData,
  setLocationData,
  handleImageSelect,
  removeImage,
  handleSubmit,
}: EasterEggFormContentProps) {
  if (isLoading) {
    return <EasterEggFormSkeleton />;
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
                    onClick={() => navigate('/easter-egg-hunt')}
                    className={cn(buttonPreset, 'rounded-full')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Zurück</span>
                  </LoadingButton>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                    {id ? 'Osterei bearbeiten' : 'Neues Osterei erstellen'}
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
                  <Label htmlFor="title" className="text-foreground">
                    Titel *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="z.B. Goldenes Ei am Hauptmarkt"
                    className={cn(inputPreset)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Beschreibung *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Hinweis zum Versteck oder eine Beschreibung des Ostereis"
                    className={cn(inputPreset, 'min-h-[120px]')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prizeDescription" className="text-foreground">
                    Gewinnbeschreibung (optional)
                  </Label>
                  <Input
                    id="prizeDescription"
                    type="text"
                    value={formData.prizeDescription}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, prizeDescription: e.target.value }))
                    }
                    placeholder="z.B. 2x Kinogutscheine"
                    className={cn(inputPreset)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfWinners" className="text-foreground">
                    Anzahl Gewinner *
                  </Label>
                  <Input
                    id="numberOfWinners"
                    type="number"
                    min="1"
                    value={formData.numberOfWinners}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        numberOfWinners: parseInt(e.target.value) || 1,
                      }))
                    }
                    className={cn(inputPreset)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-foreground">
                      Startdatum *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={cn(inputPreset)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-foreground">
                      Enddatum (optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className={cn(inputPreset)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Standort *</Label>
                  <p className="text-xs text-muted-foreground">
                    Wähle einen Partner-Standort aus oder suche nach einer Adresse.
                  </p>
                  <LocationSelector value={locationData} onChange={setLocationData} />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Bild (optional)</Label>
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
                          id="egg-image-upload"
                        />
                        <LoadingButton
                          type="button"
                          variant="outline"
                          asChild
                          className={cn(buttonPreset)}
                        >
                          <label htmlFor="egg-image-upload" className="cursor-pointer">
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
                    {id ? 'Osterei aktualisieren' : 'Osterei erstellen'}
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/easter-egg-hunt')}
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
