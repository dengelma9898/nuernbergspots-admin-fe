/**
 * Tests für errorUtils.ts
 * Testet die zentrale Fehlerbehandlung und Erfolgsmeldungen
 */

import {
  getUserFriendlyError,
  showUserFriendlyError,
  showSuccessMessage,
  UserFriendlyError,
  ErrorContext,
} from '../errorUtils';

// Mock sonner toast
const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
};

describe('errorUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getUserFriendlyError', () => {
    describe('Validation-Fehler', () => {
      it('sollte Validation-Fehler korrekt behandeln', () => {
        const validationError = {
          validationError: {
            title: 'Validierungsfehler',
            message: 'Bitte fülle alle Pflichtfelder aus',
            actionHint: 'Überprüfe deine Eingaben',
          },
        };

        const result = getUserFriendlyError(validationError);

        expect(result.title).toBe('Validierungsfehler');
        expect(result.message).toBe('Bitte fülle alle Pflichtfelder aus');
        expect(result.actionHint).toBe('Überprüfe deine Eingaben');
        expect(result.isPersistent).toBe(true);
      });

      it('sollte Validation-Fehler mit Kontext kombinieren', () => {
        const validationError = {
          validationError: {
            title: 'Validierungsfehler',
            message: 'Bitte fülle alle Pflichtfelder aus',
          },
        };

        const result = getUserFriendlyError(validationError, 'save-business');

        expect(result.title).toBe('Fehler beim Speichern des Geschäfts: Validierungsfehler');
        expect(result.message).toBe('Bitte fülle alle Pflichtfelder aus');
      });
    });

    describe('HTTP Status-Codes', () => {
      it('sollte 413 (Datei zu groß) korrekt behandeln', () => {
        const error = { status: 413 };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Datei ist zu groß');
        expect(result.message).toContain('zu groß');
        expect(result.isPersistent).toBe(true);
        expect(result.actionHint).toBeDefined();
      });

      it('sollte 413 mit Kontext kombinieren', () => {
        const error = { status: 413 };
        const result = getUserFriendlyError(error, 'upload-image');

        expect(result.title).toBe('Fehler beim Hochladen des Bildes: Datei ist zu groß');
      });

      it('sollte 5XX Server-Fehler korrekt behandeln', () => {
        const error = { status: 500 };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Server hat Probleme');
        expect(result.message).toContain('technische Probleme');
        expect(result.isRetryable).toBe(true);
        expect(result.isPersistent).toBe(true);
      });

      it('sollte 401 (Unauthorized) korrekt behandeln', () => {
        const error = { status: 401 };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Anmeldung erforderlich');
        expect(result.message).toContain('nicht angemeldet');
        expect(result.isPersistent).toBe(true);
      });

      it('sollte 403 (Forbidden) korrekt behandeln', () => {
        const error = { status: 403 };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Keine Berechtigung');
        expect(result.message).toContain('keine Berechtigung');
        expect(result.isPersistent).toBe(true);
      });

      it('sollte 404 (Not Found) korrekt behandeln', () => {
        const error = { status: 404 };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Nicht gefunden');
        expect(result.message).toContain('nicht gefunden');
        expect(result.isPersistent).toBe(false);
      });

      it('sollte andere 4XX Fehler korrekt behandeln', () => {
        const error = { status: 400 };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Fehler bei der Anfrage');
        expect(result.message).toContain('Fehlercode: 400');
        expect(result.isPersistent).toBe(true);
      });
    });

    describe('Status-Code aus response extrahieren', () => {
      it('sollte Status-Code aus response.status extrahieren', () => {
        const error = { response: { status: 500 } };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Server hat Probleme');
      });

      it('sollte Status-Code aus Fehlermeldung extrahieren', () => {
        const error = new Error('HTTP error! status: 413');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Datei ist zu groß');
      });
    });

    describe('Netzwerkfehler', () => {
      it('sollte Netzwerkfehler ohne Status-Code korrekt behandeln', () => {
        const error = { isNetworkError: true };
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Netzwerkfehler');
        expect(result.message).toContain('keine Verbindung');
        expect(result.isRetryable).toBe(true);
        expect(result.isPersistent).toBe(true);
      });

      it('sollte "Failed to fetch" als Netzwerkfehler erkennen', () => {
        const error = new Error('Failed to fetch');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Netzwerkfehler');
        expect(result.isRetryable).toBe(true);
      });

      it('sollte Netzwerkfehler mit Kontext kombinieren', () => {
        const error = { isNetworkError: true };
        const result = getUserFriendlyError(error, 'load-business');

        expect(result.title).toBe('Fehler beim Laden des Geschäfts: Netzwerkfehler');
      });
    });

    describe('Timeout-Fehler', () => {
      it('sollte Timeout-Fehler korrekt behandeln', () => {
        const error = new Error('Request timeout');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Zeitüberschreitung');
        expect(result.message).toContain('zu lange gedauert');
        expect(result.isRetryable).toBe(true);
        expect(result.isPersistent).toBe(true);
      });

      it('sollte Timeout-Fehler mit Kontext kombinieren', () => {
        const error = new Error('Request timeout');
        const result = getUserFriendlyError(error, 'upload-image');

        expect(result.title).toBe('Fehler beim Hochladen des Bildes: Zeitüberschreitung');
      });
    });

    describe('CORS-Fehler', () => {
      it('sollte CORS-Fehler korrekt behandeln', () => {
        const error = new Error('CORS policy blocked');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Verbindungsproblem');
        expect(result.message).toContain('Serverkonfiguration');
        expect(result.isPersistent).toBe(true);
      });
    });

    describe('Bildformat-Fehler', () => {
      it('sollte Bildformat-Fehler korrekt behandeln', () => {
        const error = new Error('Invalid image format');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Ungültiges Bildformat');
        expect(result.message).toContain('JPG, PNG oder WebP');
        expect(result.isPersistent).toBe(true);
      });
    });

    describe('Dateigröße-Fehler', () => {
      it('sollte "zu groß" Fehler in Nachricht erkennen', () => {
        const error = new Error('Das Bild ist zu groß');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Datei ist zu groß');
        expect(result.isPersistent).toBe(true);
      });
    });

    describe('Generische Fehler', () => {
      it('sollte benutzerfreundliche Nachrichten als Titel verwenden', () => {
        const error = new Error('Bitte fülle alle Felder aus');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Fehler');
        expect(result.message).toBe('Bitte fülle alle Felder aus');
      });

      it('sollte Standard-Fehler für unbekannte Fehler zurückgeben', () => {
        const error = new Error('Some technical error message with undefined and failed');
        const result = getUserFriendlyError(error);

        expect(result.title).toBe('Ein Fehler ist aufgetreten');
        expect(result.message).toContain('unerwarteter Fehler');
        expect(result.isPersistent).toBe(true);
      });

      it('sollte Standard-Fehler mit Kontext kombinieren', () => {
        // Verwende einen Fehler, der definitiv als Standard-Fehler behandelt wird
        const error = new Error('Some technical error message with undefined and failed');
        const result = getUserFriendlyError(error, 'save-event');

        expect(result.title).toBe('Fehler beim Speichern des Events: Ein Fehler ist aufgetreten');
      });
    });

    describe('Kontext-Anwendung', () => {
      it('sollte alle Kontexte korrekt anwenden', () => {
        const contexts: Array<{ context: ErrorContext; expectedPrefix: string }> = [
          { context: 'load-business', expectedPrefix: 'Fehler beim Laden des Geschäfts' },
          { context: 'save-business', expectedPrefix: 'Fehler beim Speichern des Geschäfts' },
          { context: 'delete-business', expectedPrefix: 'Fehler beim Löschen des Geschäfts' },
          { context: 'load-event', expectedPrefix: 'Fehler beim Laden des Events' },
          { context: 'save-event', expectedPrefix: 'Fehler beim Speichern des Events' },
          { context: 'delete-event', expectedPrefix: 'Fehler beim Löschen des Events' },
          { context: 'load-chatroom', expectedPrefix: 'Fehler beim Laden des Chatrooms' },
          { context: 'send-message', expectedPrefix: 'Fehler beim Senden der Nachricht' },
          { context: 'upload-image', expectedPrefix: 'Fehler beim Hochladen des Bildes' },
          { context: 'load-categories', expectedPrefix: 'Fehler beim Laden der Kategorien' },
          { context: 'save-category', expectedPrefix: 'Fehler beim Speichern der Kategorie' },
          { context: 'delete-category', expectedPrefix: 'Fehler beim Löschen der Kategorie' },
          { context: 'load-job-offer', expectedPrefix: 'Fehler beim Laden des Stellenangebots' },
          { context: 'save-job-offer', expectedPrefix: 'Fehler beim Speichern des Stellenangebots' },
          { context: 'delete-job-offer', expectedPrefix: 'Fehler beim Löschen des Stellenangebots' },
          { context: 'load-advent-calendar', expectedPrefix: 'Fehler beim Laden des Adventskalenders' },
          { context: 'save-advent-calendar', expectedPrefix: 'Fehler beim Speichern des Adventskalenders' },
          { context: 'delete-advent-calendar', expectedPrefix: 'Fehler beim Löschen des Adventskalenders' },
          { context: 'load-news', expectedPrefix: 'Fehler beim Laden der News' },
          { context: 'save-news', expectedPrefix: 'Fehler beim Speichern der News' },
          { context: 'delete-news', expectedPrefix: 'Fehler beim Löschen der News' },
          { context: 'load-users', expectedPrefix: 'Fehler beim Laden der Benutzer' },
          { context: 'block-user', expectedPrefix: 'Fehler beim Blockieren des Benutzers' },
          { context: 'unblock-user', expectedPrefix: 'Fehler beim Entsperren des Benutzers' },
          { context: 'load-contact-requests', expectedPrefix: 'Fehler beim Laden der Kontaktanfragen' },
          { context: 'respond-contact-request', expectedPrefix: 'Fehler beim Beantworten der Kontaktanfrage' },
          { context: 'load-keywords', expectedPrefix: 'Fehler beim Laden der Keywords' },
          { context: 'save-keyword', expectedPrefix: 'Fehler beim Speichern des Keywords' },
          { context: 'delete-keyword', expectedPrefix: 'Fehler beim Löschen des Keywords' },
          { context: 'load-legal-document', expectedPrefix: 'Fehler beim Laden des Dokuments' },
          { context: 'save-legal-document', expectedPrefix: 'Fehler beim Speichern des Dokuments' },
          { context: 'load-analytics', expectedPrefix: 'Fehler beim Laden der Analytics' },
          { context: 'login', expectedPrefix: 'Fehler beim Anmelden' },
        ];

        const error = { status: 500 };

        contexts.forEach(({ context, expectedPrefix }) => {
          const result = getUserFriendlyError(error, context);
          expect(result.title).toContain(expectedPrefix);
        });
      });

      it('sollte generic Kontext ignorieren', () => {
        const error = { status: 500 };
        const resultWithContext = getUserFriendlyError(error, 'generic');
        const resultWithoutContext = getUserFriendlyError(error);

        expect(resultWithContext.title).toBe(resultWithoutContext.title);
      });

      it('sollte undefined Kontext ignorieren', () => {
        const error = { status: 500 };
        const resultWithContext = getUserFriendlyError(error, undefined);
        const resultWithoutContext = getUserFriendlyError(error);

        expect(resultWithContext.title).toBe(resultWithoutContext.title);
      });
    });

    describe('String-Fehler', () => {
      it('sollte String-Fehler korrekt behandeln', () => {
        // Verwende einen String, der als benutzerfreundlich erkannt wird
        const result = getUserFriendlyError('Some error string');

        // "Some error string" wird als benutzerfreundliche Nachricht erkannt (< 100 Zeichen, keine technischen Begriffe)
        expect(result.title).toBe('Fehler');
        expect(result.message).toBe('Some error string');
        expect(result.isPersistent).toBe(true);
      });

      it('sollte technische String-Fehler als Standard-Fehler behandeln', () => {
        const result = getUserFriendlyError('Some technical error message with undefined and failed');

        expect(result.title).toBe('Ein Fehler ist aufgetreten');
        expect(result.isPersistent).toBe(true);
      });
    });

    describe('Unbekannte Fehlertypen', () => {
      it('sollte null korrekt behandeln', () => {
        const result = getUserFriendlyError(null);

        // null wird zu String "null" konvertiert, was als benutzerfreundlich erkannt wird
        expect(result.title).toBe('Fehler');
        expect(result.message).toBe('null');
        expect(result.isPersistent).toBe(true);
      });

      it('sollte undefined korrekt behandeln', () => {
        const result = getUserFriendlyError(undefined);

        // undefined wird zu String "undefined" konvertiert, was technisch ist
        expect(result.title).toBe('Ein Fehler ist aufgetreten');
        expect(result.isPersistent).toBe(true);
      });
    });
  });

  describe('showUserFriendlyError', () => {
    it('sollte Toast mit Fehlermeldung anzeigen', () => {
      const error = { status: 500 };
      showUserFriendlyError(error, mockToast);

      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith('Server hat Probleme', {
        description: expect.stringContaining('technische Probleme'),
        duration: Infinity,
        action: {
          label: 'Verstanden',
          onClick: expect.any(Function),
        },
      });
    });

    it('sollte Retry-Button anzeigen wenn Retry möglich und retryAction übergeben', () => {
      const error = { status: 500 };
      const retryAction = jest.fn();

      showUserFriendlyError(error, mockToast, retryAction);

      expect(mockToast.error).toHaveBeenCalledWith('Server hat Probleme', {
        description: expect.stringContaining('technische Probleme'),
        duration: 10000,
        action: {
          label: 'Erneut versuchen',
          onClick: retryAction,
        },
      });
    });

    it('sollte keinen Retry-Button anzeigen wenn Retry nicht möglich', () => {
      const error = { status: 400 };
      const retryAction = jest.fn();

      showUserFriendlyError(error, mockToast, retryAction);

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Verstanden',
          }),
        })
      );
    });

    it('sollte keinen Retry-Button anzeigen wenn keine retryAction übergeben', () => {
      const error = { status: 500 };

      showUserFriendlyError(error, mockToast);

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Verstanden',
          }),
        })
      );
    });

    it('sollte Kontext-Parameter verwenden', () => {
      const error = { status: 500 };
      showUserFriendlyError(error, mockToast, undefined, 'save-business');

      expect(mockToast.error).toHaveBeenCalledWith(
        'Fehler beim Speichern des Geschäfts: Server hat Probleme',
        expect.any(Object)
      );
    });

    it('sollte duration auf Infinity setzen für persistente Fehler', () => {
      const error = { status: 401 };
      showUserFriendlyError(error, mockToast);

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });

    it('sollte duration auf 5000 setzen für nicht-persistente Fehler', () => {
      const error = { status: 404 };
      showUserFriendlyError(error, mockToast);

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it('sollte keine Action anzeigen wenn kein actionHint vorhanden', () => {
      const error = new Error('Some simple error');
      const result = getUserFriendlyError(error);
      // Simuliere Fehler ohne actionHint
      const errorWithoutHint = { ...result, actionHint: undefined };
      jest.spyOn(require('../errorUtils'), 'getUserFriendlyError').mockReturnValue(errorWithoutHint);

      showUserFriendlyError(error, mockToast);

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: undefined,
        })
      );
    });
  });

  describe('showSuccessMessage', () => {
    it('sollte einfache Erfolgsmeldung anzeigen', () => {
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich gespeichert',
      });

      expect(mockToast.success).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith('Erfolgreich gespeichert', {
        description: undefined,
        action: undefined,
        duration: 5000,
      });
    });

    it('sollte Erfolgsmeldung mit Beschreibung anzeigen', () => {
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich gespeichert',
        description: 'Das Geschäft wurde erfolgreich gespeichert',
      });

      expect(mockToast.success).toHaveBeenCalledWith('Erfolgreich gespeichert', {
        description: 'Das Geschäft wurde erfolgreich gespeichert',
        action: undefined,
        duration: 5000,
      });
    });

    it('sollte Erfolgsmeldung mit Undo-Aktion anzeigen', () => {
      const undoAction = jest.fn();
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich gelöscht',
        undoAction,
      });

      expect(mockToast.success).toHaveBeenCalledWith('Erfolgreich gelöscht', {
        description: undefined,
        action: {
          label: 'Rückgängig',
          onClick: undoAction,
        },
        duration: 10000,
      });
    });

    it('sollte nächste Schritte als separaten Toast anzeigen', () => {
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich erstellt',
        nextSteps: ['Schritt 1', 'Schritt 2'],
      });

      expect(mockToast.success).toHaveBeenCalledTimes(1);

      // Simuliere setTimeout
      jest.advanceTimersByTime(1000);

      expect(mockToast.info).toHaveBeenCalledTimes(1);
      expect(mockToast.info).toHaveBeenCalledWith('Nächste Schritte', {
        description: 'Schritt 1\nSchritt 2',
        duration: 8000,
      });
    });

    it('sollte nächste Schritte nicht anzeigen wenn leer', () => {
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich erstellt',
        nextSteps: [],
      });

      jest.advanceTimersByTime(1000);

      expect(mockToast.info).not.toHaveBeenCalled();
    });

    it('sollte nächste Schritte nicht anzeigen wenn nicht übergeben', () => {
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich erstellt',
      });

      jest.advanceTimersByTime(1000);

      expect(mockToast.info).not.toHaveBeenCalled();
    });

    it('sollte alle Optionen kombinieren', () => {
      const undoAction = jest.fn();
      showSuccessMessage(mockToast, {
        title: 'Erfolgreich erstellt',
        description: 'Das Event wurde erfolgreich erstellt',
        undoAction,
        nextSteps: ['Schritt 1'],
      });

      expect(mockToast.success).toHaveBeenCalledWith('Erfolgreich erstellt', {
        description: 'Das Event wurde erfolgreich erstellt',
        action: {
          label: 'Rückgängig',
          onClick: undoAction,
        },
        duration: 10000,
      });

      jest.advanceTimersByTime(1000);

      expect(mockToast.info).toHaveBeenCalledWith('Nächste Schritte', {
        description: 'Schritt 1',
        duration: 8000,
      });
    });
  });
});

