import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsEditTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTextContent: string;
  onEditTextContentChange: (value: string) => void;
  editSaving: boolean;
  onSave: () => void;
}

export function NewsEditTextDialog({
  open,
  onOpenChange,
  editTextContent,
  onEditTextContentChange,
  editSaving,
  onSave,
}: NewsEditTextDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(cardPreset)}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Text-News bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={editTextContent}
            onChange={e => onEditTextContentChange(e.target.value)}
            placeholder="Text bearbeiten..."
            disabled={editSaving}
            className={cn(inputPreset, 'min-h-[150px]')}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <LoadingButton
              type="button"
              variant="ghost"
              disabled={editSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
            >
              Abbrechen
            </LoadingButton>
          </DialogClose>
          <LoadingButton
            variant="outline"
            onClick={onSave}
            disabled={editSaving || !editTextContent.trim()}
            isLoading={editSaving}
            loadingText="Wird gespeichert..."
            className={cn(buttonPreset, 'rounded-xl')}
          >
            Speichern
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
