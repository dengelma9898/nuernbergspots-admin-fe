import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MessageCircle, Users, Trash2, Edit2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LoadingButton } from '@/components/LoadingButton';
import { Chatroom } from '@/models/chatroom';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface ChatroomCardProps {
  chatroom: Chatroom;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ChatroomCard({ chatroom, onClick, onEdit, onDelete }: ChatroomCardProps) {
  return (
    <Card
      className={cn(
        cardPreset,
        'cursor-pointer rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-foreground">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            {chatroom.title}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            {chatroom.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {chatroom.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={chatroom.imageUrl}
                alt={chatroom.title}
                className="w-full h-full object-cover border border-secondary"
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {chatroom.participants?.length ?? 0} Teilnehmer
          </div>
          {chatroom.lastMessage && (
            <div className="text-xs text-muted-foreground">
              Letzte Nachricht: {chatroom.lastMessage.content}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-secondary mt-2">
        <div className="text-xs text-muted-foreground w-full text-center">
          Erstellt am {format(new Date(chatroom.createdAt), 'dd.MM.yyyy', { locale: de })}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <LoadingButton
            variant="outline"
            onClick={onEdit}
            className={cn(buttonPreset, 'w-full sm:w-auto flex items-center justify-center')}
          >
            <Edit2 className="h-4 w-4 mr-2" /> Bearbeiten
          </LoadingButton>
          <LoadingButton
            variant="destructive"
            onClick={onDelete}
            className="w-full sm:w-auto flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Löschen
          </LoadingButton>
        </div>
      </CardFooter>
    </Card>
  );
}
