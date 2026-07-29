import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function formatAdventCalendarDate(date: string): string {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
}
