import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Event } from '@/models/events';
import { GroupedEvent } from '@/components/events/image-editor/types';

export type EventImageSkipReason = 'no_daily_slots' | 'invalid_date';

export interface EventImageEditorSkippedEvent {
  event: Event;
  reason: EventImageSkipReason;
}

export interface EventImageEditorValidationResult {
  usableEvents: Event[];
  skippedEvents: EventImageEditorSkippedEvent[];
}

export const getEventImageSlotDate = (event: Event): Date | null => {
  const raw = event.dailyTimeSlots?.[0]?.date;
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

export const validateEventsForImageEditor = (events: Event[]): EventImageEditorValidationResult => {
  const usableEvents: Event[] = [];
  const skippedEvents: EventImageEditorSkippedEvent[] = [];

  for (const event of events) {
    if (getEventImageSlotDate(event)) {
      usableEvents.push(event);
      continue;
    }

    skippedEvents.push({
      event,
      reason: event.dailyTimeSlots?.length ? 'invalid_date' : 'no_daily_slots',
    });
  }

  return { usableEvents, skippedEvents };
};

export const getEventImageSkipReasonLabel = (reason: EventImageSkipReason): string => {
  switch (reason) {
    case 'no_daily_slots':
      return 'Kein Tagesdatum (dailyTimeSlots fehlen oder leer)';
    case 'invalid_date':
      return 'Ungültiges Tagesdatum';
    default:
      return 'Nicht verwendbar';
  }
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const formatDate = (date: string) => {
  try {
    const eventDate = new Date(date);
    const dayStr = format(eventDate, 'EEEEEE', { locale: de }).replace(/^(.)(.?)$/, '$1$2.');
    const dateStr = format(eventDate, 'dd.MM.', { locale: de });
    const timeStr = format(eventDate, 'HH:mm', { locale: de });
    return {
      dayDate: `${dayStr} ${dateStr}`,
      time: timeStr ? `${timeStr} Uhr` : '',
      dayOnly: dayStr,
      dateOnly: dateStr,
    };
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return {
      dayDate: 'Ungültiges Datum',
      time: '',
      dayOnly: '',
      dateOnly: '',
    };
  }
};

export const formatEventTitle = (event: Event) => {
  if (event.dailyTimeSlots && event.dailyTimeSlots.length > 0) {
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

    if (firstSlot.date !== lastSlot.date) {
      const { dayOnly, dateOnly } = formatDate(lastSlot.date);
      return `${event.title} (bis ${dayOnly} ${dateOnly})`;
    }
  }
  return event.title;
};

export const formatAddress = (address: string) => {
  let formatted = address.replace(/\b\d{5}\s*/, '');
  formatted = formatted.replace(/,\s*Deutschland$/i, '');
  formatted = formatted.replace(/\s*Deutschland$/i, '');
  return formatted.trim();
};

export const groupEventsByDate = (events: Event[]): GroupedEvent[] => {
  const eventsWithDate = events.filter(event => getEventImageSlotDate(event) !== null);

  const sortedEvents = [...eventsWithDate].sort((a, b) => {
    const aDate = getEventImageSlotDate(a)!;
    const bDate = getEventImageSlotDate(b)!;
    return aDate.getTime() - bDate.getTime();
  });

  const groupedEvents: { [key: string]: Event[] } = {};

  sortedEvents.forEach(event => {
    const startDate = getEventImageSlotDate(event)!;
    const dateKey = format(startDate, 'yyyy-MM-dd');

    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  return Object.entries(groupedEvents).map(([dateStr, grouped]) => ({
    date: new Date(dateStr),
    events: grouped,
  }));
};

export const getEventDisplayText = (event: Event): string => {
  const time = event.dailyTimeSlots?.[0]?.from ? `${event.dailyTimeSlots[0].from} Uhr` : '';
  const eventTitle = formatEventTitle(event);
  const location = event.location.address ? formatAddress(event.location.address) : '';
  const parts: string[] = [];
  if (time) parts.push(time);
  if (eventTitle) parts.push(eventTitle);
  if (location) parts.push(location);
  return parts.join(' | ');
};
