import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@/models/events';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  MapPin,
  Ticket,
  Euro,
  Pencil,
  Trash2,
  Calendar,
  Globe,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { glassCard } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

interface ScraperEventCardProps {
  event: Event;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const ScraperEventCard: React.FC<ScraperEventCardProps> = ({ event, onDelete, onEdit }) => {
  const formatTimeSlot = (slot: Event['dailyTimeSlots'][0]) => {
    const date = format(new Date(slot.date), 'dd.MM.yyyy', { locale: de });
    if (slot.from && slot.to) {
      return `${date}, ${slot.from} - ${slot.to} Uhr`;
    } else if (slot.from) {
      return `${date}, ab ${slot.from} Uhr`;
    }
    return date;
  };

  return (
    <Card className={cn(glassCard, 'w-full overflow-hidden')}>
      <CardHeader className="pb-4 border-b border-secondary/50">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex-1">
            {event.title}
          </CardTitle>
          <div className="flex gap-2 shrink-0">
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={onEdit}
                title="Bearbeiten"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9"
                onClick={onDelete}
                title="Löschen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hauptinhalt - Links (2/3 auf Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Beschreibung */}
            {event.description && (
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Ort und Termine in einem Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ort */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Ort
                  </p>
                  <p className="text-sm sm:text-base text-foreground font-medium">
                    {event.location.address}
                  </p>
                  {event.location.latitude &&
                    event.location.longitude &&
                    event.location.latitude !== 0 &&
                    event.location.longitude !== 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                      </p>
                    )}
                </div>
              </div>

              {/* Termine */}
              {event.dailyTimeSlots && event.dailyTimeSlots.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Termine
                    </p>
                    <div className="space-y-1">
                      {event.dailyTimeSlots.slice(0, 3).map((slot, index) => (
                        <div key={index} className="text-sm sm:text-base text-foreground font-medium">
                          {formatTimeSlot(slot)}
                        </div>
                      ))}
                      {event.dailyTimeSlots.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{event.dailyTimeSlots.length - 3} weitere
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preis, Tickets, Kategorie in einem Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(event.priceString || event.price !== undefined) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                  <Euro className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Preis
                    </p>
                    <p className="text-sm sm:text-base text-foreground font-medium">
                      {event.priceString ||
                        (event.price !== undefined ? `${event.price.toFixed(2)} €` : 'Kostenlos')}
                    </p>
                  </div>
                </div>
              )}
              {event.ticketsNeeded && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                  <Ticket className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Tickets
                    </p>
                    <p className="text-sm sm:text-base text-foreground font-medium">Erforderlich</p>
                  </div>
                </div>
              )}
              {event.categoryId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                  <Music className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Kategorie
                    </p>
                    <p className="text-sm sm:text-base text-foreground font-medium truncate">
                      {event.categoryId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Website und Kontakt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.website && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Website
                    </p>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-primary hover:underline break-all font-medium"
                    >
                      {event.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Kontakt */}
              {(event.contactEmail || event.contactPhone) && (
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Kontakt
                  </p>
                  <div className="space-y-2">
                    {event.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {event.contactEmail}
                        </a>
                      </div>
                    )}
                    {event.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`tel:${event.contactPhone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {event.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Social Media */}
            {event.socialMedia &&
              (event.socialMedia.instagram ||
                event.socialMedia.facebook ||
                event.socialMedia.tiktok) && (
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Social Media
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {event.socialMedia.instagram && (
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{event.socialMedia.instagram}</span>
                      </div>
                    )}
                    {event.socialMedia.facebook && (
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{event.socialMedia.facebook}</span>
                      </div>
                    )}
                    {event.socialMedia.tiktok && (
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{event.socialMedia.tiktok}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar - Rechts (1/3 auf Desktop) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Bilder */}
            {(event.titleImageUrl || (event.imageUrls && event.imageUrls.length > 0)) && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Bilder
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-1 gap-3">
                  {event.titleImageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-secondary">
                      <img
                        src={event.titleImageUrl}
                        alt={`${event.title} - Titelbild`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {event.imageUrls &&
                    event.imageUrls.slice(0, 3).map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-secondary"
                      >
                        <img
                          src={url}
                          alt={`${event.title} - Bild ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  {event.imageUrls && event.imageUrls.length > 3 && (
                    <div className="relative aspect-video w-full flex items-center justify-center rounded-lg border-2 border-dashed border-secondary bg-muted/20">
                      <p className="text-xs text-muted-foreground">
                        +{event.imageUrls.length - 3} weitere
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Zusätzliche Flags */}
            {event.isPromoted && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    ⭐ Highlight Event
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
