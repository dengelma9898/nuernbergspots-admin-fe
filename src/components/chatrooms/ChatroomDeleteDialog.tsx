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
import { Chatroom } from '@/models/chatroom';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface ChatroomDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChatroom: Chatroom | null;
  onConfirm: () => void;
}

export function ChatroomDeleteDialog({
  open,
  onOpenChange,
  selectedChatroom,
  onConfirm,
}: ChatroomDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(cardPreset)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Chatroom löschen</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Möchten Sie den Chatroom "{selectedChatroom?.title}" wirklich löschen? Diese Aktion kann
            nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={cn(buttonPreset)}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
