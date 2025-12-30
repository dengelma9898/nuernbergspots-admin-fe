import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateAdventCalendarEntryDto, UpdateAdventCalendarEntryDto } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage, getUserFriendlyError } from '@/utils/errorUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image as ImageIcon, Upload, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function AdventCalendarFormSkeleton() {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <Card className={cn(glassCard)}>
              <CardHeader>
                <Skeleton className="h-10 w-44 rounded-xl mb-2" />
                <Skeleton className="h-6 w-64 rounded" />
              </CardHeader>
            </Card>

            {/* Form Skeleton */}
            <Card className={cn(glassCard)}>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export function AdventCalendarForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adventCalendarService = useAdventCalendarService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);
  
  // Zentrale Bildvalidierung mit max 1 MB pro Bild
  const imageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });
  const [formData, setFormData] = useState<CreateAdventCalendarEntryDto>({
    number: 1,
    canParticipate: true,
    isActive: true,
    date: new Date().toISOString().split('T')[0], // Heute als Standard
    isSpecial: false,
    description: '',
    linkUrl: undefined,
  });

  const loadEntry = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const entry = await adventCalendarService.getById(id);
      setFormData({
        number: entry.number,
        canParticipate: entry.canParticipate,
        isActive: entry.isActive,
        date: entry.date,
        isSpecial: entry.isSpecial,
        description: entry.description,
        linkUrl: entry.linkUrl,
      });
      if (entry.imageUrl) {
        setOriginalImageUrl(entry.imageUrl);
        setShouldDeleteImage(false);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Eintrags:', error);
      showUserFriendlyError(error, toast, () => loadEntry(), 'load-advent-calendar');
      navigate('/advent-calendar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll zu Validierungsfehlern, wenn sie angezeigt werden
  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorsRef.current) {
      setTimeout(() => {
        validationErrorsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // Kleine Verzögerung, damit das Element gerendert ist
    }
  }, [validationErrors]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
    // Wenn ein neues Bild ausgewählt wird, wird das alte ersetzt (nicht gelöscht)
    if (imageUpload.files.length > 0) {
      setShouldDeleteImage(false);
    }
  };

  const removeImage = () => {
    imageUpload.clearImages();
    // Wenn ein bestehendes Bild gelöscht wird, markiere es zum Löschen
    if (originalImageUrl) {
      setShouldDeleteImage(true);
      setOriginalImageUrl('');
    }
  };

  const normalizeUrl = (urlString: string): string => {
    if (!urlString || !urlString.trim()) {
      return '';
    }
    
    const trimmed = urlString.trim();
    
    // Wenn bereits ein Protokoll vorhanden ist, zurückgeben
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Wenn kein Protokoll vorhanden ist, https:// hinzufügen
    return `https://${trimmed}`;
  };

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || !urlString.trim()) {
      return true; // Leer ist erlaubt (optional)
    }
    
    try {
      const normalized = normalizeUrl(urlString);
      const url = new URL(normalized);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    const errors: string[] = [];
    
    if (!formData.description.trim()) {
      errors.push('Bitte geben Sie eine Beschreibung ein');
    }

    if (formData.number < 1) {
      errors.push('Das Adventstürchen muss mindestens 1 sein');
    }

    if (formData.linkUrl && formData.linkUrl.trim() && !isValidUrl(formData.linkUrl)) {
      errors.push('Bitte geben Sie eine gültige URL ein');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      let entryId: string;

      if (id) {
        // Update
        const updateData: UpdateAdventCalendarEntryDto = {
          number: formData.number,
          canParticipate: formData.canParticipate,
          isActive: formData.isActive,
          date: formData.date,
          isSpecial: formData.isSpecial,
          description: formData.description,
          linkUrl: formData.linkUrl?.trim() ? normalizeUrl(formData.linkUrl.trim()) : undefined,
        };
        
        // Wenn Bild gelöscht werden soll UND kein neues Bild ausgewählt wurde, sende null ans Backend
        if (shouldDeleteImage && imageUpload.files.length === 0) {
          updateData.imageUrl = null;
        }
        
        const updatedEntry = await adventCalendarService.update(id, updateData);
        entryId = updatedEntry.id;

        // Upload Image if selected (ersetzt das alte Bild, wenn shouldDeleteImage true ist)
        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await adventCalendarService.uploadImage(entryId, imageUpload.files[0]);
        } else if (shouldDeleteImage) {
          // Wenn kein neues Bild ausgewählt wurde, aber gelöscht werden soll,
          // wurde das bereits im updateData.imageUrl = null gesetzt
        }
        
        // Reset delete flag
        setShouldDeleteImage(false);

        showSuccessMessage(toast, {
          title: 'Eintrag aktualisiert',
          description: `Eintrag #${formData.number} wurde erfolgreich aktualisiert.`,
        });
      } else {
        // Create
        const createData: CreateAdventCalendarEntryDto = {
          ...formData,
          linkUrl: formData.linkUrl?.trim() ? normalizeUrl(formData.linkUrl.trim()) : undefined,
        };
        const newEntry = await adventCalendarService.create(createData);
        entryId = newEntry.id;

        // Upload Image if selected
        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await adventCalendarService.uploadImage(entryId, imageUpload.files[0]);
        }

        showSuccessMessage(toast, {
          title: 'Eintrag erstellt',
          description: `Eintrag #${formData.number} wurde erfolgreich erstellt.`,
        });
      }

      navigate('/advent-calendar');
    } catch (error) {
      console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Eintrags:`, error);
      const friendlyError = getUserFriendlyError(error, 'save-advent-calendar');
      
      // Wenn Validierungsfehler vorhanden sind, zeige sie auf der Seite
      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        // Für andere Fehler zeige Toast
        showUserFriendlyError(error, toast, () => handleSubmit(e), 'save-advent-calendar');
      }
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return <AdventCalendarFormSkeleton />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <motion.div
          className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <AnimatedButton
                      variant="ghost"
                      onClick={() => navigate('/advent-calendar')}
                      className={cn(glassButton, 'w-full sm:w-auto')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Zurück
                    </AnimatedButton>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                      {id ? 'Adventskalender-Eintrag bearbeiten' : 'Neuen Adventskalender-Eintrag erstellen'}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard)}>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Validierungsfehler */}
                  {validationErrors.length > 0 && (
                    <Alert 
                      ref={validationErrorsRef}
                      variant="destructive" 
                      className={cn(glassCard, 'border-destructive/50')}
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
                  
                  {/* Number */}
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
                      className={cn(glassInput)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Diese Nummer wird für die Sortierung der Einträge verwendet.
                    </p>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-foreground">
                      Datum *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={cn(glassInput)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">
                      Beschreibung *
                    </Label>
                    <MarkdownEditor
                      value={formData.description}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, description: value }));
                        // Fehler zurücksetzen, wenn Wert geändert wird
                        if (validationErrors.length > 0) {
                          setValidationErrors(prev => prev.filter(err => !err.includes('Beschreibung')));
                        }
                      }}
                      placeholder="Beschreibung des Adventskalender-Eintrags (Markdown wird unterstützt)"
                      minHeight="min-h-[200px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Du kannst Markdown verwenden, um Links, Formatierungen und Listen einzufügen. Nutze die Toolbar-Buttons oder die Markdown-Syntax direkt.
                    </p>
                  </div>

                  {/* Link URL */}
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
                          // Fehler zurücksetzen, wenn Wert geändert wird
                          if (validationErrors.length > 0) {
                            setValidationErrors(prev => prev.filter(err => !err.includes('URL')));
                          }
                        }}
                        placeholder="www.example.com oder https://example.com"
                        className={cn(glassInput, 'pl-10')}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: URL zu einem externen Link für diesen Eintrag. Protokoll (https://) wird automatisch hinzugefügt, falls nicht vorhanden.
                    </p>
                  </div>

                  {/* Switches */}
                  <div className="space-y-4">
                    <Card className={cn(glassCard, 'p-4')}>
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

                    <Card className={cn(glassCard, 'p-4')}>
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

                    <Card className={cn(glassCard, 'p-4')}>
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

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Bild</Label>
                    {imageUpload.error && (
                      <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
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
                      {(imageUpload.previewUrls.length > 0 || originalImageUrl) ? (
                        <div className="relative group">
                          <div className={cn(glassCard, 'relative w-full h-48 sm:h-64 rounded-lg overflow-hidden p-2')}>
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
                        <div className={cn(glassCard, 'border-2 border-dashed p-8 text-center')}>
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">Kein Bild ausgewählt</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <AnimatedButton
                            type="button"
                            variant="outline"
                            asChild
                            className={cn(glassButton)}
                          >
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Upload className="mr-2 h-4 w-4" />
                              Bild auswählen
                            </label>
                          </AnimatedButton>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
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
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/advent-calendar')}
                      className={cn(glassButton, 'flex-1')}
                    >
                      Abbrechen
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

