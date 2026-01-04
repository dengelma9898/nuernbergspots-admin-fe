import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Power } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { useDirectChatService } from '@/services/directChatService';
import { IDirectChatSettings } from '@/models/direct-chat';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

// Skeleton für den Feature Toggle Card
function FeatureToggleSkeleton() {
  return (
    <Card className={cn(glassCard, 'p-6')}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DirectChats() {
  const navigate = useNavigate();
  const directChatService = useDirectChatService();
  const isInitialMount = useRef(true);

  const [settings, setSettings] = useState<IDirectChatSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await directChatService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Fehler beim Laden der Settings:', error);
      showUserFriendlyError(error, toast, () => loadSettings(), 'load-settings');
    } finally {
      setIsLoading(false);
    }
  }, [directChatService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadSettings();
    }
  }, [loadSettings]);

  const handleToggleFeature = async (isEnabled: boolean) => {
    try {
      setIsUpdating(true);
      const updatedSettings = await directChatService.updateSettings({ isEnabled });
      setSettings(updatedSettings);
      showSuccessMessage(toast, {
        title: isEnabled ? 'Feature aktiviert' : 'Feature deaktiviert',
        description: isEnabled 
          ? 'Direkte Chats sind jetzt für alle Nutzer verfügbar.'
          : 'Direkte Chats wurden deaktiviert.',
      });
    } catch (error: unknown) {
      console.error('Fehler beim Aktualisieren der Settings:', error);
      // Bei 403 Forbidden - keine Berechtigung
      if ((error as { status?: number }).status === 403) {
        toast.error('Keine Berechtigung', {
          description: 'Nur Super-Admins können dieses Feature aktivieren oder deaktivieren.',
        });
      } else {
        showUserFriendlyError(error, toast, undefined, 'update-settings');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="container mx-auto p-4 sm:p-8 max-w-7xl relative z-10">
          <motion.div
            className="space-y-6 sm:space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Header */}
            <motion.div
              className={cn(glassCard, 'p-6')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    className={cn(glassButton, 'rounded-full')}
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Zurück zum Dashboard</span>
                  </AnimatedButton>
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
                    Direkte Chats
                  </h1>
                </div>
                <div className="text-base sm:text-lg text-muted-foreground max-w-md ml-12">
                  Verwalten Sie hier alle direkten Chat-Konversationen
                </div>
              </div>
            </motion.div>

            {/* Feature Toggle Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              {isLoading ? (
                <FeatureToggleSkeleton />
              ) : (
                <Card className={cn(glassCard, 'p-6')}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2.5 rounded-full',
                          settings?.isEnabled 
                            ? 'bg-success/20 text-success' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          <Power className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <Label 
                            htmlFor="feature-toggle" 
                            className="text-base font-semibold text-foreground cursor-pointer"
                          >
                            Feature aktivieren
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {settings?.isEnabled 
                              ? 'Direkte Chats sind für alle Nutzer verfügbar'
                              : 'Direkte Chats sind derzeit deaktiviert'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="feature-toggle"
                        checked={settings?.isEnabled ?? false}
                        onCheckedChange={handleToggleFeature}
                        disabled={isUpdating}
                        aria-label="Direkte Chats aktivieren oder deaktivieren"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
