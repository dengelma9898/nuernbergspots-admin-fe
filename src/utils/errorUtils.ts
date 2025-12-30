/**
 * Zentrale Fehlerbehandlung - Konvertiert technische Fehler in benutzerfreundliche Meldungen
 * Verwendet freundschaftliches "Du" in allen Meldungen
 */

export type ErrorContext =
  | 'load-business'
  | 'save-business'
  | 'delete-business'
  | 'load-event'
  | 'save-event'
  | 'delete-event'
  | 'load-chatroom'
  | 'send-message'
  | 'upload-image'
  | 'load-categories'
  | 'save-category'
  | 'delete-category'
  | 'load-job-offer'
  | 'save-job-offer'
  | 'delete-job-offer'
  | 'load-advent-calendar'
  | 'save-advent-calendar'
  | 'delete-advent-calendar'
  | 'load-news'
  | 'save-news'
  | 'delete-news'
  | 'load-users'
  | 'block-user'
  | 'unblock-user'
  | 'load-contact-requests'
  | 'respond-contact-request'
  | 'load-keywords'
  | 'save-keyword'
  | 'delete-keyword'
  | 'load-legal-document'
  | 'save-legal-document'
  | 'generic';

export interface UserFriendlyError {
  title: string;
  message: string;
  isPersistent: boolean;
  actionHint?: string;
  isRetryable?: boolean;
}

interface ErrorWithStatus extends Error {
  status?: number;
  isNetworkError?: boolean;
  validationError?: {
    title: string;
    message: string;
    actionHint?: string;
  };
}

/**
 * Extrahiert den HTTP-Status-Code aus einem Error-Objekt
 */
function extractStatusCode(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const err = error as ErrorWithStatus;
    
    // 1. Prüfe direktes status-Property
    if (typeof err.status === 'number') {
      return err.status;
    }
    
    // 2. Prüfe response.status falls vorhanden
    if ((err as any).response?.status && typeof (err as any).response.status === 'number') {
      return (err as any).response.status;
    }
    
    // 3. Versuche Status-Code aus Fehlermeldung zu extrahieren
    const message = err.message || String(error);
    
    // Suche nach "status: 413" oder "413" oder "HTTP error! status: 413"
    const statusMatch = message.match(/(?:status|code)[:\s]*(\d{3})/i) || 
                        message.match(/\b(\d{3})\b/);
    if (statusMatch) {
      const code = parseInt(statusMatch[1], 10);
      // Validiere dass es ein gültiger HTTP-Status-Code ist
      if (code >= 100 && code < 600) {
        return code;
      }
    }
  }
  return null;
}

/**
 * Wendet den Kontext auf eine Fehlermeldung an
 */
function applyContext(error: UserFriendlyError, context?: ErrorContext): UserFriendlyError {
  if (!context || context === 'generic') {
    return error;
  }

  const contextMessages: Record<ErrorContext, string> = {
    'load-business': 'Fehler beim Laden des Geschäfts',
    'save-business': 'Fehler beim Speichern des Geschäfts',
    'delete-business': 'Fehler beim Löschen des Geschäfts',
    'load-event': 'Fehler beim Laden des Events',
    'save-event': 'Fehler beim Speichern des Events',
    'delete-event': 'Fehler beim Löschen des Events',
    'load-chatroom': 'Fehler beim Laden des Chatrooms',
    'send-message': 'Fehler beim Senden der Nachricht',
    'upload-image': 'Fehler beim Hochladen des Bildes',
    'load-categories': 'Fehler beim Laden der Kategorien',
    'save-category': 'Fehler beim Speichern der Kategorie',
    'delete-category': 'Fehler beim Löschen der Kategorie',
    'load-job-offer': 'Fehler beim Laden des Stellenangebots',
    'save-job-offer': 'Fehler beim Speichern des Stellenangebots',
    'delete-job-offer': 'Fehler beim Löschen des Stellenangebots',
    'load-advent-calendar': 'Fehler beim Laden des Adventskalenders',
    'save-advent-calendar': 'Fehler beim Speichern des Adventskalenders',
    'delete-advent-calendar': 'Fehler beim Löschen des Adventskalenders',
    'load-news': 'Fehler beim Laden der News',
    'save-news': 'Fehler beim Speichern der News',
    'delete-news': 'Fehler beim Löschen der News',
    'load-users': 'Fehler beim Laden der Benutzer',
    'block-user': 'Fehler beim Blockieren des Benutzers',
    'unblock-user': 'Fehler beim Entsperren des Benutzers',
    'load-contact-requests': 'Fehler beim Laden der Kontaktanfragen',
    'respond-contact-request': 'Fehler beim Beantworten der Kontaktanfrage',
    'load-keywords': 'Fehler beim Laden der Keywords',
    'save-keyword': 'Fehler beim Speichern des Keywords',
    'delete-keyword': 'Fehler beim Löschen des Keywords',
    'load-legal-document': 'Fehler beim Laden des Dokuments',
    'save-legal-document': 'Fehler beim Speichern des Dokuments',
    'generic': '',
  };

  return {
    ...error,
    title: `${contextMessages[context]}: ${error.title}`,
  };
}

/**
 * Erkennt den Fehlertyp und gibt eine benutzerfreundliche Fehlermeldung zurück
 * Verwendet freundschaftliches "Du" in allen Meldungen
 * @param error - Der Fehler, der konvertiert werden soll
 * @param context - Optional: Der Kontext der Aktion (z.B. 'save-business', 'load-event')
 */
export function getUserFriendlyError(error: unknown, context?: ErrorContext): UserFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();
  const statusCode = extractStatusCode(error);

  // Validation-Fehler haben höchste Priorität (werden vor Upload geprüft)
  if (error && typeof error === 'object') {
    const err = error as ErrorWithStatus;
    if (err.validationError) {
      return applyContext({
        title: err.validationError.title,
        message: err.validationError.message,
        isPersistent: true,
        actionHint: err.validationError.actionHint,
      }, context);
    }
  }

  // WICHTIG: Status-Codes ZUERST prüfen, bevor generische Netzwerkfehler behandelt werden
  // Datei zu groß (413) - Höchste Priorität für Upload-Fehler
  if (
    statusCode === 413 ||
    errorString.includes('413') ||
    errorString.includes('content too large') ||
    errorString.includes('request entity too large') ||
    errorString.includes('payload too large') ||
    errorString.includes('zu groß') ||
    errorString.includes('maximale größe')
  ) {
    return applyContext({
      title: 'Datei ist zu groß',
      message:
        'Die Datei, die du hochladen möchtest, ist zu groß. Bitte wähle eine kleinere Datei aus oder komprimiere sie vorher.',
      isPersistent: true,
      actionHint: 'Versuche eine Datei mit weniger als 5 MB oder verwende ein Bildbearbeitungsprogramm, um die Größe zu reduzieren.',
    }, context);
  }

  // 5XX Server-Fehler (500-599) - Priorität: Hoch, da sehr spezifisch
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return applyContext({
      title: 'Server hat Probleme',
      message:
        'Der Server hat gerade technische Probleme. Das liegt nicht an dir - bitte versuche es in ein paar Minuten nochmal.',
      isPersistent: true,
      actionHint: 'Wenn das Problem länger besteht, kontaktiere bitte den Support.',
      isRetryable: true,
    }, context);
  }

  // Authentifizierungsfehler (401) - Vor anderen 4XX Fehlern
  if (
    statusCode === 401 ||
    errorString.includes('401') ||
    errorString.includes('unauthorized') ||
    errorString.includes('authentication')
  ) {
    return {
      title: 'Anmeldung erforderlich',
      message: 'Du bist nicht angemeldet oder deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
      isPersistent: true,
      actionHint: 'Bitte melde dich erneut an.',
    };
  }

  // Berechtigungsfehler (403)
  if (
    statusCode === 403 ||
    errorString.includes('403') ||
    errorString.includes('forbidden') ||
    errorString.includes('permission')
  ) {
    return {
      title: 'Keine Berechtigung',
      message: 'Du hast keine Berechtigung für diese Aktion. Bitte kontaktiere einen Administrator.',
      isPersistent: true,
      actionHint: 'Kontaktiere einen Administrator, wenn du glaubst, dass dies ein Fehler ist.',
    };
  }

  // Nicht gefunden (404)
  if (
    statusCode === 404 ||
    errorString.includes('404') ||
    errorString.includes('not found') ||
    errorString.includes('nicht gefunden')
  ) {
    return {
      title: 'Nicht gefunden',
      message: 'Die angeforderte Ressource wurde nicht gefunden. Möglicherweise wurde sie gelöscht oder existiert nicht mehr.',
      isPersistent: false,
      actionHint: 'Bitte aktualisiere die Seite und versuche es erneut.',
    };
  }

  // 4XX Client-Fehler (400-499) - Generische Behandlung für andere 4XX Fehler
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return {
      title: 'Fehler bei der Anfrage',
      message: `Deine Anfrage konnte nicht verarbeitet werden (Fehlercode: ${statusCode}). Bitte überprüfe deine Eingaben und versuche es erneut.`,
      isPersistent: true,
      actionHint: 'Wenn das Problem weiterhin besteht, kontaktiere bitte den Support.',
    };
  }

  // CORS-Fehler - Nur wenn KEIN Status-Code vorhanden ist
  if (
    !statusCode &&
    (errorString.includes('cors') ||
      errorString.includes('access-control-allow-origin') ||
      errorString.includes('blocked by cors policy'))
  ) {
    return {
      title: 'Verbindungsproblem',
      message:
        'Die Verbindung zum Server konnte nicht hergestellt werden. Das liegt wahrscheinlich an einer Serverkonfiguration.',
      isPersistent: true,
      actionHint: 'Bitte versuche es später erneut oder kontaktiere den Support, wenn das Problem weiterhin besteht.',
    };
  }

  // Netzwerkfehler - Nur wenn KEIN Status-Code vorhanden ist (echter Netzwerkfehler)
  if (
    !statusCode &&
    ((error as ErrorWithStatus)?.isNetworkError ||
      errorString.includes('failed to fetch') ||
      errorString.includes('network error') ||
      errorString.includes('networkerror') ||
      errorString.includes('err_network'))
  ) {
    return applyContext({
      title: 'Netzwerkfehler',
      message:
        'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfe deine Internetverbindung.',
      isPersistent: true,
      actionHint: 'Überprüfe deine Internetverbindung und versuche es erneut.',
      isRetryable: true,
    }, context);
  }

  // Timeout-Fehler
  if (
    errorString.includes('timeout') ||
    errorString.includes('aborted') ||
    errorString.includes('timed out')
  ) {
    return applyContext({
      title: 'Zeitüberschreitung',
      message:
        'Die Anfrage hat zu lange gedauert. Die Datei könnte zu groß sein oder deine Verbindung ist langsam.',
      isPersistent: true,
      actionHint: 'Versuche eine kleinere Datei hochzuladen oder versuche es später erneut.',
      isRetryable: true,
    }, context);
  }

  // Authentifizierungsfehler (401)
  if (
    statusCode === 401 ||
    errorString.includes('401') ||
    errorString.includes('unauthorized') ||
    errorString.includes('authentication')
  ) {
    return {
      title: 'Anmeldung erforderlich',
      message: 'Du bist nicht angemeldet oder deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
      isPersistent: true,
      actionHint: 'Bitte melde dich erneut an.',
    };
  }

  // Berechtigungsfehler (403)
  if (
    statusCode === 403 ||
    errorString.includes('403') ||
    errorString.includes('forbidden') ||
    errorString.includes('permission')
  ) {
    return {
      title: 'Keine Berechtigung',
      message: 'Du hast keine Berechtigung für diese Aktion. Bitte kontaktiere einen Administrator.',
      isPersistent: true,
      actionHint: 'Kontaktiere einen Administrator, wenn du glaubst, dass dies ein Fehler ist.',
    };
  }

  // Nicht gefunden (404)
  if (
    statusCode === 404 ||
    errorString.includes('404') ||
    errorString.includes('not found') ||
    errorString.includes('nicht gefunden')
  ) {
    return {
      title: 'Nicht gefunden',
      message: 'Die angeforderte Ressource wurde nicht gefunden. Möglicherweise wurde sie gelöscht oder existiert nicht mehr.',
      isPersistent: false,
      actionHint: 'Bitte aktualisiere die Seite und versuche es erneut.',
    };
  }

  // Bildformat-Fehler
  if (
    errorString.includes('image') &&
    (errorString.includes('format') ||
      errorString.includes('type') ||
      errorString.includes('invalid') ||
      errorString.includes('nicht unterstützt'))
  ) {
    return {
      title: 'Ungültiges Bildformat',
      message:
        'Das Bildformat, das du ausgewählt hast, wird nicht unterstützt. Bitte verwende JPG, PNG oder WebP.',
      isPersistent: true,
      actionHint: 'Konvertiere das Bild in ein unterstütztes Format (JPG, PNG oder WebP).',
    };
  }

  // Spezifische Fehlermeldungen für Dateigröße (auch wenn kein 413 Status-Code)
  if (
    errorString.includes('bild ist zu groß') ||
    errorString.includes('datei ist zu groß') ||
    errorString.includes('maximale größe') ||
    errorString.includes('zu groß')
  ) {
    return {
      title: 'Datei ist zu groß',
      message:
        'Die Datei, die du hochladen möchtest, ist zu groß. Bitte wähle eine kleinere Datei aus oder komprimiere sie vorher.',
      isPersistent: true,
      actionHint: 'Versuche eine Datei mit weniger als 5 MB oder verwende ein Bildbearbeitungsprogramm, um die Größe zu reduzieren.',
    };
  }

  // Generischer Fehler mit benutzerfreundlicher Nachricht, falls vorhanden
  if (errorMessage && !errorMessage.includes('http error') && !errorMessage.includes('status:')) {
    // Prüfe ob die Nachricht bereits benutzerfreundlich ist
    if (
      errorMessage.length < 100 &&
      !errorMessage.includes('error!') &&
      !errorMessage.includes('failed') &&
      !errorMessage.includes('undefined')
    ) {
      return {
        title: 'Fehler',
        message: errorMessage,
        isPersistent: true,
      };
    }
  }

  // Standard-Fehler
  const baseError: UserFriendlyError = {
    title: 'Ein Fehler ist aufgetreten',
    message:
      'Beim Verarbeiten deiner Anfrage ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
    isPersistent: true,
    actionHint: 'Wenn das Problem weiterhin besteht, kontaktiere bitte den Support.',
  };

  return applyContext(baseError, context);
}

/**
 * Zeigt eine benutzerfreundliche Fehlermeldung als Toast an
 * @param error - Der Fehler, der angezeigt werden soll
 * @param toast - Die Toast-Funktion von sonner
 * @param retryAction - Optional: Funktion, die beim Retry aufgerufen wird
 * @param context - Optional: Der Kontext der Aktion (z.B. 'save-business', 'load-event')
 */
export function showUserFriendlyError(
  error: unknown,
  toast: any,
  retryAction?: () => void,
  context?: ErrorContext
) {
  const friendlyError = getUserFriendlyError(error, context);
  
  // Wenn Retry möglich ist und eine Retry-Aktion übergeben wurde
  if (friendlyError.isRetryable && retryAction) {
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      duration: 10000, // Länger sichtbar für Retry-Option
      action: {
        label: 'Erneut versuchen',
        onClick: retryAction,
      },
    });
  } else {
    // Standard-Verhalten
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      duration: friendlyError.isPersistent ? Infinity : 5000,
      action: friendlyError.actionHint
        ? {
            label: 'Verstanden',
            onClick: () => {},
          }
        : undefined,
    });
  }
}

/**
 * Erstellt eine benutzerfreundliche Fehlermeldung für einen spezifischen Kontext
 * Kann für spezifischere Fehlermeldungen verwendet werden
 */
export function createContextualError(
  context: string,
  error: unknown
): UserFriendlyError {
  const baseError = getUserFriendlyError(error);
  
  // Kontext-spezifische Anpassungen
  if (context === 'image-upload') {
    const statusCode = extractStatusCode(error);
    if (statusCode === 413) {
      return {
        title: 'Bild ist zu groß',
        message:
          'Das Bild, das du hochladen möchtest, ist zu groß. Bitte wähle ein kleineres Bild aus oder komprimiere es vorher.',
        isPersistent: true,
        actionHint: 'Versuche ein Bild mit weniger als 5 MB oder verwende ein Bildbearbeitungsprogramm, um die Größe zu reduzieren.',
      };
    }
  }
  
  return baseError;
}
