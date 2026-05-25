import { matchesCategoryFilter } from '../eventFilterUtils';
import { Event } from '@/models/events';

const createMockEvent = (overrides: Partial<Event> = {}): Event =>
  ({
    id: 'event-1',
    title: 'Test Event',
    description: 'Beschreibung',
    location: { address: 'Test', latitude: 0, longitude: 0 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    dailyTimeSlots: [{ date: '2024-06-15', from: '14:00', to: '18:00' }],
    ...overrides,
  }) as Event;

describe('matchesCategoryFilter', () => {
  describe('Filter "all"', () => {
    it('sollte alle Events durchlassen unabhängig von categoryId', () => {
      expect(matchesCategoryFilter(createMockEvent(), 'all')).toBe(true);
      expect(matchesCategoryFilter(createMockEvent({ categoryId: undefined }), 'all')).toBe(true);
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'default' }), 'all')).toBe(true);
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'cat-1' }), 'all')).toBe(true);
    });
  });

  describe('Filter "no-category" (Ohne Kategorie)', () => {
    it('sollte Events mit null/undefined categoryId einschließen', () => {
      expect(matchesCategoryFilter(createMockEvent({ categoryId: undefined }), 'no-category')).toBe(
        true
      );
    });

    it('sollte Events mit categoryId "default" (CSV-Import) einschließen', () => {
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'default' }), 'no-category')).toBe(
        true
      );
    });

    it('sollte Events mit gültiger categoryId ausschließen', () => {
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'cat-1' }), 'no-category')).toBe(
        false
      );
    });
  });

  describe('Filter für konkrete Kategorie', () => {
    it('sollte nur Events mit exakter categoryId-Übereinstimmung durchlassen', () => {
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'cat-1' }), 'cat-1')).toBe(true);
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'cat-2' }), 'cat-1')).toBe(false);
      expect(matchesCategoryFilter(createMockEvent({ categoryId: undefined }), 'cat-1')).toBe(
        false
      );
      expect(matchesCategoryFilter(createMockEvent({ categoryId: 'default' }), 'cat-1')).toBe(
        false
      );
    });
  });
});
