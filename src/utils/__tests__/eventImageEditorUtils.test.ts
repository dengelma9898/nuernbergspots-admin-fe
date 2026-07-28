import { Event } from '@/models/events';
import {
  getEventImageSlotDate,
  groupEventsByDate,
  validateEventsForImageEditor,
} from '@/utils/eventImageEditorUtils';

const baseEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: 'Test Event',
  description: 'Desc',
  location: { address: 'Nürnberg', latitude: 0, longitude: 0 },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  dailyTimeSlots: [],
  ...overrides,
});

describe('eventImageEditorUtils', () => {
  describe('getEventImageSlotDate', () => {
    it('returns null when dailyTimeSlots are missing', () => {
      expect(getEventImageSlotDate(baseEvent({ dailyTimeSlots: [] }))).toBeNull();
    });

    it('returns null for invalid date strings', () => {
      expect(
        getEventImageSlotDate(
          baseEvent({ dailyTimeSlots: [{ date: 'not-a-date', from: '18:00' }] })
        )
      ).toBeNull();
    });

    it('returns a Date for valid ISO dates', () => {
      const result = getEventImageSlotDate(
        baseEvent({ dailyTimeSlots: [{ date: '2026-07-15', from: '18:00' }] })
      );
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2026);
    });
  });

  describe('validateEventsForImageEditor', () => {
    it('separates usable and skipped events', () => {
      const valid = baseEvent({
        id: 'valid',
        dailyTimeSlots: [{ date: '2026-07-15' }],
      });
      const monthOnly = baseEvent({
        id: 'month',
        monthYear: '07.2026',
        dailyTimeSlots: [],
      });

      const result = validateEventsForImageEditor([valid, monthOnly]);

      expect(result.usableEvents).toHaveLength(1);
      expect(result.usableEvents[0].id).toBe('valid');
      expect(result.skippedEvents).toHaveLength(1);
      expect(result.skippedEvents[0].event.id).toBe('month');
      expect(result.skippedEvents[0].reason).toBe('no_daily_slots');
    });
  });

  describe('groupEventsByDate', () => {
    it('does not throw for events without daily slots', () => {
      expect(() =>
        groupEventsByDate([
          baseEvent({ id: 'a', monthYear: '07.2026' }),
          baseEvent({ id: 'b', dailyTimeSlots: [{ date: '2026-07-20' }] }),
        ])
      ).not.toThrow();
    });

    it('groups only events with valid daily dates', () => {
      const grouped = groupEventsByDate([
        baseEvent({ id: 'skip', monthYear: '07.2026' }),
        baseEvent({ id: 'a', dailyTimeSlots: [{ date: '2026-07-20' }] }),
        baseEvent({ id: 'b', dailyTimeSlots: [{ date: '2026-07-20', from: '19:00' }] }),
      ]);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].events).toHaveLength(2);
    });
  });
});
