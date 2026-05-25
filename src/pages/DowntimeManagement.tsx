import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { useDowntimeService } from '@/services/downtimeService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

// Skeleton Component
const DowntimeManagementSkeleton = () => (
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

      {/* Toggle Section Skeleton */}
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

export function DowntimeManagement() {
  const navigate = useNavigate();
  const downtimeService = useDowntimeService();
  const [isDowntime, setIsDowntime] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  useEffect(() => {
    loadDowntimeStatus();
  }, []);

  const loadDowntimeStatus = async () => {
    try {
      setIsLoading(true);
      const status = await downtimeService.getDowntimeStatus();
      setIsDowntime(status.isDowntime);
    } catch (error) {
      console.error('Fehler beim Laden des Downtime-Status:', error);
      showUserFriendlyError(error, toast, () => loadDowntimeStatus(), 'generic');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleClick = (newValue: boolean) => {
    setPendingValue(newValue);
    setIsDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingValue === null) return;

    try {
      setIsUpdating(true);
      setIsDialogOpen(false);
      const status = await downtimeService.setDowntimeStatus(pendingValue);
      setIsDowntime(status.isDowntime);
      showSuccessMessage(toast, {
        title: status.isDowntime ? 'Downtime wurde aktiviert' : 'Downtime wurde deaktiviert',
        description: status.isDowntime
          ? 'Die Wartungsseite ist jetzt aktiv.'
          : 'Die Wartungsseite wurde deaktiviert.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Downtime-Status:', error);
      showUserFriendlyError(error, toast, () => handleConfirm(), 'generic');
    } finally {
      setIsUpdating(false);
      setPendingValue(null);
    }
  };

  const handleCancelToggle = () => {
    setIsDialogOpen(false);
    setPendingValue(null);
  };

  const getDialogTitle = () => {
    if (pendingValue === null) return 'Downtime ändern';
    return pendingValue ? 'Downtime aktivieren' : 'Downtime deaktivieren';
  };

  const getDialogDescription = () => {
    if (pendingValue === null) return '';

    if (pendingValue) {
      return 'Möchten Sie den Downtime wirklich aktivieren? Wenn der Downtime aktiviert ist, wird die Anwendung für alle Benutzer nicht verfügbar sein. Diese Aktion kann erhebliche Auswirkungen auf die Nutzererfahrung haben.';
    } else {
      return 'Möchten Sie den Downtime wirklich deaktivieren? Die Anwendung wird wieder für alle Benutzer verfügbar sein.';
    }
  };

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
          Downtime-Verwaltung
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
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Downtime-Status</h2>
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            Verwalten Sie den Wartungsmodus der Anwendung
          </p>
        </div>

        {/* Toggle Section */}
        <div className={cn(glassCard, 'p-4 sm:p-6')}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">Downtime aktiv</h3>
                {isDowntime && (
                  <span className="px-2 py-1 text-xs font-semibold bg-destructive/20 text-destructive rounded-full border border-destructive">
                    Aktiv
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isDowntime
                  ? 'Die Anwendung ist derzeit im Wartungsmodus und für Benutzer nicht verfügbar.'
                  : 'Die Anwendung ist derzeit verfügbar. Aktivieren Sie den Downtime, um die Anwendung in den Wartungsmodus zu versetzen.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isDowntime}
                onCheckedChange={handleToggleClick}
                disabled={isLoading || isUpdating}
              />
            </div>
          </div>
        </div>

        {/* Warning Info */}
        {isDowntime && (
          <div className={cn(glassCard, 'p-4 sm:p-6 border-yellow-500/50 bg-yellow-500/5')}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Wartungsmodus aktiv</p>
                <p className="text-xs text-muted-foreground">
                  Die Anwendung ist derzeit nicht verfügbar. Benutzer können nicht auf die Anwendung
                  zugreifen, bis der Downtime deaktiviert wird.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className={cn(glassCard)}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">{getDialogTitle()}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {getDialogDescription()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelToggle} className={cn(glassButton)}>
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggle}
                className={cn(
                  pendingValue
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
              >
                {pendingValue ? 'Aktivieren' : 'Deaktivieren'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <DowntimeManagementSkeleton />
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
