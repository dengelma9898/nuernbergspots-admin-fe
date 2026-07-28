---
name: Ponytail Phase 3 — API-Client & Fehler-Utils
overview: 'Refaktoriert api-client.ts auf eine zentrale request()-Methode und dedupliziert errorUtils.ts ohne API-Verhalten zu ändern. Optional colorUtils inline. Voraussetzung: Phase 2. Verifikation: npm run test && npm run build && npm run start:dev.'
todos:
  - id: api-client-request-method
    content: 'api-client.ts: private request<T>() einführen; get/post/put/patch/delete delegieren'
    status: completed
  - id: api-client-tests-green
    content: Alle Service-Tests weiterhin grün (keine Signatur-Änderung an Services)
    status: completed
  - id: error-utils-dedupe
    content: 'errorUtils.ts: doppelte 401/403/404-Blöcke entfernen'
    status: completed
  - id: error-utils-tests
    content: src/utils/__tests__/errorUtils.test.ts anpassen falls nötig, alle grün
    status: completed
  - id: optional-color-utils
    content: 'Optional: colorUtils.ts inline an Call-Sites und Datei löschen'
    status: completed
  - id: verify-phase3
    content: npm run test && npm run build && npm run start:dev; Toast bei Fehler manuell prüfen
    status: completed
isProject: false
---

# Plan: Ponytail Phase 3 — API-Client & Fehler-Utils straffen

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase2_unused_deps.plan.md](./ponytail_phase2_unused_deps.plan.md)  
**Nachfolger:** [ponytail_phase4_unwrap_data.plan.md](./ponytail_phase4_unwrap_data.plan.md)

## Ziel

~270 Zeilen Duplikation entfernen, ohne öffentliche Service-APIs oder Fehlermeldungen zu ändern.

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

Zusätzlich manuell: ein API-Fehler (z. B. abgemeldet → 401) zeigt weiterhin deutschen Toast.

---

## 1. [`src/lib/api-client.ts`](../../src/lib/api-client.ts)

### Problem

`get`, `post`, `put`, `patch`, `delete` wiederholen jeweils:

- `getHeaders()` + `fetch`
- `extractErrorMessage` bei `!response.ok`
- `TypeError` / `fetch` Netzwerkfehler-Handling

### Lösung

```ts
private async request<T>(
  method: string,
  endpoint: string,
  options?: { body?: BodyInit; contentType?: string; isFormData?: boolean }
): Promise<T>
```

- Token-Caching in `getHeaders()` **unverändert** lassen (`.cursorrules` API-Regeln).
- `delete` mit 204 → `{} as T` beibehalten.
- Öffentliche Methoden `get/post/put/patch/delete` bleiben als dünne Wrapper (keine Service-Änderung).

### Tests

Alle Tests unter `src/services/__tests__/` müssen ohne Anpassung grün bleiben.

---

## 2. [`src/utils/errorUtils.ts`](../../src/utils/errorUtils.ts)

### Problem

Identische Zweige für 401, 403, 404 erscheinen **zweimal** (ca. Zeilen 391–437 und 521–567).

### Lösung

- Hilfsfunktionen z. B. `authRequiredError()`, `forbiddenError()`, `notFoundError()` **oder** frühes `return` nach erstem Match.
- Reihenfolge der Prioritäten **nicht** ändern (Firebase → Validation → 413 → 5xx → 4xx …).
- `getUserFriendlyError`, `showUserFriendlyError`, `showSuccessMessage` Signaturen unverändert.

### Tests

[`src/utils/__tests__/errorUtils.test.ts`](../../src/utils/__tests__/errorUtils.test.ts) vollständig grün halten.

---

## 3. Optional: [`src/utils/colorUtils.ts`](../../src/utils/colorUtils.ts)

Zwei Einzeiler, Call-Sites:

- [`src/pages/JobCategories.tsx`](../../src/pages/JobCategories.tsx)
- [`src/pages/events/EventCategoryList.tsx`](../../src/pages/events/EventCategoryList.tsx)
- [`src/pages/events/EventList.tsx`](../../src/pages/events/EventList.tsx)
- [`src/components/events/EventInfoCard.tsx`](../../src/components/events/EventInfoCard.tsx)

Wenn inline: Jest-Mocks in betroffenen Tests aktualisieren, Datei löschen.

**Nur umsetzen, wenn in derselben Session — sonst überspringen.**

---

## Erfolgskriterien

- `api-client.ts` deutlich kürzer, ein Netzwerk-`try/catch`
- `errorUtils.ts` ohne duplizierte Status-Blöcke
- Keine Änderung an Service-Hooks oder Page-Logik
- Volle Test-Suite grün
