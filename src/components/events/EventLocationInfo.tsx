import React from 'react';
import { Event } from '@/models/events';
import { Label } from '@/components/ui/label';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import { MapPin } from 'lucide-react';

interface EventLocationInfoProps {
  event: Event;
  isEditing: boolean;
  editedEvent: Partial<Event>;
  searchValue: LocationResult | null;
  onLocationSelect: (location: LocationResult | null) => void;
}

export const EventLocationInfo: React.FC<EventLocationInfoProps> = ({
  event,
  isEditing,
  editedEvent,
  searchValue,
  onLocationSelect,
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-foreground">Adresse</Label>
      {isEditing ? (
        <div className="space-y-2">
          <LocationSearch
            value={searchValue}
            onChange={onLocationSelect}
            placeholder="Adresse suchen..."
            debounce={1000}
          />
          {editedEvent.location?.address && (
            <div className="text-sm text-muted-foreground">
              Ausgewählte Adresse: {editedEvent.location.address}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {event.location.address}
          {event.location.latitude && event.location.longitude && (
            <span className="ml-2 text-xs">
              ({event.location.latitude}, {event.location.longitude})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
