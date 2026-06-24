---
name: Ponytail Phase 5 — Button & Layout-Wrapper
overview: 'Merged AnimatedButton in LoadingButton und zentralisiert PageTransition im Route-Layout. Entfernt redundante Wrapper auf ~40 Seiten. Voraussetzung: Phase 4. Verifikation: npm run test && npm run build && npm run start:dev.'
todos:
  - id: merge-loading-button
    content: 'LoadingButton: Tap/Hover-Scale von AnimatedButton übernehmen (ohne isLoading)'
    status: pending
  - id: migrate-animated-button-imports
    content: 'Alle AnimatedButton-Imports auf LoadingButton umstellen (~40 Seiten/Komponenten)'
    status: pending
  - id: delete-animated-button
    content: 'src/components/AnimatedButton.tsx löschen'
    status: pending
  - id: centralize-page-transition
    content: 'PageTransition einmal in App.tsx/routes.tsx um Route-Outlet legen'
    status: pending
  - id: remove-page-transition-per-page
    content: 'Doppelte <PageTransition> aus allen Einzelseiten entfernen'
    status: pending
  - id: verify-phase5
    content: 'npm run test && npm run build && npm run start:dev; Buttons + Navigation prüfen'
    status: pending
isProject: false
---

# Plan: Ponytail Phase 5 — Button- & Layout-Wrapper konsolidieren

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase4_unwrap_data.plan.md](./ponytail_phase4_unwrap_data.plan.md)  
**Nachfolger:** [ponytail_phase6_icons.plan.md](./ponytail_phase6_icons.plan.md)

## Ziel

Zwei redundante Button-Wrapper zu einem zusammenführen; `PageTransition`-Boilerplate von jeder Seite ins Layout verlagern.

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

Manuell: Button mit Loading-Spinner; Seitenwechsel ohne Layout-Sprung.

---

## 1. `AnimatedButton` → `LoadingButton`

### Ausgangslage

| Komponente | Datei | Verhalten |
| ---------- | ----- | --------- |
| `AnimatedButton` | [`src/components/AnimatedButton.tsx`](../../src/components/AnimatedButton.tsx) | `whileTap` scale 0.95, `whileHover` 1.02 |
| `LoadingButton` | [`src/components/LoadingButton.tsx`](../../src/components/LoadingButton.tsx) | Gleiches + `isLoading`, Spinner, `AnimatePresence` |

Viele Seiten importieren **beide**.

### Umsetzung

1. In [`LoadingButton.tsx`](../../src/components/LoadingButton.tsx): Verhalten von `AnimatedButton` ist bereits Superset — prüfen ob `isLoading={false}` identisches Tap/Hover liefert.
2. Grep `AnimatedButton` → Import ersetzen:

```ts
// vorher
import { AnimatedButton } from '@/components/AnimatedButton';
// nachher
import { LoadingButton } from '@/components/LoadingButton';
```

3. JSX: `<AnimatedButton` → `<LoadingButton` (Props kompatibel halten).
4. [`AnimatedButton.tsx`](../../src/components/AnimatedButton.tsx) löschen.
5. Tests anpassen, die `AnimatedButton` mocken.

**Hauptbetroffene Bereiche:** `src/pages/**`, `src/components/events/**`, `src/components/businesses/BusinessCard.tsx`

---

## 2. `PageTransition` zentralisieren

### Ausgangslage

[`src/components/PageTransition.tsx`](../../src/components/PageTransition.tsx) wrappt ~45 Seiten einzeln mit `motion.div` + `fadeInUp`.

### Umsetzung

**Option A (empfohlen):** In [`src/App.tsx`](../../src/App.tsx) oder [`src/routes.tsx`](../../src/routes.tsx):

```tsx
<Route element={<PageTransition><Outlet /></PageTransition>} …>
```

**Option B:** Layout-Komponente `AdminLayout` mit `PageTransition` + `{children}`.

**Schritte:**

1. Zentrale Wrapper-Stelle einführen.
2. Pro Seite alle `<PageTransition>…</PageTransition>` entfernen (nur äußerer Wrapper).
3. Seiten mit **mehreren** `PageTransition`-Blöcken (Loading/Error/Main) auf ein gemeinsames Root-Element reduzieren — ggf. nur äußersten behalten bis Phase 7.

### `AnimatePresence`

- [`src/pages/chatrooms/ChatMessages.tsx`](../../src/pages/chatrooms/ChatMessages.tsx) und [`CsvEventImport.tsx`](../../src/pages/events/CsvEventImport.tsx) behalten lokales `AnimatePresence` für Listen-Exit — **nicht** ins Layout verschieben.

---

## 3. Nicht anfassen (Phase 7)

- `motion.div` + `staggerContainer` auf Listen-Seiten — bleibt bis framer-motion-Migration.
- [`src/components/AnimatedCard.tsx`](../../src/components/AnimatedCard.tsx) — Phase 7.

---

## Erfolgskriterien

- `grep -r "AnimatedButton" src/` → 0 Treffer
- `PageTransition` nur noch 1–2 Import-Stellen (Layout + Definition)
- Loading-Buttons: Spinner + disabled während Request
- Alle Tests grün
