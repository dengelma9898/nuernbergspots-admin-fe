import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { LocationSelector, LocationData } from '@/components/ui/LocationSelector';

import { cn } from '@/lib/utils';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useTaxiStandService } from '@/services/taxiStandService';
import { CreateTaxiStandDto, UpdateTaxiStandDto } from '@/models/taxi-stand';

import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage, getUserFriendlyError } from '@/utils/errorUtils';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';

function TaxiStandFormSkeleton() {
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
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
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

interface TaxiStandFormData {
  title: string;
  description: string;
  phoneNumber: string;
  numberOfTaxis: string;
}

export function TaxiStandForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const taxiStandService = useTaxiStandService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<TaxiStandFormData>({
    title: '',
    description: '',
    phoneNumber: id ? '' : '(0911) 19 410',
    numberOfTaxis: '',
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const loadStand = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const stand = await taxiStandService.getById(id);
      setFormData({
        title: stand.title || '',
        description: stand.description || '',
        phoneNumber: stand.phoneNumber,
        numberOfTaxis: stand.numberOfTaxis != null ? String(stand.numberOfTaxis) : '',
      });
      if (stand.location) {
        setLocationData({
          address: stand.location.address,
          latitude: stand.location.latitude,
          longitude: stand.location.longitude,
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden des Taxistandorts:', error);
      showUserFriendlyError(error, toast, () => loadStand(), 'generic');
      navigate('/taxi-stands');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadStand();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    const errors: string[] = [];

    if (!formData.phoneNumber.trim()) {
      errors.push('Bitte geben Sie eine Telefonnummer ein');
    }
    if (!locationData || !locationData.address || locationData.latitude === 0 || locationData.longitude === 0) {
      errors.push('Bitte wählen Sie einen Standort aus (Partner oder Adresssuche)');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);

      if (id) {
        const updateData: UpdateTaxiStandDto = {
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
          phoneNumber: formData.phoneNumber.trim(),
          numberOfTaxis: formData.numberOfTaxis ? parseInt(formData.numberOfTaxis) : undefined,
          address: locationData!.address,
          latitude: locationData!.latitude,
          longitude: locationData!.longitude,
        };

        await taxiStandService.update(id, updateData);

        showSuccessMessage(toast, {
          title: 'Taxistandort aktualisiert',
          description: `Der Taxistandort wurde erfolgreich aktualisiert.`,
        });
      } else {
        const createData: CreateTaxiStandDto = {
          phoneNumber: formData.phoneNumber.trim(),
          address: locationData!.address,
          latitude: locationData!.latitude,
          longitude: locationData!.longitude,
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
          numberOfTaxis: formData.numberOfTaxis ? parseInt(formData.numberOfTaxis) : undefined,
        };

        await taxiStandService.create(createData);

        showSuccessMessage(toast, {
          title: 'Taxistandort erstellt',
          description: `Der Taxistandort wurde erfolgreich erstellt.`,
        });
      }

      navigate('/taxi-stands');
    } catch (error) {
      console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Taxistandorts:`, error);
      const friendlyError = getUserFriendlyError(error, 'generic');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(e), 'generic');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <TaxiStandFormSkeleton />;
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
                      onClick={() => navigate('/taxi-stands')}
                      className={cn(glassButton, 'rounded-full')}
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span className="sr-only">Zurück</span>
                    </AnimatedButton>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                      {id ? 'Taxistandort bearbeiten' : 'Neuen Taxistandort erstellen'}
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

                  {/* Telefonnummer */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-foreground">
                      Telefonnummer *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="z.B. +49 911 19410"
                      className={cn(glassInput)}
                      required
                    />
                  </div>

                  {/* Titel */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">
                      Titel (optional)
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="z.B. Hauptbahnhof Nürnberg"
                      className={cn(glassInput)}
                    />
                  </div>

                  {/* Beschreibung */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">
                      Beschreibung (optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="z.B. Vor dem Haupteingang"
                      className={cn(glassInput, 'min-h-[80px]')}
                    />
                  </div>

                  {/* Anzahl Taxis */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfTaxis" className="text-foreground">
                      Anzahl Taxis (optional)
                    </Label>
                    <Input
                      id="numberOfTaxis"
                      type="number"
                      min="0"
                      value={formData.numberOfTaxis}
                      onChange={e => setFormData(prev => ({ ...prev, numberOfTaxis: e.target.value }))}
                      placeholder="z.B. 10"
                      className={cn(glassInput)}
                    />
                  </div>

                  {/* Standort */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Standort *</Label>
                    <p className="text-xs text-muted-foreground">
                      Wähle einen Partner-Standort aus oder suche nach einer Adresse.
                    </p>
                    <LocationSelector
                      value={locationData}
                      onChange={setLocationData}
                      defaultTab="search"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <LoadingButton
                      type="submit"
                      disabled={isSaving}
                      isLoading={isSaving}
                      loadingText={id ? 'Wird aktualisiert...' : 'Wird erstellt...'}
                      className="flex-1"
                    >
                      {id ? 'Taxistandort aktualisieren' : 'Taxistandort erstellen'}
                    </LoadingButton>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/taxi-stands')}
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
