import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Trophy, Edit, Trash2, Users } from 'lucide-react';
import { AdventCalendarEntry } from '@/models/advent-calendar';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { defaultTransition } from '@/lib/animations';
import { cardPresetHover, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { formatAdventCalendarDate } from '@/utils/adventCalendarFormatUtils';

interface AdventCalendarEntryCardProps {
  entry: AdventCalendarEntry;
  onDelete: (id: string) => void;
}

export function AdventCalendarEntryCard({ entry, onDelete }: AdventCalendarEntryCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(cardPresetHover, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        {entry.imageUrl ? (
          <div className="relative h-48 w-full">
            <img
              src={entry.imageUrl}
              alt={entry.description}
              className="object-cover w-full h-full rounded-t-lg bg-muted p-2 border-b border-secondary"
            />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">
              Nr. {entry.number}
            </Badge>
          </div>
        ) : (
          <div className="relative h-48 w-full bg-muted rounded-t-lg flex items-center justify-center border-b border-secondary">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0">
              Nr. {entry.number}
            </Badge>
          </div>
        )}

        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <CardTitle className="text-foreground">Eintrag #{entry.number}</CardTitle>
          <CardDescription className="text-muted-foreground">{entry.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow !px-4 !py-2 gap-0">
          {entry.winners && entry.winners.length > 0 && (
            <div className="flex items-center text-sm text-foreground mb-2">
              <Trophy className="h-4 w-4 mr-2" />
              {entry.winners.length} Gewinner
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 !px-4 !pt-2 !pb-4 gap-0">
          {entry.canParticipate && (
            <div className="w-full mb-2">
              <LoadingButton
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/advent-calendar/${entry.id}/participants`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Teilnehmer
              </LoadingButton>
            </div>
          )}
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-muted-foreground">
              {formatAdventCalendarDate(entry.createdAt)}
            </div>
            <div className="flex gap-2">
              <LoadingButton
                variant="outline"
                size="sm"
                className={cn(buttonPreset)}
                onClick={() => navigate(`/advent-calendar/${entry.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </LoadingButton>
              <LoadingButton variant="destructive" size="sm" onClick={() => onDelete(entry.id)}>
                <Trash2 className="h-4 w-4" />
              </LoadingButton>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

interface AdventCalendarEntryCardMobileProps {
  entry: AdventCalendarEntry;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
}

export function AdventCalendarEntryCardMobile({
  entry,
  onDelete,
  navigate,
}: AdventCalendarEntryCardMobileProps) {
  return (
    <Card className={cn(cardPresetHover, 'p-4')}>
      <div className="flex flex-col gap-2">
        <Badge className="w-fit bg-primary text-primary-foreground border-0 mb-2">
          Nr. {entry.number}
        </Badge>
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.description}
            className="object-cover w-full h-40 rounded bg-muted p-2 border border-secondary mb-2"
          />
        )}
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-lg text-foreground">Eintrag #{entry.number}</span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">{entry.description}</div>
        {entry.winners && entry.winners.length > 0 && (
          <div className="flex items-center text-sm text-foreground mb-2">
            <Trophy className="h-4 w-4 mr-2" />
            {entry.winners.length} Gewinner
          </div>
        )}
        <div className="text-xs text-muted-foreground mb-2">
          Erstellt am {formatAdventCalendarDate(entry.createdAt)}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {entry.canParticipate && (
            <LoadingButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/advent-calendar/${entry.id}/participants`)}
            >
              <Users className="mr-2 h-4 w-4" />
              Teilnehmer
            </LoadingButton>
          )}
          <LoadingButton
            variant="outline"
            size="sm"
            className={cn(buttonPreset, 'w-full')}
            onClick={() => navigate(`/advent-calendar/${entry.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </LoadingButton>
          <LoadingButton
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </LoadingButton>
        </div>
      </div>
    </Card>
  );
}
