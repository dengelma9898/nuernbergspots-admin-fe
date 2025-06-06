import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from '@/models/events';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Ticket, Euro, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScraperEventCardProps {
  event: Event;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const ScraperEventCard: React.FC<ScraperEventCardProps> = ({
  event,
  onDelete,
  onEdit,
}) => {
  const formatTimeSlot = (slot: Event['dailyTimeSlots'][0]) => {
    const date = format(new Date(slot.date), 'dd.MM.yyyy', { locale: de });
    if (slot.from && slot.to) {
      return `${date}, ${slot.from} - ${slot.to} Uhr`;
    }
    return date;
  };

  return (
    <Card className="h-full flex flex-col relative">
      <CardHeader className="pb-0 flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-lg line-clamp-2 mb-0">{event.title}</CardTitle>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onEdit}
              title="Bearbeiten"
            >
              <Pencil className="h-4 w-4 mr-1" /> Bearbeiten
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={onDelete}
              title="Löschen"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Löschen
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 mt-1">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {event.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{event.location.address}</span>
        </div>
        {event.dailyTimeSlots.length > 0 && (
          <div className="text-sm">
            <strong>Termine:</strong>
            <ul className="list-disc list-inside">
              {event.dailyTimeSlots.map((slot, index) => (
                <li key={index}>{formatTimeSlot(slot)}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-4 mt-auto pt-2">
          {event.ticketsNeeded && (
            <div className="flex items-center gap-1 text-sm">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span>Tickets erforderlich</span>
            </div>
          )}
          {event.price !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span>{event.price.toFixed(2)} €</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 