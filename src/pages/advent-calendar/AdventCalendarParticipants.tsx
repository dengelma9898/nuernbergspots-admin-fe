import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Trophy,
  Users,
  Shuffle,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdventCalendarEntry } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { Skeleton } from '@/components/ui/skeleton';

function ParticipantsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full bg-white/10 backdrop-blur-xl rounded-lg" />
      ))}
    </div>
  );
}

export function AdventCalendarParticipants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adventCalendarService = useAdventCalendarService();
  const [entry, setEntry] = useState<AdventCalendarEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  const loadEntry = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adventCalendarService.getById(id);
      setEntry(data);
    } catch (error) {
      toast.error('Fehler beim Laden des Eintrags', {
        description: 'Der Eintrag konnte nicht geladen werden.',
      });
      navigate('/advent-calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = async (userId: string) => {
    if (!id) return;
    try {
      setIsSelectingWinner(true);
      await adventCalendarService.addWinner(id, { userId });
      toast.success('Gewinner hinzugefügt', {
        description: 'Der Gewinner wurde erfolgreich ausgewählt.',
      });
      loadEntry();
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Gewinners', {
        description: 'Der Gewinner konnte nicht hinzugefügt werden.',
      });
      console.error('Fehler beim Hinzufügen des Gewinners:', error);
    } finally {
      setIsSelectingWinner(false);
    }
  };

  const handleRandomWinner = () => {
    if (!entry) return;

    const winners = entry.winners || [];
    const participants = entry.participants || [];
    const availableParticipants = participants.filter(
      userId => !winners.includes(userId)
    );

    if (availableParticipants.length === 0) {
      toast.error('Keine verfügbaren Teilnehmer', {
        description: 'Es gibt keine Teilnehmer, die noch nicht Gewinner sind.',
      });
      return;
    }

    // Zufälligen Teilnehmer auswählen
    const randomIndex = Math.floor(Math.random() * availableParticipants.length);
    const randomUserId = availableParticipants[randomIndex];
    handleSelectWinner(randomUserId);
  };

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
          <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <CardHeader>
              <Skeleton className="h-10 w-64 bg-white/10 backdrop-blur-xl rounded" />
            </CardHeader>
            <CardContent>
              <ParticipantsSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const participants = entry.participants || []; // Array von User IDs
  const winners = entry.winners || [];
  const availableParticipants = participants.filter(
    userId => !winners.includes(userId)
  );

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
      <div className="container mx-auto py-6 max-w-full px-2 sm:px-4 overflow-x-hidden relative z-10">
        {/* Header */}
        <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/advent-calendar')}
                className="w-full sm:w-auto backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Button>
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                  Teilnehmer - Eintrag #{entry.number}
                </CardTitle>
                <CardDescription className="text-white/70 mt-2">
                  {participants.length > 0
                    ? `${participants.length} Teilnehmer${participants.length > 1 ? '' : ''}`
                    : 'Keine Teilnehmer vorhanden'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content */}
        {participants.length === 0 ? (
          <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-white/40" />
              <p className="text-white/90 text-lg">Keine Teilnehmer vorhanden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Gewinner */}
            {winners.length > 0 && (
              <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <CardTitle className="text-white text-xl">Gewinner</CardTitle>
                    <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/50">
                      {winners.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {winners.map(userId => (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-4 backdrop-blur-2xl bg-yellow-500/20 border border-yellow-400/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-yellow-400/30 flex items-center justify-center">
                            <Users className="h-6 w-6 text-yellow-200" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{userId}</p>
                            <p className="text-xs text-white/50">ID: {userId}</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/50">
                          <Trophy className="h-3 w-3 mr-1" />
                          Gewinner
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verfügbare Teilnehmer */}
            {availableParticipants.length > 0 && (
              <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-white/90" />
                      <CardTitle className="text-white text-xl">
                        Teilnehmer ({availableParticipants.length})
                      </CardTitle>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleRandomWinner}
                      disabled={isSelectingWinner}
                      className="backdrop-blur-2xl bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 border-purple-300/30 hover:border-purple-300/40 transition-all duration-300 hover:scale-105 rounded-xl"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Zufälliger Gewinner
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableParticipants.map(userId => (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-4 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{userId}</p>
                            <p className="text-xs text-white/50">ID: {userId}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {availableParticipants.length === 0 && winners.length > 0 && (
              <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-400/60" />
                  <p className="text-white/90 text-lg">Alle Teilnehmer sind bereits Gewinner</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

