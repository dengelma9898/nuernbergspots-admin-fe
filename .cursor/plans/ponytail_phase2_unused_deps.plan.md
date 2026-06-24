---
name: Ponytail Phase 2 — Ungenutzte Dependencies
overview: 'Entfernt date-fns-tz und die Legacy-PostCSS7-Tailwind-Pipeline. Vite nutzt bereits @tailwindcss/vite. Voraussetzung: Phase 1 abgeschlossen. Verifikation: npm run test && npm run build && npm run start:dev.'
todos:
  - id: uninstall-date-fns-tz
    content: 'npm uninstall date-fns-tz — kein Import in src/'
    status: pending
  - id: postcss-config-cleanup
    content: 'postcss.config.cjs: @tailwindcss/postcss7-compat entfernen oder Datei löschen wenn obsolet'
    status: pending
  - id: uninstall-postcss7-compat
    content: 'npm uninstall @tailwindcss/postcss7-compat'
    status: pending
  - id: visual-smoke-check
    content: 'Login + eine Listen-Seite visuell prüfen (Tailwind/Glass-Layout intakt)'
    status: pending
  - id: verify-phase2
    content: 'npm run test && npm run build && npm run start:dev'
    status: pending
isProject: false
---

# Plan: Ponytail Phase 2 — Ungenutzte Dependencies

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase1_dead_code.plan.md](./ponytail_phase1_dead_code.plan.md)  
**Nachfolger:** [ponytail_phase3_api_errors.plan.md](./ponytail_phase3_api_errors.plan.md)

## Ziel

Zwei Packages entfernen, die im Quellcode nicht (mehr) gebraucht werden.

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

---

## 1. `date-fns-tz`

**Befund:** In `package.json`, aber kein `import` aus `date-fns-tz` in `src/`. Datumslogik nutzt [`date-fns`](../../package.json) direkt.

```bash
npm uninstall date-fns-tz
```

Keine Code-Änderung nötig.

---

## 2. `@tailwindcss/postcss7-compat`

**Befund:**

- [`vite.config.ts`](../../vite.config.ts) nutzt `@tailwindcss/vite` Plugin.
- [`postcss.config.cjs`](../../postcss.config.cjs) referenziert noch Legacy-Compat:

```js
'@tailwindcss/postcss7-compat': {},
```

**Vorgehen**

1. In [`postcss.config.cjs`](../../postcss.config.cjs) `@tailwindcss/postcss7-compat` entfernen.
2. `npm run build` — wenn erfolgreich und Styles korrekt:
   - `npm uninstall @tailwindcss/postcss7-compat`
3. Falls PostCSS-Datei danach nur noch redundante Plugins enthält: prüfen, ob `postcss.config.cjs` ganz gelöscht werden kann (Vite + `@tailwindcss/vite` reicht für Tailwind v4).

**Behalten (falls noch genutzt):** `postcss-nesting`, `autoprefixer` — nur streichen, wenn Build ohne sie läuft.

---

## 3. Referenz-Styling prüfen

Nach Build visuell auf zwei Seiten:

- [`src/pages/Login.tsx`](../../src/pages/Login.tsx) — Rainbow-Background, Cards, Borders
- Eine Listen-Seite z. B. [`src/pages/events/EventList.tsx`](../../src/pages/events/EventList.tsx)

Erwartung: identisches Erscheinungsbild zu vor Phase 2.

---

## Erfolgskriterien

- `package.json` / `package-lock.json` ohne `date-fns-tz` und `@tailwindcss/postcss7-compat`
- `npm run test` grün
- `npm run build` grün, CSS-Bundle enthält Tailwind-Utilities
- App startet, keine fehlenden Styles
