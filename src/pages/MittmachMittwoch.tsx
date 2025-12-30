import React, { useEffect, useState } from 'react';
import { useSpecialPollService } from '@/services/specialPollService';
import { SpecialPoll, SpecialPollStatus } from '@/models/specialPoll';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const MittmachMittwochSkeleton: React.FC = () => {
  return (
    <Card className={cn(glassCard, 'rounded-2xl')}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          {/* Title and Badge */}
          <div className="flex-1">
            <Skeleton className="h-6 w-5/6 md:w-3/4 rounded mb-2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Created Date */}
        <Skeleton className="h-4 w-32 rounded mt-2" />
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {/* Response Count */}
        <Skeleton className="h-4 w-24 rounded mb-3" />

        {/* Last Response Preview */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function MittmachMittwoch() {
  const specialPollService = useSpecialPollService();
  const [polls, setPolls] = useState<SpecialPoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'ALL' | SpecialPollStatus>('ALL');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setIsLoading(true);
      const data = await specialPollService.getSpecialPolls();
      setPolls(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: SpecialPollStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case SpecialPollStatus.ACTIVE:
        return 'default';
      case SpecialPollStatus.PENDING:
        return 'secondary';
      case SpecialPollStatus.CLOSED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleCreatePoll = async () => {
    if (!newPollTitle.trim()) return;
    try {
      const createdPoll = await specialPollService.createSpecialPoll({ title: newPollTitle.trim() });
      showSuccessMessage(toast, {
        title: 'Aktion/Poll wurde erfolgreich erstellt',
        description: `"${newPollTitle.trim()}" wurde erfolgreich erstellt.`,
      });
      setIsCreateDialogOpen(false);
      setNewPollTitle('');
      loadPolls();
    } catch (error) {
      console.error('Fehler beim Erstellen der Aktion/Poll:', error);
      showUserFriendlyError(error, toast, () => handleCreatePoll(), 'save-event');
    }
  };

  const groupedPolls = {
    [SpecialPollStatus.ACTIVE]: polls.filter(p => p.status === SpecialPollStatus.ACTIVE),
    [SpecialPollStatus.PENDING]: polls.filter(p => p.status === SpecialPollStatus.PENDING),
    [SpecialPollStatus.CLOSED]: polls.filter(p => p.status === SpecialPollStatus.CLOSED),
  };

  const filteredPolls =
    statusFilter === 'ALL' ? groupedPolls : { [statusFilter]: groupedPolls[statusFilter] };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="container mx-auto p-4 md:p-8 max-w-4xl relative z-10">
          {/* Navigation and Controls Section */}
          <motion.div
            className={cn(glassCard, 'p-4 md:p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-4">
              {/* Navigation Button - Full width on mobile */}
              <AnimatedButton
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full md:w-auto md:self-start"
              >
                Zurück zum Dashboard
              </AnimatedButton>

              {/* Controls Row - Stack on mobile, side by side on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                  <SelectTrigger className={cn(glassInput, 'w-full sm:w-48')}>
                    <SelectValue placeholder="Status filtern" />
                  </SelectTrigger>
                  <SelectContent className={cn(glassCard)}>
                    <SelectItem value="ALL" className="cursor-pointer">
                      Alle
                    </SelectItem>
                    <SelectItem
                      value={SpecialPollStatus.ACTIVE}
                      className="cursor-pointer"
                    >
                      Aktiv
                    </SelectItem>
                    <SelectItem
                      value={SpecialPollStatus.PENDING}
                      className="cursor-pointer"
                    >
                      Ausstehend
                    </SelectItem>
                    <SelectItem
                      value={SpecialPollStatus.CLOSED}
                      className="cursor-pointer"
                    >
                      Geschlossen
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <AnimatedButton className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      <Plus className="h-4 w-4" />
                      Neue Aktion/Poll
                    </AnimatedButton>
                  </DialogTrigger>
                  <DialogContent className={cn(glassCard, 'sm:max-w-[425px]')}>
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Neue Aktion/Poll erstellen</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        value={newPollTitle}
                        onChange={e => setNewPollTitle(e.target.value)}
                        placeholder="Titel der Aktion/Poll"
                        autoFocus
                        className={cn(glassInput)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newPollTitle.trim()) {
                            e.preventDefault();
                            handleCreatePoll();
                          }
                        }}
                      />
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <AnimatedButton
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className={cn(glassButton, 'w-full sm:w-auto')}
                      >
                        Abbrechen
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={handleCreatePoll}
                        disabled={!newPollTitle.trim()}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50"
                      >
                        Erstellen
                      </AnimatedButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
          {/* Title Section */}
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
          </motion.div>
          {/* Content Grid - Improved mobile-first responsive design */}
          <motion.div
            key={`polls-${polls.length}-${isLoading}`}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {isLoading ? (
              <>
                {/* Section Header Skeleton */}
                <div className="col-span-full mt-6 mb-2">
                  <Skeleton className="h-6 w-48 rounded" />
                </div>
                {/* Action Cards Skeletons */}
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
                  <div className="text-muted-foreground text-lg">Noch keine Aktionen vorhanden.</div>
                </Card>
              </motion.div>
            ) : (
              Object.entries(filteredPolls).map(
                ([status, polls]) =>
                  polls.length > 0 && (
                    <React.Fragment key={status}>
                      <motion.div
                        className="col-span-full mt-6 mb-2"
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                      >
                        <h2 className="text-lg md:text-xl font-semibold text-foreground">
                          {status === SpecialPollStatus.ACTIVE && 'Aktive Aktionen'}
                          {status === SpecialPollStatus.PENDING && 'Ausstehende Aktionen'}
                          {status === SpecialPollStatus.CLOSED && 'Geschlossene Aktionen'}
                        </h2>
                      </motion.div>
                      {polls.map((poll) => (
                        <motion.div key={poll.id} variants={fadeInUp}>
                          <Card
                            className={cn(glassCard, 'cursor-pointer rounded-2xl')}
                            onClick={() => navigate(`/mittmach-mittwoch/${poll.id}`)}
                          >
                            <CardHeader className="p-4 md:p-6">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                <CardTitle className="text-foreground text-lg md:text-xl font-semibold leading-tight flex-1">
                                  {poll.title}
                                </CardTitle>
                                <Badge
                                  variant={getStatusVariant(poll.status)}
                                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                >
                                  {poll.status}
                                </Badge>
                              </div>
                              <CardDescription className="text-muted-foreground text-sm mt-2">
                                Erstellt am{' '}
                                {format(new Date(poll.createdAt), 'dd.MM.yyyy', { locale: de })}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 pt-0">
                              <div className="text-sm text-foreground mb-3 font-medium">
                                {poll.responses.length} Antwort{poll.responses.length === 1 ? '' : 'en'}
                              </div>
                              {/* Optional: Vorschau der letzten Antwort */}
                              {poll.responses.length > 0 && (
                                <div className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                                  Letzte Antwort von{' '}
                                  <span className="text-foreground font-medium">
                                    {poll.responses[poll.responses.length - 1].userName}
                                  </span>
                                  : "{poll.responses[poll.responses.length - 1].response}"
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </React.Fragment>
                  )
              )
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
