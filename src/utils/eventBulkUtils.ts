import { Event, BulkUpdateEventCategoryResult } from '@/models/events';

export const BULK_CATEGORY_MAX_EVENTS = 100;

/**
 * Patched die Event-Liste mit erfolgreichen Bulk-Kategorie-Ergebnissen.
 */
export function applyBulkCategoryResult(
  events: Event[],
  result: BulkUpdateEventCategoryResult
): Event[] {
  const updatedById = new Map(
    result.results.filter(r => r.success && r.event).map(r => [r.eventId, r.event!])
  );
  return events.map(e => updatedById.get(e.id) ?? e);
}

/**
 * Prüft, ob alle ausgewählten Events bereits die Ziel-Kategorie haben.
 */
export function allSelectedHaveCategory(
  events: Event[],
  eventIds: Iterable<string>,
  categoryId: string
): boolean {
  const idSet = eventIds instanceof Set ? eventIds : new Set(eventIds);
  if (idSet.size === 0) {
    return false;
  }
  return [...idSet].every(id => {
    const event = events.find(e => e.id === id);
    return event?.categoryId === categoryId;
  });
}
