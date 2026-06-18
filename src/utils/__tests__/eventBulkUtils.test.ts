import { Event, BulkUpdateEventCategoryResult } from '@/models/events';
import { applyBulkCategoryResult, allSelectedHaveCategory } from '@/utils/eventBulkUtils';

const baseEvent: Event = {
  id: 'e1',
  title: 'Test',
  description: 'd',
  location: { address: 'a', latitude: 0, longitude: 0 },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  dailyTimeSlots: [],
  categoryId: 'old-cat',
};

describe('eventBulkUtils', () => {
  describe('applyBulkCategoryResult', () => {
    it('should patch successful events from bulk result', () => {
      const events = [baseEvent, { ...baseEvent, id: 'e2', categoryId: 'other' }];
      const result: BulkUpdateEventCategoryResult = {
        total: 2,
        successful: 2,
        failed: 0,
        results: [
          {
            eventId: 'e1',
            success: true,
            event: { ...baseEvent, categoryId: 'new-cat' },
          },
          {
            eventId: 'e2',
            success: true,
            event: { ...baseEvent, id: 'e2', categoryId: 'new-cat' },
          },
        ],
      };

      const updated = applyBulkCategoryResult(events, result);

      expect(updated[0].categoryId).toBe('new-cat');
      expect(updated[1].categoryId).toBe('new-cat');
    });

    it('should leave failed events unchanged', () => {
      const events = [baseEvent];
      const result: BulkUpdateEventCategoryResult = {
        total: 1,
        successful: 0,
        failed: 1,
        results: [{ eventId: 'e1', success: false, message: 'Event not found' }],
      };

      const updated = applyBulkCategoryResult(events, result);

      expect(updated[0].categoryId).toBe('old-cat');
    });
  });

  describe('allSelectedHaveCategory', () => {
    it('returns true when all selected events have the target category', () => {
      const events = [
        { ...baseEvent, id: 'e1', categoryId: 'cat-a' },
        { ...baseEvent, id: 'e2', categoryId: 'cat-a' },
      ];
      expect(allSelectedHaveCategory(events, ['e1', 'e2'], 'cat-a')).toBe(true);
    });

    it('returns false when at least one event has a different category', () => {
      const events = [
        { ...baseEvent, id: 'e1', categoryId: 'cat-a' },
        { ...baseEvent, id: 'e2', categoryId: 'cat-b' },
      ];
      expect(allSelectedHaveCategory(events, ['e1', 'e2'], 'cat-a')).toBe(false);
    });

    it('returns false for empty selection', () => {
      expect(allSelectedHaveCategory([baseEvent], [], 'cat-a')).toBe(false);
    });
  });
});
