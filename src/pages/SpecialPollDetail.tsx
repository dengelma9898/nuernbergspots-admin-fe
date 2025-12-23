import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecialPollService } from '@/services/specialPollService';
import { SpecialPoll, SpecialPollStatus, SpecialPollResponse } from '@/models/specialPoll';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

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

  const getStatusVariant = (status: SpecialPollStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case SpecialPollStatus.ACTIVE:
        return 'default';
      case SpecialPollStatus.PENDING:
        return 'secondary';
      case SpecialPollStatus.CLOSED:
        return 'outline';
      default:
        return 'secondary';
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
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="container mx-auto p-4 md:p-8 max-w-2xl relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <AnimatedButton variant="outline" className="mb-6" onClick={() => navigate('/mittmach-mittwoch')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </AnimatedButton>
          </motion.div>
          {isLoading ? (
            <motion.div
              className="text-center py-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'p-8')}>
                <div className="text-muted-foreground">Lade Aktion...</div>
              </Card>
            </motion.div>
          ) : poll ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-foreground">{poll.title}</CardTitle>
                    <Badge variant={getStatusVariant(poll.status)}>{poll.status}</Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Erstellt am {format(new Date(poll.createdAt), 'dd.MM.yyyy', { locale: de })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-4">
                    <span className="font-semibold text-foreground">Status:</span>
                    <Select
                      value={poll.status}
                      onValueChange={handleStatusChange}
                      disabled={isStatusUpdating}
                    >
                      <SelectTrigger className={cn(glassInput, 'w-40')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={cn(glassCard)}>
                        <SelectItem value={SpecialPollStatus.ACTIVE}>Aktiv</SelectItem>
                        <SelectItem value={SpecialPollStatus.PENDING}>Ausstehend</SelectItem>
                        <SelectItem value={SpecialPollStatus.CLOSED}>Geschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold text-foreground">Anzahl Antworten:</span> <span className="text-foreground">{poll.responses.length}</span>
                  </div>
                  <div className="mb-6">
                    <span className="font-semibold text-foreground">Antworten:</span>
                    {poll.responses.length === 0 ? (
                      <div className="text-muted-foreground mt-2">Noch keine Antworten vorhanden.</div>
                    ) : (
                      <motion.ul
                        className="mt-2 space-y-2"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {poll.responses.map((resp, idx) => (
                          <motion.li
                            key={idx}
                            variants={fadeInUp}
                            className={cn(glassCard, 'p-3 flex items-start justify-between gap-2')}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{resp.userName}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(resp.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                              </div>
                              <div className="mt-1 text-foreground">{resp.response}</div>
                            </div>
                            <Dialog
                              open={deleteDialogOpen && responseToDelete === resp}
                              onOpenChange={open => {
                                setDeleteDialogOpen(open);
                                if (!open) setResponseToDelete(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <AnimatedButton
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setResponseToDelete(resp);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </AnimatedButton>
                              </DialogTrigger>
                              <DialogContent className={cn(glassCard)}>
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Antwort wirklich löschen?</DialogTitle>
                                </DialogHeader>
                                <Card className={cn(glassCard, 'mb-4 p-3')}>
                                  <div className="font-medium mb-1 text-foreground">{resp.userName}</div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    {format(new Date(resp.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                                  </div>
                                  <div className="italic text-foreground">{resp.response}</div>
                                </Card>
                                <DialogFooter>
                                  <AnimatedButton variant="outline" onClick={() => setDeleteDialogOpen(false)} className={cn(glassButton)}>
                                    Abbrechen
                                  </AnimatedButton>
                                  <AnimatedButton variant="destructive" onClick={handleDeleteResponse}>
                                    Löschen
                                  </AnimatedButton>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </motion.li>
                        ))}
                      </motion.ul>
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
                      className={cn(glassInput, 'flex-1')}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && responseText.trim()) {
                          e.preventDefault();
                          handleAddResponse();
                        }
                      }}
                    />
                    <LoadingButton
                      type="submit"
                      disabled={!responseText.trim() || isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Wird gesendet..."
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    >
                      Antwort absenden
                    </LoadingButton>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'p-8')}>
                <div className="text-destructive">Aktion nicht gefunden.</div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
