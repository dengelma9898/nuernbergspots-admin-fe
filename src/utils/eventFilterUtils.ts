import { Event } from '@/models/events';

/**
 * Prüft ob ein Event den Kategorie-Filter erfüllt.
 * "Ohne Kategorie" schließt sowohl null/undefined als auch
 * categoryId "default" (CSV-importierte Events) ein.
 */
export const matchesCategoryFilter = (
  event: Event,
  categoryFilter: string
): boolean => {
  return (
    categoryFilter === 'all' ||
    (categoryFilter === 'no-category' &&
      (!event.categoryId || event.categoryId === 'default')) ||
    (categoryFilter !== 'no-category' && event.categoryId === categoryFilter)
  );
};
