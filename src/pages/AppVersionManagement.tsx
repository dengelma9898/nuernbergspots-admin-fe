import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { useAppVersionService } from '@/services/appVersionService';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton, glassInput } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Skeleton Component
const AppVersionManagementSkeleton = () => (
  <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
    {/* Header Skeleton */}
    <Card className={cn(glassCard, 'p-4 sm:p-6 mb-6')}>
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64 rounded" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </Card>

    {/* Content Skeleton */}
    <div className="space-y-6">
      {/* Current Version Card Skeleton */}
      <Card className={cn(glassCard)}>
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-72 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Set Version Card Skeleton */}
      <Card className={cn(glassCard)}>
        <CardHeader>
          <Skeleton className="h-6 w-56 rounded" />
          <Skeleton className="h-4 w-80 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export function AppVersionManagement() {
  const navigate = useNavigate();
  const appVersionService = useAppVersionService();
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [versionInput, setVersionInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMinimumVersion();
  }, []);

  const loadMinimumVersion = async () => {
    try {
      setIsLoading(true);
      const version = await appVersionService.getMinimumVersion();
      if (version) {
        setCurrentVersion(version.minimumVersion);
        setVersionInput(version.minimumVersion);
      } else {
        setCurrentVersion(null);
        setVersionInput('');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mindestversion:', error);
      showUserFriendlyError(error, toast, () => loadMinimumVersion(), 'generic');
    } finally {
      setIsLoading(false);
    }
  };

  const validateVersionFormat = (version: string): boolean => {
    // Format: X.Y.Z (z.B. 1.2.3)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedVersion = versionInput.trim();

    if (!trimmedVersion) {
      toast.error('Bitte geben Sie eine Version ein');
      return;
    }

    if (!validateVersionFormat(trimmedVersion)) {
      toast.error('Ungültiges Versionsformat. Bitte verwenden Sie das Format X.Y.Z (z.B. 1.2.3)');
      return;
    }

    try {
      setIsSaving(true);
      const result = await appVersionService.setMinimumVersion({
        minimumVersion: trimmedVersion,
      });
      setCurrentVersion(result.minimumVersion);
      showSuccessMessage(toast, {
        title: 'Mindestversion aktualisiert',
        description: `Die Mindestversion wurde erfolgreich auf ${result.minimumVersion} gesetzt.`,
      });
    } catch (error) {
      console.error('Fehler beim Setzen der Mindestversion:', error);
      showUserFriendlyError(error, toast, () => handleSubmit(e), 'generic');
    } finally {
      setIsSaving(false);
    }
  };

  const pageContent = (
    <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
      {/* Header Section */}
      <motion.div
        className={cn(glassCard, 'p-4 sm:p-6 mb-6')}
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={defaultTransition}
      >
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <AnimatedButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className={cn(glassButton, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zum Dashboard</span>
            </AnimatedButton>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
              App-Version-Verwaltung
            </h1>
          </div>
          <AnimatedButton
            variant="ghost"
            size="icon"
            onClick={loadMinimumVersion}
            disabled={isLoading}
            className={cn(glassButton, 'rounded-full')}
            title="Aktualisieren"
          >
            <RefreshCw className={cn('h-5 w-5', isLoading && 'animate-spin')} />
            <span className="sr-only">Aktualisieren</span>
          </AnimatedButton>
        </div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Aktuelle Version Card */}
        <Card className={cn(glassCard)}>
          <CardHeader>
            <CardTitle className="text-foreground">Aktuelle Mindestversion</CardTitle>
            <CardDescription className="text-muted-foreground">
              Die aktuell konfigurierte Mindestversion der App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentVersion ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-foreground">
                      {currentVersion}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-500/50">
                      Aktiv
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Format: X.Y.Z (Semantic Versioning)
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground">Keine Version konfiguriert</span>
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/50">
                    Nicht gesetzt
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Version setzen Card */}
        <Card className={cn(glassCard)}>
          <CardHeader>
            <CardTitle className="text-foreground">Mindestversion setzen</CardTitle>
            <CardDescription className="text-muted-foreground">
              Setzen Sie die Mindestversion für die App. Wenn bereits eine Version existiert, wird
              sie aktualisiert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version" className="text-foreground">
                  Version
                </Label>
                <Input
                  id="version"
                  type="text"
                  placeholder="z.B. 1.2.3"
                  value={versionInput}
                  onChange={(e) => setVersionInput(e.target.value)}
                  disabled={isLoading || isSaving}
                  className={cn(glassInput)}
                  pattern="^\d+\.\d+\.\d+$"
                />
                <p className="text-xs text-muted-foreground">
                  Format: X.Y.Z (z.B. 1.2.3) - Semantic Versioning
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <LoadingButton
                  type="submit"
                  disabled={isLoading || isSaving || !versionInput.trim()}
                  loading={isSaving}
                  className={cn(glassButton, 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50')}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Version speichern
                </LoadingButton>
                {currentVersion && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVersionInput(currentVersion)}
                    disabled={isLoading || isSaving}
                    className={cn(glassButton)}
                  >
                    Aktuelle Version verwenden
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className={cn(glassCard, 'border-blue-500/50 bg-blue-500/5')}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Information</p>
                <p className="text-xs text-muted-foreground">
                  Die Mindestversion bestimmt, welche App-Versionen ein Update benötigen. Apps mit
                  einer niedrigeren Version als der Mindestversion werden aufgefordert, ein Update
                  durchzuführen.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Versionsformat:</strong> X.Y.Z (Semantic Versioning)
                  <br />
                  <strong>Beispiel:</strong> 1.2.3 (Major.Minor.Patch)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <AppVersionManagementSkeleton />
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

