import { Event } from '@/models/events';

/**
 * Prüft, ob sich ein Event geändert hat
 */
export const isEventChanged = (event: Event | null, editedEvent: Partial<Event>): boolean => {
  if (!event) return false;

  // Vergleiche nur relevante Felder
  const fieldsToCompare: (keyof Event)[] = [
    'title',
    'description',
    'location',
    'price',
    'priceString',
    'ticketsNeeded',
    'isPromoted',
    'categoryId',
    'dailyTimeSlots',
    'monthYear',
    'contactEmail',
    'contactPhone',
    'website',
    'socialMedia',
  ];

  return fieldsToCompare.some(field => {
    if (field === 'socialMedia') {
      return JSON.stringify(event[field]) !== JSON.stringify(editedEvent[field]);
    }
    // @ts-ignore - Vergleich von komplexen Objekten
    return JSON.stringify(event[field]) !== JSON.stringify(editedEvent[field]);
  });
};
