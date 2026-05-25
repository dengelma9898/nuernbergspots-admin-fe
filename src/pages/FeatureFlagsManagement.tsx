import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { useBusinessEventsSettingsService } from '@/services/businessEventsSettingsService';
import { UserType } from '@/models/users';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Skeleton Component
const FeatureFlagsManagementSkeleton = () => (
  <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
      <Skeleton className="h-10 w-48 rounded" />
      <Skeleton className="h-8 w-44 rounded" />
    </div>

    {/* Content Skeleton */}
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-5 w-80 rounded" />
      </div>

      {/* Feature Flag Card Skeleton */}
      <div className="border border-secondary rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export function FeatureFlagsManagement() {
  const navigate = useNavigate();
  const businessEventsSettingsService = useBusinessEventsSettingsService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const [businessEventsEnabled, setBusinessEventsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadBusinessEventsSettings(), loadUserRole()]);
  };

  const loadBusinessEventsSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await businessEventsSettingsService.getBusinessEventsSettings();
      setBusinessEventsEnabled(settings?.isEnabled ?? false);
    } catch (error) {
      console.error('Fehler beim Laden der Business Events Settings:', error);
      showUserFriendlyError(error, toast, () => loadBusinessEventsSettings(), 'generic');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;
      const profile = await userService.getUserProfile(userId);
      setUserRole(profile.userType);
    } catch (error) {
      console.error('Fehler beim Laden der User-Rolle:', error);
    }
  };

  const handleBusinessEventsToggle = async (newValue: boolean) => {
    if (userRole !== UserType.SUPER_ADMIN) {
      return;
    }

    if (isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      const updatedSettings =
        await businessEventsSettingsService.updateBusinessEventsSettings(newValue);
      setBusinessEventsEnabled(updatedSettings.isEnabled);
      showSuccessMessage(toast, {
        title: updatedSettings.isEnabled
          ? 'Business Events aktiviert'
          : 'Business Events deaktiviert',
        description: updatedSettings.isEnabled
          ? 'Partner können jetzt Events für ihre Unternehmen erstellen.'
          : 'Partner können keine Events mehr für ihre Unternehmen erstellen.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Business Events Settings:', error);
      showUserFriendlyError(error, toast, () => handleBusinessEventsToggle(newValue), 'generic');
    } finally {
      setIsUpdating(false);
    }
  };

  const isSuperAdmin = userRole === UserType.SUPER_ADMIN;

  const pageContent = (
    <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
      <motion.div
        className="flex flex-row items-center gap-4 mb-6"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={defaultTransition}
      >
        <AnimatedButton
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className={cn(glassButton, 'rounded-full')}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Zurück zum Dashboard</span>
        </AnimatedButton>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">
          Feature Flags Verwaltung
        </h1>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Überschrift */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Feature Flags</h2>
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            Verwalten Sie die Feature Flags der Anwendung. Feature Flags ermöglichen es, Funktionen
            ein- und auszuschalten, ohne Code zu ändern.
          </p>
        </div>

        {/* Business Events Feature Flag */}
        <Card className={cn(glassCard, 'p-4 sm:p-6')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-foreground" />
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Business Events für Partner
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Steuert, ob Business Partner Events für ihre Unternehmen erstellen können
                  </CardDescription>
                </div>
              </div>
              <Badge
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full border shrink-0',
                  businessEventsEnabled
                    ? 'bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
                    : 'bg-red-600/20 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400'
                )}
              >
                {businessEventsEnabled ? 'Aktiviert ✅' : 'Deaktiviert ❌'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">
                  {businessEventsEnabled
                    ? 'Partner können Events für ihre Unternehmen erstellen. Diese Funktion ist aktiviert.'
                    : 'Partner können keine Events für ihre Unternehmen erstellen. Diese Funktion ist deaktiviert.'}
                </p>
                {!isSuperAdmin && (
                  <p className="text-xs text-muted-foreground/70">
                    Nur Super Admins können diese Einstellung ändern
                  </p>
                )}
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={businessEventsEnabled ?? false}
                    onCheckedChange={handleBusinessEventsToggle}
                    disabled={isLoading || isUpdating}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder für zukünftige Feature Flags */}
        <Card className={cn(glassCard, 'p-4 sm:p-6 opacity-60')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg font-semibold text-muted-foreground">
                  Weitere Feature Flags
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Weitere Feature Flags werden in Zukunft hier hinzugefügt
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <FeatureFlagsManagementSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {pageContent}
      </div>
    </PageTransition>
  );
}
