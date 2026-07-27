import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { glassCard } from '@/lib/glassmorphism';
import { CsvColumnName } from '@/utils/csvEventParser';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { formatDate } from '@/utils/eventFormatters';
import {
  CalendarDays,
  MapPin,
  Tag,
  Euro,
  ChevronDown,
  ChevronUp,
  Ticket,
} from 'lucide-react';

const EMPTY_VALUE = '—';

export type CsvImportEventCardVariant = 'default' | 'success' | 'warning' | 'error';

interface CsvImportEventCardProps {
  title: string;
  rowLabel?: string;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  disabled?: boolean;
  statusBadge?: React.ReactNode;
  actionButtons?: React.ReactNode;
  variant?: CsvImportEventCardVariant;
  highlights: Array<{ icon: React.ReactNode; value: string }>;
  details: React.ReactNode;
  defaultExpanded?: boolean;
}

const variantStyles: Record<CsvImportEventCardVariant, string> = {
  default: 'border-secondary hover:border-primary/30',
  success: 'border-green-500/40 bg-green-500/5',
  warning: 'border-yellow-500/40 bg-yellow-500/5',
  error: 'border-red-500/40 bg-red-500/5',
};

export const CsvImportEventCard: React.FC<CsvImportEventCardProps> = ({
  title,
  rowLabel,
  selectable = false,
  isSelected = false,
  onToggleSelect,
  disabled = false,
  statusBadge,
  actionButtons,
  variant = 'default',
  highlights,
  details,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCardClick = () => {
    if (selectable && onToggleSelect && !disabled) {
      onToggleSelect();
    }
  };

  return (
    <Card
      className={cn(
        glassCard,
        'flex flex-col h-full transition-all duration-300',
        variantStyles[variant],
        selectable && !disabled && 'cursor-pointer hover:scale-[1.01]',
        selectable && isSelected && 'ring-2 ring-primary border-primary/50 bg-primary/5',
        selectable && !isSelected && 'opacity-80'
      )}
      onClick={selectable ? handleCardClick : undefined}
    >
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-start gap-3">
          {selectable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              disabled={disabled}
              onClick={e => e.stopPropagation()}
              className="mt-1.5 h-5 w-5 shrink-0 accent-primary"
              aria-label={`${title} auswählen`}
            />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <CardTitle className="text-lg font-bold text-foreground leading-tight">
                {title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {rowLabel && (
                  <Badge variant="outline" className="text-xs border-secondary">
                    {rowLabel}
                  </Badge>
                )}
                {statusBadge}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 shrink-0 text-foreground/70">{item.icon}</span>
                  <span className="break-words">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {actionButtons && (
          <div
            className="flex flex-wrap gap-2"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            {actionButtons}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 mt-auto">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setExpanded(prev => !prev);
          }}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? (
            <>
              Weniger Details
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Alle Details anzeigen
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>

        {expanded && (
          <div className="rounded-lg border border-secondary/60 bg-background/40 p-3">
            {details}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const formatCsvDateTime = (data: Record<CsvColumnName, string>): string => {
  const startDate = data.Startdatum?.trim();
  if (!startDate) return EMPTY_VALUE;

  const endDate = data.Enddatum?.trim();
  const startTime = data.Startzeit?.trim();
  const endTime = data.Endzeit?.trim();

  let result = startDate;
  if (endDate && endDate !== startDate) {
    result = `${startDate} – ${endDate}`;
  }
  if (startTime || endTime) {
    const timePart = startTime && endTime ? `${startTime}–${endTime}` : startTime || endTime;
    result = `${result}, ${timePart}`;
  }
  return result;
};

export const buildCsvHighlights = (
  data: Record<CsvColumnName, string>
): Array<{ icon: React.ReactNode; value: string }> => {
  const highlights: Array<{ icon: React.ReactNode; value: string }> = [
    { icon: <CalendarDays className="h-4 w-4" />, value: formatCsvDateTime(data) },
  ];

  if (data.Veranstaltungsort?.trim()) {
    highlights.push({
      icon: <MapPin className="h-4 w-4" />,
      value: data.Veranstaltungsort.trim(),
    });
  }
  if (data.Kategorien?.trim()) {
    highlights.push({
      icon: <Tag className="h-4 w-4" />,
      value: data.Kategorien.trim(),
    });
  }
  if (data.Preis?.trim()) {
    highlights.push({
      icon: <Euro className="h-4 w-4" />,
      value: data.Preis.trim(),
    });
  }
  if (data.Tickets?.trim()) {
    highlights.push({
      icon: <Ticket className="h-4 w-4" />,
      value: `Tickets: ${data.Tickets.trim()}`,
    });
  }

  return highlights;
};

const formatEventDateTime = (event: Event): string => {
  if (event.dailyTimeSlots?.length) {
    const first = event.dailyTimeSlots[0];
    const last = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    const datePart =
      first.date === last.date
        ? formatDate(first.date)
        : `${formatDate(first.date)} – ${formatDate(last.date)}`;

    if (first.from && last.to) {
      return `${datePart}, ${first.from}–${last.to}`;
    }
    if (first.from) {
      return `${datePart}, ab ${first.from}`;
    }
    return datePart;
  }
  return EMPTY_VALUE;
};

export const buildEventHighlights = (
  event: Event,
  category?: EventCategory
): Array<{ icon: React.ReactNode; value: string }> => {
  const highlights: Array<{ icon: React.ReactNode; value: string }> = [
    { icon: <CalendarDays className="h-4 w-4" />, value: formatEventDateTime(event) },
  ];

  if (event.location?.address) {
    highlights.push({
      icon: <MapPin className="h-4 w-4" />,
      value: event.location.address,
    });
  }

  const categoryName = category?.name || event.categoryId;
  if (categoryName) {
    highlights.push({
      icon: <Tag className="h-4 w-4" />,
      value: categoryName,
    });
  }

  const price =
    event.priceString || (event.price !== undefined ? `${event.price} €` : 'Kostenlos');
  highlights.push({
    icon: <Euro className="h-4 w-4" />,
    value: price,
  });

  if (event.ticketsNeeded !== undefined) {
    highlights.push({
      icon: <Ticket className="h-4 w-4" />,
      value: `Tickets: ${event.ticketsNeeded ? 'ja' : 'nein'}`,
    });
  }

  return highlights;
};
