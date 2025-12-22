/**
 * Zentrale Fehlerbehandlung - Konvertiert technische Fehler in benutzerfreundliche Meldungen
 * Verwendet freundschaftliches "Du" in allen Meldungen
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  isPersistent: boolean;
  actionHint?: string;
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
 * Erkennt den Fehlertyp und gibt eine benutzerfreundliche Fehlermeldung zurück
 * Verwendet freundschaftliches "Du" in allen Meldungen
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();
  const statusCode = extractStatusCode(error);

  // Validation-Fehler haben höchste Priorität (werden vor Upload geprüft)
  if (error && typeof error === 'object') {
    const err = error as ErrorWithStatus;
    if (err.validationError) {
      return {
        title: err.validationError.title,
        message: err.validationError.message,
        isPersistent: true,
        actionHint: err.validationError.actionHint,
      };
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
    return {
      title: 'Datei ist zu groß',
      message:
        'Die Datei, die du hochladen möchtest, ist zu groß. Bitte wähle eine kleinere Datei aus oder komprimiere sie vorher.',
      isPersistent: true,
      actionHint: 'Versuche eine Datei mit weniger als 5 MB oder verwende ein Bildbearbeitungsprogramm, um die Größe zu reduzieren.',
    };
  }

  // 5XX Server-Fehler (500-599) - Priorität: Hoch, da sehr spezifisch
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return {
      title: 'Server hat Probleme',
      message:
        'Der Server hat gerade technische Probleme. Das liegt nicht an dir - bitte versuche es in ein paar Minuten nochmal.',
      isPersistent: true,
      actionHint: 'Wenn das Problem länger besteht, kontaktiere bitte den Support.',
    };
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
    return {
      title: 'Netzwerkfehler',
      message:
        'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfe deine Internetverbindung.',
      isPersistent: true,
      actionHint: 'Überprüfe deine Internetverbindung und versuche es erneut.',
    };
  }

  // Timeout-Fehler
  if (
    errorString.includes('timeout') ||
    errorString.includes('aborted') ||
    errorString.includes('timed out')
  ) {
    return {
      title: 'Zeitüberschreitung',
      message:
        'Die Anfrage hat zu lange gedauert. Die Datei könnte zu groß sein oder deine Verbindung ist langsam.',
      isPersistent: true,
      actionHint: 'Versuche eine kleinere Datei hochzuladen oder versuche es später erneut.',
    };
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
  return {
    title: 'Ein Fehler ist aufgetreten',
    message:
      'Beim Verarbeiten deiner Anfrage ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
    isPersistent: true,
    actionHint: 'Wenn das Problem weiterhin besteht, kontaktiere bitte den Support.',
  };
}

/**
 * Zeigt eine benutzerfreundliche Fehlermeldung als Toast an
 */
export function showUserFriendlyError(error: unknown, toast: any) {
  const friendlyError = getUserFriendlyError(error);
  
  toast.error(friendlyError.message, {
    title: friendlyError.title,
    duration: friendlyError.isPersistent ? Infinity : 5000,
    description: friendlyError.actionHint,
    action: friendlyError.isPersistent
      ? {
          label: 'Schließen',
          onClick: () => {},
        }
      : undefined,
  });
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
