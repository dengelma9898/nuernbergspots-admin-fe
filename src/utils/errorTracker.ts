import { toast as sonnerToast } from 'sonner';

import { extractStatusCode } from './errorUtils';

export interface ConsoleLogEntry {
  timestamp: Date;
  args: string[];
}

export interface ErrorReportParams {
  error?: unknown;
  title?: string;
  message?: string;
  context?: string;
  route?: string;
  url?: string;
  statusCode?: number | null;
  consoleLogs?: ConsoleLogEntry[];
}

const MAX_CONSOLE_LOGS = 20;
let originalConsoleError: typeof console.error | null = null;
let originalToastError: typeof sonnerToast.error | null = null;
const consoleLogsBuffer: ConsoleLogEntry[] = [];

/**
 * Wandelt ein Argument in einen lesbaren String um
 */
function stringifyConsoleArg(arg: unknown): string {
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
  }
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

/**
 * Gibt einen formatierten Text für bekannte HTTP-Statuscodes zurück
 */
export function getHttpStatusDescription(statusCode: number): string {
  const statusMap: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    409: 'Conflict',
    413: 'Payload Too Large',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  const name = statusMap[statusCode];
  return name ? `${statusCode} (${name})` : String(statusCode);
}

/**
 * Formatiert ein Datum im Format DD.MM.YYYY, HH:mm:ss
 */
function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
}

/**
 * Formatiert eine Uhrzeit im Format HH:mm:ss
 */
function formatTimeOnly(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Ermittelt die aktuelle SPA-Route
 */
export function getCurrentRoute(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  const pathname = window.location.pathname || '/';
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  return `${pathname}${search}${hash}`;
}

/**
 * Liefert die zeitlich passenden Console-Errors aus dem Puffer
 */
export function getRecentConsoleLogs(limit = 10): ConsoleLogEntry[] {
  return consoleLogsBuffer.slice(-limit);
}

/**
 * Leert den Console-Log-Puffer (hauptsächlich für Tests)
 */
export function clearConsoleLogs(): void {
  consoleLogsBuffer.length = 0;
}

/**
 * Erstellt einen strukturierten, für Messenger (wie WhatsApp) optimierten Fehlerbericht
 */
export function formatErrorReport(params: ErrorReportParams = {}): string {
  const now = new Date();
  const route = params.route || getCurrentRoute();
  const currentUrl =
    params.url || (typeof window !== 'undefined' ? window.location.href : 'Unbekannt');

  const resolvedStatusCode =
    params.statusCode !== undefined ? params.statusCode : extractStatusCode(params.error);

  const statusText =
    resolvedStatusCode !== null && resolvedStatusCode !== undefined
      ? getHttpStatusDescription(resolvedStatusCode)
      : 'Kein HTTP-Fehler / Client-seitig';

  const lines: string[] = [
    '🚨 Admin-FE Fehlerbericht',
    '━━━━━━━━━━━━━━━━━━━━',
    `📅 Zeit: ${formatDateTime(now)}`,
    `📍 Route: ${route}`,
    `🌐 HTTP-Status: ${statusText}`,
  ];

  if (params.title) {
    lines.push(`⚠️ Titel: ${params.title}`);
  }
  if (params.message) {
    lines.push(`💬 Nachricht: ${params.message}`);
  }
  if (params.context) {
    lines.push(`🎯 Kontext: ${params.context}`);
  }

  // Details zum technischen Fehler
  const err = params.error;
  if (err) {
    lines.push('');
    lines.push('─── Technischer Fehler ───');
    if (err instanceof Error) {
      lines.push(`Name: ${err.name}`);
      lines.push(`Message: ${err.message}`);

      const errWithResponse = err as { response?: { data?: unknown } };
      if (errWithResponse.response?.data) {
        try {
          lines.push(`API-Response: ${JSON.stringify(errWithResponse.response.data, null, 2)}`);
        } catch {
          lines.push(`API-Response: ${String(errWithResponse.response.data)}`);
        }
      }

      if (err.stack) {
        lines.push('Stack:');
        lines.push(err.stack);
      }
    } else if (typeof err === 'object' && err !== null) {
      try {
        lines.push(JSON.stringify(err, null, 2));
      } catch {
        lines.push(String(err));
      }
    } else {
      lines.push(String(err));
    }
  }

  // Zeitlich passende Konsole-Logs
  const logs = params.consoleLogs || getRecentConsoleLogs();
  if (logs.length > 0) {
    lines.push('');
    lines.push('─── Konsole (zeitlich passend) ───');
    logs.forEach(log => {
      lines.push(`[${formatTimeOnly(log.timestamp)}] ${log.args.join(' ')}`);
    });
  }

  // System- / Umgebungsinformationen
  lines.push('');
  lines.push('─── Umgebung ───');
  lines.push(`URL: ${currentUrl}`);
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
    lines.push(`Modus: ${import.meta.env.MODE}`);
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    lines.push(`User-Agent: ${navigator.userAgent}`);
  }

  return lines.join('\n');
}

/**
 * Kopiert Text in die Zwischenablage mit Fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback versuchen
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Kopiert den formatierten Fehlerbericht in die Zwischenablage und zeigt Erfolgs-/Fehlertoast an
 */
export async function copyErrorReportToClipboard(
  params: ErrorReportParams = {},
  toastInstance: {
    success: (msg: string, opts?: unknown) => void;
    error: (msg: string, opts?: unknown) => void;
  } = sonnerToast
): Promise<boolean> {
  const report = formatErrorReport(params);
  const success = await copyToClipboard(report);

  if (success) {
    toastInstance.success('Fehlerbericht in Zwischenablage kopiert', {
      description: 'Du kannst die Informationen jetzt z. B. per WhatsApp senden.',
      duration: 4000,
    });
    return true;
  } else {
    toastInstance.error('Kopieren fehlgeschlagen', {
      description: 'Die Zwischenablage konnte nicht beschrieben werden.',
      duration: 5000,
    });
    return false;
  }
}

/**
 * Startet das Tracking von console.error und hängt den Quick-Copy Button an Fehler-Toasts
 */
export function initErrorTracking(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 1. console.error abfangen
  if (!originalConsoleError && typeof console !== 'undefined') {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      try {
        consoleLogsBuffer.push({
          timestamp: new Date(),
          args: args.map(stringifyConsoleArg),
        });

        if (consoleLogsBuffer.length > MAX_CONSOLE_LOGS) {
          consoleLogsBuffer.shift();
        }
      } catch {
        // Fehler im Logger ignorieren
      }

      originalConsoleError?.apply(console, args);
    };
  }

  // 2. Globaler Hook für direkte sonnerToast.error Aufrufe
  if (!originalToastError && sonnerToast && typeof sonnerToast.error === 'function') {
    originalToastError = sonnerToast.error.bind(sonnerToast);

    sonnerToast.error = ((message: unknown, data?: Record<string, unknown>) => {
      // Falls noch kein cancel-Button definiert ist, Quick-Copy Button einhängen
      if (!data?.cancel) {
        const enrichedData = {
          ...data,
          cancel: {
            label: 'Fehler kopieren',
            onClick: () => {
              void copyErrorReportToClipboard(
                {
                  title: typeof message === 'string' ? message : 'Fehler',
                  message: typeof data?.description === 'string' ? data.description : undefined,
                },
                sonnerToast
              );
            },
          },
        };
        return originalToastError!(message as any, enrichedData as any);
      }
      return originalToastError!(message as any, data as any);
    }) as typeof sonnerToast.error;
  }
}

/**
 * Setzt console.error und toast.error auf Originale zurück (vor allem für Tests)
 */
export function restoreErrorTracking(): void {
  if (originalConsoleError) {
    console.error = originalConsoleError;
    originalConsoleError = null;
  }

  if (originalToastError && sonnerToast) {
    sonnerToast.error = originalToastError;
    originalToastError = null;
  }

  clearConsoleLogs();
}
