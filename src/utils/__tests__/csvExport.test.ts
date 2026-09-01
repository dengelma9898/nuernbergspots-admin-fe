import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { MockInstance } from 'vitest';

import { downloadCsv, rowsToCsv } from '@/utils/csvExport';

describe('csvExport', () => {
  describe('rowsToCsv', () => {
    it('serializes headers and rows', () => {
      const csv = rowsToCsv([
        { name: 'Alice', count: 2 },
        { name: 'Bob', count: 3 },
      ]);
      expect(csv).toBe('name,count\nAlice,2\nBob,3');
    });

    it('escapes values with commas and quotes', () => {
      const csv = rowsToCsv([{ title: 'Hello, "World"' }]);
      expect(csv).toBe('title\n"Hello, ""World"""');
    });

    it('returns empty string for empty rows', () => {
      expect(rowsToCsv([])).toBe('');
    });
  });

  describe('downloadCsv', () => {
    let clickSpy: MockInstance;

    beforeEach(() => {
      clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      URL.createObjectURL = vi.fn(() => 'blob:mock');
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      clickSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('creates download link with UTF-8 BOM', () => {
      downloadCsv('export', [{ id: '1', name: 'Test' }]);
      expect(URL.createObjectURL).toHaveBeenCalled();
      const blob = (URL.createObjectURL as Mock).mock.calls[0][0] as Blob;
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('does nothing for empty rows', () => {
      downloadCsv('export', []);
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });
});
