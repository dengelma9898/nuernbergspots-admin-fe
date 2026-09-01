import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { cardPreset, cardPresetHover, inputPreset, buttonPreset } from '@/lib/designTokens';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useEasterEggService } from '@/services/easterEggService';
import { EasterEgg } from '@/models/easter-egg';

import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import {
  ArrowLeft,
  MapPin,
  Users,
  Trophy,
  Shuffle,
  UserPlus,
  Egg,
  Calendar,
  Gift,
  AlertCircle,
} from 'lucide-react';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

function EasterEggDetailSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className={cn(cardPreset)}>
            <CardHeader>
              <Skeleton className="h-10 w-44 rounded-xl mb-2" />
            </CardHeader>
          </Card>
          <Card className={cn(cardPreset)}>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EasterEggDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const easterEggService = useEasterEggService();
  const [egg, setEgg] = useState<EasterEgg | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAddingWinner, setIsAddingWinner] = useState(false);
  const [manualWinnerUserId, setManualWinnerUserId] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadData();
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

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [fetchedEgg, fetchedParticipants] = await Promise.all([
        easterEggService.getById(id),
        easterEggService.getParticipants(id),
      ]);
      setEgg(fetchedEgg);
      setParticipants(fetchedParticipants);
    } catch (error) {
      console.error('Fehler beim Laden des Ostereis:', error);
      showUserFriendlyError(error, toast, () => loadData(), 'load-easter-egg');
      navigate('/easter-egg-hunt');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawWinners = async () => {
    if (!id) return;
    try {
      setIsDrawing(true);
      setValidationErrors([]);
      const updatedEgg = await easterEggService.drawWinners(id);
      setEgg(updatedEgg);
      showSuccessMessage(toast, {
        title: 'Gewinner ausgelost',
        description: `Es wurden ${updatedEgg.winnerCount} Gewinner ausgelost.`,
      });
      loadData();
    } catch (error) {
      console.error('Fehler beim Auslosen der Gewinner:', error);
      showUserFriendlyError(error, toast, () => handleDrawWinners(), 'save-easter-egg');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleAddWinner = async () => {
    if (!id) return;

    if (!manualWinnerUserId.trim()) {
      setValidationErrors(['Bitte geben Sie eine User-ID ein.']);
      return;
    }

    try {
      setIsAddingWinner(true);
      setValidationErrors([]);
      const updatedEgg = await easterEggService.addWinner(id, {
        userId: manualWinnerUserId.trim(),
      });
      setEgg(updatedEgg);
      setManualWinnerUserId('');
      showSuccessMessage(toast, {
        title: 'Gewinner hinzugefügt',
        description: 'Der Gewinner wurde erfolgreich hinzugefügt.',
      });
      loadData();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Gewinners:', error);
      showUserFriendlyError(error, toast, () => handleAddWinner(), 'save-easter-egg');
    } finally {
      setIsAddingWinner(false);
    }
  };

  if (loading) {
    return <EasterEggDetailSkeleton />;
  }

  if (!egg) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-4 md:p-8">
          <Card className={cn(cardPreset, 'p-8 md:p-12 text-center max-w-lg mx-auto')}>
            <Egg className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
              Osterei-Aktion nicht gefunden
            </h3>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Die angeforderte Osterei-Aktion konnte nicht gefunden werden.
            </p>
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/easter-egg-hunt')}
              className={cn(buttonPreset, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zur Übersicht</span>
            </LoadingButton>
          </Card>
        </div>
      </div>
    );
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
          {/* Header */}
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
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                      {egg.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Osterei-Details, Teilnehmer und Gewinner
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Osterei-Info */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(cardPreset)}>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {egg.imageUrl && (
                  <div
                    className={cn(
                      cardPreset,
                      'relative w-full h-48 sm:h-64 rounded-lg overflow-hidden p-2'
                    )}
                  >
                    <img
                      src={egg.imageUrl}
                      alt={egg.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}

                <p className="text-foreground">{egg.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{egg.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {formatDate(egg.startDate)}
                      {egg.endDate ? ` – ${formatDate(egg.endDate)}` : ''}
                    </span>
                  </div>
                  {egg.prizeDescription && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gift className="h-4 w-4 shrink-0" />
                      <span>{egg.prizeDescription}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4 shrink-0" />
                    <span>Max. {egg.numberOfWinners} Gewinner</span>
                  </div>
                </div>

                {/* Statistik-Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {egg.participantCount} Teilnehmer
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {egg.winnerCount} / {egg.numberOfWinners} Gewinner
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gewinner-Verwaltung */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Gewinner-Verwaltung
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Gewinner auslosen oder manuell hinzufügen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Validierungsfehler */}
                {validationErrors.length > 0 && (
                  <Alert
                    ref={validationErrorsRef}
                    variant="destructive"
                    className={cn(cardPreset, 'border-destructive/50')}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Zufällig auslosen */}
                <div className={cn(cardPreset, 'p-4')}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <Label className="text-foreground font-medium">Zufällig auslosen</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wählt zufällig bis zu {egg.numberOfWinners} Gewinner aus den Teilnehmern
                        (ohne bereits vorhandene Gewinner).
                      </p>
                    </div>
                    <LoadingButton
                      onClick={handleDrawWinners}
                      disabled={isDrawing || egg.participantCount === 0}
                      isLoading={isDrawing}
                      loadingText="Wird ausgelost..."
                      variant="outline"
                      className={cn(buttonPreset)}
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      Gewinner auslosen
                    </LoadingButton>
                  </div>
                </div>

                {/* Manuell hinzufügen */}
                <div className={cn(cardPreset, 'p-4')}>
                  <Label className="text-foreground font-medium">Gewinner manuell hinzufügen</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Geben Sie die Firebase User-ID des Gewinners ein.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={manualWinnerUserId}
                      onChange={e => setManualWinnerUserId(e.target.value)}
                      placeholder="Firebase User-ID"
                      className={cn(inputPreset, 'flex-1')}
                    />
                    <LoadingButton
                      onClick={handleAddWinner}
                      disabled={isAddingWinner || !manualWinnerUserId.trim()}
                      isLoading={isAddingWinner}
                      loadingText="Wird hinzugefügt..."
                      variant="outline"
                      className={cn(buttonPreset)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Hinzufügen
                    </LoadingButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Teilnehmer-Liste */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.3 }}
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Teilnehmer ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Noch keine Teilnehmer vorhanden.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {participants.map((userId, index) => (
                      <div
                        key={userId}
                        className={cn(
                          'p-3 rounded-lg border border-secondary flex items-center justify-between',
                          'hover:bg-muted/50 transition-colors'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-6">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-foreground font-mono truncate">
                            {userId}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
