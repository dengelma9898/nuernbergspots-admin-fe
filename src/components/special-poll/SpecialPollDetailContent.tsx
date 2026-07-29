import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from '@/components/motion';
import { ArrowLeft, Star, ThumbsUp, Trash2 } from 'lucide-react';

import { LoadingButton } from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/animations';
import { buttonPreset, cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import {
  SpecialPollStatus,
  getSpecialPollStatusBadgeVariant,
  getSpecialPollStatusDisplayLabel,
  specialPollHighlightBadgeClassName,
} from '@/models/specialPoll';

import { useSpecialPollDetail } from '@/hooks/useSpecialPollDetail';
import { SpecialPollDetailSkeleton } from '@/components/special-poll/SpecialPollDetailSkeletons';

export type SpecialPollDetailContentProps = ReturnType<typeof useSpecialPollDetail>;

export function SpecialPollDetailContent({
  pollId,
  navigate,
  poll,
  isLoading,
  responseText,
  setResponseText,
  isSubmitting,
  deleteDialogOpen,
  setDeleteDialogOpen,
  responseToDelete,
  setResponseToDelete,
  isStatusUpdating,
  isHighlightUpdating,
  upvotingResponseId,
  removingOwnResponse,
  pollDeleteOpen,
  setPollDeleteOpen,
  isDeletingPoll,
  userRole,
  isSuperAdmin,
  currentUserId,
  handleAddResponse,
  handleDeleteResponseModerate,
  handleRemoveOwnResponse,
  handleStatusChange,
  handleHighlightChange,
  handleUpvote,
  handleDeletePoll,
}: SpecialPollDetailContentProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto p-4 md:p-8 max-w-2xl relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <LoadingButton
            variant="outline"
            size="icon"
            className={cn(buttonPreset, 'rounded-full mb-6')}
            onClick={() => navigate('/mittmach-mittwoch')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Zurück zur Übersicht</span>
          </LoadingButton>
        </motion.div>
        {isLoading ? (
          <SpecialPollDetailSkeleton />
        ) : poll ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card
              className={cn(
                cardPreset,
                (poll.isHighlighted ?? false) && 'border-2 border-red-500 ring-2 ring-red-500/40'
              )}
            >
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <CardTitle className="text-foreground">{poll.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {poll.isHighlighted && (
                      <Badge variant="outline" className={specialPollHighlightBadgeClassName}>
                        <Star className="h-3 w-3" aria-hidden />
                        Hervorgehoben
                      </Badge>
                    )}
                    <Badge variant={getSpecialPollStatusBadgeVariant(poll.status)}>
                      {getSpecialPollStatusDisplayLabel(poll.status)}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">
                  Erstellt am {format(new Date(poll.createdAt), 'dd.MM.yyyy', { locale: de })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSuperAdmin && (
                  <div className="flex flex-col gap-4 rounded-xl border border-white/10 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-foreground">Hervorhebung</span>
                      <div className="flex items-center gap-3">
                        <Switch
                          id="poll-highlight"
                          checked={poll.isHighlighted}
                          onCheckedChange={v => void handleHighlightChange(v)}
                          disabled={isHighlightUpdating}
                        />
                        <Label htmlFor="poll-highlight" className="text-sm text-foreground">
                          In der App prominent anzeigen
                        </Label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-foreground">Status</span>
                      <Select
                        value={poll.status}
                        onValueChange={v => void handleStatusChange(v as SpecialPollStatus)}
                        disabled={isStatusUpdating}
                      >
                        <SelectTrigger className={cn(inputPreset, 'w-full sm:w-44')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={cn(cardPreset)}>
                          <SelectItem value={SpecialPollStatus.ACTIVE}>Aktiv</SelectItem>
                          <SelectItem value={SpecialPollStatus.PENDING}>Ausstehend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Erlaubt sind nur „Aktiv“ und „Ausstehend“. Ältere „geschlossen“-Daten werden
                      von der API als aktiv ausgeliefert.
                    </p>
                    <Dialog open={pollDeleteOpen} onOpenChange={setPollDeleteOpen}>
                      <DialogTrigger asChild>
                        <LoadingButton variant="destructive" className="w-full sm:w-auto">
                          Umfrage löschen
                        </LoadingButton>
                      </DialogTrigger>
                      <DialogContent className={cn(cardPreset)}>
                        <DialogHeader>
                          <DialogTitle className="text-foreground">
                            Umfrage wirklich löschen?
                          </DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                        <DialogFooter className="gap-2">
                          <LoadingButton
                            variant="outline"
                            onClick={() => setPollDeleteOpen(false)}
                            className={cn(buttonPreset)}
                            disabled={isDeletingPoll}
                          >
                            Abbrechen
                          </LoadingButton>
                          <LoadingButton
                            variant="destructive"
                            onClick={() => void handleDeletePoll()}
                            isLoading={isDeletingPoll}
                            loadingText="Löschen…"
                          >
                            Endgültig löschen
                          </LoadingButton>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {!isSuperAdmin && userRole !== null && (
                  <p className="text-sm text-muted-foreground">
                    Status und Hervorhebung kann nur ein Super-Admin ändern. Du kannst antworten und
                    abstimmen.
                  </p>
                )}

                <div>
                  <span className="font-semibold text-foreground">Anzahl Antworten:</span>{' '}
                  <span className="text-foreground">{poll.responses.length}</span>
                </div>

                <div>
                  <span className="font-semibold text-foreground">Antworten:</span>
                  {poll.responses.length === 0 ? (
                    <div className="text-muted-foreground mt-2">
                      Noch keine Antworten vorhanden.
                    </div>
                  ) : (
                    <motion.ul
                      className="mt-2 space-y-2"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {poll.responses.map(resp => (
                        <motion.li
                          key={resp.id}
                          variants={fadeInUp}
                          className={cn(
                            cardPreset,
                            'p-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{resp.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(resp.createdAt), 'dd.MM.yyyy HH:mm', {
                                locale: de,
                              })}
                            </div>
                            <div className="mt-1 text-foreground break-words">{resp.response}</div>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 items-stretch shrink-0">
                            <LoadingButton
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(buttonPreset, 'gap-2')}
                              onClick={() => void handleUpvote(resp.id)}
                              disabled={upvotingResponseId !== null}
                              aria-label="Zustimmen"
                            >
                              <ThumbsUp className="h-4 w-4" aria-hidden />
                              {resp.upvotedUserIds.length}
                            </LoadingButton>

                            {currentUserId && resp.userId === currentUserId && pollId && (
                              <LoadingButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => void handleRemoveOwnResponse()}
                                isLoading={removingOwnResponse}
                                loadingText="…"
                              >
                                Meine Antwort löschen
                              </LoadingButton>
                            )}

                            {isSuperAdmin && (
                              <Dialog
                                open={deleteDialogOpen && responseToDelete?.id === resp.id}
                                onOpenChange={open => {
                                  setDeleteDialogOpen(open);
                                  if (!open) setResponseToDelete(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <LoadingButton
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    aria-label="Antwort moderieren löschen"
                                    onClick={() => {
                                      setResponseToDelete(resp);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </LoadingButton>
                                </DialogTrigger>
                                <DialogContent className={cn(cardPreset)}>
                                  <DialogHeader>
                                    <DialogTitle className="text-foreground">
                                      Antwort wirklich löschen?
                                    </DialogTitle>
                                  </DialogHeader>
                                  <Card className={cn(cardPreset, 'mb-4 p-3')}>
                                    <div className="font-medium mb-1 text-foreground">
                                      {resp.userName}
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      {format(new Date(resp.createdAt), 'dd.MM.yyyy HH:mm', {
                                        locale: de,
                                      })}
                                    </div>
                                    <div className="italic text-foreground">{resp.response}</div>
                                  </Card>
                                  <DialogFooter>
                                    <LoadingButton
                                      variant="outline"
                                      onClick={() => setDeleteDialogOpen(false)}
                                      className={cn(buttonPreset)}
                                    >
                                      Abbrechen
                                    </LoadingButton>
                                    <LoadingButton
                                      variant="destructive"
                                      onClick={() => void handleDeleteResponseModerate()}
                                    >
                                      Löschen
                                    </LoadingButton>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Moderation: Beim Bearbeiten der Antwortliste werden Zustimmungen beibehalten, wenn
                  die Umfrage zuletzt per GET geladen wurde.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    void handleAddResponse();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Deine Antwort..."
                    disabled={isSubmitting}
                    className={cn(inputPreset, 'flex-1')}
                    onKeyDown={e => {
                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        responseText.trim() &&
                        !isSubmitting
                      ) {
                        e.preventDefault();
                        void handleAddResponse();
                      }
                    }}
                  />
                  <LoadingButton
                    type="submit"
                    disabled={!responseText.trim() || isSubmitting}
                    isLoading={isSubmitting}
                    loadingText="Wird gesendet..."
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl min-h-[44px]"
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
            <Card className={cn(cardPreset, 'p-8')}>
              <div className="text-destructive">Aktion nicht gefunden.</div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
