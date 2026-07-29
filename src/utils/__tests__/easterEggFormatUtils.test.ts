import { describe, expect, it, jest } from '@jest/globals';

import { formatEasterEggDate } from '@/utils/easterEggFormatUtils';

jest.mock('date-fns', () => ({
  format: jest.fn(() => '20. April 2024'),
}));

jest.mock('date-fns/locale', () => ({ de: {} }));

describe('formatEasterEggDate', () => {
  it('formats valid dates', () => {
    expect(formatEasterEggDate('2024-04-20T00:00:00.000Z')).toBe('20. April 2024');
  });

  it('returns fallback for invalid dates', () => {
    const { format } = require('date-fns');
    format.mockImplementationOnce(() => {
      throw new Error('Invalid');
    });
    expect(formatEasterEggDate('invalid')).toBe('Ungültiges Datum');
  });
});
