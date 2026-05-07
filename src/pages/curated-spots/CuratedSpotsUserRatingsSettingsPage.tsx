import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { cn } from '@/lib/utils';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { glassButton, glassCard } from '@/lib/glassmorphism';

import { useCuratedSpotService } from '@/services/curatedSpotService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { CuratedSpotsUserRatingsSettings } from '@/models/curated-spot';
import { UserType } from '@/models/users';

import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';

function SettingsPageSkeleton() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Skeleton className="h-10 w-56 rounded-xl" />
      <Card className={cn(glassCard)}>
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-full rounded mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-14 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function CuratedSpotsUserRatingsSettingsPage() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();

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

  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [settings, setSettings] = useState<CuratedSpotsUserRatingsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [patching, setPatching] = useState(false);

  const isAdminOrSuperAdmin =
    userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

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

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await curatedSpotServiceRef.current.getUserRatingsSettings();
      setSettings(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden der Community-Bewertungs-Einstellungen:', error);
      showUserFriendlyError(error, toast, undefined, 'generic');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadUserRole();
      void loadSettings();
    });
  }, [loadUserRole, loadSettings]);

  const handleToggle = async (enabled: boolean) => {
    if (patching || !isAdminOrSuperAdmin) return;
    try {
      setPatching(true);
      const data = await curatedSpotServiceRef.current.patchUserRatingsSettings({
        isEnabled: enabled,
      });
      setSettings(data);
      showSuccessMessage(toast, {
        title: enabled ? 'Community-Bewertungen aktiviert' : 'Community-Bewertungen deaktiviert',
        description: enabled
          ? 'Nutzer können kuratierte Spots einmalig bewerten (Apps/Web gemäß Backend).'
          : 'Nutzer können keine Spot-Bewertungen mehr abgeben.',
      });
    } catch (error) {
      showUserFriendlyError(error, toast, undefined, 'generic');
    } finally {
      setPatching(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
          <div className="max-w-xl mx-auto space-y-6">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={defaultTransition}
              className="flex items-center gap-3"
            >
              <AnimatedButton
                variant="outline"
                size="icon"
                onClick={() => navigate('/curated-spots')}
                className={cn(glassButton)}
                aria-label="Zurück zu kuratierten Spots"
              >
                <ArrowLeft className="h-4 w-4" />
              </AnimatedButton>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Star className="h-7 w-7 shrink-0" />
                Community-Bewertungen
              </h1>
            </motion.div>

            {!isAdminOrSuperAdmin && userRole !== null && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nur Lesen</AlertTitle>
                <AlertDescription>
                  Nur Admin oder Super-Admin können den Schalter ändern. Der aktuelle Status wird
                  geladen (siehe Backend-Doku curated-spots-ratings-web-integration).
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <SettingsPageSkeleton />
            ) : (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={defaultTransition}
              >
                <Card className={cn(glassCard)}>
                  <CardHeader>
                    <CardTitle className="text-foreground">Nutzer dürfen Spots bewerten</CardTitle>
                    <CardDescription>
                      Steuert, ob Apps die Routen für Nutzerbewertungen nutzen dürfen. Solange das
                      Feature aktiv ist, kann jede Person jeden Spot nur einmal bewerten.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="user-ratings-enabled" className="text-foreground">
                        Community-Bewertungen
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {settings?.updatedAt
                          ? `Zuletzt geändert: ${new Intl.DateTimeFormat('de-DE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            }).format(new Date(settings.updatedAt))}`
                          : 'Status geladen.'}
                        {settings?.updatedBy ? ` · ${settings.updatedBy}` : ''}
                      </p>
                    </div>
                    <Switch
                      id="user-ratings-enabled"
                      checked={settings?.isEnabled ?? false}
                      onCheckedChange={handleToggle}
                      disabled={!isAdminOrSuperAdmin || patching || loading}
                      className="shrink-0"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
