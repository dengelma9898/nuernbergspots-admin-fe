import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingButton } from '@/components/LoadingButton';
import { Chatroom } from '@/models/chatroom';
import type { UserFriendlyError } from '@/utils/errorUtils';
import type { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

type ImageUpload = ReturnType<typeof useValidatedImageUpload>;

interface ChatroomEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChatroom: Chatroom | null;
  onSelectedChatroomChange: (chatroom: Chatroom | null) => void;
  originalImageUrl: string | null;
  onOriginalImageUrlChange: (url: string | null) => void;
  editError: UserFriendlyError | null;
  editImageUpload: ImageUpload;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function ChatroomEditDialog({
  open,
  onOpenChange,
  selectedChatroom,
  onSelectedChatroomChange,
  originalImageUrl,
  onOriginalImageUrlChange,
  editError,
  editImageUpload,
  onImageSelect,
  onSave,
}: ChatroomEditDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          editImageUpload.clearImages();
          onOriginalImageUrlChange(null);
        }
      }}
    >
      <DialogContent className={cn(cardPreset)}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Chatroom bearbeiten</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Bearbeiten Sie die Einstellungen des Chatrooms.
          </DialogDescription>
        </DialogHeader>
        {(editError || editImageUpload.error) && (
          <Alert variant="destructive" className={cn(cardPreset, 'border-destructive/50')}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{editImageUpload.error?.title || editError?.title}</AlertTitle>
            <AlertDescription className="mt-2">
              <p>{editImageUpload.error?.message || editError?.message}</p>
              {(editImageUpload.error?.actionHint || editError?.actionHint) && (
                <p className="mt-2 text-sm opacity-90">
                  {editImageUpload.error?.actionHint || editError?.actionHint}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-foreground">
              Titel
            </Label>
            <Input
              id="edit-title"
              value={selectedChatroom?.title || ''}
              onChange={e =>
                onSelectedChatroomChange(
                  selectedChatroom ? { ...selectedChatroom, title: e.target.value } : null
                )
              }
              placeholder="Chatroom Titel"
              className={cn(inputPreset)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-foreground">
              Beschreibung
            </Label>
            <Textarea
              id="edit-description"
              value={selectedChatroom?.description || ''}
              onChange={e =>
                onSelectedChatroomChange(
                  selectedChatroom ? { ...selectedChatroom, description: e.target.value } : null
                )
              }
              placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
              className={cn(inputPreset)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Chatroom Bild</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 border-2 border-dashed border-secondary rounded-lg overflow-hidden">
                {editImageUpload.previewUrls.length > 0 || originalImageUrl ? (
                  <>
                    <img
                      src={editImageUpload.previewUrls[0] || originalImageUrl || ''}
                      alt="Vorschau"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (editImageUpload.previewUrls.length > 0) {
                          editImageUpload.removeImage(0);
                        } else if (originalImageUrl) {
                          onOriginalImageUrlChange(null);
                        }
                      }}
                      className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-colors"
                      aria-label="Bild entfernen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onImageSelect}
                  className="hidden"
                  id="edit-image-upload"
                />
                <Label
                  htmlFor="edit-image-upload"
                  className={cn(
                    buttonPreset,
                    'cursor-pointer inline-flex items-center justify-center text-sm font-medium h-10 px-4 py-2'
                  )}
                >
                  Bild auswählen
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <LoadingButton
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
          >
            Abbrechen
          </LoadingButton>
          <LoadingButton
            variant="outline"
            onClick={onSave}
            className={cn(buttonPreset, 'rounded-xl')}
          >
            Speichern
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
