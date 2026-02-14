import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { glassCard, glassCardHover, glassInput, glassButton } from '@/lib/glassmorphism';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useTaxiStandService } from '@/services/taxiStandService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { TaxiStand, TaxiStandFeatureStatus } from '@/models/taxi-stand';
import { UserType } from '@/models/users';

import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Search,
  Settings,
  MapPin,
  Phone,
  Car,
  BarChart3,
  AlertCircle,
  Calendar,
} from 'lucide-react';

// --- Skeleton Components ---

function TaxiStandCardSkeleton() {
  return (
    <Card className={cn(glassCard, 'p-2 sm:p-4 flex flex-col justify-between h-full')}>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded mt-1" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
        <Skeleton className="h-4 w-32 rounded" />
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

function TaxiStandMobileSkeleton() {
  return (
    <Card className={cn(glassCard, 'p-4')}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-40 rounded mb-2" />
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

// --- Main Component ---

export function TaxiStandManagement() {
  const [stands, setStands] = useState<TaxiStand[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureDisabledError, setFeatureDisabledError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState<TaxiStandFeatureStatus>({
    isFeatureActive: false,
    startDate: undefined,
  });
  const [startDateInput, setStartDateInput] = useState('');
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);
  const [isUpdatingFeatureStatus, setIsUpdatingFeatureStatus] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const taxiStandService = useTaxiStandService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadStands = async () => {
    try {
      setLoading(true);
      setFeatureDisabledError(false);
      const fetchedStands = await taxiStandService.getAll();
      setStands(fetchedStands.filter(stand => stand.id !== 'feature-status'));
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 503) {
        setFeatureDisabledError(true);
        setStands([]);
      } else {
        console.error('Fehler beim Laden der Taxistandorte:', error);
        showUserFriendlyError(error, toast, () => loadStands(), 'generic');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureStatus = async () => {
    try {
      setIsLoadingFeatureStatus(true);
      const status = await taxiStandService.getFeatureStatus();
      setFeatureStatus(status);
      setStartDateInput(status.startDate || '');
    } catch (error) {
      console.error('Fehler beim Laden des Feature-Status:', error);
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
    if (isUpdatingFeatureStatus) return;

    try {
      setIsUpdatingFeatureStatus(true);
      const status = await taxiStandService.setFeatureStatus(newValue, startDateInput || undefined);
      setFeatureStatus(status);
      showSuccessMessage(toast, {
        title: status.isFeatureActive
          ? 'Taxistandorte-Feature wurde aktiviert'
          : 'Taxistandorte-Feature wurde deaktiviert',
        description: status.isFeatureActive
          ? 'Die Taxistandorte sind jetzt für Benutzer sichtbar.'
          : 'Die Taxistandorte wurden für Benutzer ausgeblendet.',
      });
      if (status.isFeatureActive) {
        loadStands();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Feature-Status:', error);
      showUserFriendlyError(error, toast, () => handleFeatureStatusToggle(newValue), 'generic');
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  const handleStartDateSave = async () => {
    if (isUpdatingFeatureStatus) return;

    try {
      setIsUpdatingFeatureStatus(true);
      const status = await taxiStandService.setFeatureStatus(
        featureStatus.isFeatureActive,
        startDateInput || undefined
      );
      setFeatureStatus(status);
      showSuccessMessage(toast, {
        title: 'Startdatum aktualisiert',
        description: `Das Startdatum wurde erfolgreich gespeichert.`,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Startdatums:', error);
      showUserFriendlyError(error, toast, () => handleStartDateSave(), 'generic');
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  useEffect(() => {
    loadFeatureStatus();
    loadStands();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (standId: string) => {
    if (!confirm('Möchten Sie diesen Taxistandort wirklich löschen?')) return;

    try {
      await taxiStandService.delete(standId);
      showSuccessMessage(toast, {
        title: 'Taxistandort gelöscht',
        description: 'Der Taxistandort wurde erfolgreich gelöscht.',
      });
      loadStands();
    } catch (error) {
      console.error('Fehler beim Löschen des Taxistandorts:', error);
      showUserFriendlyError(error, toast, () => handleDelete(standId), 'generic');
    }
  };

  const filteredStands = stands.filter(stand => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (stand.title && stand.title.toLowerCase().includes(query)) ||
      stand.location.address.toLowerCase().includes(query) ||
      stand.phoneNumber.toLowerCase().includes(query)
    );
  });

  const totalPhoneClicks = stands.reduce(
    (sum, stand) => sum + (stand.phoneClickTimestamps?.length || 0),
    0
  );

  if (loading || isLoadingFeatureStatus) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <Skeleton className="h-10 w-44 rounded-xl" />
                <Skeleton className="h-8 w-48 rounded" />
                <div className="w-full sm:w-auto sm:ml-auto">
                  <Skeleton className="h-10 w-56 rounded-xl" />
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className={cn(glassCard, 'p-4')}>
                  <Skeleton className="h-6 w-16 rounded mb-2" />
                  <Skeleton className="h-4 w-24 rounded" />
                </Card>
              ))}
            </div>
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <Skeleton className="h-10 w-full rounded-lg" />
            </Card>
            <div className="block md:hidden space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <TaxiStandMobileSkeleton key={i} />
              ))}
            </div>
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <TaxiStandCardSkeleton key={i} />
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
        <motion.div
          className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-row items-center gap-4">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className={cn(glassButton, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto text-foreground">
                Taxistandorte Verwaltung
              </h1>
              <div className="w-full sm:w-auto sm:ml-auto">
                <AnimatedButton
                  onClick={() => navigate('/taxi-stands/new')}
                  className={cn(glassButton, 'w-full sm:w-auto')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Standort anlegen
                </AnimatedButton>
              </div>
            </div>
          </motion.div>

          {/* Feature Status (nur Admin/Super-Admin) */}
          {isAdminOrSuperAdmin && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard, 'p-6 mb-6')}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-foreground" />
                        <Label htmlFor="feature-status" className="text-foreground text-lg font-semibold">
                          Feature-Status
                        </Label>
                        <Badge className={cn(
                          featureStatus.isFeatureActive
                            ? 'bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
                            : 'bg-destructive/20 text-destructive border-destructive'
                        )}>
                          {featureStatus.isFeatureActive ? 'Aktiviert' : 'Deaktiviert'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {featureStatus.isFeatureActive
                          ? 'Die Taxistandorte sind aktiviert und für Benutzer verfügbar.'
                          : 'Die Taxistandorte sind deaktiviert und für Benutzer nicht verfügbar.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLoadingFeatureStatus ? (
                        <Skeleton className="h-6 w-12 rounded-full" />
                      ) : (
                        <Switch
                          id="feature-status"
                          checked={featureStatus.isFeatureActive}
                          onCheckedChange={handleFeatureStatusToggle}
                          disabled={isUpdatingFeatureStatus}
                          className={cn(
                            'data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500',
                            'data-[state=unchecked]:bg-red-600 dark:data-[state=unchecked]:bg-red-500'
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Startdatum */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-2 border-t border-secondary">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="startDate" className="text-foreground text-sm font-medium">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Startdatum
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDateInput}
                        onChange={e => setStartDateInput(e.target.value)}
                        className={cn(glassInput, 'max-w-xs')}
                      />
                    </div>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={handleStartDateSave}
                      disabled={isUpdatingFeatureStatus || startDateInput === (featureStatus.startDate || '')}
                      className={cn(glassButton)}
                    >
                      Datum speichern
                    </AnimatedButton>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Statistiken */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.15 }}
          >
            <Card className={cn(glassCard, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Standorte</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stands.length}</div>
            </Card>
            <Card className={cn(glassCard, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Taxis gesamt</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stands.reduce((sum, s) => sum + (s.numberOfTaxis || 0), 0)}
              </div>
            </Card>
            <Card className={cn(glassCard, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Telefon-Klicks</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalPhoneClicks}</div>
            </Card>
          </motion.div>

          {/* 503-Fehlermeldung: Feature deaktiviert */}
          {featureDisabledError && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <Alert className={cn(glassCard, 'mb-6 border-amber-500/50')}>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-foreground">Taxistandorte-Feature ist derzeit deaktiviert</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Die Taxistandorte-Liste kann nicht geladen werden, solange das Feature deaktiviert ist.
                  {isAdminOrSuperAdmin && (
                    <span> Bitte aktivieren Sie das Feature oben in den Einstellungen.</span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Suchfeld */}
          {!featureDisabledError && (
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
                    placeholder="Nach Standort, Adresse oder Telefonnummer suchen..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={cn(glassInput, 'rounded-lg pl-10')}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Standortliste */}
          {!featureDisabledError && (
            <>
              {filteredStands.length === 0 && !loading ? (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.3 }}
                >
                  <Card className={cn(glassCard, 'p-8 text-center')}>
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-foreground text-lg">Keine Taxistandorte gefunden.</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Erstelle deinen ersten Taxistandort, um loszulegen.
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <>
                  {/* Mobile */}
                  <motion.div
                    className="block md:hidden space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {filteredStands.map(stand => (
                      <motion.div key={stand.id} variants={fadeInUp}>
                        <TaxiStandCardMobile
                          stand={stand}
                          onDelete={handleDelete}
                          navigate={navigate}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Desktop */}
                  <motion.div
                    className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {filteredStands.map(stand => (
                      <motion.div key={stand.id} variants={fadeInUp}>
                        <TaxiStandCard stand={stand} onDelete={handleDelete} />
                      </motion.div>
                    ))}
                  </motion.div>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

// --- Card Components ---

interface TaxiStandCardProps {
  stand: TaxiStand;
  onDelete: (id: string) => void;
}

const TaxiStandCard: React.FC<TaxiStandCardProps> = ({ stand, onDelete }) => {
  const navigate = useNavigate();
  const phoneClicks = stand.phoneClickTimestamps?.length || 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(glassCardHover, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <CardTitle className="text-foreground text-base">
            {stand.title || 'Taxistandort'}
          </CardTitle>
          {stand.description && (
            <CardDescription className="text-muted-foreground text-xs line-clamp-2">
              {stand.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex-grow !px-4 !py-2 gap-0 space-y-1.5">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{stand.location.address}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="h-3 w-3 mr-1 shrink-0" />
            <span>{stand.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {stand.numberOfTaxis != null && (
              <span className="flex items-center text-muted-foreground">
                <Car className="h-3 w-3 mr-1" />
                {stand.numberOfTaxis} Taxis
              </span>
            )}
            <span className="flex items-center text-muted-foreground">
              <BarChart3 className="h-3 w-3 mr-1" />
              {phoneClicks} Klicks
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end items-center !px-4 !pt-2 !pb-4 gap-0">
          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              size="sm"
              className={cn(glassButton)}
              onClick={() => navigate(`/taxi-stands/${stand.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </AnimatedButton>
            <AnimatedButton
              variant="destructive"
              size="sm"
              onClick={() => onDelete(stand.id)}
            >
              <Trash2 className="h-4 w-4" />
            </AnimatedButton>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface TaxiStandCardMobileProps {
  stand: TaxiStand;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
}

const TaxiStandCardMobile: React.FC<TaxiStandCardMobileProps> = ({ stand, onDelete, navigate }) => {
  const phoneClicks = stand.phoneClickTimestamps?.length || 0;

  return (
    <Card className={cn(glassCardHover, 'p-4')}>
      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg text-foreground">
          {stand.title || 'Taxistandort'}
        </span>
        {stand.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{stand.description}</p>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1 shrink-0" />
          <span className="truncate">{stand.location.address}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Phone className="h-3 w-3 mr-1 shrink-0" />
          <span>{stand.phoneNumber}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {stand.numberOfTaxis != null && (
            <span className="flex items-center text-muted-foreground">
              <Car className="h-3 w-3 mr-1" /> {stand.numberOfTaxis} Taxis
            </span>
          )}
          <span className="flex items-center text-muted-foreground">
            <BarChart3 className="h-3 w-3 mr-1" /> {phoneClicks} Klicks
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            className={cn(glassButton, 'w-full')}
            onClick={() => navigate(`/taxi-stands/${stand.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </AnimatedButton>
          <AnimatedButton
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(stand.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </AnimatedButton>
        </div>
      </div>
    </Card>
  );
};
