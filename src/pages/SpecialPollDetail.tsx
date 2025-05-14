import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecialPollService } from '@/services/specialPollService';
import { SpecialPoll, SpecialPollStatus, SpecialPollResponse } from '@/models/specialPoll';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SpecialPollDetail() {
  const { pollId } = useParams<{ pollId: string }>();
  const specialPollService = useSpecialPollService();
  const [poll, setPoll] = useState<SpecialPoll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<SpecialPollResponse | null>(null);
  const navigate = useNavigate();
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  useEffect(() => {
    if (pollId) {
      loadPoll(pollId);
    }
  }, [pollId]);

  const loadPoll = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await specialPollService.getSpecialPoll(id);
      setPoll(data);
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

  const handleAddResponse = async () => {
    if (!pollId || !responseText.trim()) return;
    setIsSubmitting(true);
    try {
      await specialPollService.addResponse(pollId, responseText.trim());
      toast.success('Antwort wurde hinzugefügt.');
      setResponseText('');
      loadPoll(pollId);
    } catch (error) {
      toast.error('Antwort konnte nicht hinzugefügt werden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!pollId || !responseToDelete || !poll) return;
    try {
      const updatedResponses = poll.responses.filter(r => r !== responseToDelete);
      await specialPollService.updateResponses(pollId, updatedResponses);
      toast.success('Antwort wurde gelöscht.');
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
      loadPoll(pollId);
    } catch (error) {
      toast.error('Antwort konnte nicht gelöscht werden.');
    }
  };

  const handleStatusChange = async (newStatus: SpecialPollStatus) => {
    if (!pollId || !poll || poll.status === newStatus) return;
    setIsStatusUpdating(true);
    try {
      await specialPollService.updateSpecialPollStatus(pollId, { status: newStatus });
      toast.success('Status wurde aktualisiert.');
      loadPoll(pollId);
    } catch (error) {
      toast.error('Status konnte nicht geändert werden.');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate('/mittmach-mittwoch')}>
        Zurück zur Übersicht
      </Button>
      {isLoading ? (
        <div className="text-center py-8">Lade Aktion...</div>
      ) : poll ? (
        <Card>
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
            <div className="mb-4 flex items-center gap-4">
              <span className="font-semibold">Status:</span>
              <Select
                value={poll.status}
                onValueChange={handleStatusChange}
                disabled={isStatusUpdating}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SpecialPollStatus.ACTIVE}>Aktiv</SelectItem>
                  <SelectItem value={SpecialPollStatus.PENDING}>Ausstehend</SelectItem>
                  <SelectItem value={SpecialPollStatus.CLOSED}>Geschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Anzahl Antworten:</span> {poll.responses.length}
            </div>
            <div className="mb-6">
              <span className="font-semibold">Antworten:</span>
              {poll.responses.length === 0 ? (
                <div className="text-muted-foreground mt-2">Noch keine Antworten vorhanden.</div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {poll.responses.map((resp, idx) => (
                    <li key={idx} className="border rounded p-2 bg-muted flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{resp.userName}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(resp.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}</div>
                        <div className="mt-1">{resp.response}</div>
                      </div>
                      <Dialog open={deleteDialogOpen && responseToDelete === resp} onOpenChange={open => {
                        setDeleteDialogOpen(open);
                        if (!open) setResponseToDelete(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setResponseToDelete(resp);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Antwort wirklich löschen?</DialogTitle>
                          </DialogHeader>
                          <div className="mb-4 p-3 bg-muted rounded">
                            <div className="font-medium mb-1">{resp.userName}</div>
                            <div className="text-sm text-muted-foreground mb-2">{format(new Date(resp.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}</div>
                            <div className="italic">{resp.response}</div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteResponse}>
                              Löschen
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAddResponse();
              }}
              className="flex gap-2"
            >
              <Input
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Deine Antwort..."
                disabled={isSubmitting}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && responseText.trim()) {
                    e.preventDefault();
                    handleAddResponse();
                  }
                }}
              />
              <Button type="submit" disabled={!responseText.trim() || isSubmitting}>
                Antwort absenden
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8 text-destructive">Aktion nicht gefunden.</div>
      )}
    </div>
  );
} 