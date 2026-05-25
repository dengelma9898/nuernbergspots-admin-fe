import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import {
  SpecialPoll,
  getSpecialPollStatusBadgeVariant,
  getSpecialPollStatusDisplayLabel,
  specialPollHighlightBadgeClassName,
} from '@/models/specialPoll';
import { UserType } from '@/models/users';
import { useSpecialPollService } from '@/services/specialPollService';
import { useUserService } from '@/services/userService';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';

const MittmachMittwochSkeleton: React.FC = () => {
  return (
    <Card className={cn(glassCard, 'rounded-2xl')}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-5/6 md:w-3/4 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-32 rounded mt-2" />
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <Skeleton className="h-4 w-24 rounded mb-3" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function MittmachMittwoch() {
  const navigate = useNavigate();
  const specialPollService = useSpecialPollService();
  const specialPollServiceRef = useRef(specialPollService);
  useEffect(() => {
    specialPollServiceRef.current = specialPollService;
  }, [specialPollService]);

  const userService = useUserService();
  const userServiceRef = useRef(userService);
  useEffect(() => {
    userServiceRef.current = userService;
  }, [userService]);

  const { getUserId } = useAuth();

  const [polls, setPolls] = useState<SpecialPoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollHighlighted, setNewPollHighlighted] = useState(false);
  const [createSending, setCreateSending] = useState(false);
  const [highlightOnly, setHighlightOnly] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);

  const isSuperAdmin = userRole === UserType.SUPER_ADMIN;

  const loadPolls = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await specialPollServiceRef.current.getSpecialPolls(
        highlightOnly ? { highlighted: true } : undefined
      );
      setPolls(data);
    } catch (error) {
      // eslint-disable-next-line no-console -- Debug bei Lade-Fehlern
      console.error('Fehler beim Laden der Umfragen:', error);
      showUserFriendlyError(error, toast, undefined, 'generic');
    } finally {
      setIsLoading(false);
    }
  }, [highlightOnly]);

  const loadUserRole = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const profile = await userServiceRef.current.getUserProfile(userId);
      setUserRole(profile.userType);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  }, [getUserId]);

  useEffect(() => {
    void loadPolls();
  }, [loadPolls]);

  useEffect(() => {
    void loadUserRole();
  }, [loadUserRole]);

  const handleCreatePoll = async () => {
    if (!newPollTitle.trim() || createSending) return;
    try {
      setCreateSending(true);
      await specialPollServiceRef.current.createSpecialPoll({
        title: newPollTitle.trim(),
        ...(newPollHighlighted ? { isHighlighted: true } : {}),
      });
      showSuccessMessage(toast, {
        title: 'Aktion/Poll wurde erfolgreich erstellt',
        description: `"${newPollTitle.trim()}" wurde erfolgreich erstellt.`,
      });
      setIsCreateDialogOpen(false);
      setNewPollTitle('');
      setNewPollHighlighted(false);
      await loadPolls();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Erstellen der Aktion/Poll:', error);
      showUserFriendlyError(error, toast, () => void handleCreatePoll(), 'save-event');
    } finally {
      setCreateSending(false);
    }
  };

  const pollSections = (() => {
    const latestResponseMs = (poll: SpecialPoll): number | null => {
      if (!poll.responses.length) return null;
      return Math.max(...poll.responses.map(r => new Date(r.createdAt).getTime()));
    };

    /** Neueste Antwort oben; Umfragen ohne Antworten nach unten (innerhalb der Gruppe). */
    const byLatestAnswerThenUpdated = (a: SpecialPoll, b: SpecialPoll) => {
      const ta = latestResponseMs(a);
      const tb = latestResponseMs(b);
      if (ta != null && tb != null) return tb - ta;
      if (ta != null && tb == null) return -1;
      if (ta == null && tb != null) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    };

    const highlighted = polls.filter(p => p.isHighlighted ?? false).sort(byLatestAnswerThenUpdated);
    const others = polls.filter(p => !(p.isHighlighted ?? false)).sort(byLatestAnswerThenUpdated);

    return [
      { key: 'highlighted', heading: 'Hervorgehobene Aktionen', list: highlighted },
      { key: 'other', heading: 'Weitere Aktionen', list: others },
    ] as const;
  })();

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="container mx-auto p-4 md:p-8 max-w-4xl relative z-10">
          <motion.div
            className={cn(glassCard, 'p-4 md:p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-4">
              <AnimatedButton
                variant="outline"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className={cn(glassButton, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </AnimatedButton>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:flex-wrap">
                <div
                  className={cn(
                    glassInput,
                    'flex flex-row items-center justify-between gap-3 rounded-md px-3 py-2 w-full sm:w-auto sm:min-w-[220px]'
                  )}
                >
                  <Label
                    htmlFor="highlight-only"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Nur hervorgehoben
                  </Label>
                  <Switch
                    id="highlight-only"
                    checked={highlightOnly}
                    onCheckedChange={setHighlightOnly}
                    disabled={isLoading}
                  />
                </div>

                {isSuperAdmin && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <AnimatedButton className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl min-h-[44px]">
                        <Plus className="h-4 w-4" />
                        Neue Aktion/Poll
                      </AnimatedButton>
                    </DialogTrigger>
                    <DialogContent className={cn(glassCard, 'sm:max-w-[425px]')}>
                      <DialogHeader>
                        <DialogTitle className="text-foreground">
                          Neue Aktion/Poll erstellen
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <Input
                          value={newPollTitle}
                          onChange={e => setNewPollTitle(e.target.value)}
                          placeholder="Titel der Aktion/Poll"
                          autoFocus
                          className={cn(glassInput)}
                          disabled={createSending}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newPollTitle.trim() && !createSending) {
                              e.preventDefault();
                              void handleCreatePoll();
                            }
                          }}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <Label htmlFor="create-highlight" className="text-sm text-foreground">
                            Hervorheben
                          </Label>
                          <Switch
                            id="create-highlight"
                            checked={newPollHighlighted}
                            onCheckedChange={setNewPollHighlighted}
                            disabled={createSending}
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <AnimatedButton
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          className={cn(glassButton, 'w-full sm:w-auto')}
                          disabled={createSending}
                        >
                          Abbrechen
                        </AnimatedButton>
                        <LoadingButton
                          type="button"
                          onClick={() => void handleCreatePoll()}
                          disabled={!newPollTitle.trim() || createSending}
                          isLoading={createSending}
                          loadingText="Wird erstellt..."
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                        >
                          Erstellen
                        </LoadingButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {!isSuperAdmin && userRole !== null && (
                <p className="text-sm text-muted-foreground">
                  Nur Super-Admins können neue Umfragen anlegen (Lesen und Mitmachen sind für dich
                  möglich).
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Mittmach Mittwoch
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Hier findest du alle Aktionen, Ideen und Möglichkeiten, wie du dich am Mittwoch in der
              Community engagieren kannst!
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Innerhalb der Bereiche stehen Umfragen mit der letzten Antwort zuerst; ohne Antworten
              unten. Oben zuerst weiterhin die hervorgehobenen Umfragen. Der Status auf den Karten
              zeigt „ACTIVE“ auch wenn die API noch „PENDING“ liefert.
            </p>
          </motion.div>

          <motion.div
            key={`polls-${polls.length}-${isLoading}-${highlightOnly}`}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {isLoading ? (
              <>
                <div className="col-span-full mt-6 mb-2">
                  <Skeleton className="h-6 w-48 rounded" />
                </div>
                {[...Array(6)].map((_, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <MittmachMittwochSkeleton />
                  </motion.div>
                ))}
              </>
            ) : polls.length === 0 ? (
              <motion.div
                className="col-span-full"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={defaultTransition}
              >
                <Card className={cn(glassCard, 'p-8 text-center')}>
                  <div className="text-muted-foreground text-lg">
                    Noch keine Aktionen vorhanden.
                  </div>
                </Card>
              </motion.div>
            ) : (
              pollSections.map(({ key, heading, list }) =>
                list.length > 0 ? (
                  <React.Fragment key={key}>
                    <motion.div
                      className="col-span-full mt-6 mb-2"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                    >
                      <h2 className="text-lg md:text-xl font-semibold text-foreground">
                        {heading}
                      </h2>
                    </motion.div>
                    {list.map(pollItem => (
                      <motion.div key={pollItem.id} variants={fadeInUp}>
                        <Card
                          className={cn(
                            glassCard,
                            'cursor-pointer rounded-2xl',
                            (pollItem.isHighlighted ?? false) &&
                              'border-2 border-red-500 ring-2 ring-red-500/40'
                          )}
                          onClick={() => navigate(`/mittmach-mittwoch/${pollItem.id}`)}
                        >
                          <CardHeader className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <CardTitle className="text-foreground text-lg md:text-xl font-semibold leading-tight flex-1">
                                {pollItem.title}
                              </CardTitle>
                              <div className="flex flex-wrap gap-2 justify-end">
                                {pollItem.isHighlighted && (
                                  <Badge
                                    variant="outline"
                                    className={specialPollHighlightBadgeClassName}
                                  >
                                    <Star className="h-3 w-3 shrink-0" aria-hidden />
                                    Hervorgehoben
                                  </Badge>
                                )}
                                <Badge
                                  variant={getSpecialPollStatusBadgeVariant(pollItem.status)}
                                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                >
                                  {getSpecialPollStatusDisplayLabel(pollItem.status)}
                                </Badge>
                              </div>
                            </div>
                            <CardDescription className="text-muted-foreground text-sm mt-2">
                              Erstellt am{' '}
                              {format(new Date(pollItem.createdAt), 'dd.MM.yyyy', { locale: de })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 md:p-6 pt-0">
                            <div className="text-sm text-foreground mb-3 font-medium">
                              {pollItem.responses.length} Antwort
                              {pollItem.responses.length === 1 ? '' : 'en'}
                            </div>
                            {pollItem.responses.length > 0 && (
                              <div className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                                Letzte Antwort von{' '}
                                <span className="text-foreground font-medium">
                                  {pollItem.responses[pollItem.responses.length - 1].userName}
                                </span>
                                : "{pollItem.responses[pollItem.responses.length - 1].response}"
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </React.Fragment>
                ) : null
              )
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
