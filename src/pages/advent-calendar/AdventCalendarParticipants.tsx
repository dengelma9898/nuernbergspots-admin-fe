import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Shuffle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { showSuccessMessage } from '@/utils/errorUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { AdventCalendarEntry } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, cardPresetHover, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

function ParticipantsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function AdventCalendarParticipants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adventCalendarService = useAdventCalendarService();
  const [entry, setEntry] = useState<AdventCalendarEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  const loadEntry = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adventCalendarService.getById(id);
      setEntry(data);
    } catch (error) {
      console.error('Fehler beim Laden des Eintrags:', error);
      showUserFriendlyError(error, toast, () => loadEntry(), 'load-advent-calendar');
      navigate('/advent-calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = async (userId: string) => {
    if (!id) return;
    try {
      setIsSelectingWinner(true);
      await adventCalendarService.addWinner(id, { userId });
      showSuccessMessage(toast, {
        title: 'Gewinner hinzugefügt',
        description: 'Der Gewinner wurde erfolgreich ausgewählt.',
      });
      loadEntry();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Gewinners:', error);
      showUserFriendlyError(error, toast, () => handleSelectWinner(userId), 'save-advent-calendar');
    } finally {
      setIsSelectingWinner(false);
    }
  };

  const handleRandomWinner = () => {
    if (!entry) return;

    const winners = entry.winners || [];
    const participants = entry.participants || [];
    const availableParticipants = participants.filter(userId => !winners.includes(userId));

    if (availableParticipants.length === 0) {
      setValidationErrors(['Es gibt keine Teilnehmer, die noch nicht Gewinner sind.']);
      return;
    }

    setValidationErrors([]);

    // Zufälligen Teilnehmer auswählen
    const randomIndex = Math.floor(Math.random() * availableParticipants.length);
    const randomUserId = availableParticipants[randomIndex];
    handleSelectWinner(randomUserId);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Main Content */}
        <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
          <Card className={cn(cardPreset, 'mb-6')}>
            <CardHeader>
              <Skeleton className="h-10 w-64 rounded" />
            </CardHeader>
            <CardContent>
              <ParticipantsSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-4 md:p-8">
          <Card className={cn(cardPreset, 'p-8 md:p-12 text-center max-w-lg mx-auto')}>
            <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
              Eintrag nicht gefunden
            </h3>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Der angeforderte Adventskalender-Eintrag konnte nicht gefunden werden.
            </p>
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/advent-calendar')}
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

  const participants = entry.participants || []; // Array von User IDs
  const winners = entry.winners || [];
  const availableParticipants = participants.filter(userId => !winners.includes(userId));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <motion.div
        className="container mx-auto py-6 max-w-full px-2 sm:px-4 overflow-x-hidden relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <Card className={cn(cardPreset, 'mb-6')}>
            <CardHeader>
              <div className="flex flex-row items-center gap-4">
                <LoadingButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/advent-calendar')}
                  className={cn(buttonPreset, 'rounded-full')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zur Übersicht</span>
                </LoadingButton>
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                    Teilnehmer - Eintrag #{entry.number}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    {participants.length > 0
                      ? `${participants.length} Teilnehmer${participants.length > 1 ? '' : ''}`
                      : 'Keine Teilnehmer vorhanden'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Content */}
        {participants.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(cardPreset)}>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground text-lg">Keine Teilnehmer vorhanden</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Gewinner */}
            {winners.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                <Card className={cn(cardPreset)}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      <CardTitle className="text-foreground text-xl">Gewinner</CardTitle>
                      <Badge className="bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400">
                        {winners.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="space-y-3"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {winners.map((userId, index) => (
                        <motion.div
                          key={userId}
                          variants={fadeInUp}
                          className={cn(
                            cardPresetHover,
                            'flex items-center justify-between p-4 bg-yellow-500/5 border-yellow-500/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-foreground font-medium">{userId}</p>
                              <p className="text-xs text-muted-foreground">ID: {userId}</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400">
                            <Trophy className="h-3 w-3 mr-1" />
                            Gewinner
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Verfügbare Teilnehmer */}
            {availableParticipants.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.2 }}
              >
                <Card className={cn(cardPreset)}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-foreground" />
                        <CardTitle className="text-foreground text-xl">
                          Teilnehmer ({availableParticipants.length})
                        </CardTitle>
                      </div>
                      <LoadingButton
                        size="sm"
                        onClick={handleRandomWinner}
                        disabled={isSelectingWinner}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Shuffle className="h-4 w-4 mr-2" />
                        Zufälliger Gewinner
                      </LoadingButton>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="space-y-3"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {availableParticipants.map((userId, index) => (
                        <motion.div
                          key={userId}
                          variants={fadeInUp}
                          className={cn(cardPresetHover, 'flex items-center justify-between p-4')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-foreground font-medium">{userId}</p>
                              <p className="text-xs text-muted-foreground">ID: {userId}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {availableParticipants.length === 0 && winners.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.3 }}
              >
                <Card className={cn(cardPreset)}>
                  <CardContent className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-foreground text-lg">Alle Teilnehmer sind bereits Gewinner</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
