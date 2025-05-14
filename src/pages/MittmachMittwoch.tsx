import React, { useEffect, useState } from 'react';
import { useSpecialPollService } from '@/services/specialPollService';
import { SpecialPoll, SpecialPollStatus } from '@/models/specialPoll';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Zurück zum Dashboard
        </Button>
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Alle</SelectItem>
              <SelectItem value={SpecialPollStatus.ACTIVE}>Aktiv</SelectItem>
              <SelectItem value={SpecialPollStatus.PENDING}>Ausstehend</SelectItem>
              <SelectItem value={SpecialPollStatus.CLOSED}>Geschlossen</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow">
                <Plus className="h-4 w-4" />
                Neue Aktion/Poll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Aktion/Poll erstellen</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newPollTitle}
                  onChange={e => setNewPollTitle(e.target.value)}
                  placeholder="Titel der Aktion/Poll"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newPollTitle.trim()) {
                      e.preventDefault();
                      handleCreatePoll();
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreatePoll} disabled={!newPollTitle.trim()}>
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">Mittmach Mittwoch</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Hier findest du alle Aktionen, Ideen und Möglichkeiten, wie du dich am Mittwoch in der Community engagieren kannst!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Lade Aktionen...</div>
        ) : polls.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Noch keine Aktionen vorhanden.
          </div>
        ) : (
          Object.entries(filteredPolls).map(([status, polls]) =>
            polls.length > 0 && (
              <React.Fragment key={status}>
                <div className="col-span-full mt-6 mb-2 text-lg font-semibold">
                  {status === SpecialPollStatus.ACTIVE && 'Aktive Aktionen'}
                  {status === SpecialPollStatus.PENDING && 'Ausstehende Aktionen'}
                  {status === SpecialPollStatus.CLOSED && 'Geschlossene Aktionen'}
                </div>
                {polls.map((poll) => (
                  <Card
                    key={poll.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/mittmach-mittwoch/${poll.id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{poll.title}</CardTitle>
                        <Badge className={getStatusColor(poll.status)}>{poll.status}</Badge>
                      </div>
                      <CardDescription>
                        Erstellt am {format(new Date(poll.createdAt), 'dd.MM.yyyy', { locale: de })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-2">
                        {poll.responses.length} Antwort{poll.responses.length === 1 ? '' : 'en'}
                      </div>
                      {/* Optional: Vorschau der letzten Antwort */}
                      {poll.responses.length > 0 && (
                        <div className="text-xs text-muted-foreground italic">
                          Letzte Antwort von {poll.responses[poll.responses.length-1].userName}: "{poll.responses[poll.responses.length-1].response}"
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
  );
} 