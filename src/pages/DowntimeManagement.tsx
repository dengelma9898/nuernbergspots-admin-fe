import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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

// Skeleton Component
const DowntimeManagementSkeleton = () => (
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
          {/* Toggle Section Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-white/10 backdrop-blur-xl rounded" />
              <Skeleton className="h-4 w-64 bg-white/10 backdrop-blur-xl rounded" />
            </div>
            <Skeleton className="h-6 w-12 bg-white/10 backdrop-blur-xl rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
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
      toast.error('Fehler beim Laden des Downtime-Status');
      console.error('Fehler beim Laden des Downtime-Status:', error);
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
      toast.success(
        status.isDowntime
          ? 'Downtime wurde aktiviert'
          : 'Downtime wurde deaktiviert'
      );
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Downtime-Status');
      console.error('Fehler beim Aktualisieren des Downtime-Status:', error);
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
        <h1 className="text-xl sm:text-2xl font-bold text-white break-words">
          Downtime-Verwaltung
        </h1>
      </div>

      <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 px-2 py-2">
        <CardHeader>
          <CardTitle className="text-white">Downtime-Status</CardTitle>
          <CardDescription className="text-white/80 break-words">
            Verwalten Sie den Wartungsmodus der Anwendung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Toggle Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">Downtime aktiv</h3>
                  {isDowntime && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-100 rounded-full border border-red-400/30">
                      Aktiv
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70">
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
                  className="data-[state=checked]:bg-red-500/30 data-[state=unchecked]:bg-white/20"
                />
              </div>
            </div>

            {/* Warning Info */}
            {isDowntime && (
              <div className="flex items-start gap-3 p-4 backdrop-blur-xl bg-yellow-500/10 rounded-2xl border border-yellow-400/20 shadow-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-300 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-yellow-100">
                    Wartungsmodus aktiv
                  </p>
                  <p className="text-xs text-yellow-200/80">
                    Die Anwendung ist derzeit nicht verfügbar. Benutzer können nicht auf die
                    Anwendung zugreifen, bis der Downtime deaktiviert wird.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="backdrop-blur-3xl bg-white/10 border border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{getDialogTitle()}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              {getDialogDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelToggle}
              className="backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              className={`backdrop-blur-xl text-white border transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl ${
                pendingValue
                  ? 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30 hover:border-red-400/40'
                  : 'bg-green-500/20 hover:bg-green-500/30 border-green-400/30 hover:border-green-400/40'
              }`}
            >
              {pendingValue ? 'Aktivieren' : 'Deaktivieren'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

        <DowntimeManagementSkeleton />
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

