import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trash2, Users, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAccountManagementService } from '@/services/accountManagementService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassCardHover, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

// Skeleton Components
const AccountManagementSkeleton = () => (
  <div className="container mx-auto max-w-full p-4 sm:p-6 md:p-8 px-2 overflow-x-hidden relative z-10">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
      <Skeleton className="h-10 w-48 rounded" />
      <Skeleton className="h-8 w-44 rounded" />
    </div>

    {/* Card Skeleton */}
    <Card className={cn(glassCard, 'px-2 py-2')}>
      <CardHeader>
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-5 w-80 rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
            {/* Stats Card 1 */}
            <Card className={cn(glassCard, 'p-4')}>
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-6 sm:h-8 w-8 rounded" />
              </div>
            </Card>

            {/* Stats Card 2 */}
            <Card className={cn(glassCard, 'p-4')}>
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-6 sm:h-8 w-6 rounded" />
              </div>
            </Card>

            {/* Stats Card 3 */}
            <Card className={cn(glassCard, 'p-4')}>
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-6 sm:h-8 w-20 rounded" />
              </div>
            </Card>
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-10 w-48 rounded" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export function AccountManagement() {
  const navigate = useNavigate();
  const accountManagementService = useAccountManagementService();
  const [stats, setStats] = useState<{
    total: number;
    oldAccounts: number;
    cutoffDate?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await accountManagementService.getAnonymousAccountStats();
      setStats(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Statistiken');
      console.error('Fehler beim Laden der Statistiken:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setIsCleaning(true);
      await accountManagementService.cleanupAnonymousAccounts();
      await loadStats();
      toast.success('Anonyme Accounts erfolgreich bereinigt');
    } catch (error) {
      toast.error('Fehler beim Bereinigen der anonymen Accounts');
      console.error('Fehler beim Bereinigen der anonymen Accounts:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const pageContent = (
    <div className="container mx-auto max-w-full p-4 sm:p-6 md:p-8 px-2 overflow-x-hidden relative z-10">
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={defaultTransition}
      >
        <AnimatedButton
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className={cn(glassButton)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </AnimatedButton>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">Account-Management</h1>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.1 }}
      >
        <Card className={cn(glassCard, 'px-2 py-2')}>
          <CardHeader>
            <CardTitle className="text-foreground">Anonyme Accounts</CardTitle>
            <CardDescription className="text-muted-foreground break-words">
              Verwaltung und Bereinigung von anonymen Benutzeraccounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-6">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={fadeInUp}>
                    <Card className={cn(glassCardHover, 'p-4')}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                        <div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Gesamt</div>
                          <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Card className={cn(glassCardHover, 'p-4')}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                        <div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Älter als 5 Tage</div>
                          <div className="text-lg sm:text-2xl font-bold text-foreground">
                            {stats.oldAccounts}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Card className={cn(glassCardHover, 'p-4')}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                        <div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Alle Accounts älter als</div>
                          <div className="text-lg sm:text-2xl font-bold text-foreground">
                            {stats.cutoffDate
                              ? format(new Date(stats.cutoffDate), 'dd.MM.yyyy', { locale: de })
                              : 'Nie'}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <LoadingButton
                      variant="destructive"
                      disabled={stats.oldAccounts === 0 || isCleaning}
                      className="w-full sm:w-auto"
                    >
                      {isCleaning ? (
                        <>
                          Bereinigung läuft...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Alte Accounts bereinigen
                        </>
                      )}
                    </LoadingButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={cn(glassCard)}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        Anonyme Accounts bereinigen
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Möchten Sie wirklich alle anonymen Accounts löschen, die älter als 5 Tage
                        sind? Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={cn(glassButton)}>
                        Abbrechen
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCleanup}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Bereinigen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-base">Keine Daten verfügbar</div>
            )}
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
          <AccountManagementSkeleton />
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
