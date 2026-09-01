import { format } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { formatAdventCalendarDate } from '@/utils/adventCalendarFormatUtils';

vi.mock('date-fns', () => ({
  format: vi.fn(() => '15. Januar 2024'),
}));

vi.mock('date-fns/locale', () => ({ de: {} }));

describe('formatAdventCalendarDate', () => {
  it('formats valid dates', () => {
    expect(formatAdventCalendarDate('2024-01-15T00:00:00.000Z')).toBe('15. Januar 2024');
  });

  it('returns fallback for invalid dates', () => {
    format.mockImplementationOnce(() => {
      throw new Error('Invalid');
    });
    expect(formatAdventCalendarDate('invalid')).toBe('Ungültiges Datum');
  });
});
