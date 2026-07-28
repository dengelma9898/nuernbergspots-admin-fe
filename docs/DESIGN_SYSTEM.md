# Design-System Dokumentation

## Minimalistisches Design mit Dark Mode Support

**Version:** 1.1  
**Letzte Aktualisierung:** Juli 2026  
**Status:** Implementiert

---

## Design-Philosophie

Das Design-System basiert auf **Minimalismus** und **Funktionalität**. Es verzichtet bewusst auf dekorative Elemente wie Glassmorphism, Schatten oder komplexe Hintergründe und fokussiert sich auf Klarheit, Lesbarkeit und konsistente Benutzerführung.

### Kernprinzipien

- **Minimalismus** — Keine Schatten, kein `backdrop-blur`, klare Borders
- **Konsistenz** — Einheitliches Design-System mit Secondary-Color-Borders
- **Lesbarkeit** — JetBrains Mono für technischen, professionellen Look
- **Reduzierte Komplexität** — Flache Struktur, weniger Verschachtelungen
- **Subtile Animationen** — Funktionale Mikroanimationen ohne Ablenkung (0.2s)
- **Dark Mode Support** — Vollständige Theme-Unterstützung
- **Informationsdichte** — Admin-UI: kompakte Listen, Tabellen und Metriken

---

## Farbschema

### Light Mode (Standard)

- **Primary:** Weiß — Haupt-Hintergrundfarbe
- **Secondary:** Schwarz — Borders, Text-Akzente
- **Tertiary:** Rot (`red-500`) — Warnungen, wichtige Akzente

### Dark Mode

Primary und Secondary werden vertauscht für optimale Lesbarkeit. Tertiary bleibt konsistent.

---

## Typografie

**JetBrains Mono** (`font-mono`) mit responsive Skalierung:

- Mobile: `text-sm`
- Tablet: `text-base`
- Desktop: `text-lg`

---

## Hintergrund

Die `Background`-Komponente nutzt maximal 2 Ebenen:

1. Theme-Gradient (Primary/Secondary)
2. Ein dekorativer Blur-Kreis (`blur-3xl`, kein `backdrop-blur`)

---

## Komponenten-System

### Basis-Komponenten (shadcn/ui)

`Card`, `Button`, `Input`, `Badge`, `Dialog`, `Select`, `Skeleton`, `Table`

### Design-Tokens (`src/lib/designTokens.ts`)

Zentrale Presets für konsistentes Border-Design:

| Export              | Verwendung                        |
| ------------------- | --------------------------------- |
| `cardPreset`        | Cards, Container                  |
| `cardPresetHover`   | Klickbare Cards                   |
| `inputPreset`       | Inputs, SelectTrigger             |
| `buttonPreset`      | Outline-Buttons                   |
| `badgePreset`       | Labels, Icon-Badges               |
| `listSectionPreset` | Listen-Header/Filter (`p-4 mb-6`) |

#### Beispiel

```tsx
import { Card } from '@/components/ui/card';
import { cardPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

<Card className={cn(cardPreset, 'p-4')}>{/* Inhalt */}</Card>

<div className={listSectionPreset}>{/* Listen-Header */}</div>
```

---

## Animation-System

Animationen laufen über **CSS `@keyframes`** und den `motion`-Shim (`src/components/motion.tsx`).

| Utility                | Dauer | Verwendung       |
| ---------------------- | ----- | ---------------- |
| `.animate-fade-in-up`  | 0.2s  | Page-Transitions |
| `.motion-stagger-item` | 0.2s  | Listen-Stagger   |
| `defaultTransition`    | 0.2s  | motion-Wrapper   |

### Komponenten

- **`PageTransition`** — Fade-In für Route-Inhalte
- **`AnimatedCard`** — Stagger für Card-Grids (minimaler Delay)
- **`LoadingButton`** — Spinner während API-Requests
- **`Background`** — Theme-Gradient + dekorativer Kreis

`prefers-reduced-motion` deaktiviert Animationen global in `index.css`.

---

## Layout

### Admin-Shell

Geschützte Routen nutzen `AdminLayout` mit Sidebar, Breadcrumbs, ThemeToggle und UserMenu.

### Listen & Tabellen (Informationsdichte)

- Listen-Sections: `listSectionPreset` (`p-4 mb-6`)
- Grids: `gap-4`, optional `xl:grid-cols-4`
- Tabellen: Defaults aus `table.tsx` (`h-10`, `p-2`) — keine `py-4`-Overrides
- Form-Pages und Dialoge: weiterhin großzügigeres Padding (`p-6`)

### Responsive Design

Mobile-First mit Breakpoints gemäß `.cursorrules`. Touch-Targets für Buttons mindestens 44px — Buttons nicht weiter verkleinern.

---

## Loading States

Skeleton statt Spinner (`.cursorrules`). Struktur an echten Content anpassen.

---

## Best Practices

### DO

- `cardPreset`, `inputPreset`, `buttonPreset`, `listSectionPreset` verwenden
- `AdminLayout` für geschützte Routes
- `LoadingButton` für API-Aktionen
- Skeleton für Ladezustände

### DON'T

- Kein Glassmorphism (`backdrop-blur`, `bg-white/5`)
- Keine Schatten (`shadow-*`) auf Custom-UI
- Keine hardcodierten Farben
- Keine langen kaskadierenden Animation-Delays

---

## Weitere Ressourcen

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [next-themes](https://github.com/pacocoursey/next-themes)
