import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { Event } from '@/models/events';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Formatiert ein Datum im deutschen Format
 */
export const formatDate = (date: string): string => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch (error) {
    return 'Ungültiges Datum';
  }
};

/**
 * Formatiert ein Datum mit Uhrzeit im deutschen Format
 */
export const formatDateTime = (date: string): string => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy HH:mm', { locale: de });
  } catch (error) {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  }
};

/**
 * Gibt das Event-Datum und die Zeit als formatierte Zeichenkette zurück
 */
export const getEventDateTime = (event: Event): string => {
  const firstSlot = event.dailyTimeSlots[0];
  const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

  if (firstSlot.from && lastSlot.to) {
    return `${formatDate(firstSlot.date)} ${firstSlot.from} - ${lastSlot.to}`;
  }
  return formatDate(firstSlot.date);
};

/**
 * Event-Status basierend auf den Zeitfenstern
 */
export interface EventStatus {
  label: string;
  icon: ReactNode;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
}

export const getEventStatus = (event: Event): EventStatus => {
  const now = new Date();

  const firstSlot = event.dailyTimeSlots[0];
  const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

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

  return {
    label: 'Unbekannt',
    icon: <AlertCircle className="h-4 w-4" />,
    variant: 'secondary' as const,
  };
};

