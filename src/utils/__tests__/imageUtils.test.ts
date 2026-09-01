import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressImage, formatFileSize, isImageTooLarge } from '@/utils/imageUtils';

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

  describe('compressImage', () => {
    const makeImageFile = (size = 3 * 1024 * 1024, type = 'image/jpeg') => {
      const file = new File(['x'.repeat(size)], 'foto.jpg', { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    beforeEach(() => {
      // FileReader gibt eine Data-URL zurück
      vi.stubGlobal(
        'FileReader',
        class {
          result = 'data:image/jpeg;base64,AAA';
          onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
          onerror: (() => void) | null = null;
          readAsDataURL() {
            this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
          }
        }
      );

      // Image lädt sofort mit eigenen Dimensionen
      vi.stubGlobal(
        'Image',
        class {
          width = 4000;
          height = 3000;
          src = '';
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          constructor() {
            // onload wird nach Setzen von src ausgelöst
          }
        }
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('liefert die Datei unverändert, wenn es kein Bild ist', async () => {
      const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 50 * 1024 * 1024 });
      const result = await compressImage(file);
      expect(result).toBe(file);
    });

    it('liefert die Datei unverändert, wenn sie bereits klein genug ist', async () => {
      const file = makeImageFile(1024);
      const result = await compressImage(file);
      expect(result).toBe(file);
    });

    it('komprimiert große Bilder über das Canvas und behält Name und Typ', async () => {
      const file = makeImageFile(3 * 1024 * 1024);

      // Image-Dimensionen setzen, sobald src gesetzt wird (löst onload aus)
      vi.stubGlobal(
        'Image',
        class {
          width = 4000;
          height = 3000;
          set src(v: string) {
            this.width = 4000;
            this.height = 3000;
            setTimeout(() => this.onload?.(), 0);
          }
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
        }
      );

      const ctx = {
        drawImage: vi.fn(),
        canvas: { width: 0, height: 0 },
        toBlob: vi.fn((cb: (b: Blob | null) => void) =>
          cb(new Blob(['comp'], { type: 'image/jpeg' }))
        ),
      };
      vi.stubGlobal(
        'HTMLCanvasElement',
        class {
          width = 0;
          height = 0;
          toBlob = null;
          getContext() {
            return ctx;
          }
        }
      );
      vi.spyOn(document, 'createElement').mockReturnValue({
        width: 0,
        height: 0,
        toBlob: (cb: (b: Blob | null) => void) => cb(new Blob(['comp'], { type: 'image/jpeg' })),
        getContext: () => ctx,
      } as unknown as HTMLCanvasElement);

      const result = await compressImage(file);
      expect(result.name).toBe('foto.jpg');
      expect(result.type).toBe('image/jpeg');
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('rejected, wenn das Bild nicht geladen werden kann', async () => {
      const file = makeImageFile(3 * 1024 * 1024);

      vi.stubGlobal(
        'Image',
        class {
          width = 0;
          height = 0;
          set src(v: string) {
            setTimeout(() => this.onerror?.(), 0);
          }
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
        }
      );

      await expect(compressImage(file)).rejects.toThrow('Bild konnte nicht geladen werden');
    });
  });
});
