import React, { useEffect, useState } from 'react';
import { useSpecialPollService } from '@/services/specialPollService';
import { SpecialPoll, SpecialPollStatus } from '@/models/specialPoll';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MittmachMittwochSkeleton: React.FC = () => {
  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-2xl ring-1 ring-white/30">
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          {/* Title and Badge */}
          <div className="flex-1">
            <Skeleton className="bg-white/10 backdrop-blur-xl h-6 w-5/6 md:w-3/4 rounded mb-2" />
          </div>
          <Skeleton className="bg-white/10 backdrop-blur-xl h-6 w-20 rounded-full" />
        </div>
        {/* Created Date */}
        <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-32 rounded mt-2" />
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {/* Response Count */}
        <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-24 rounded mb-3" />
        
        {/* Last Response Preview */}
        <div className="space-y-1">
          <Skeleton className="bg-white/10 backdrop-blur-xl h-3 w-full rounded" />
          <Skeleton className="bg-white/10 backdrop-blur-xl h-3 w-4/5 rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function MittmachMittwoch() {
  const specialPollService = useSpecialPollService();
  const [polls, setPolls] = useState<SpecialPoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'ALL' | SpecialPollStatus>('ALL');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setIsLoading(true);
      const data = await specialPollService.getSpecialPolls();
      setPolls(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: SpecialPollStatus) => {
    switch (status) {
      case SpecialPollStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SpecialPollStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case SpecialPollStatus.CLOSED:
        return 'bg-gray-200 text-gray-800';
      default:
        return '';
    }
  };

  const handleCreatePoll = async () => {
    if (!newPollTitle.trim()) return;
    try {
      await specialPollService.createSpecialPoll({ title: newPollTitle.trim() });
      toast.success('Aktion/Poll wurde erfolgreich erstellt.');
      setIsCreateDialogOpen(false);
      setNewPollTitle('');
      loadPolls();
    } catch (error) {
      toast.error('Aktion/Poll konnte nicht erstellt werden.');
    }
  };

  const groupedPolls = {
    [SpecialPollStatus.ACTIVE]: polls.filter(p => p.status === SpecialPollStatus.ACTIVE),
    [SpecialPollStatus.PENDING]: polls.filter(p => p.status === SpecialPollStatus.PENDING),
    [SpecialPollStatus.CLOSED]: polls.filter(p => p.status === SpecialPollStatus.CLOSED),
  };

  const filteredPolls = statusFilter === 'ALL'
    ? groupedPolls
    : { [statusFilter]: groupedPolls[statusFilter] };

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
      <div className="container mx-auto p-4 md:p-8 max-w-4xl relative z-10">
      {/* Navigation and Controls Section */}
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
        <div className="flex flex-col gap-4">
          {/* Navigation Button - Full width on mobile */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl w-full md:w-auto md:self-start"
          >
            Zurück zum Dashboard
          </Button>
          
          {/* Controls Row - Stack on mobile, side by side on larger screens */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 w-full sm:w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                <SelectItem value="ALL" className="text-white hover:bg-white/20 cursor-pointer">Alle</SelectItem>
                <SelectItem value={SpecialPollStatus.ACTIVE} className="text-white hover:bg-white/20 cursor-pointer">Aktiv</SelectItem>
                <SelectItem value={SpecialPollStatus.PENDING} className="text-white hover:bg-white/20 cursor-pointer">Ausstehend</SelectItem>
                <SelectItem value={SpecialPollStatus.CLOSED} className="text-white hover:bg-white/20 cursor-pointer">Geschlossen</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto bg-primary">
                  <Plus className="h-4 w-4" />
                  Neue Aktion/Poll
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] backdrop-blur-3xl bg-white/10 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Neue Aktion/Poll erstellen</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newPollTitle}
                  onChange={e => setNewPollTitle(e.target.value)}
                  placeholder="Titel der Aktion/Poll"
                  autoFocus
                  className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newPollTitle.trim()) {
                      e.preventDefault();
                      handleCreatePoll();
                    }
                  }}
                />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  className="w-full sm:w-auto backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white/90 hover:text-white rounded-xl"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleCreatePoll} 
                  disabled={!newPollTitle.trim()} 
                  className="w-full sm:w-auto backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>
      {/* Title Section */}
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
          Mittmach Mittwoch
        </h1>
        <p className="text-base md:text-lg text-white/80 leading-relaxed">
          Hier findest du alle Aktionen, Ideen und Möglichkeiten, wie du dich am Mittwoch in der Community engagieren kannst!
        </p>
      </div>
      {/* Content Grid - Improved mobile-first responsive design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {isLoading ? (
          <>
            {/* Section Header Skeleton */}
            <div className="col-span-full mt-6 mb-2">
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-4 border border-white/20">
                <Skeleton className="bg-white/10 backdrop-blur-xl h-6 w-48 rounded" />
              </div>
            </div>
            {/* Action Cards Skeletons */}
            {[...Array(6)].map((_, index) => (
              <MittmachMittwochSkeleton key={index} />
            ))}
          </>
        ) : polls.length === 0 ? (
          <div className="col-span-full">
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 text-center">
              <div className="text-white/70 text-lg">Noch keine Aktionen vorhanden.</div>
            </div>
          </div>
        ) : (
          Object.entries(filteredPolls).map(([status, polls]) =>
            polls.length > 0 && (
              <React.Fragment key={status}>
                <div className="col-span-full mt-6 mb-2">
                  <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-4 border border-white/20">
                    <h2 className="text-lg md:text-xl font-semibold text-white">
                      {status === SpecialPollStatus.ACTIVE && 'Aktive Aktionen'}
                      {status === SpecialPollStatus.PENDING && 'Ausstehende Aktionen'}
                      {status === SpecialPollStatus.CLOSED && 'Geschlossene Aktionen'}
                    </h2>
                  </div>
                </div>
                {polls.map((poll) => (
                  <Card
                    key={poll.id}
                    className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 cursor-pointer rounded-2xl ring-1 ring-white/30 hover:ring-white/40"
                    onClick={() => navigate(`/mittmach-mittwoch/${poll.id}`)}
                  >
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <CardTitle className="text-white text-lg md:text-xl font-semibold leading-tight flex-1">
                          {poll.title}
                        </CardTitle>
                        <Badge className={`${getStatusColor(poll.status)} px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap`}>
                          {poll.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-white/70 text-sm mt-2">
                        Erstellt am {format(new Date(poll.createdAt), 'dd.MM.yyyy', { locale: de })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                      <div className="text-sm text-white/80 mb-3 font-medium">
                        {poll.responses.length} Antwort{poll.responses.length === 1 ? '' : 'en'}
                      </div>
                      {/* Optional: Vorschau der letzten Antwort */}
                      {poll.responses.length > 0 && (
                        <div className="text-xs text-white/60 italic leading-relaxed line-clamp-2">
                          Letzte Antwort von <span className="text-white/80 font-medium">{poll.responses[poll.responses.length-1].userName}</span>: "{poll.responses[poll.responses.length-1].response}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </React.Fragment>
            )
          )
        )}
      </div>
      </div>
    </div>
  );
} 