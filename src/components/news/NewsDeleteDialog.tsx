import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NewsItem } from '@/models/news';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsDeleteDialogProps {
  item: NewsItem | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function NewsDeleteDialog({
  item,
  deleting,
  onOpenChange,
  onConfirm,
}: NewsDeleteDialogProps) {
  return (
    <AlertDialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(cardPreset)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">News löschen?</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80">
            Möchten Sie diese News wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
            werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting} className={cn(buttonPreset, 'rounded-xl')}>
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className={cn(
              'bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl',
              deleting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {deleting ? 'Wird gelöscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
