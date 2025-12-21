/**
 * Konvertiert technische Fehler in benutzerfreundliche Meldungen
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  isPersistent: boolean;
  actionHint?: string;
}

/**
 * Erkennt den Fehlertyp und gibt eine benutzerfreundliche Fehlermeldung zurück
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // CORS-Fehler
  if (
    errorString.includes('cors') ||
    errorString.includes('access-control-allow-origin') ||
    errorString.includes('blocked by cors policy')
  ) {
    return {
      title: 'Verbindungsproblem',
      message:
        'Die Verbindung zum Server konnte nicht hergestellt werden. Bitte kontaktieren Sie den Administrator, da möglicherweise eine Serverkonfiguration erforderlich ist.',
      isPersistent: true,
      actionHint: 'Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.',
    };
  }

  // Datei zu groß (413)
  if (
    errorString.includes('413') ||
    errorString.includes('content too large') ||
    errorString.includes('request entity too large') ||
    errorString.includes('payload too large')
  ) {
    return {
      title: 'Bild zu groß',
      message:
        'Das ausgewählte Bild ist zu groß. Bitte wählen Sie ein kleineres Bild aus oder komprimieren Sie es vor dem Hochladen.',
      isPersistent: true,
      actionHint: 'Versuchen Sie ein Bild mit weniger als 5 MB oder verwenden Sie ein Bildbearbeitungsprogramm, um die Größe zu reduzieren.',
    };
  }

  // Netzwerkfehler
  if (
    errorString.includes('failed to fetch') ||
    errorString.includes('network error') ||
    errorString.includes('networkerror') ||
    errorString.includes('err_network')
  ) {
    return {
      title: 'Netzwerkfehler',
      message:
        'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfen Sie Ihre Internetverbindung.',
      isPersistent: true,
      actionHint: 'Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
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
        'Die Anfrage hat zu lange gedauert. Das Bild könnte zu groß sein oder die Verbindung ist langsam.',
      isPersistent: true,
      actionHint: 'Versuchen Sie ein kleineres Bild hochzuladen oder versuchen Sie es später erneut.',
    };
  }

  // Authentifizierungsfehler
  if (
    errorString.includes('401') ||
    errorString.includes('unauthorized') ||
    errorString.includes('authentication')
  ) {
    return {
      title: 'Anmeldung erforderlich',
      message: 'Sie sind nicht angemeldet oder Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      isPersistent: true,
      actionHint: 'Bitte melden Sie sich erneut an.',
    };
  }

  // Berechtigungsfehler
  if (
    errorString.includes('403') ||
    errorString.includes('forbidden') ||
    errorString.includes('permission')
  ) {
    return {
      title: 'Keine Berechtigung',
      message: 'Sie haben keine Berechtigung für diese Aktion. Bitte kontaktieren Sie einen Administrator.',
      isPersistent: true,
      actionHint: 'Kontaktieren Sie einen Administrator, wenn Sie glauben, dass dies ein Fehler ist.',
    };
  }

  // Serverfehler (500)
  if (
    errorString.includes('500') ||
    errorString.includes('internal server error') ||
    errorString.includes('server error')
  ) {
    return {
      title: 'Serverfehler',
      message:
        'Auf dem Server ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.',
      isPersistent: true,
      actionHint: 'Bitte versuchen Sie es in einigen Minuten erneut.',
    };
  }

  // Nicht gefunden (404)
  if (
    errorString.includes('404') ||
    errorString.includes('not found') ||
    errorString.includes('nicht gefunden')
  ) {
    return {
      title: 'Nicht gefunden',
      message: 'Die angeforderte Ressource wurde nicht gefunden. Möglicherweise wurde sie gelöscht oder existiert nicht.',
      isPersistent: false,
      actionHint: 'Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.',
    };
  }

  // Bildformat-Fehler
  if (
    errorString.includes('image') &&
    (errorString.includes('format') ||
      errorString.includes('type') ||
      errorString.includes('invalid'))
  ) {
    return {
      title: 'Ungültiges Bildformat',
      message:
        'Das ausgewählte Bildformat wird nicht unterstützt. Bitte verwenden Sie JPG, PNG oder WebP.',
      isPersistent: true,
      actionHint: 'Konvertieren Sie das Bild in ein unterstütztes Format (JPG, PNG oder WebP).',
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
      'Beim Verarbeiten Ihrer Anfrage ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    isPersistent: true,
    actionHint: 'Wenn das Problem weiterhin besteht, kontaktieren Sie bitte den Support.',
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
