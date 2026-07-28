---
name: Ponytail Phase 7 — framer-motion → CSS
overview: 'Ersetzt framer-motion durch tailwindcss-animate/CSS auf ~50 Dateien; entfernt animations.ts und die Dependency. Voraussetzung: Phase 6. Verifikation: npm run test && npm run build && npm run start:dev.'
todos:
  - id: motion-shared-components
    content: '7a: LoadingButton, AnimatedCard, PageTransition, Background auf CSS umstellen'
    status: pending
  - id: motion-auth-shell
    content: '7b: Login, Dashboard, Profile migrieren'
    status: pending
  - id: motion-list-pages
    content: '7c: Events, Businesses, Users, News, JobOffers migrieren'
    status: pending
  - id: motion-remaining-pages
    content: '7d: Restliche Seiten migrieren'
    status: pending
  - id: delete-animations-uninstall
    content: 'animations.ts löschen; npm uninstall framer-motion'
    status: pending
  - id: reduced-motion
    content: 'motion-reduce: Varianten für prefers-reduced-motion prüfen'
    status: pending
  - id: verify-phase7
    content: 'npm run test && npm run build && npm run start:dev; visueller Check 3–5 Seiten'
    status: pending
isProject: false
---

# Plan: Ponytail Phase 7 — Animationen: framer-motion → CSS

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase6_icons.plan.md](./ponytail_phase6_icons.plan.md)  
**Nachfolger:** [ponytail_phase8_optional.plan.md](./ponytail_phase8_optional.plan.md)

## Ziel

`framer-motion` entfernen; dekoratives Motion über `tailwindcss-animate` (bereits installiert) und Tailwind-Utilities.

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

Visuell: Login, Dashboard, EventList, eine Formular-Seite.

---

## 1. Migrations-Mapping

| framer-motion                      | CSS / Tailwind Ersatz                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `fadeInUp` / `PageTransition`      | `animate-in fade-in slide-in-from-bottom-4 duration-300`               |
| `staggerContainer` + `staggerItem` | `animation-delay-*` pro Kind **oder** einfaches `fade-in` ohne Stagger |
| `scaleIn`                          | `animate-in zoom-in-95 duration-200`                                   |
| `shake` (Login-Fehler)             | `animate-shake` (ggf. kurz in `index.css` `@keyframes`)                |
| `whileTap={{ scale: 0.95 }}`       | `active:scale-95 transition-transform`                                 |
| `whileHover={{ scale: 1.02 }}`     | `hover:scale-[1.02] transition-transform`                              |
| Spinner rotate                     | `animate-spin` (bereits Lucide)                                        |
| `AnimatePresence` Listen-Exit      | Optional weglassen oder CSS `opacity` transition                       |

**Reduced motion:**

```html
className="motion-reduce:animate-none motion-reduce:transition-none"
```

---

## 2. Sub-Phasen (empfohlene Reihenfolge)

### 7a — Shared Components

| Datei                                                                          | Aktion                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [`src/components/LoadingButton.tsx`](../../src/components/LoadingButton.tsx)   | `motion`/`AnimatePresence` → CSS + conditional render für Loading             |
| [`src/components/AnimatedCard.tsx`](../../src/components/AnimatedCard.tsx)     | `motion.div` → `div` mit `animate-in` + optional `style={{ animationDelay }}` |
| [`src/components/PageTransition.tsx`](../../src/components/PageTransition.tsx) | Reines `div` mit Tailwind animate classes                                     |
| [`src/components/Background.tsx`](../../src/components/Background.tsx)         | `motion` Blur-Kreise → `animate-pulse`                                        |

### 7b — Auth & Shell

- [`src/pages/Login.tsx`](../../src/pages/Login.tsx) — `shake`, `scaleIn`, `AnimatePresence` für Fehler
- [`src/pages/Dashboard.tsx`](../../src/pages/Dashboard.tsx) — viele `motion.div` + `staggerContainer`
- [`src/pages/Profile.tsx`](../../src/pages/Profile.tsx)

### 7c — Listen-Bereiche

- `src/pages/events/*` (EventList, EventDetail, CreateEvent, CopyEvent, CsvEventImport, EventCategoryList, EventImageEditor)
- `src/pages/businesses/*`
- `src/pages/users/*`
- [`src/pages/NewsManagement.tsx`](../../src/pages/NewsManagement.tsx)
- [`src/pages/JobOffers.tsx`](../../src/pages/JobOffers.tsx), [`JobCategories.tsx`](../../src/pages/JobCategories.tsx)

### 7d — Rest

Alle verbleibenden `import { motion` in `src/pages/` und `src/components/`.

Grep-Hilfe:

```bash
grep -rl "framer-motion" src/
```

---

## 3. [`src/lib/animations.ts`](../../src/lib/animations.ts)

Nach vollständiger Migration:

1. Alle Imports von `@/lib/animations` entfernen
2. Datei löschen

---

## 4. Spezialfälle

### Chat & CSV Import

- [`ChatMessages.tsx`](../../src/pages/chatrooms/ChatMessages.tsx): `slideInRight` für Nachrichten — `animate-in slide-in-from-right-4`
- [`CsvEventImport.tsx`](../../src/pages/events/CsvEventImport.tsx): `AnimatePresence` für Steps — vereinfachen auf conditional render + `fade-in`

### Tests

Viele Page-Tests mocken `framer-motion` nicht — sollten weiter grün sein. Falls Tests `motion`-spezifische Selektoren nutzen: anpassen.

---

## 5. Dependency entfernen

```bash
npm uninstall framer-motion
```

`grep -r "framer-motion" src/` → 0 Treffer.

---

## Erfolgskriterien

- Kein `framer-motion` in `package.json` oder `src/`
- Seiten laden mit sanftem Fade (oder ohne Animation bei `prefers-reduced-motion`)
- Keine Layout-Shifts / kein fehlendes Content durch `height: 0` Exit-Animationen
- Volle Test-Suite + Build grün
