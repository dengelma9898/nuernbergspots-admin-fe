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
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { defaultTransition } from '@/lib/animations';
import { cardPresetHover, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { TaxiStand } from '@/models/taxi-stand';
import { BarChart3, Car, Edit, MapPin, Phone, Trash2 } from 'lucide-react';

interface TaxiStandCardProps {
  stand: TaxiStand;
  onDelete: (id: string) => void;
}

export const TaxiStandCard: React.FC<TaxiStandCardProps> = ({ stand, onDelete }) => {
  const navigate = useNavigate();
  const phoneClicks = stand.phoneClickTimestamps?.length || 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(cardPresetHover, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <CardTitle className="text-foreground text-base">
            {stand.title || 'Taxistandort'}
          </CardTitle>
          {stand.description && (
            <CardDescription className="text-muted-foreground text-xs line-clamp-2">
              {stand.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex-grow !px-4 !py-2 gap-0 space-y-1.5">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{stand.location.address}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="h-3 w-3 mr-1 shrink-0" />
            <span>{stand.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {stand.numberOfTaxis != null && (
              <span className="flex items-center text-muted-foreground">
                <Car className="h-3 w-3 mr-1" />
                {stand.numberOfTaxis} Taxis
              </span>
            )}
            <span className="flex items-center text-muted-foreground">
              <BarChart3 className="h-3 w-3 mr-1" />
              {phoneClicks} Klicks
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end items-center !px-4 !pt-2 !pb-4 gap-0">
          <div className="flex gap-2">
            <LoadingButton
              variant="outline"
              size="sm"
              className={cn(buttonPreset)}
              onClick={() => navigate(`/taxi-stands/${stand.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </LoadingButton>
            <LoadingButton variant="destructive" size="sm" onClick={() => onDelete(stand.id)}>
              <Trash2 className="h-4 w-4" />
            </LoadingButton>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface TaxiStandCardMobileProps {
  stand: TaxiStand;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
}

export const TaxiStandCardMobile: React.FC<TaxiStandCardMobileProps> = ({
  stand,
  onDelete,
  navigate,
}) => {
  const phoneClicks = stand.phoneClickTimestamps?.length || 0;

  return (
    <Card className={cn(cardPresetHover, 'p-4')}>
      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg text-foreground">{stand.title || 'Taxistandort'}</span>
        {stand.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{stand.description}</p>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1 shrink-0" />
          <span className="truncate">{stand.location.address}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Phone className="h-3 w-3 mr-1 shrink-0" />
          <span>{stand.phoneNumber}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {stand.numberOfTaxis != null && (
            <span className="flex items-center text-muted-foreground">
              <Car className="h-3 w-3 mr-1" /> {stand.numberOfTaxis} Taxis
            </span>
          )}
          <span className="flex items-center text-muted-foreground">
            <BarChart3 className="h-3 w-3 mr-1" /> {phoneClicks} Klicks
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <LoadingButton
            variant="outline"
            size="sm"
            className={cn(buttonPreset, 'w-full')}
            onClick={() => navigate(`/taxi-stands/${stand.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </LoadingButton>
          <LoadingButton
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(stand.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </LoadingButton>
        </div>
      </div>
    </Card>
  );
};
