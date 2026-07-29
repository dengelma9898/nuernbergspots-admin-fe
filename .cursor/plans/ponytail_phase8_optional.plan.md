---
name: Ponytail Phase 8 — Optional (Presets & Services)
overview: 'Optionale Architektur-Vereinfachungen nach Phasen 1–7: glassmorphism.ts umbenennen, useXService inkrementell refactoren, UI-Passthrough-Tests nur nach Coverage-Review. Voraussetzung: Phase 7. Verifikation: npm run test && npm run build && npm run start:dev (+ test:coverage bei 8c).'
todos:
  - id: rename-glass-presets
    content: '8a: glassmorphism.ts → card-presets.ts (oder @layer components); Imports aktualisieren'
    status: completed
  - id: analytics-service-utils
    content: '8b-start: useAnalyticsService → reine Utils-Funktionen (kein API)'
    status: cancelled
  - id: service-factory-pattern
    content: '8b-inkrementell: pro Service createXService(api) statt useMemo-Hook (ein Service pro Commit)'
    status: cancelled
  - id: coverage-review
    content: '8c: npm run test:coverage — Baseline dokumentieren'
    status: cancelled
  - id: trim-ui-passthrough-tests
    content: '8c: Nur Tests löschen die Radix/Tailwind duplizieren; Coverage ≥80% halten'
    status: cancelled
  - id: verify-phase8
    content: 'npm run test && npm run build && npm run start:dev'
    status: completed
isProject: false
---

# Plan: Ponytail Phase 8 — Styling-Presets & Service-Hooks (optional)

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase7_motion_css.plan.md](./ponytail_phase7_motion_css.plan.md)  
**Nachfolger:** — (Abschluss Ponytail-Audit)

## Hinweis

Diese Phase ist **optional** und bewusst inkrementell. Jeder Sub-Plan (8a, 8b, 8c) kann einzeln umgesetzt oder übersprungen werden.

## Verifikation (Pflicht pro Sub-Plan)

```bash
npm run test
npm run build
npm run start:dev
```

Bei **8c** zusätzlich:

```bash
npm run test:coverage
```

---

## 8a — `glassmorphism.ts` bereinigen

### Problem

[`src/lib/glassmorphism.ts`](../../src/lib/glassmorphism.ts) exportiert `glassCard`, `glassInput`, … — kein Glassmorphism mehr (laut Datei-Kommentar), nur `cn()`-Presets.

### Umsetzung

1. Umbenennen → `src/lib/card-presets.ts` (oder `layout-presets.ts`)
2. Exports umbenennen optional: `glassCard` → `cardPreset` (Breaking für ~60 Dateien — **nur** wenn gewünscht; sonst nur Dateiname + Kommentar)
3. Grep `glassmorphism` → Imports aktualisieren

### Erfolg

Klarere Semantik, keine Verwechslung mit `.cursorrules` Glassmorphism-Hintergrund.

---

## 8b — `useXService()` vereinfachen

### Problem

25 Services folgen dem Muster:

```ts
export function useBusinessService() {
  const api = useApi();
  return useMemo(() => ({ getBusinesses: async () => { … } }), [api]);
}
```

`useMemo`-Objekt pro Render-Context — mehr Boilerplate als nötig.

### Empfohlene Migration (ein Service pro Commit)

**Schritt 1 — `analyticsService` (kein HTTP):**

[`src/services/analyticsService.ts`](../../src/services/analyticsService.ts) → `src/utils/analyticsUtils.ts` mit reinen Funktionen; Hook `useAnalyticsService` durch direkten Import in [`Analytics.tsx`](../../src/pages/Analytics.tsx) ersetzen.

**Schritt 2 — Factory-Pattern für API-Services:**

```ts
// eventService.ts
export function createEventService(api: ApiClient) {
  return {
    getEvents: async () => api.getData<Event[]>(endpoints.events),
    …
  };
}

export function useEventService() {
  const api = useApi();
  return useMemo(() => createEventService(api), [api]);
}
```

Vorteil: Services testbar ohne React; Hook bleibt dünn.

**Reihenfolge:** Kleinste Services zuerst (`downtimeService`, `accountManagementService`), `eventService`/`businessService` zuletzt.

### Nicht tun

- Alle 25 Services in einem PR — zu hohes Risiko

---

## 8c — UI-Passthrough-Tests reduzieren

### Problem

~13k Zeilen in [`src/components/ui/__tests__/`](../../src/components/ui/__tests__/) testen shadcn/Radix-Wrapper (`button`, `card`, `input`, …) ohne App-Logik.

### Konflikt

[`.cursorrules`](../../.cursorrules): **80 % Coverage** mandatory.

### Vorgehen

1. `npm run test:coverage` — Baseline speichern
2. Kandidaten zum Entfernen (niedrigster Wert):
   - `button.test.tsx`, `card.test.tsx`, `input.test.tsx`, `label.test.tsx`, `badge.test.tsx`
3. Nach jedem Löschblock: Coverage erneut prüfen
4. **Nur löschen**, wenn Gesamt-Coverage ≥ 80 % bleibt

### Alternative

Tests behalten, aber nicht erweitern — Phase 8c als `skipped` markieren.

---

## Sub-Plan Status

| ID  | Titel              | Pflicht?                    |
| --- | ------------------ | --------------------------- |
| 8a  | Presets umbenennen | Optional                    |
| 8b  | Service-Factories  | Optional, inkrementell      |
| 8c  | UI-Tests trimmen   | Optional, Coverage-abhängig |

---

## Erfolgskriterien (Gesamt)

- Keine Regression in `npm run validate`
- Architektur dokumentiert in [`docs/OVERVIEW.md`](../../docs/OVERVIEW.md) falls Service-Pattern geändert
- Master-Plan [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md) auf `done` setzen
