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
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { defaultTransition } from '@/lib/animations';
import { cardPresetHover, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { formatEasterEggDate } from '@/utils/easterEggFormatUtils';
import { EasterEgg } from '@/models/easter-egg';
import { Calendar, Edit, Egg, MapPin, Trash2, Trophy, Users } from 'lucide-react';

interface EasterEggCardProps {
  egg: EasterEgg;
  onDelete: (id: string) => void;
}

export const EasterEggCard: React.FC<EasterEggCardProps> = ({ egg, onDelete }) => {
  const navigate = useNavigate();

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(cardPresetHover, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        {egg.imageUrl ? (
          <div className="relative h-48 w-full">
            <img
              src={egg.imageUrl}
              alt={egg.title}
              className="object-cover w-full h-full rounded-t-lg bg-muted p-2 border-b border-secondary"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full bg-muted rounded-t-lg flex items-center justify-center border-b border-secondary">
            <Egg className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <CardTitle className="text-foreground text-base">{egg.title}</CardTitle>
          <CardDescription className="text-muted-foreground text-xs line-clamp-2">
            {egg.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow !px-4 !py-2 gap-0 space-y-1.5">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{egg.location.address}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1 shrink-0" />
            <span>
              {formatEasterEggDate(egg.startDate)}
              {egg.endDate ? ` – ${formatEasterEggDate(egg.endDate)}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {egg.participantCount}
            </span>
            <span className="flex items-center text-muted-foreground">
              <Trophy className="h-3 w-3 mr-1" />
              {egg.winnerCount}
            </span>
          </div>
          {egg.prizeDescription && (
            <Badge variant="outline" className="text-xs w-fit">
              {egg.prizeDescription}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center !px-4 !pt-2 !pb-4 gap-0">
          <div className="text-xs text-muted-foreground">{formatEasterEggDate(egg.createdAt)}</div>
          <div className="flex gap-2">
            <LoadingButton
              variant="outline"
              size="sm"
              className={cn(buttonPreset)}
              onClick={() => navigate(`/easter-egg-hunt/${egg.id}`)}
            >
              <Users className="h-4 w-4" />
            </LoadingButton>
            <LoadingButton
              variant="outline"
              size="sm"
              className={cn(buttonPreset)}
              onClick={() => navigate(`/easter-egg-hunt/${egg.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </LoadingButton>
            <LoadingButton variant="destructive" size="sm" onClick={() => onDelete(egg.id)}>
              <Trash2 className="h-4 w-4" />
            </LoadingButton>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface EasterEggCardMobileProps {
  egg: EasterEgg;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
}

export const EasterEggCardMobile: React.FC<EasterEggCardMobileProps> = ({
  egg,
  onDelete,
  navigate,
}) => {
  return (
    <Card className={cn(cardPresetHover, 'p-4')}>
      <div className="flex flex-col gap-2">
        {egg.imageUrl && (
          <img
            src={egg.imageUrl}
            alt={egg.title}
            className="object-cover w-full h-40 rounded bg-muted p-2 border border-secondary mb-2"
          />
        )}
        <span className="font-bold text-lg text-foreground">{egg.title}</span>
        <p className="text-sm text-muted-foreground line-clamp-2">{egg.description}</p>

        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1 shrink-0" />
          <span className="truncate">{egg.location.address}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1 shrink-0" />
          <span>
            {formatEasterEggDate(egg.startDate)}
            {egg.endDate ? ` – ${formatEasterEggDate(egg.endDate)}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center text-muted-foreground">
            <Users className="h-3 w-3 mr-1" /> {egg.participantCount} Teilnehmer
          </span>
          <span className="flex items-center text-muted-foreground">
            <Trophy className="h-3 w-3 mr-1" /> {egg.winnerCount} Gewinner
          </span>
        </div>

        {egg.prizeDescription && (
          <Badge variant="outline" className="text-xs w-fit">
            {egg.prizeDescription}
          </Badge>
        )}

        <div className="text-xs text-muted-foreground mt-1">
          Erstellt am {formatEasterEggDate(egg.createdAt)}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <LoadingButton
            variant="outline"
            size="sm"
            className={cn(buttonPreset, 'w-full')}
            onClick={() => navigate(`/easter-egg-hunt/${egg.id}`)}
          >
            <Users className="mr-2 h-4 w-4" />
            Detail / Gewinner
          </LoadingButton>
          <LoadingButton
            variant="outline"
            size="sm"
            className={cn(buttonPreset, 'w-full')}
            onClick={() => navigate(`/easter-egg-hunt/${egg.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </LoadingButton>
          <LoadingButton
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(egg.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </LoadingButton>
        </div>
      </div>
    </Card>
  );
};
