import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Trash2,
  Users,
  Clock,
  Calendar
} from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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

  return (
    <div className="container mx-auto max-w-full p-8 sm:p-8 px-2 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold break-words">Account-Management</h1>
      </div>

      <Card className="px-2 py-2">
        <CardHeader>
          <CardTitle>Anonyme Accounts</CardTitle>
          <CardDescription className="break-words">
            Verwaltung und Bereinigung von anonymen Benutzeraccounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-base">Lade Statistiken...</div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Gesamt</div>
                    <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Älter als 5 Tage</div>
                    <div className="text-lg sm:text-2xl font-bold">{stats.oldAccounts}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 bg-muted rounded-lg">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Alle Accounts älter als</div>
                    <div className="text-lg sm:text-2xl font-bold">
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
                    className="cursor-pointer"
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
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Anonyme Accounts bereinigen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Möchten Sie wirklich alle anonymen Accounts löschen, die älter als 5 Tage sind?
                      Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCleanup}>
                      Bereinigen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-base">
              Keine Daten verfügbar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 