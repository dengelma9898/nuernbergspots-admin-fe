import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LocationSelector, LocationData } from '@/components/ui/LocationSelector';

import { cn } from '@/lib/utils';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useEasterEggService } from '@/services/easterEggService';
import { CreateEasterEggDto, UpdateEasterEggDto } from '@/models/easter-egg';

import { toast } from 'sonner';
import {
  showUserFriendlyError,
  showSuccessMessage,
  getUserFriendlyError,
} from '@/utils/errorUtils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Upload, X, AlertCircle } from 'lucide-react';

function EasterEggFormSkeleton() {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className={cn(glassCard)}>
              <CardHeader>
                <Skeleton className="h-10 w-44 rounded-xl mb-2" />
                <Skeleton className="h-6 w-64 rounded" />
              </CardHeader>
            </Card>
            <Card className={cn(glassCard)}>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
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

interface EasterEggFormData {
  title: string;
  description: string;
  prizeDescription: string;
  numberOfWinners: number;
  startDate: string;
  endDate: string;
}

export function EasterEggForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const easterEggService = useEasterEggService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);

  const imageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });

  const [formData, setFormData] = useState<EasterEggFormData>({
    title: '',
    description: '',
    prizeDescription: '',
    numberOfWinners: 1,
    startDate: '',
    endDate: '',
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const loadEgg = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const egg = await easterEggService.getById(id);
      setFormData({
        title: egg.title,
        description: egg.description,
        prizeDescription: egg.prizeDescription || '',
        numberOfWinners: egg.numberOfWinners,
        startDate: egg.startDate,
        endDate: egg.endDate || '',
      });
      if (egg.location) {
        setLocationData({
          address: egg.location.address,
          latitude: egg.location.latitude,
          longitude: egg.location.longitude,
        });
      }
      if (egg.imageUrl) {
        setOriginalImageUrl(egg.imageUrl);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Ostereis:', error);
      showUserFriendlyError(error, toast, () => loadEgg(), 'load-easter-egg');
      navigate('/easter-egg-hunt');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEgg();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorsRef.current) {
      setTimeout(() => {
        validationErrorsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [validationErrors]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
  };

  const removeImage = () => {
    imageUpload.clearImages();
    setOriginalImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Bitte geben Sie einen Titel ein');
    }
    if (!formData.description.trim()) {
      errors.push('Bitte geben Sie eine Beschreibung ein');
    }
    if (!formData.startDate) {
      errors.push('Bitte geben Sie ein Startdatum ein');
    }
    if (
      !locationData ||
      !locationData.address ||
      locationData.latitude === 0 ||
      locationData.longitude === 0
    ) {
      errors.push('Bitte wählen Sie einen Standort aus (Partner oder Adresssuche)');
    }
    if (formData.numberOfWinners < 1) {
      errors.push('Die Anzahl der Gewinner muss mindestens 1 sein');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      let eggId: string;

      if (id) {
        const updateData: UpdateEasterEggDto = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          prizeDescription: formData.prizeDescription.trim() || undefined,
          numberOfWinners: formData.numberOfWinners,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          address: locationData!.address,
          latitude: locationData!.latitude,
          longitude: locationData!.longitude,
        };

        const updatedEgg = await easterEggService.update(id, updateData);
        eggId = updatedEgg.id;

        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await easterEggService.uploadImage(eggId, imageUpload.files[0]);
        }

        showSuccessMessage(toast, {
          title: 'Osterei aktualisiert',
          description: `"${formData.title}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        const createData: CreateEasterEggDto = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          prizeDescription: formData.prizeDescription.trim() || undefined,
          numberOfWinners: formData.numberOfWinners,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          address: locationData!.address,
          latitude: locationData!.latitude,
          longitude: locationData!.longitude,
        };

        const newEgg = await easterEggService.create(createData);
        eggId = newEgg.id;

        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await easterEggService.uploadImage(eggId, imageUpload.files[0]);
        }

        showSuccessMessage(toast, {
          title: 'Osterei erstellt',
          description: `"${formData.title}" wurde erfolgreich erstellt.`,
        });
      }

      navigate('/easter-egg-hunt');
    } catch (error) {
      console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Ostereis:`, error);
      const friendlyError = getUserFriendlyError(error, 'save-easter-egg');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(e), 'save-easter-egg');
      }
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return <EasterEggFormSkeleton />;
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
                  <div className="flex flex-row items-center gap-4">
                    <AnimatedButton
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/easter-egg-hunt')}
                      className={cn(glassButton, 'rounded-full')}
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span className="sr-only">Zurück</span>
                    </AnimatedButton>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                      {id ? 'Osterei bearbeiten' : 'Neues Osterei erstellen'}
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

                  {/* Title */}
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
                      className={cn(glassInput)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">
                      Beschreibung *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Hinweis zum Versteck oder eine Beschreibung des Ostereis"
                      className={cn(glassInput, 'min-h-[120px]')}
                      required
                    />
                  </div>

                  {/* Prize Description */}
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
                      className={cn(glassInput)}
                    />
                  </div>

                  {/* Number of Winners */}
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
                      className={cn(glassInput)}
                      required
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-foreground">
                        Startdatum *
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, startDate: e.target.value }))
                        }
                        className={cn(glassInput)}
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
                        className={cn(glassInput)}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Standort *</Label>
                    <p className="text-xs text-muted-foreground">
                      Wähle einen Partner-Standort aus oder suche nach einer Adresse.
                    </p>
                    <LocationSelector value={locationData} onChange={setLocationData} />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Bild (optional)</Label>
                    {imageUpload.error && (
                      <Alert
                        variant="destructive"
                        className={cn(glassCard, 'border-destructive/50')}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{imageUpload.error.title}</AlertTitle>
                        <AlertDescription className="mt-2">
                          <p>{imageUpload.error.message}</p>
                          {imageUpload.error.actionHint && (
                            <p className="mt-2 text-sm opacity-90">
                              {imageUpload.error.actionHint}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-4">
                      {imageUpload.previewUrls.length > 0 || originalImageUrl ? (
                        <div className="relative group">
                          <div
                            className={cn(
                              glassCard,
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
                        <div className={cn(glassCard, 'border-2 border-dashed p-8 text-center')}>
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">Kein Bild ausgewählt</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="egg-image-upload"
                          />
                          <AnimatedButton
                            type="button"
                            variant="outline"
                            asChild
                            className={cn(glassButton)}
                          >
                            <label htmlFor="egg-image-upload" className="cursor-pointer">
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
                      {id ? 'Osterei aktualisieren' : 'Osterei erstellen'}
                    </LoadingButton>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/easter-egg-hunt')}
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
