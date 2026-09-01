import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, isFuture, isPast, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  Copy,
  Euro,
  Eye,
  Heart,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Square,
  Star,
  StarOff,
  Tag,
  Ticket,
} from 'lucide-react';
import { AnimatedCard } from '@/components/AnimatedCard';
import { LoadingButton } from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { formatMonthYear, monthYearToDate } from '@/utils/eventFormatters';
import { convertFFToHex, getContrastTextColor } from '@/utils/eventListUtils';
import { getIconComponent } from '@/utils/iconUtils';

export interface EventCardProps {
  event: Event;
  category?: EventCategory;
  onDelete: (id: string) => void;
  onCopy?: (id: string) => void;
  showApprove?: boolean;
  onApprove?: (id: string) => void;
  isApproving?: boolean;
  isPreview?: boolean;
  onEdit?: () => void;
  showDeleteButton?: boolean;
  index?: number;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  disableAnimation?: boolean;
}

const getStableFallbackImage = (
  cat: EventCategory | undefined,
  seed: string
): string | undefined => {
  if (!cat?.fallbackImages?.length) {
    return undefined;
  }
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index)) % cat.fallbackImages.length;
  }
  return cat.fallbackImages[hash];
};

const EventCardComponent: React.FC<EventCardProps> = ({
  event,
  category,
  onDelete,
  onCopy,
  showApprove = false,
  onApprove,
  isApproving = false,
  isPreview = false,
  onEdit,
  showDeleteButton = false,
  index = 0,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  disableAnimation = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection(event.id);
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
    } catch {
      return 'Ungültiges Datum';
    }
  };

  const formatPrice = (eventItem: Event) => {
    if (eventItem.priceString) {
      return eventItem.priceString;
    }
    if (eventItem.price) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(eventItem.price);
    }
    return 'Kostenlos';
  };

  const getEventDateTime = (eventItem: Event) => {
    if (eventItem.dailyTimeSlots?.length) {
      const firstSlot = eventItem.dailyTimeSlots[0];
      const lastSlot = eventItem.dailyTimeSlots[eventItem.dailyTimeSlots.length - 1];

      if (firstSlot.date === lastSlot.date) {
        return formatDate(firstSlot.date);
      }
      return `${formatDate(firstSlot.date)} - ${formatDate(lastSlot.date)}`;
    }

    if (eventItem.monthYear) {
      return formatMonthYear(eventItem.monthYear);
    }

    return 'Kein Datum';
  };

  const getEventStatus = (eventItem: Event) => {
    if (eventItem.dailyTimeSlots?.length) {
      const now = new Date();
      const firstSlot = eventItem.dailyTimeSlots[0];
      const lastSlot = eventItem.dailyTimeSlots[eventItem.dailyTimeSlots.length - 1];

      const firstDate = new Date(firstSlot.date);
      const lastDate = new Date(lastSlot.date);

      if (isPast(lastDate)) {
        return {
          label: 'Beendet',
          icon: <CheckCircle2 className="h-4 w-4" />,
          variant: 'secondary' as const,
        };
      }

      if (isWithinInterval(now, { start: firstDate, end: lastDate })) {
        return {
          label: 'Läuft jetzt',
          icon: <Clock className="h-4 w-4" />,
          variant: 'default' as const,
        };
      }

      if (isFuture(firstDate)) {
        return {
          label: 'Kommend',
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'outline' as const,
        };
      }
    }

    if (eventItem.monthYear) {
      const monthYearDate = monthYearToDate(eventItem.monthYear);
      if (monthYearDate) {
        const endOfMonthDate = new Date(
          monthYearDate.getFullYear(),
          monthYearDate.getMonth() + 1,
          0
        );

        if (isPast(endOfMonthDate)) {
          return {
            label: 'Beendet',
            icon: <CheckCircle2 className="h-4 w-4" />,
            variant: 'secondary' as const,
          };
        }

        if (isFuture(monthYearDate)) {
          return {
            label: 'Kommend',
            icon: <CalendarDays className="h-4 w-4" />,
            variant: 'outline' as const,
          };
        }

        return {
          label: 'Diesen Monat',
          icon: <CalendarDays className="h-4 w-4" />,
          variant: 'default' as const,
        };
      }
    }

    return {
      label: 'Ohne Datum',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'secondary' as const,
    };
  };

  const status = useMemo(() => getEventStatus(event), [event]);
  const fallbackImage = useMemo(
    () => getStableFallbackImage(category, event.id),
    [category, event.id]
  );
  const hasVisibleImage = Boolean(
    event.titleImageUrl || (event.imageUrls && event.imageUrls.length > 0) || fallbackImage
  );
  const eventDateTime = useMemo(() => getEventDateTime(event), [event]);

  const cardClassName = cn(
    cardPreset,
    'flex flex-col relative',
    hasVisibleImage && 'pt-0 overflow-hidden',
    isSelectionMode && 'cursor-pointer transition-all duration-300',
    isSelectionMode && isSelected && 'ring-4 ring-primary ring-offset-2 ring-offset-background'
  );

  const cardBody = (
    <>
      {event.titleImageUrl ? (
        <div className="relative h-48 w-full">
          <img
            src={event.titleImageUrl}
            alt={event.title}
            className="object-cover w-full h-full"
            loading="lazy"
            decoding="async"
          />
          {event.imageUrls && event.imageUrls.length > 0 && (
            <div className="absolute bottom-2 left-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded-lg border border-secondary">
              +{event.imageUrls.length} weitere Bilder
            </div>
          )}
        </div>
      ) : event.imageUrls && event.imageUrls.length > 0 ? (
        <div className="relative h-48 w-full">
          <img
            src={event.imageUrls[0]}
            alt={event.title}
            className="object-cover w-full h-full"
            loading="lazy"
            decoding="async"
          />
          {event.imageUrls.length > 1 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/90 border-secondary text-foreground"
            >
              <ImageIcon className="mr-1 h-3 w-3" />+{event.imageUrls.length - 1}
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 bg-tertiary text-tertiary-foreground border-secondary">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Hervorgehoben
            </Badge>
          )}
        </div>
      ) : fallbackImage ? (
        <div className="relative h-48 w-full">
          <img
            src={fallbackImage}
            alt={`${event.title} - Kategoriebild`}
            className="object-cover w-full h-full opacity-80"
            loading="lazy"
            decoding="async"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/90 border-secondary text-foreground"
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            Kategoriebild
          </Badge>
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 bg-tertiary text-tertiary-foreground border-secondary">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Hervorgehoben
            </Badge>
          )}
        </div>
      ) : null}
      <CardHeader>
        {isSelectionMode ? (
          <div className="flex items-center gap-2 pb-2 mb-1 border-b border-white/10">
            <div
              className={cn(
                'rounded-lg p-1.5 transition-all duration-300 shrink-0',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground border border-secondary'
              )}
              aria-hidden="true"
            >
              {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
            </div>
            <span className="text-sm text-muted-foreground">
              {isSelected ? 'Ausgewählt' : 'Zum Auswählen tippen'}
            </span>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 w-full min-w-0">
          <div className="flex items-start gap-1 min-w-0">
            <CardTitle className="text-xl text-foreground break-words">{event.title}</CardTitle>
            {event.isPromoted && (
              <Star className="h-4 w-4 text-tertiary fill-current shrink-0 mt-1" />
            )}
          </div>
          <CardDescription className="text-muted-foreground">{eventDateTime}</CardDescription>
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <Badge
                className="text-xs flex items-center max-w-full truncate border-secondary"
                style={{
                  backgroundColor: convertFFToHex(category.colorCode),
                  color: getContrastTextColor(convertFFToHex(category.colorCode)),
                }}
                title={category.name}
              >
                <span className="mr-1 flex items-center">
                  {getIconComponent(category.iconName)}
                </span>
                <span className="truncate">{category.name}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs flex items-center max-w-full truncate border-secondary"
              >
                <Tag className="w-3 h-3 mr-1" />
                Keine Kategorie
              </Badge>
            )}
            {event.status === 'PENDING' ? (
              <Badge
                variant="outline"
                className="border-amber-400/70 text-amber-100 bg-amber-500/15 border-secondary"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Ausstehend
              </Badge>
            ) : null}
            <Badge variant={status.variant} className="border-secondary">
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{event.description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{event.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Heart className="mr-2 h-4 w-4" />
            {event.favoriteCount || 0} Likes
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Ticket className="mr-2 h-4 w-4" />
            {event.ticketsNeeded ? 'Tickets erforderlich' : 'Keine Tickets erforderlich'}
          </div>
          {(event.priceString || event.price) && (
            <div className="flex items-center text-sm text-foreground">
              <Euro className="mr-2 h-4 w-4" />
              {formatPrice(event)}
            </div>
          )}
          <div className="flex items-center text-sm">
            {event.isPromoted ? (
              <>
                <Star className="mr-2 h-4 w-4 text-tertiary fill-current" />
                <span className="text-tertiary font-medium">Hervorgehobenes Event</span>
              </>
            ) : (
              <>
                <StarOff className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Standard Event</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Erstellt am {formatDate(event.createdAt)}
        </div>
        {isSelectionMode ? (
          <div className="text-sm text-muted-foreground italic">
            {isSelected ? 'Ausgewählt' : 'Klicken zum Auswählen'}
          </div>
        ) : (
          <div className="flex gap-2">
            {isPreview ? (
              <>
                <LoadingButton
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className={cn(buttonPreset)}
                >
                  Bearbeiten
                </LoadingButton>
                {onCopy && (
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(event.id)}
                    className={cn(buttonPreset)}
                    title="Event kopieren"
                    aria-label="Event kopieren"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Kopieren</span>
                  </LoadingButton>
                )}
                {showDeleteButton && (
                  <LoadingButton variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
                    Löschen
                  </LoadingButton>
                )}
              </>
            ) : (
              <>
                <LoadingButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/events/${event.id}${location.search}`)}
                  className={cn(buttonPreset)}
                  title="Details"
                  aria-label="Details"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </LoadingButton>
                <LoadingButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/events/${event.id}${location.search}`, {
                      state: { startInEditMode: true },
                    })
                  }
                  className={cn(buttonPreset)}
                  title="Bearbeiten"
                  aria-label="Bearbeiten"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Bearbeiten</span>
                </LoadingButton>
                {showApprove && onApprove ? (
                  <LoadingButton
                    size="sm"
                    onClick={() => onApprove(event.id)}
                    disabled={isApproving}
                    className="bg-emerald-600/90 text-white hover:bg-emerald-600 border-0 gap-1"
                    title="Freigeben"
                    aria-label="Event freigeben"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Freigeben</span>
                  </LoadingButton>
                ) : null}
                {onCopy && (
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(event.id)}
                    className={cn(buttonPreset)}
                    title="Event kopieren"
                    aria-label="Event kopieren"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Kopieren</span>
                  </LoadingButton>
                )}
                <LoadingButton variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
                  Löschen
                </LoadingButton>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </>
  );

  if (disableAnimation) {
    return (
      <Card className={cardClassName} onClick={isSelectionMode ? handleCardClick : undefined}>
        {cardBody}
      </Card>
    );
  }

  return (
    <AnimatedCard
      index={index}
      className={cardClassName}
      onClick={isSelectionMode ? handleCardClick : undefined}
    >
      {cardBody}
    </AnimatedCard>
  );
};

function areEventCardPropsEqual(prev: EventCardProps, next: EventCardProps): boolean {
  return (
    prev.event === next.event &&
    prev.category === next.category &&
    prev.showApprove === next.showApprove &&
    prev.isApproving === next.isApproving &&
    prev.isSelectionMode === next.isSelectionMode &&
    prev.isSelected === next.isSelected &&
    prev.isPreview === next.isPreview &&
    prev.showDeleteButton === next.showDeleteButton &&
    prev.disableAnimation === next.disableAnimation &&
    prev.onDelete === next.onDelete &&
    prev.onCopy === next.onCopy &&
    prev.onApprove === next.onApprove &&
    prev.onToggleSelection === next.onToggleSelection &&
    prev.onEdit === next.onEdit
  );
}

export const EventCard = React.memo(EventCardComponent, areEventCardPropsEqual);
