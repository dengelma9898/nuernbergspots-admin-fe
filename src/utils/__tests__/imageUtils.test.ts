import { describe, expect, it } from '@jest/globals';

import { formatFileSize, isImageTooLarge } from '@/utils/imageUtils';

describe('imageUtils', () => {
  describe('isImageTooLarge', () => {
    it('returns true when file exceeds limit', () => {
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });
      expect(isImageTooLarge(file, 5)).toBe(true);
    });

    it('returns false when file is within limit', () => {
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 });
      expect(isImageTooLarge(file, 5)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('formats zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });
});
