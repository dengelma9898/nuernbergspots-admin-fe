---
name: Ponytail Phase 1 — Toter Code & Artefakte
overview: "Entfernt ungenutzten Quellcode und committed Build-Artefakte aus Git ohne Verhaltensänderung. Voraussetzung für alle weiteren Ponytail-Phasen. Verifikation: npm run test && npm run build && npm run start:dev."
todos:
  - id: gitignore-public-assets
    content: public/assets/ aus Git entfernen (git rm -r) und in .gitignore eintragen
    status: completed
  - id: verify-firebase-hosting
    content: firebase.json prüfen — Hosting nutzt dist/ (nicht public/assets/)
    status: completed
  - id: delete-partner-module
    content: src/modules/partner/ komplett löschen (0 Imports)
    status: completed
  - id: delete-customer-scans
    content: CustomerScansAnalysis.tsx + zugehörigen Test löschen
    status: completed
  - id: delete-command-cmdk
    content: command.tsx + command.test.tsx löschen; npm uninstall cmdk
    status: completed
  - id: prune-animations-api-errors
    content: Tote Exports in animations.ts, api.ts Stubs, createContextualError, CategoryList CSS-Duplikat entfernen
    status: completed
  - id: verify-phase1
    content: npm run test && npm run build && npm run start:dev — Login/Dashboard Smoke-Check
    status: completed
isProject: false
---

# Plan: Ponytail Phase 1 — Toter Code & Build-Artefakte

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** — (Startphase)  
**Nachfolger:** [ponytail_phase2_unused_deps.plan.md](./ponytail_phase2_unused_deps.plan.md)

## Ziel

Alles entfernen, was die App nicht nutzt und kein Laufzeitverhalten ändert. Größter Gewinn: ~149k Zeilen committed Build-Output in `public/assets/`.

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

Manuell: Login-Seite lädt, Navigation zum Dashboard möglich.

---

## 1. Git-Hygiene: `public/assets/`

**Ausgangslage**

- [`firebase.json`](../../firebase.json): `"public": "dist"` — Deploy nutzt **nicht** `public/assets/`.
- 13 Dateien in `public/assets/` (~149k Zeilen JS/CSS/Fonts) sind alte Build-Artefakte im Repo.

**Schritte**

1. `git rm -r public/assets/`
2. [`.gitignore`](../../.gitignore) ergänzen:
   ```
   public/assets/
   ```
3. Nach `npm run build` prüfen: Output landet in `dist/`, nicht in `public/`.

---

## 2. Totes Modul `src/modules/partner/`

| Datei | Zeilen | Grund |
| ----- | ------ | ----- |
| `src/modules/partner/services/businessService.ts` | ~244 | Duplikat von `src/services/businessService.ts` |
| `src/modules/partner/services/userService.ts` | ~158 | Duplikat von `src/services/userService.ts` |

- Kein Import von `modules/partner` im gesamten `src/`.
- Verzeichnis `src/modules/` danach ggf. komplett löschen.

---

## 3. Ungenutzte Komponenten

| Löschen | Grund |
| ------- | ----- |
| [`src/components/CustomerScansAnalysis.tsx`](../../src/components/CustomerScansAnalysis.tsx) | Nur im eigenen Test referenziert, nicht in Routes |
| [`src/components/__tests__/CustomerScansAnalysis.test.tsx`](../../src/components/__tests__/CustomerScansAnalysis.test.tsx) | — |
| [`src/components/ui/command.tsx`](../../src/components/ui/command.tsx) | Kein App-Import, nur eigener Test |
| [`src/components/ui/__tests__/command.test.tsx`](../../src/components/ui/__tests__/command.test.tsx) | — |

Danach: `npm uninstall cmdk`

---

## 4. Kleine Bereinigungen

### [`src/lib/animations.ts`](../../src/lib/animations.ts)

Exports löschen (keine Caller):

- `slideInLeft`
- `pulse`
- `expandCollapse`
- `slowTransition`

### [`src/lib/api.ts`](../../src/lib/api.ts)

Stub-Interfaces entfernen:

- `export interface Business { … }`
- `export interface City { … }`

(Echte Types: [`src/models/business.ts`](../../src/models/business.ts))

### [`src/utils/errorUtils.ts`](../../src/utils/errorUtils.ts)

- Funktion `createContextualError` entfernen (keine Caller außer Definition).

### [`src/pages/categories/CategoryList.tsx`](../../src/pages/categories/CategoryList.tsx)

- Zeile `import 'material-icons/iconfont/material-icons.css'` entfernen — bereits in [`src/index.css`](../../src/index.css).

---

## 5. Abschluss-Checkliste

- [ ] Kein `grep -r "modules/partner\|CustomerScansAnalysis\|components/ui/command\|createContextualError"` Treffer außer Plan-Docs
- [ ] `package.json` ohne `cmdk`
- [ ] Alle Jest-Suites grün
- [ ] `tsc && vite build` erfolgreich
- [ ] Dev-Server startet ohne Console-Errors

## Erfolgskriterien

- Repo ohne `public/assets/` im Git-Index
- ~1,5k Zeilen weniger toter `src/`-Code
- Keine sichtbare UI-/API-Regression
