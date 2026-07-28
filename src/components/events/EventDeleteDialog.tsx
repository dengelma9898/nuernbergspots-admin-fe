import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { scaleIn } from '@/lib/animations';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EventDeleteDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
  onCancel,
}: EventDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(cardPreset)}>
        <motion.div variants={scaleIn} initial="initial" animate="animate" exit="exit">
          <DialogHeader>
            <DialogTitle className="text-foreground">Event löschen</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Möchten Sie dieses Event wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <LoadingButton
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className={cn(buttonPreset)}
            >
              Abbrechen
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              onClick={onConfirm}
              isLoading={isDeleting}
              loadingText="Wird gelöscht..."
            >
              Löschen
            </LoadingButton>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
