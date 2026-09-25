import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  clearConsoleLogs,
  copyErrorReportToClipboard,
  copyToClipboard,
  formatErrorReport,
  getCurrentRoute,
  getHttpStatusDescription,
  getRecentConsoleLogs,
  initErrorTracking,
  restoreErrorTracking,
} from '../errorTracker';

describe('errorTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearConsoleLogs();
  });

  afterEach(() => {
    restoreErrorTracking();
  });

  describe('getHttpStatusDescription', () => {
    it('sollte bekannte Status-Codes mit lesbarer Beschreibung formatieren', () => {
      expect(getHttpStatusDescription(400)).toBe('400 (Bad Request)');
      expect(getHttpStatusDescription(401)).toBe('401 (Unauthorized)');
      expect(getHttpStatusDescription(403)).toBe('403 (Forbidden)');
      expect(getHttpStatusDescription(404)).toBe('404 (Not Found)');
      expect(getHttpStatusDescription(409)).toBe('409 (Conflict)');
      expect(getHttpStatusDescription(413)).toBe('413 (Payload Too Large)');
      expect(getHttpStatusDescription(500)).toBe('500 (Internal Server Error)');
      expect(getHttpStatusDescription(503)).toBe('503 (Service Unavailable)');
    });

    it('sollte unbekannte Status-Codes als reine Zahl formatieren', () => {
      expect(getHttpStatusDescription(418)).toBe('418');
      expect(getHttpStatusDescription(599)).toBe('599');
    });
  });

  describe('getCurrentRoute', () => {
    it('sollte die aktuelle Route aus dem window-Objekt auslesen', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          pathname: '/events/123/edit',
          search: '?tab=details',
          hash: '#section-1',
          href: 'http://localhost/events/123/edit?tab=details#section-1',
        },
      });

      expect(getCurrentRoute()).toBe('/events/123/edit?tab=details#section-1');

      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });
  });

  describe('formatErrorReport', () => {
    it('sollte vollständigen Fehlerbericht mit allen Feldern erzeugen', () => {
      const error = new Error('Netzwerk-Timeout');
      (error as any).status = 504;
      (error as any).response = { data: { error: 'Gateway timeout from upstream' } };

      const report = formatErrorReport({
        error,
        title: 'Fehler beim Laden',
        message: 'Der Server antwortet nicht.',
        context: 'load-event',
        route: '/events',
        url: 'http://localhost:5173/events',
        statusCode: 504,
        consoleLogs: [
          {
            timestamp: new Date('2026-09-25T10:00:00Z'),
            args: ['[API Error] Request failed'],
          },
        ],
      });

      expect(report).toContain('🚨 Admin-FE Fehlerbericht');
      expect(report).toContain('📍 Route: /events');
      expect(report).toContain('🌐 HTTP-Status: 504 (Gateway Timeout)');
      expect(report).toContain('⚠️ Titel: Fehler beim Laden');
      expect(report).toContain('💬 Nachricht: Der Server antwortet nicht.');
      expect(report).toContain('🎯 Kontext: load-event');
      expect(report).toContain('─── Technischer Fehler ───');
      expect(report).toContain('Name: Error');
      expect(report).toContain('Message: Netzwerk-Timeout');
      expect(report).toContain('Gateway timeout from upstream');
      expect(report).toContain('─── Konsole (zeitlich passend) ───');
      expect(report).toContain('[API Error] Request failed');
      expect(report).toContain('─── Umgebung ───');
      expect(report).toContain('URL: http://localhost:5173/events');
    });

    it('sollte Fallback für fehlenden HTTP-Status und einfachen Fehler nutzen', () => {
      const report = formatErrorReport({
        title: 'Formular unvollständig',
        message: 'Bitte fülle alle Pflichtfelder aus.',
      });

      expect(report).toContain('🌐 HTTP-Status: Kein HTTP-Fehler / Client-seitig');
      expect(report).toContain('⚠️ Titel: Formular unvollständig');
      expect(report).toContain('💬 Nachricht: Bitte fülle alle Pflichtfelder aus.');
    });

    it('sollte Status-Code direkt aus dem Error-Objekt ableiten wenn nicht explizit angegeben', () => {
      const error = { status: 403 };
      const report = formatErrorReport({ error });

      expect(report).toContain('🌐 HTTP-Status: 403 (Forbidden)');
    });
  });

  describe('Console-Error Tracking', () => {
    it('sollte console.error abfangen und in den Puffer schreiben', () => {
      const originalConsoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      initErrorTracking();

      console.error('Test error message', { foo: 'bar' });

      const logs = getRecentConsoleLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].args[0]).toBe('Test error message');
      expect(logs[0].args[1]).toContain('"foo": "bar"');

      originalConsoleErrorSpy.mockRestore();
    });

    it('sollte maximal 20 Einträge im FIFO-Puffer speichern', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      initErrorTracking();

      for (let i = 1; i <= 25; i++) {
        console.error(`Log entry ${i}`);
      }

      const logs = getRecentConsoleLogs(30);
      expect(logs).toHaveLength(20);
      expect(logs[0].args[0]).toBe('Log entry 6');
      expect(logs[19].args[0]).toBe('Log entry 25');
    });
  });

  describe('copyToClipboard', () => {
    it('sollte navigator.clipboard.writeText verwenden wenn verfügbar', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const success = await copyToClipboard('Test text');

      expect(writeTextMock).toHaveBeenCalledWith('Test text');
      expect(success).toBe(true);
    });

    it('sollte Fallback document.execCommand verwenden wenn clipboard.writeText fehlschlägt', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      });

      document.execCommand = vi.fn().mockReturnValue(true);

      const success = await copyToClipboard('Fallback text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(success).toBe(true);
    });
  });

  describe('copyErrorReportToClipboard', () => {
    it('sollte Erfolgs-Toast anzeigen wenn Kopieren erfolgreich ist', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });

      const mockToast = {
        success: vi.fn(),
        error: vi.fn(),
      };

      const result = await copyErrorReportToClipboard(
        {
          title: 'Fehler',
          message: 'Etwas ist schiefgelaufen',
        },
        mockToast
      );

      expect(result).toBe(true);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Fehlerbericht in Zwischenablage kopiert',
        expect.objectContaining({
          description: expect.stringContaining('WhatsApp'),
        })
      );
    });

    it('sollte Fehler-Toast anzeigen wenn Kopieren fehlschlägt', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Copy failed')),
        },
      });
      document.execCommand = vi.fn().mockReturnValue(false);

      const mockToast = {
        success: vi.fn(),
        error: vi.fn(),
      };

      const result = await copyErrorReportToClipboard({}, mockToast);

      expect(result).toBe(false);
      expect(mockToast.error).toHaveBeenCalledWith('Kopieren fehlgeschlagen', expect.any(Object));
    });
  });
});
