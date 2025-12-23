import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Trophy,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdventCalendarEntry } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/models/users';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassCardHover, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

function AdventCalendarEntrySkeleton() {
  return (
    <Card className={cn(glassCard, 'p-2 sm:p-4 flex flex-col justify-between h-full')}>
      {/* Image skeleton */}
      <div className="relative h-48 w-full mb-4">
        <Skeleton className="w-full h-full rounded-t-lg" />
        {/* Day badge placeholder */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4 rounded" />
            </CardTitle>
            <CardDescription className="mt-1">
              <Skeleton className="h-4 w-32 rounded" />
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>

        {/* Winners count */}
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-3 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

function AdventCalendarEntryMobileSkeleton() {
  return (
    <Card className={cn(glassCard, 'p-4')}>
      <div className="flex flex-col gap-2">
        {/* Day badge */}
        <Skeleton className="h-6 w-20 rounded-full mb-2" />

        {/* Image */}
        <Skeleton className="w-full h-40 rounded mb-2" />

        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-3/4 rounded" />
        </div>

        {/* Description */}
        <div className="space-y-1 mb-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        {/* Winners count */}
        <Skeleton className="h-3 w-32 rounded mb-2" />

        {/* Created date */}
        <Skeleton className="h-3 w-40 rounded mb-2" />

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

export function AdventCalendarManagement() {
  const [entries, setEntries] = useState<AdventCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState<boolean>(false);
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);
  const [isUpdatingFeatureStatus, setIsUpdatingFeatureStatus] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const adventCalendarService = useAdventCalendarService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedEntries = await adventCalendarService.getAll();
      // Sortiere nach Nummer
      const sortedEntries = fetchedEntries.sort((a, b) => a.number - b.number);
      setEntries(sortedEntries);
    } catch (error) {
      toast.error('Fehler beim Laden der Daten', {
        description:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureStatus = async () => {
    try {
      setIsLoadingFeatureStatus(true);
      const status = await adventCalendarService.getFeatureStatus();
      setFeatureStatus(status.isFeatureActive);
    } catch (error) {
      console.error('Fehler beim Laden des Feature-Status:', error);
      // Nicht als Fehler anzeigen, da alle Rollen den Status lesen können sollten
    } finally {
      setIsLoadingFeatureStatus(false);
    }
  };

  const loadUserRole = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const userProfile = await userService.getUserProfile(userId);
      setUserRole(userProfile.userType);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  };

  const handleFeatureStatusToggle = async (newValue: boolean) => {
    try {
      setIsUpdatingFeatureStatus(true);
      const status = await adventCalendarService.setFeatureStatus(newValue);
      setFeatureStatus(status.isFeatureActive);
      toast.success(
        status.isFeatureActive
          ? 'Adventskalender-Feature wurde aktiviert'
          : 'Adventskalender-Feature wurde deaktiviert'
      );
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Feature-Status', {
        description: 'Der Status konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
      });
      console.error('Fehler beim Aktualisieren des Feature-Status:', error);
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  useEffect(() => {
    loadData();
    loadFeatureStatus();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (entryId: string) => {
    if (!confirm('Möchten Sie diesen Adventskalender-Eintrag wirklich löschen?')) {
      return;
    }

    try {
      await adventCalendarService.delete(entryId);
      toast.success('Eintrag gelöscht', {
        description: 'Der Adventskalender-Eintrag wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description:
          'Der Eintrag konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
      });
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.number.toString().includes(searchQuery);
    return matchesSearch;
  });

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          {/* Main Content */}
          <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
            {/* Header Skeleton */}
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <Skeleton className="h-10 w-44 rounded-xl" />
                <Skeleton className="h-8 w-48 rounded" />
                <div className="w-full sm:w-auto sm:ml-auto">
                  <Skeleton className="h-10 w-56 rounded-xl" />
                </div>
              </div>
            </Card>

            {/* Filter Skeleton */}
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <Skeleton className="h-10 w-full rounded-lg" />
            </Card>

            {/* Mobile Card Skeletons */}
            <div className="block md:hidden space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdventCalendarEntryMobileSkeleton key={index} />
              ))}
            </div>

            {/* Desktop Grid Skeletons */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <AdventCalendarEntrySkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <motion.div
          className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className={cn(glassCard, 'p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Dashboard
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto text-foreground">
                Adventskalender Verwaltung
              </h1>
              <div className="w-full sm:w-auto sm:ml-auto">
                <AnimatedButton
                  onClick={() => navigate('/advent-calendar/new')}
                  className={cn(glassButton, 'w-full sm:w-auto')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Eintrag hinzufügen
                </AnimatedButton>
              </div>
            </div>
          </motion.div>

          {/* Feature Status Card (nur für Admin/Super Admin) */}
          {isAdminOrSuperAdmin && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard, 'p-6 mb-6')}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-foreground" />
                      <Label htmlFor="feature-status" className="text-foreground text-lg font-semibold">
                        Feature-Status
                      </Label>
                      {featureStatus && (
                        <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                          Aktiviert
                        </Badge>
                      )}
                      {!featureStatus && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive">
                          Deaktiviert
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {featureStatus
                        ? 'Das Adventskalender-Feature ist aktiviert und für Benutzer verfügbar.'
                        : 'Das Adventskalender-Feature ist deaktiviert und für Benutzer nicht verfügbar.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isLoadingFeatureStatus ? (
                      <Skeleton className="h-6 w-12 rounded-full" />
                    ) : (
                      <Switch
                        id="feature-status"
                        checked={featureStatus}
                        onCheckedChange={handleFeatureStatusToggle}
                        disabled={isUpdatingFeatureStatus}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Feature Status Info (für alle anderen Rollen) */}
          {!isAdminOrSuperAdmin && !isLoadingFeatureStatus && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard, 'p-6 mb-6')}>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-foreground" />
                  <div className="flex-1">
                    <Label className="text-foreground text-lg font-semibold">Feature-Status</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {featureStatus ? (
                        <>
                          <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 mr-2">
                            Aktiviert
                          </Badge>
                          Das Adventskalender-Feature ist aktiviert.
                        </>
                      ) : (
                        <>
                          <Badge className="bg-destructive/20 text-destructive border-destructive mr-2">
                            Deaktiviert
                          </Badge>
                          Das Adventskalender-Feature ist deaktiviert.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Einträgen suchen..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(glassInput, 'rounded-lg pl-10')}
                />
              </div>
            </Card>
          </motion.div>

          {filteredEntries.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <Card className={cn(glassCard, 'p-8 text-center')}>
                <div className="text-foreground text-lg">Keine Adventskalender-Einträge gefunden.</div>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Mobile Card-Ansicht */}
              <motion.div
                className="block md:hidden space-y-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredEntries.map((entry, index) => (
                  <motion.div key={entry.id} variants={fadeInUp}>
                    <AdventCalendarEntryCardMobile
                      entry={entry}
                      onDelete={handleDelete}
                      navigate={navigate}
                    />
                  </motion.div>
                ))}
              </motion.div>
              {/* Desktop/Table Ansicht */}
              <motion.div
                className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredEntries.map((entry, index) => (
                  <motion.div key={entry.id} variants={fadeInUp}>
                    <AdventCalendarEntryCard
                      entry={entry}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}


interface AdventCalendarEntryCardProps {
  entry: AdventCalendarEntry;
  onDelete: (id: string) => void;
}

const AdventCalendarEntryCard: React.FC<AdventCalendarEntryCardProps> = ({
  entry,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={defaultTransition}
    >
      <Card className={cn(glassCardHover, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        {entry.imageUrl ? (
          <div className="relative h-48 w-full">
            <img
              src={entry.imageUrl}
              alt={entry.description}
              className="object-cover w-full h-full rounded-t-lg bg-muted p-2 border-b border-secondary"
            />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">
              Nr. {entry.number}
            </Badge>
          </div>
        ) : (
          <div className="relative h-48 w-full bg-muted rounded-t-lg flex items-center justify-center border-b border-secondary">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">
              Nr. {entry.number}
            </Badge>
          </div>
        )}

        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <CardTitle className="text-foreground">Eintrag #{entry.number}</CardTitle>
          <CardDescription className="text-muted-foreground">{entry.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow !px-4 !py-2 gap-0">
          {entry.winners && entry.winners.length > 0 && (
            <div className="flex items-center text-sm text-foreground mb-2">
              <Trophy className="h-4 w-4 mr-2" />
              {entry.winners.length} Gewinner
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 !px-4 !pt-2 !pb-4 gap-0">
          {entry.canParticipate && (
            <div className="w-full mb-2">
              <AnimatedButton
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/advent-calendar/${entry.id}/participants`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Teilnehmer
              </AnimatedButton>
            </div>
          )}
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-muted-foreground">
              {formatDate(entry.createdAt)}
            </div>
            <div className="flex gap-2">
              <AnimatedButton
                variant="outline"
                size="sm"
                className={cn(glassButton)}
                onClick={() => navigate(`/advent-calendar/${entry.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton
                variant="destructive"
                size="sm"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </AnimatedButton>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface AdventCalendarEntryCardMobileProps {
  entry: AdventCalendarEntry;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
}

const AdventCalendarEntryCardMobile: React.FC<AdventCalendarEntryCardMobileProps> = ({
  entry,
  onDelete,
  navigate,
}) => {
  return (
    <Card className={cn(glassCardHover, 'p-4')}>
      <div className="flex flex-col gap-2">
        <Badge className="w-fit bg-primary text-primary-foreground border-0 mb-2">
          Nr. {entry.number}
        </Badge>
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.description}
            className="object-cover w-full h-40 rounded bg-muted p-2 border border-secondary mb-2"
          />
        )}
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-lg text-foreground">Eintrag #{entry.number}</span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">{entry.description}</div>
        {entry.winners && entry.winners.length > 0 && (
          <div className="flex items-center text-sm text-foreground mb-2">
            <Trophy className="h-4 w-4 mr-2" />
            {entry.winners.length} Gewinner
          </div>
        )}
        <div className="text-xs text-muted-foreground mb-2">
          Erstellt am {formatDate(entry.createdAt)}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {entry.canParticipate && (
            <AnimatedButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/advent-calendar/${entry.id}/participants`)}
            >
              <Users className="mr-2 h-4 w-4" />
              Teilnehmer
            </AnimatedButton>
          )}
          <AnimatedButton
            variant="outline"
            size="sm"
            className={cn(glassButton, 'w-full')}
            onClick={() => navigate(`/advent-calendar/${entry.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </AnimatedButton>
          <AnimatedButton
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </AnimatedButton>
        </div>
      </div>
    </Card>
  );
};

