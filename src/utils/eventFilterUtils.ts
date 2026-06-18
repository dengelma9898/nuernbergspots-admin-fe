import { isBefore, startOfDay } from 'date-fns';
import { Event } from '@/models/events';
import { monthYearToDate } from '@/utils/eventFormatters';

/**
 * Prüft ob ein Event den Kategorie-Filter erfüllt.
 * "Ohne Kategorie" schließt sowohl null/undefined als auch
 * categoryId "default" (CSV-importierte Events) ein.
 */
export const matchesCategoryFilter = (event: Event, categoryFilter: string): boolean => {
  return (
    categoryFilter === 'all' ||
    (categoryFilter === 'no-category' && (!event.categoryId || event.categoryId === 'default')) ||
    (categoryFilter !== 'no-category' && event.categoryId === categoryFilter)
  );
};

/**
 * Prüft ob ein Event in der Vergangenheit liegt (nach letztem Termin bzw. Monat).
 * Events ohne Datum gelten nicht als vergangen.
 */
export const isEventPast = (event: Event): boolean => {
  const today = startOfDay(new Date());

  if (event.dailyTimeSlots?.length) {
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    const lastDate = startOfDay(new Date(lastSlot.date));
    return isBefore(lastDate, today);
  }

  if (event.monthYear) {
    const monthYearDate = monthYearToDate(event.monthYear);
    if (monthYearDate) {
      const endOfMonthDate = startOfDay(
        new Date(monthYearDate.getFullYear(), monthYearDate.getMonth() + 1, 0)
      );
      return isBefore(endOfMonthDate, today);
    }
  }

  return false;
};
