import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Trophy,
  Users,
  Shuffle,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdventCalendarEntry } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassCardHover, glassButton } from '@/lib/glassmorphism';
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
      toast.error('Fehler beim Laden des Eintrags', {
        description: 'Der Eintrag konnte nicht geladen werden.',
      });
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
      toast.success('Gewinner hinzugefügt', {
        description: 'Der Gewinner wurde erfolgreich ausgewählt.',
      });
      loadEntry();
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Gewinners', {
        description: 'Der Gewinner konnte nicht hinzugefügt werden.',
      });
      console.error('Fehler beim Hinzufügen des Gewinners:', error);
    } finally {
      setIsSelectingWinner(false);
    }
  };

  const handleRandomWinner = () => {
    if (!entry) return;

    const winners = entry.winners || [];
    const participants = entry.participants || [];
    const availableParticipants = participants.filter(
      userId => !winners.includes(userId)
    );

    if (availableParticipants.length === 0) {
      toast.error('Keine verfügbaren Teilnehmer', {
        description: 'Es gibt keine Teilnehmer, die noch nicht Gewinner sind.',
      });
      return;
    }

    // Zufälligen Teilnehmer auswählen
    const randomIndex = Math.floor(Math.random() * availableParticipants.length);
    const randomUserId = availableParticipants[randomIndex];
    handleSelectWinner(randomUserId);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          {/* Main Content */}
          <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
            <Card className={cn(glassCard, 'mb-6')}>
              <CardHeader>
                <Skeleton className="h-10 w-64 rounded" />
              </CardHeader>
              <CardContent>
                <ParticipantsSkeleton />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!entry) {
    return null;
  }

  const participants = entry.participants || []; // Array von User IDs
  const winners = entry.winners || [];
  const availableParticipants = participants.filter(
    userId => !winners.includes(userId)
  );

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
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
            <Card className={cn(glassCard, 'mb-6')}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => navigate('/advent-calendar')}
                    className={cn(glassButton, 'w-full sm:w-auto')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Übersicht
                  </AnimatedButton>
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
              <Card className={cn(glassCard)}>
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
                  <Card className={cn(glassCard)}>
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
                            className={cn(glassCardHover, 'flex items-center justify-between p-4 bg-yellow-500/5 border-yellow-500/30')}
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
                  <Card className={cn(glassCard)}>
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
                            className={cn(glassCardHover, 'flex items-center justify-between p-4')}
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
                  <Card className={cn(glassCard)}>
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
    </PageTransition>
  );
}

