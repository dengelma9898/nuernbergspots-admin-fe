import type { Mock } from 'vitest';

/**
 * Hilfsfunktionen für Sonner-Toasts in Vitest-Tests.
 * Produktionscode nutzt {@link showSuccessMessage} / {@link showUserFriendlyError}
 * aus `@/utils/errorUtils` → `toast.success`/`toast.error` erhalten i. d. R.
 * `(title, { description, ... })`, nicht nur einen einzelnen String.
 *
 * Siehe auch: CONSTITUTION.md, src/utils/errorUtils.ts
 */

/** Erfolgstoast mit festem Titel und beliebiger (String-)Beschreibung. */
export function expectToastSuccessTitle(toastFn: Mock, title: string): void {
  expect(toastFn).toHaveBeenCalledWith(
    title,
    expect.objectContaining({ description: expect.any(String) })
  );
}

/** Fehlertoast: erster Parameter ist der zusammengesetzte Titel (enthält Kontext-Präfix). */
export function expectToastErrorTitleContains(toastFn: Mock, titleSubstring: string): void {
  expect(toastFn).toHaveBeenCalledWith(
    expect.stringContaining(titleSubstring),
    expect.objectContaining({ description: expect.any(String) })
  );
}
