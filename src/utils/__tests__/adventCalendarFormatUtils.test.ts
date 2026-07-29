import { describe, expect, it, jest } from '@jest/globals';

import { formatAdventCalendarDate } from '@/utils/adventCalendarFormatUtils';

jest.mock('date-fns', () => ({
  format: jest.fn(() => '15. Januar 2024'),
}));

jest.mock('date-fns/locale', () => ({ de: {} }));

describe('formatAdventCalendarDate', () => {
  it('formats valid dates', () => {
    expect(formatAdventCalendarDate('2024-01-15T00:00:00.000Z')).toBe('15. Januar 2024');
  });

  it('returns fallback for invalid dates', () => {
    const { format } = require('date-fns');
    format.mockImplementationOnce(() => {
      throw new Error('Invalid');
    });
    expect(formatAdventCalendarDate('invalid')).toBe('Ungültiges Datum');
  });
});
