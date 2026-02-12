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

/**
 * Konvertiert das Backend-Format (mm.yyyy) in das HTML5-Format (YYYY-MM)
 * @param monthYear - Format: mm.yyyy (z.B. "02.2026")
 * @returns Format: YYYY-MM (z.B. "2026-02") oder leerer String wenn ungültig
 */
export const monthYearToHtml5 = (monthYear: string | undefined | null): string => {
  if (!monthYear) return '';
  const parts = monthYear.split('.');
  if (parts.length !== 2) return '';
  const [month, year] = parts;
  if (!month || !year || month.length > 2 || year.length !== 4) return '';
  return `${year}-${month.padStart(2, '0')}`;
};

/**
 * Konvertiert das HTML5-Format (YYYY-MM) in das Backend-Format (mm.yyyy)
 * @param html5Month - Format: YYYY-MM (z.B. "2026-02")
 * @returns Format: mm.yyyy (z.B. "02.2026") oder leerer String wenn ungültig
 */
export const html5ToMonthYear = (html5Month: string | undefined | null): string => {
  if (!html5Month) return '';
  const parts = html5Month.split('-');
  if (parts.length !== 2) return '';
  const [year, month] = parts;
  if (!month || !year || year.length !== 4) return '';
  return `${month.padStart(2, '0')}.${year}`;
};

/**
 * Formatiert monthYear für die Anzeige
 * @param monthYear - Format: mm.yyyy (z.B. "02.2026")
 * @returns Formatierter String (z.B. "Februar 2026")
 */
export const formatMonthYear = (monthYear: string | undefined | null): string => {
  if (!monthYear) return '';
  const html5Format = monthYearToHtml5(monthYear);
  if (!html5Format) return monthYear; // Fallback auf Original wenn Konvertierung fehlschlägt
  try {
    // Erstelle Datum mit erstem Tag des Monats
    const date = new Date(`${html5Format}-01`);
    return format(date, 'MMMM yyyy', { locale: de });
  } catch {
    return monthYear;
  }
};

/**
 * Konvertiert monthYear in ein Date-Objekt (erster Tag des Monats)
 * @param monthYear - Format: mm.yyyy (z.B. "02.2026")
 * @returns Date-Objekt oder null wenn ungültig
 */
export const monthYearToDate = (monthYear: string | undefined | null): Date | null => {
  if (!monthYear) return null;
  const html5Format = monthYearToHtml5(monthYear);
  if (!html5Format) return null;
  try {
    return new Date(`${html5Format}-01`);
  } catch {
    return null;
  }
};

/**
 * Prüft ob ein Event Zeitinformationen hat (dailyTimeSlots oder monthYear)
 */
export const hasDateInfo = (event: Event): boolean => {
  return (event.dailyTimeSlots?.length > 0) || !!event.monthYear;
};