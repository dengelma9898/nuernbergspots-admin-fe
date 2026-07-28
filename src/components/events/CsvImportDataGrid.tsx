import React, { useState } from 'react';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { cn } from '@/lib/utils';
import { CSV_COLUMN_NAMES, CsvColumnName } from '@/utils/csvEventParser';
import { formatDate, formatMonthYear } from '@/utils/eventFormatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

const EMPTY_VALUE = '—';

interface DataField {
  label: string;
  value: string;
  fullWidth?: boolean;
}

interface CsvImportDataGridProps {
  mode: 'csv' | 'event';
  csvData?: Record<CsvColumnName, string>;
  event?: Event;
  category?: EventCategory;
}

const formatEventTimeSlots = (event: Event): string => {
  if (event.dailyTimeSlots?.length) {
    return event.dailyTimeSlots
      .map(slot => {
        const date = formatDate(slot.date);
        if (slot.from && slot.to) {
          return `${date} ${slot.from}–${slot.to}`;
        }
        if (slot.from) {
          return `${date} ab ${slot.from}`;
        }
        return date;
      })
      .join('; ');
  }

  if (event.monthYear) {
    return formatMonthYear(event.monthYear);
  }

  return EMPTY_VALUE;
};

const formatSocialMedia = (event: Event): string => {
  const entries: string[] = [];
  if (event.socialMedia?.instagram) {
    entries.push(`Instagram: ${event.socialMedia.instagram}`);
  }
  if (event.socialMedia?.facebook) {
    entries.push(`Facebook: ${event.socialMedia.facebook}`);
  }
  if (event.socialMedia?.tiktok) {
    entries.push(`TikTok: ${event.socialMedia.tiktok}`);
  }
  return entries.length > 0 ? entries.join('; ') : EMPTY_VALUE;
};

const buildCsvFields = (csvData: Record<CsvColumnName, string>): DataField[] =>
  CSV_COLUMN_NAMES.map(name => ({
    label: name,
    value: csvData[name]?.trim() || EMPTY_VALUE,
    fullWidth: name === 'Beschreibung',
  }));

const buildEventFields = (event: Event, category?: EventCategory): DataField[] => [
  { label: 'Titel', value: event.title || EMPTY_VALUE },
  { label: 'Beschreibung', value: event.description || EMPTY_VALUE, fullWidth: true },
  { label: 'Termine', value: formatEventTimeSlots(event), fullWidth: true },
  { label: 'Veranstaltungsort', value: event.location?.address || EMPTY_VALUE },
  { label: 'Kategorie', value: category?.name || event.categoryId || EMPTY_VALUE },
  {
    label: 'Preis',
    value: event.priceString || (event.price !== undefined ? String(event.price) : EMPTY_VALUE),
  },
  {
    label: 'Tickets',
    value: event.ticketsNeeded === undefined ? EMPTY_VALUE : event.ticketsNeeded ? 'ja' : 'nein',
  },
  { label: 'E-Mail', value: event.contactEmail || EMPTY_VALUE },
  { label: 'Telefon', value: event.contactPhone || EMPTY_VALUE },
  { label: 'Webseite', value: event.website || EMPTY_VALUE },
  { label: 'Social Media', value: formatSocialMedia(event), fullWidth: true },
];

const FieldValue: React.FC<{ label: string; value: string; fullWidth?: boolean }> = ({
  label,
  value,
  fullWidth,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = fullWidth && value.length > 120 && value !== EMPTY_VALUE;

  return (
    <div className={cn('space-y-1', fullWidth && 'sm:col-span-2')}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground break-words">
        {isLongText && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-left w-full group"
          >
            <span className="line-clamp-3">{value}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
              Mehr anzeigen
              <ChevronDown className="h-3 w-3" />
            </span>
          </button>
        ) : isLongText && expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-left w-full group"
          >
            <span>{value}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
              Weniger anzeigen
              <ChevronUp className="h-3 w-3" />
            </span>
          </button>
        ) : (
          value
        )}
      </dd>
    </div>
  );
};

export const CsvImportDataGrid: React.FC<CsvImportDataGridProps> = ({
  mode,
  csvData,
  event,
  category,
}) => {
  const fields =
    mode === 'csv' && csvData
      ? buildCsvFields(csvData)
      : mode === 'event' && event
        ? buildEventFields(event, category)
        : [];

  if (fields.length === 0) {
    return null;
  }

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
      {fields.map(field => (
        <FieldValue
          key={field.label}
          label={field.label}
          value={field.value}
          fullWidth={field.fullWidth}
        />
      ))}
    </dl>
  );
};
