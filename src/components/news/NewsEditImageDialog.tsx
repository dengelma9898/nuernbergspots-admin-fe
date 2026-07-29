import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsEditImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editImageContent: string;
  onEditImageContentChange: (value: string) => void;
  editImageUrls: string[];
  editSaving: boolean;
  onRemoveImage: (url: string) => void;
  onSave: () => void;
}

export function NewsEditImageDialog({
  open,
  onOpenChange,
  editImageContent,
  onEditImageContentChange,
  editImageUrls,
  editSaving,
  onRemoveImage,
  onSave,
}: NewsEditImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(cardPreset, 'max-w-2xl')}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Bild-News bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-image-content" className="text-foreground">
              Text
            </Label>
            <Textarea
              id="edit-image-content"
              value={editImageContent}
              onChange={e => onEditImageContentChange(e.target.value)}
              placeholder="Text bearbeiten..."
              disabled={editSaving}
              className={cn(inputPreset)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Bilder</Label>
            {editImageUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {editImageUrls.map((url, idx) => (
                  <div key={idx} className="relative group overflow-visible">
                    <img
                      src={url}
                      alt={`Bild ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-secondary"
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveImage(url);
                      }}
                      disabled={editSaving}
                      title="Bild entfernen"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full h-7 w-7 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ position: 'absolute' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Card className={cn(cardPreset, 'text-center py-8')}>
                <div className="text-muted-foreground">Keine Bilder vorhanden</div>
              </Card>
            )}
          </div>
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
            disabled={editSaving || !editImageContent.trim()}
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
