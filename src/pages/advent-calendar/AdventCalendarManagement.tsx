import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Trophy,
  Search,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdventCalendarEntry } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/models/users';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

function AdventCalendarEntrySkeleton() {
  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full ring-1 ring-white/30">
      {/* Image skeleton */}
      <div className="relative h-48 w-full mb-4">
        <Skeleton className="w-full h-full rounded-t-lg bg-white/10 backdrop-blur-xl" />
        {/* Day badge placeholder */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-8 w-12 rounded-full bg-white/10 backdrop-blur-xl" />
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4 bg-white/10 backdrop-blur-xl rounded" />
            </CardTitle>
            <CardDescription className="mt-1">
              <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-4 w-4/5 bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-4 w-3/5 bg-white/10 backdrop-blur-xl rounded" />
        </div>

        {/* Winners count */}
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
          <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-3 w-32 bg-white/10 backdrop-blur-xl rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl bg-white/10 backdrop-blur-xl" />
          <Skeleton className="h-8 w-16 rounded-xl bg-white/10 backdrop-blur-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

function AdventCalendarEntryMobileSkeleton() {
  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-2xl p-4 ring-1 ring-white/30">
      <div className="flex flex-col gap-2">
        {/* Day badge */}
        <Skeleton className="h-6 w-20 rounded-full bg-white/10 backdrop-blur-xl mb-2" />

        {/* Image */}
        <Skeleton className="w-full h-40 rounded bg-white/10 backdrop-blur-xl mb-2" />

        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-3/4 bg-white/10 backdrop-blur-xl rounded" />
        </div>

        {/* Description */}
        <div className="space-y-1 mb-2">
          <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-4 w-2/3 bg-white/10 backdrop-blur-xl rounded" />
        </div>

        {/* Winners count */}
        <Skeleton className="h-3 w-32 bg-white/10 backdrop-blur-xl rounded mb-2" />

        {/* Created date */}
        <Skeleton className="h-3 w-40 bg-white/10 backdrop-blur-xl rounded mb-2" />

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl bg-white/10 backdrop-blur-xl" />
          <Skeleton className="h-9 w-full rounded-xl bg-white/10 backdrop-blur-xl" />
        </div>
      </div>
    </Card>
  );
}

export function AdventCalendarManagement() {
  const [entries, setEntries] = useState<AdventCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState<boolean>(false);
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);
  const [isUpdatingFeatureStatus, setIsUpdatingFeatureStatus] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const adventCalendarService = useAdventCalendarService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedEntries = await adventCalendarService.getAll();
      // Sortiere nach Nummer
      const sortedEntries = fetchedEntries.sort((a, b) => a.number - b.number);
      setEntries(sortedEntries);
    } catch (error) {
      toast.error('Fehler beim Laden der Daten', {
        description:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureStatus = async () => {
    try {
      setIsLoadingFeatureStatus(true);
      const status = await adventCalendarService.getFeatureStatus();
      setFeatureStatus(status.isFeatureActive);
    } catch (error) {
      console.error('Fehler beim Laden des Feature-Status:', error);
      // Nicht als Fehler anzeigen, da alle Rollen den Status lesen können sollten
    } finally {
      setIsLoadingFeatureStatus(false);
    }
  };

  const loadUserRole = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const userProfile = await userService.getUserProfile(userId);
      setUserRole(userProfile.userType);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  };

  const handleFeatureStatusToggle = async (newValue: boolean) => {
    try {
      setIsUpdatingFeatureStatus(true);
      const status = await adventCalendarService.setFeatureStatus(newValue);
      setFeatureStatus(status.isFeatureActive);
      toast.success(
        status.isFeatureActive
          ? 'Adventskalender-Feature wurde aktiviert'
          : 'Adventskalender-Feature wurde deaktiviert'
      );
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Feature-Status', {
        description: 'Der Status konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
      });
      console.error('Fehler beim Aktualisieren des Feature-Status:', error);
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  useEffect(() => {
    loadData();
    loadFeatureStatus();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (entryId: string) => {
    if (!confirm('Möchten Sie diesen Adventskalender-Eintrag wirklich löschen?')) {
      return;
    }

    try {
      await adventCalendarService.delete(entryId);
      toast.success('Eintrag gelöscht', {
        description: 'Der Adventskalender-Eintrag wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description:
          'Der Eintrag konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
      });
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.number.toString().includes(searchQuery);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
          {/* Header Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
              <Skeleton className="h-10 w-44 rounded-xl bg-white/10 backdrop-blur-xl" />
              <Skeleton className="h-8 w-48 bg-white/10 backdrop-blur-xl rounded" />
              <div className="w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-10 w-56 rounded-xl bg-white/10 backdrop-blur-xl" />
              </div>
            </div>
          </div>

          {/* Filter Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <Skeleton className="h-10 w-full rounded-lg bg-white/10 backdrop-blur-xl" />
          </div>

          {/* Mobile Card Skeletons */}
          <div className="block md:hidden space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdventCalendarEntryMobileSkeleton key={index} />
            ))}
          </div>

          {/* Desktop Grid Skeletons */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <AdventCalendarEntrySkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
              Adventskalender Verwaltung
            </h1>
            <div className="w-full sm:w-auto sm:ml-auto">
              <Button
                onClick={() => navigate('/advent-calendar/new')}
                className="w-full sm:w-auto backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Eintrag hinzufügen
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Status Card (nur für Admin/Super Admin) */}
        {isAdminOrSuperAdmin && (
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-white/90" />
                  <Label htmlFor="feature-status" className="text-white/90 text-lg font-semibold">
                    Feature-Status
                  </Label>
                  {featureStatus && (
                    <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                      Aktiviert
                    </Badge>
                  )}
                  {!featureStatus && (
                    <Badge className="bg-red-500/20 text-red-100 border-red-400/30">
                      Deaktiviert
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/70">
                  {featureStatus
                    ? 'Das Adventskalender-Feature ist aktiviert und für Benutzer verfügbar.'
                    : 'Das Adventskalender-Feature ist deaktiviert und für Benutzer nicht verfügbar.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isLoadingFeatureStatus ? (
                  <Skeleton className="h-6 w-12 rounded-full bg-white/10 backdrop-blur-xl" />
                ) : (
                  <Switch
                    id="feature-status"
                    checked={featureStatus}
                    onCheckedChange={handleFeatureStatusToggle}
                    disabled={isUpdatingFeatureStatus}
                    className="data-[state=checked]:bg-green-500/30 data-[state=unchecked]:bg-white/20"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feature Status Info (für alle anderen Rollen) */}
        {!isAdminOrSuperAdmin && !isLoadingFeatureStatus && (
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-white/90" />
              <div className="flex-1">
                <Label className="text-white/90 text-lg font-semibold">Feature-Status</Label>
                <p className="text-sm text-white/70 mt-1">
                  {featureStatus ? (
                    <>
                      <Badge className="bg-green-500/20 text-green-100 border-green-400/30 mr-2">
                        Aktiviert
                      </Badge>
                      Das Adventskalender-Feature ist aktiviert.
                    </>
                  ) : (
                    <>
                      <Badge className="bg-red-500/20 text-red-100 border-red-400/30 mr-2">
                        Deaktiviert
                      </Badge>
                      Das Adventskalender-Feature ist deaktiviert.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Nach Einträgen suchen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rounded-lg pl-10 backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 text-center">
            <div className="text-white/90 text-lg">Keine Adventskalender-Einträge gefunden.</div>
          </div>
        ) : (
          <>
            {/* Mobile Card-Ansicht */}
            <div className="block md:hidden space-y-6">
              {filteredEntries.map(entry => (
                <Card
                  key={entry.id}
                  className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30"
                >
                  <div className="flex flex-col gap-2">
                    <Badge className="w-fit bg-gradient-to-r from-red-500 to-green-500 text-white border-0 mb-2">
                      Nr. {entry.number}
                    </Badge>
                    {entry.imageUrl && (
                      <img
                        src={entry.imageUrl}
                        alt={entry.description}
                        className="object-cover w-full h-40 rounded bg-white/10 p-2 mb-2"
                      />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-lg text-white">Eintrag #{entry.number}</span>
                    </div>
                    <div className="text-sm text-white/80 mb-2">{entry.description}</div>
                    {entry.winners && entry.winners.length > 0 && (
                      <div className="flex items-center text-sm text-white/90 mb-2">
                        <Trophy className="h-4 w-4 mr-2" />
                        {entry.winners.length} Gewinner
                      </div>
                    )}
                    <div className="text-xs text-white/70 mb-2">
                      Erstellt am {formatDate(entry.createdAt)}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                        onClick={() => navigate(`/advent-calendar/${entry.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full cursor-pointer backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {/* Desktop/Table Ansicht */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map(entry => (
                <AdventCalendarEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface AdventCalendarEntryCardProps {
  entry: AdventCalendarEntry;
  onDelete: (id: string) => void;
}

const AdventCalendarEntryCard: React.FC<AdventCalendarEntryCardProps> = ({
  entry,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl ring-1 ring-white/30">
      {entry.imageUrl ? (
        <div className="relative h-48 w-full">
          <img
            src={entry.imageUrl}
            alt={entry.description}
            className="object-cover w-full h-full rounded-t-lg bg-white/10 p-2"
          />
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-green-500 text-white border-0">
            Nr. {entry.number}
          </Badge>
        </div>
      ) : (
        <div className="relative h-48 w-full bg-white/10 rounded-t-lg flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-white/40" />
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-green-500 text-white border-0">
            Nr. {entry.number}
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-white">Eintrag #{entry.number}</CardTitle>
        <CardDescription className="text-white/80">{entry.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        {entry.winners && entry.winners.length > 0 && (
          <div className="flex items-center text-sm text-white/90 mb-2">
            <Trophy className="h-4 w-4 mr-2" />
            {entry.winners.length} Gewinner
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-white/70">
          {formatDate(entry.createdAt)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
            onClick={() => navigate(`/advent-calendar/${entry.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

