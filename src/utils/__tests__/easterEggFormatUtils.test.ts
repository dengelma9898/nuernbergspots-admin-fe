import { format } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { formatEasterEggDate } from '@/utils/easterEggFormatUtils';

vi.mock('date-fns', () => ({
  format: vi.fn(() => '20. April 2024'),
}));

vi.mock('date-fns/locale', () => ({ de: {} }));

describe('formatEasterEggDate', () => {
  it('formats valid dates', () => {
    expect(formatEasterEggDate('2024-04-20T00:00:00.000Z')).toBe('20. April 2024');
  });

  it('returns fallback for invalid dates', () => {
    format.mockImplementationOnce(() => {
      throw new Error('Invalid');
    });
    expect(formatEasterEggDate('invalid')).toBe('Ungültiges Datum');
  });
});
