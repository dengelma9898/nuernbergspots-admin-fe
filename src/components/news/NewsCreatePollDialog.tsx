import React from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsCreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pollQuestion: string;
  onPollQuestionChange: (value: string) => void;
  pollOptions: string[];
  allowMultipleAnswers: boolean;
  onAllowMultipleAnswersChange: (value: boolean) => void;
  pollExpiresAt: string;
  onPollExpiresAtChange: (value: string) => void;
  pollSending: boolean;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onOptionChange: (index: number, value: string) => void;
  onSend: () => void;
}

export function NewsCreatePollDialog({
  open,
  onOpenChange,
  pollQuestion,
  onPollQuestionChange,
  pollOptions,
  allowMultipleAnswers,
  onAllowMultipleAnswersChange,
  pollExpiresAt,
  onPollExpiresAtChange,
  pollSending,
  onAddOption,
  onRemoveOption,
  onOptionChange,
  onSend,
}: NewsCreatePollDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(cardPreset, 'max-w-lg')}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Umfrage erstellen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poll-question" className="text-foreground">
              Frage
            </Label>
            <Input
              id="poll-question"
              value={pollQuestion}
              onChange={e => onPollQuestionChange(e.target.value)}
              placeholder="Stelle deine Frage..."
              disabled={pollSending}
              className={cn(inputPreset)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Antwortmöglichkeiten</Label>
            {pollOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={e => onOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={pollSending}
                  className={cn(inputPreset)}
                />
                {pollOptions.length > 2 && (
                  <LoadingButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveOption(index)}
                    disabled={pollSending}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </LoadingButton>
                )}
              </div>
            ))}
            <LoadingButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddOption}
              disabled={pollSending || pollOptions.length >= 10}
              className={cn(buttonPreset, 'w-full')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Option hinzufügen
            </LoadingButton>
          </div>

          <div className={cn(cardPreset, 'flex items-center space-x-3 p-3')}>
            <Switch
              id="multiple-answers"
              checked={allowMultipleAnswers}
              onCheckedChange={onAllowMultipleAnswersChange}
              disabled={pollSending}
            />
            <Label htmlFor="multiple-answers" className="text-foreground">
              Mehrfachauswahl erlauben
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="poll-expires" className="text-foreground">
              Ablaufdatum (optional)
            </Label>
            <Input
              id="poll-expires"
              type="datetime-local"
              value={pollExpiresAt}
              onChange={e => onPollExpiresAtChange(e.target.value)}
              disabled={pollSending}
              className={cn(inputPreset)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <LoadingButton
              type="button"
              variant="ghost"
              disabled={pollSending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
            >
              Abbrechen
            </LoadingButton>
          </DialogClose>
          <LoadingButton
            variant="outline"
            onClick={onSend}
            disabled={pollSending || !pollQuestion.trim() || pollOptions.some(opt => !opt.trim())}
            isLoading={pollSending}
            loadingText="Wird erstellt..."
            className={cn(buttonPreset, 'rounded-xl')}
          >
            Umfrage erstellen
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
