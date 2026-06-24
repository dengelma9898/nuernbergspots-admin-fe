---
name: Ponytail Phase 6 — Icon-Stack (MUI entfernen)
overview: 'Entfernt @mui/material, @mui/icons-material und @emotion/* — ersetzt durch MaterialIcon (Font) + Lucide. Refaktoriert iconUtils und icon-picker. Voraussetzung: Phase 5. Verifikation: npm run test && npm run build && npm run start:dev.'
todos:
  - id: inventory-icon-names
    content: 'Backend iconName-Werte inventarisieren (Kategorien, Events, JobOffers)'
    status: pending
  - id: refactor-icon-utils
    content: 'iconUtils.tsx: getIconComponent auf MaterialIcon umstellen, kein @mui/icons-material'
    status: pending
  - id: refactor-icon-picker
    content: 'icon-picker.tsx: MUI-Icons durch MaterialIcon + kuratierte Liste ersetzen'
    status: pending
  - id: update-tests
    content: 'icon-picker.test, CategoryList/JobCategories/Event-Tests anpassen'
    status: pending
  - id: uninstall-mui
    content: 'npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled'
    status: pending
  - id: verify-phase6
    content: 'npm run test && npm run build && npm run start:dev; Kategorie-Icons + Picker prüfen'
    status: pending
isProject: false
---

# Plan: Ponytail Phase 6 — Icon-Stack vereinheitlichen

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase5_wrappers.plan.md](./ponytail_phase5_wrappers.plan.md)  
**Nachfolger:** [ponytail_phase7_motion_css.plan.md](./ponytail_phase7_motion_css.plan.md)

## Ziel

Drei Icon-Systeme → zwei:

- **Lucide** — UI-Chrome (bereits Standard)
- **Material Icons Font** — Kategorie-`iconName` vom Backend

MUI-Stack komplett entfernen (−4 Dependencies, deutlich kleineres Bundle).

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

Manuell: JobCategories, EventCategoryList, CategoryList — Icons sichtbar; Icon-Picker in Formularen funktional.

---

## 1. Ist-Zustand

| System | Verwendung | Problem |
| ------ | ---------- | ------- |
| `lucide-react` | ~70 Dateien | OK |
| `material-icons` npm | [`src/index.css`](../../src/index.css), [`MaterialIcon`](../../src/components/ui/material-icon.tsx) | OK |
| `@mui/icons-material` | [`iconUtils.tsx`](../../src/utils/iconUtils.tsx), [`icon-picker.tsx`](../../src/components/ui/icon-picker.tsx) | `import * as Icons` bundlet **alle** Icons |

---

## 2. Icon-Namen inventarisieren

Backend liefert `iconName` als snake_case (z. B. `local_cafe`).

Prüfen in:

- [`src/pages/JobCategories.tsx`](../../src/pages/JobCategories.tsx)
- [`src/pages/events/EventCategoryList.tsx`](../../src/pages/events/EventCategoryList.tsx)
- [`src/pages/categories/CategoryList.tsx`](../../src/pages/categories/CategoryList.tsx)

`convertToIconName()` in iconUtils mappt snake_case → PascalCase für MUI — für Font-Icons: **snake_case direkt** als Glyph-Name nutzen (`MaterialIcon icon="local_cafe"`).

---

## 3. [`src/utils/iconUtils.tsx`](../../src/utils/iconUtils.tsx) refactoren

**Vorher:** `@mui/icons-material` Dynamic Component  
**Nachher:**

```tsx
import { MaterialIcon } from '@/components/ui/material-icon';

export function getIconComponent(iconName: string) {
  const name = iconName?.includes('_') ? iconName : convertSnakeFromPascal(iconName);
  return <MaterialIcon icon={name} size="medium" />;
}
```

- `Storefront` Fallback bei leerem Namen
- `specialCases` Map beibehalten falls nötig

---

## 4. [`src/components/ui/icon-picker.tsx`](../../src/components/ui/icon-picker.tsx)

**Problem:** `Object.keys(Icons)` aus MUI — tausende Icons.

**Lösung:**

1. Statische Liste `ALLOWED_ICONS: string[]` (snake_case Material Icon Names) — aus Backend-Inventar + gängige Ergänzungen.
2. Rendering: `<MaterialIcon icon={name} />` statt MUI Component.
3. [`@tanstack/react-virtual`](../../package.json) behalten wenn Liste > ~100 Einträge.
4. Suche/filter über `searchTerm` unverändert.

---

## 5. Tests

- [`src/components/ui/__tests__/icon-picker.test.tsx`](../../src/components/ui/__tests__/icon-picker.test.tsx) — MUI-Mock entfernen, `MaterialIcon` mocken
- [`src/components/ui/__tests__/material-icon.test.tsx`](../../src/components/ui/__tests__/material-icon.test.tsx) — grün halten
- Page-Tests mit `jest.mock('@/utils/iconUtils')` — weiterhin gültig

---

## 6. Dependencies entfernen

```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

Verifikation: `grep -r "@mui/" src/` → 0 Treffer.

---

## 7. Bundle-Check (optional)

```bash
npm run build 2>&1 | tail -20
```

Vorher/Nachher `dist/assets/*.js` Größe notieren.

---

## Erfolgskriterien

- Kein `@mui/` Import in `src/`
- Kategorie-Icons in Liste + Form korrekt
- Icon-Picker: Suche, Auswahl, Vorschau funktionieren
- Alle Tests grün
