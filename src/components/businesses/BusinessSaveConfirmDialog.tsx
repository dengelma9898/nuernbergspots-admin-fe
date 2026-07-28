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
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface BusinessSaveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const BusinessSaveConfirmDialog: React.FC<BusinessSaveConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(cardPreset)}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <AlertDialogTitle className="text-foreground">Änderungen speichern</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground space-y-2">
            <p>Bevor du die Änderungen speicherst, möchten wir dich kurz daran erinnern:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Der Partner erhält <strong>keine automatische Benachrichtigung</strong> über die
                Änderungen.
              </li>
              <li>
                Bitte <strong>kontaktiere den Partner</strong> persönlich, um ihn über die
                Aktualisierungen zu informieren.
              </li>
              <li>
                So kann der Partner die Änderungen auch in seinem System entsprechend aktualisieren.
              </li>
            </ul>
            <p className="mt-3 font-medium text-foreground">
              Möchtest du die Änderungen jetzt speichern?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} className={cn(buttonPreset)}>
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(buttonPreset, 'bg-primary hover:bg-primary/90 text-primary-foreground')}
            data-testid="edit-business-confirm-save"
          >
            Änderungen speichern
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
