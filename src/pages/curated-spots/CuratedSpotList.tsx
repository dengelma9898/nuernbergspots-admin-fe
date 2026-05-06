import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { glassCard, glassCardHover, glassButton } from '@/lib/glassmorphism';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useCuratedSpotService } from '@/services/curatedSpotService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { CuratedSpot } from '@/models/curated-spot';
import { UserType } from '@/models/users';

import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Edit, MapPin, Plus, ShieldCheck, Trash2 } from 'lucide-react';

function CuratedSpotCardSkeleton() {
  return (
    <Card className={cn(glassCard, 'p-4 flex flex-col justify-between h-full')}>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded mt-2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </CardFooter>
    </Card>
  );
}

function statusBadgeVariant(status: CuratedSpot['status']) {
  return status === 'ACTIVE' ? 'default' : 'secondary';
}

export function CuratedSpotList() {
  const navigate = useNavigate();
  const curatedSpotService = useCuratedSpotService();
  const curatedSpotServiceRef = useRef(curatedSpotService);
  useEffect(() => {
    curatedSpotServiceRef.current = curatedSpotService;
  }, [curatedSpotService]);

  const userService = useUserService();
  const userServiceRef = useRef(userService);
  useEffect(() => {
    userServiceRef.current = userService;
  }, [userService]);

  const { getUserId } = useAuth();

  const [spots, setSpots] = useState<CuratedSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [actionSpotId, setActionSpotId] = useState<string | null>(null);

  const isAdminOrSuperAdmin =
    userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadSpots = useCallback(async () => {
    try {
      setLoading(true);
      const list = await curatedSpotServiceRef.current.listAdmin();
      setSpots(list);
    } catch (error) {
      // eslint-disable-next-line no-console -- Debug bei Lade-Fehlern
      console.error('Fehler beim Laden der kuratierten Spots:', error);
      showUserFriendlyError(error, toast, undefined, 'generic');
    } finally {
      setLoading(false);
    }
  }, []);

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
    queueMicrotask(() => {
      void loadSpots();
      void loadUserRole();
    });
  }, [loadSpots, loadUserRole]);

  const handleActivate = async (spotId: string) => {
    if (actionSpotId) return;
    try {
      setActionSpotId(spotId);
      await curatedSpotServiceRef.current.patch(spotId, { status: 'ACTIVE' });
      showSuccessMessage(toast, {
        title: 'Spot freigegeben',
        description: 'Der Spot ist jetzt ACTIVE.',
      });
      await loadSpots();
    } catch (error) {
      showUserFriendlyError(error, toast, () => handleActivate(spotId), 'generic');
    } finally {
      setActionSpotId(null);
    }
  };

  const handleDelete = async (spotId: string) => {
    if (!confirm('Spot wirklich löschen? (Soft-Delete im Backend)')) return;
    if (actionSpotId) return;
    try {
      setActionSpotId(spotId);
      await curatedSpotServiceRef.current.delete(spotId);
      showSuccessMessage(toast, {
        title: 'Spot gelöscht',
        description: 'Der Spot wurde als gelöscht markiert.',
      });
      await loadSpots();
    } catch (error) {
      showUserFriendlyError(error, toast, () => handleDelete(spotId), 'generic');
    } finally {
      setActionSpotId(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
          <div className="max-w-5xl mx-auto space-y-6">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={defaultTransition}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <AnimatedButton
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/')}
                  className={cn(glassButton)}
                  aria-label="Zurück zum Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </AnimatedButton>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-7 w-7 shrink-0" />
                    Kuratierte Spots
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verwaltung inkl. Freigabe (ACTIVE) und Soft-Delete — siehe Backend-Doku
                    curated-spots-admin-integration.
                  </p>
                </div>
              </div>
              <AnimatedButton
                onClick={() => navigate('/curated-spots/new')}
                className={cn(glassButton, 'w-full sm:w-auto')}
                disabled={!isAdminOrSuperAdmin}
              >
                <Plus className="h-4 w-4 mr-2" />
                Neuer Spot
              </AnimatedButton>
            </motion.div>

            {!isAdminOrSuperAdmin && userRole !== null && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Berechtigung</AlertTitle>
                <AlertDescription>
                  Nur Admin oder Super-Admin können Spots anlegen oder bearbeiten. Die Liste kann je nach
                  Backend dennoch sichtbar sein.
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <CuratedSpotCardSkeleton key={i} />
                ))}
              </div>
            ) : spots.length === 0 ? (
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Keine Spots</CardTitle>
                  <CardDescription>Lege den ersten kuratierten Spot an.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatedButton
                    onClick={() => navigate('/curated-spots/new')}
                    className={cn(glassButton)}
                    disabled={!isAdminOrSuperAdmin}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Spot erstellen
                  </AnimatedButton>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {spots.map((spot, index) => (
                  <motion.div
                    key={spot.id}
                    variants={fadeInUp}
                    transition={{ ...defaultTransition, delay: index * 0.04 }}
                  >
                    <Card className={cn(glassCardHover, 'h-full flex flex-col')}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg text-foreground line-clamp-2">{spot.name}</CardTitle>
                          <Badge variant={statusBadgeVariant(spot.status)}>{spot.status}</Badge>
                        </div>
                        <CardDescription className="text-muted-foreground">
                          {spot.address?.street?.trim()
                            ? `${spot.address.street} ${spot.address.houseNumber}, ${spot.address.postalCode} ${spot.address.city}`
                            : 'Keine Adresse hinterlegt'}{' '}
                          · {spot.keywordIds.length} Spot-Keyword(s) · {spot.imageUrls.length} Bild(er)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                        <p className="line-clamp-3 font-mono text-xs opacity-80">
                          {spot.descriptionMarkdown.slice(0, 160)}
                          {spot.descriptionMarkdown.length > 160 ? '…' : ''}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2">
                        <AnimatedButton
                          size="sm"
                          variant="outline"
                          className={cn(glassButton)}
                          onClick={() => navigate(`/curated-spots/${spot.id}/edit`)}
                          disabled={!isAdminOrSuperAdmin}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </AnimatedButton>
                        {spot.status === 'PENDING' && (
                          <AnimatedButton
                            size="sm"
                            className={cn(glassButton)}
                            onClick={() => handleActivate(spot.id)}
                            disabled={!isAdminOrSuperAdmin || actionSpotId === spot.id}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Freigeben
                          </AnimatedButton>
                        )}
                        <AnimatedButton
                          size="sm"
                          variant="destructive"
                          className="shrink-0"
                          onClick={() => handleDelete(spot.id)}
                          disabled={!isAdminOrSuperAdmin || actionSpotId === spot.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Löschen
                        </AnimatedButton>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
