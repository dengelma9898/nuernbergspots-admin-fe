import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

// Skeleton Components
const AccountManagementSkeleton = () => (
  <div className="container mx-auto max-w-full p-4 sm:p-6 md:p-8 px-2 overflow-x-hidden relative z-10">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
      <Skeleton className="h-10 w-48 bg-white/10 backdrop-blur-xl rounded" />
      <Skeleton className="h-8 w-44 bg-white/10 backdrop-blur-xl rounded" />
    </div>

    {/* Card Skeleton */}
    <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 px-2 py-2">
      <CardHeader>
        <Skeleton className="h-7 w-40 bg-white/10 backdrop-blur-xl rounded" />
        <Skeleton className="h-5 w-80 bg-white/10 backdrop-blur-xl rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
            {/* Stats Card 1 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-white/10 backdrop-blur-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-6 sm:h-8 w-8 bg-white/10 backdrop-blur-xl rounded" />
              </div>
            </div>

            {/* Stats Card 2 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-white/10 backdrop-blur-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-6 sm:h-8 w-6 bg-white/10 backdrop-blur-xl rounded" />
              </div>
            </div>

            {/* Stats Card 3 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-white/10 backdrop-blur-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-6 sm:h-8 w-20 bg-white/10 backdrop-blur-xl rounded" />
              </div>
            </div>
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-10 w-48 bg-white/10 backdrop-blur-xl rounded" />
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-xl border-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-white break-words">Account-Management</h1>
      </div>

      <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 px-2 py-2">
        <CardHeader>
          <CardTitle className="text-white">Anonyme Accounts</CardTitle>
          <CardDescription className="text-white/80 break-words">
            Verwaltung und Bereinigung von anonymen Benutzeraccounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white/90" />
                  <div>
                    <div className="text-xs sm:text-sm text-white/70">Gesamt</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">{stats.total}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white/90" />
                  <div>
                    <div className="text-xs sm:text-sm text-white/70">Älter als 5 Tage</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">
                      {stats.oldAccounts}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white/90" />
                  <div>
                    <div className="text-xs sm:text-sm text-white/70">Alle Accounts älter als</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">
                      {stats.cutoffDate
                        ? format(new Date(stats.cutoffDate), 'dd.MM.yyyy', { locale: de })
                        : 'Nie'}
                    </div>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={stats.oldAccounts === 0 || isCleaning}
                    className="cursor-pointer backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30 hover:border-red-400/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isCleaning ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Bereinigung läuft...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Alte Accounts bereinigen
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="backdrop-blur-3xl bg-white/10 border border-white/20 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Anonyme Accounts bereinigen
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/80">
                      Möchten Sie wirklich alle anonymen Accounts löschen, die älter als 5 Tage
                      sind? Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20">
                      Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanup}
                      className="backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30"
                    >
                      Bereinigen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="text-center py-4 text-white/80 text-base">Keine Daten verfügbar</div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />

        {/* Animated Blur Circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />

        <AccountManagementSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />

      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />

      {pageContent}
    </div>
  );
}
