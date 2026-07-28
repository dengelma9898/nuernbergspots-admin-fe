import React, { useEffect, useState } from 'react';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/utils/iconUtils';
import { allSelectedHaveCategory } from '@/utils/eventBulkUtils';
import { Info } from 'lucide-react';

interface BulkCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvents: Event[];
  categories: EventCategory[];
  onConfirm: (categoryId: string) => void | Promise<void>;
  submitting: boolean;
}

export const BulkCategoryDialog: React.FC<BulkCategoryDialogProps> = ({
  open,
  onOpenChange,
  selectedEvents,
  categories,
  onConfirm,
  submitting,
}) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setCategoryId('');
      setConfirmOpen(false);
    }
  }, [open]);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const allAlreadyAssigned =
    categoryId.length > 0 &&
    allSelectedHaveCategory(
      selectedEvents,
      selectedEvents.map(e => e.id),
      categoryId
    );

  const canSubmit =
    categoryId.length > 0 &&
    selectedEvents.length > 0 &&
    selectedEvents.length <= 100 &&
    !submitting;

  const handleAssignClick = () => {
    if (!canSubmit) return;
    setConfirmOpen(true);
  };

  const handleConfirmed = async () => {
    if (!categoryId) return;
    await onConfirm(categoryId);
    setConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(cardPreset)}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Kategorie zuweisen</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedEvents.length} Event{selectedEvents.length === 1 ? '' : 's'} erhalten
              dieselbe Kategorie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground">Kategorie</Label>
              <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center">
                          {getIconComponent(category.iconName)}
                        </span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory ? (
              <p className="text-sm text-muted-foreground">
                Gewählt:{' '}
                <span className="text-foreground font-medium">{selectedCategory.name}</span>
              </p>
            ) : null}

            {allAlreadyAssigned ? (
              <div className="flex items-start gap-2 rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span>
                  Alle ausgewählten Events haben bereits diese Kategorie. Die Zuweisung ist
                  idempotent und kann trotzdem ausgeführt werden.
                </span>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <LoadingButton
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className={cn(buttonPreset)}
            >
              Abbrechen
            </LoadingButton>
            <LoadingButton
              onClick={handleAssignClick}
              disabled={!canSubmit}
              isLoading={submitting}
              loadingText="Wird zugewiesen…"
            >
              Zuweisen
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className={cn(cardPreset)}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Zuweisung bestätigen</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {selectedEvents.length} Event{selectedEvents.length === 1 ? '' : 's'} erhalten die
              Kategorie „{selectedCategory?.name ?? '—'}“. Fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(buttonPreset)} disabled={submitting}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                void handleConfirmed();
              }}
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
