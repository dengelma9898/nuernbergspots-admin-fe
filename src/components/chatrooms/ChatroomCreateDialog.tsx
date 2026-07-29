import { Plus, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingButton } from '@/components/LoadingButton';
import type { UserFriendlyError } from '@/utils/errorUtils';
import type { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

type ImageUpload = ReturnType<typeof useValidatedImageUpload>;

interface ChatroomCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newChatroom: {
    title: string;
    description: string;
    imageUrl: string;
    participants: string[];
  };
  onNewChatroomChange: (chatroom: ChatroomCreateDialogProps['newChatroom']) => void;
  createError: UserFriendlyError | null;
  onCreateErrorChange: (error: UserFriendlyError | null) => void;
  createImageUpload: ImageUpload;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
}

export function ChatroomCreateDialog({
  open,
  onOpenChange,
  newChatroom,
  onNewChatroomChange,
  createError,
  onCreateErrorChange,
  createImageUpload,
  onImageSelect,
  onCreate,
}: ChatroomCreateDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          onCreateErrorChange(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <LoadingButton className="w-full sm:w-auto cursor-pointer text-base font-semibold px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Neuer Chatroom
        </LoadingButton>
      </DialogTrigger>
      <DialogContent className={cn(cardPreset)}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Neuen Chatroom erstellen</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Erstellen Sie einen neuen Chatroom mit den gewünschten Einstellungen.
          </DialogDescription>
        </DialogHeader>
        {(createError || createImageUpload.error) && (
          <Alert variant="destructive" className={cn(cardPreset, 'border-destructive/50')}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{createImageUpload.error?.title || createError?.title}</AlertTitle>
            <AlertDescription className="mt-2">
              <p>{createImageUpload.error?.message || createError?.message}</p>
              {(createImageUpload.error?.actionHint || createError?.actionHint) && (
                <p className="mt-2 text-sm opacity-90">
                  {createImageUpload.error?.actionHint || createError?.actionHint}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Titel
            </Label>
            <Input
              id="title"
              value={newChatroom.title}
              onChange={e => onNewChatroomChange({ ...newChatroom, title: e.target.value })}
              placeholder="Chatroom Titel"
              className={cn(inputPreset)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              value={newChatroom.description}
              onChange={e => onNewChatroomChange({ ...newChatroom, description: e.target.value })}
              placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
              className={cn(inputPreset)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Chatroom Bild</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 border-2 border-dashed border-secondary rounded-lg overflow-hidden">
                {createImageUpload.previewUrls.length > 0 ? (
                  <>
                    <img
                      src={createImageUpload.previewUrls[0]}
                      alt="Vorschau"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => createImageUpload.removeImage(0)}
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
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
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
            onClick={() => {
              onOpenChange(false);
              createImageUpload.clearImages();
              onCreateErrorChange(null);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
          >
            Abbrechen
          </LoadingButton>
          <LoadingButton
            variant="outline"
            onClick={onCreate}
            className={cn(buttonPreset, 'rounded-xl')}
          >
            Erstellen
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
