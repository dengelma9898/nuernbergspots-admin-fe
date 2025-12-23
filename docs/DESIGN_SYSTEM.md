# Design-System Dokumentation
## Minimalistisches Design mit Dark Mode Support

**Version:** 1.0  
**Letzte Aktualisierung:** Januar 2025  
**Status:** ✅ Implementiert

---

## 🎯 Design-Philosophie

Das Design-System basiert auf **Minimalismus** und **Funktionalität**. Es verzichtet bewusst auf dekorative Elemente wie Glassmorphism, Schatten oder komplexe Hintergründe und fokussiert sich auf Klarheit, Lesbarkeit und konsistente Benutzerführung.

### Kernprinzipien

- **Minimalismus** - Keine Schatten, kein Blur, klare Borders
- **Konsistenz** - Einheitliches Design-System mit Secondary Color Borders
- **Lesbarkeit** - Robot-Style Font für technischen, professionellen Look
- **Reduzierte Komplexität** - Flache Struktur, weniger Verschachtelungen
- **Subtile Animationen** - Funktionale Mikroanimationen ohne Ablenkung
- **Dark Mode Support** - Vollständige Theme-Unterstützung

---

## 🎨 Farbschema

### Light Mode (Standard)

- **Primary:** Weiß (`white`) - Haupt-Hintergrundfarbe
- **Secondary:** Schwarz (`black`) - Für Borders, Text-Akzente
- **Tertiary:** Rot (`red-500`) - Für Warnungen, wichtige Akzente

### Dark Mode

- **Primary:** Schwarz (`black`) - Haupt-Hintergrundfarbe
- **Secondary:** Weiß (`white`) - Für Borders, Text-Akzente
- **Tertiary:** Rot (`red-500`) - Für Warnungen, wichtige Akzente

**Hinweis:** Primary und Secondary werden im Dark Mode vertauscht, um optimale Lesbarkeit zu gewährleisten.

### CSS-Variablen

Das Farbschema wird über CSS-Variablen (`--primary`, `--secondary`, `--tertiary`) verwaltet, die automatisch basierend auf dem aktiven Theme gesetzt werden.

---

## 📐 Typografie

### Schriftart

**JetBrains Mono** - Eine monospace Schriftart für einen technischen, professionellen Look.

**Fallback:** `Courier New, monospace`

### Schriftgrößen

- Responsive Typografie mit Tailwind-Klassen:
  - Mobile: `text-sm` (14px)
  - Tablet: `text-base` (16px)
  - Desktop: `text-lg` (18px)
  - Large: `text-xl` (20px)

### Line Heights

- Optimiert für bessere Lesbarkeit
- Konsistente Skalierung über alle Breakpoints

---

## 🖼️ Hintergrund

### Struktur

Der Hintergrund besteht aus **maximal 2 Ebenen**:

1. **Gradient-Layer** - Primary/Secondary basierend auf Theme
   - Light Mode: Weiß → Grau-50 → Weiß
   - Dark Mode: Schwarz → Grau-900 → Schwarz

2. **Blur-Kreis** - Tertiary (Rot) als subtiler Akzent
   - Light Mode: `bg-red-500/5` (5% Opacity)
   - Dark Mode: `bg-red-500/10` (10% Opacity)
   - Sanfte Puls-Animation mit Framer Motion

**Reduzierung:** Von ursprünglich 5 Blur-Kreisen auf 1 Blur-Kreis (-80% Komplexität)

---

## 🧩 Komponenten-System

### Basis-Komponenten (shadcn/ui)

Die Anwendung nutzt **shadcn/ui** als Basis-Komponenten-Bibliothek:
- `Card` - Container für Inhalte
- `Button` - Interaktive Buttons
- `Input` - Eingabefelder
- `Badge` - Labels und Status-Anzeigen
- `Dialog` - Modals und Popovers
- `Select` - Dropdown-Auswahlfelder
- `Skeleton` - Loading-States

### Design-Utilities (`src/lib/glassmorphism.ts`)

**Hinweis:** Der Dateiname `glassmorphism.ts` ist historisch bedingt. Die Datei enthält **kein** Glassmorphism, sondern minimalistisches Border-Design.

#### `glassCard`
Basis-Klassen für Cards mit Secondary Color Border:
```typescript
bg-card border border-secondary rounded-lg transition-all duration-300
```

#### `glassCardHover`
Card mit Hover-Effekt:
```typescript
glassCard + hover:border-secondary/80 cursor-pointer
```

#### `glassInput`
Input-Felder mit Secondary Color Border:
```typescript
bg-background border border-secondary text-foreground
focus:border-secondary rounded-lg transition-all duration-300
```

#### `glassButton`
Buttons mit Secondary Color Border:
```typescript
bg-background border border-secondary text-foreground
hover:bg-secondary/5 hover:border-secondary/80 rounded-lg
```

#### `glassBadge`
Badges/Labels mit Secondary Color Border:
```typescript
bg-background border border-secondary text-foreground rounded-md
```

---

## ✨ Animation-System

### Framer Motion Variants (`src/lib/animations.ts`)

#### `fadeInUp`
Standard Page-Transition Animation:
- Verwendet für: Page-Transitions, Cards beim Laden
- Animation: Opacity 0→1, Y: 20px→0

#### `staggerContainer` & `staggerItem`
List-Animationen mit Stagger-Effekt:
- Verwendet für: Card-Lists, Grid-Layouts
- Delay: 50ms zwischen Items

#### `scaleIn`
Modal/Popover Animationen:
- Verwendet für: Modals, Dropdowns
- Animation: Opacity 0→1, Scale: 0.9→1.0

#### Weitere Variants
- `fadeIn` - Einfache Fade-Animationen
- `slideInRight/Left` - Sidebar/Drawer Animationen
- `shake` - Error-State Animationen
- `pulse` - Loading-State Animationen

### Wiederverwendbare Komponenten

#### `PageTransition` (`src/components/PageTransition.tsx`)
Wrapper für Page-Transitions:
- Smooth Fade-In + Slide-Up Animation
- Respektiert `prefers-reduced-motion`
- Konsistente Transitions zwischen Seiten

#### `AnimatedCard` (`src/components/AnimatedCard.tsx`)
Card mit Stagger-Animation:
- Konfigurierbare Delay für Stagger-Effekt
- Sanfte Hover-Effekte (Scale 1.02)
- Unterstützt alle Card-Props

#### `AnimatedButton` (`src/components/AnimatedButton.tsx`)
Button mit Click-Feedback:
- Click-Animation (Scale 0.95 → 1.0)
- Hover-Animation (Scale 1.02)
- Besseres visuelles Feedback

#### `LoadingButton` (`src/components/LoadingButton.tsx`)
Button mit Loading-State:
- Zeigt Spinner während des Ladens
- Deaktiviert während des Ladens
- Smooth Transition zwischen States

#### `Background` (`src/components/Background.tsx`)
Minimalistische Background-Komponente:
- Maximal 2 Ebenen (1 Gradient + 1 Blur-Kreis)
- Theme-basierte Farben
- Sanfte Animationen mit Framer Motion

---

## 📱 Responsive Design

### Mobile-First Ansatz

Die Anwendung folgt einem **Mobile-First** Design-Prinzip:

- **Mobile:** Base (320px+) - Touch-optimiert, große Touch-Targets (min. 44px)
- **Tablet:** `sm:` (640px+) - Angepasste Layouts
- **Desktop:** `md:` (768px+) - Erweiterte Funktionalität
- **Large:** `lg:` (1024px+) - Optimale Desktop-Erfahrung
- **XL:** `xl:` (1280px+) - Große Bildschirme

### Responsive Patterns

- **Typography:** `text-sm sm:text-base md:text-lg lg:text-xl`
- **Spacing:** `p-4 md:p-6 lg:p-8`
- **Layout:** `flex-col sm:flex-row`
- **Grids:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Body-Padding

Alle Seiten verwenden responsive Padding für bessere Abstände:
```typescript
px-4 sm:px-6 lg:px-8
```

---

## 🎭 Dark Mode

### Implementierung

Dark Mode wird über **next-themes** verwaltet:
- Automatische Erkennung des System-Themes
- Manuelles Umschalten über Theme-Toggle
- Persistierung der Präferenz

### Theme-Umschaltung

- **Primary/Secondary vertauscht** für optimale Lesbarkeit
- **Tertiary (Rot)** bleibt konsistent
- **Smooth Transitions** zwischen Themes (500ms)

---

## 🔄 Loading States

### Skeleton Loading

Anstatt Spinner werden **Skeleton-Komponenten** verwendet:
- Bessere UX während des Ladens
- Zeigt die Struktur des kommenden Inhalts
- Konsistente Styling mit dem Design-System

### Skeleton-Patterns

- **Text-Linien:** `h-4 w-[width]` mit verschiedenen Breiten
- **Avatars/Icons:** `h-[size] w-[size] rounded-full`
- **Badges:** `h-6 w-[width] rounded-full`
- **Cards:** Vollständige Card-Struktur

---

## 📋 Layout-Prinzipien

### Reduzierte Verschachtelungen

- **Maximal 4 Ebenen** Verschachtelung
- Überschriften statt umschließender Cards für Sections
- Flache Struktur ohne unnötige Container

### Spacing

- Konsistente Abstände basierend auf 8px-Grid
- Optimierte Card-Paddings für bessere Balance
- Verbesserte Whitespace-Nutzung

---

## 🎯 Verwendungsbeispiele

### Card-Komponente

```tsx
import { Card } from '@/components/ui/card';
import { glassCard } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

<Card className={cn(glassCard)}>
  {/* Card Content */}
</Card>
```

### Button mit Animation

```tsx
import { AnimatedButton } from '@/components/AnimatedButton';

<AnimatedButton onClick={handleClick}>
  Klicken
</AnimatedButton>
```

### Page mit Background und Transition

```tsx
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';

<PageTransition>
  <Background />
  <div className="relative z-10">
    {/* Page Content */}
  </div>
</PageTransition>
```

### Liste mit Stagger-Animation

```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item, index) => (
    <motion.div key={item.id} variants={staggerItem}>
      {/* Item Content */}
    </motion.div>
  ))}
</motion.div>
```

---

## 🚀 Best Practices

### DO ✅

- Verwende `glassCard`, `glassInput`, `glassButton` für konsistente Styling
- Nutze `PageTransition` und `Background` für alle Seiten
- Verwende `AnimatedButton` oder `LoadingButton` für interaktive Elemente
- Implementiere Stagger-Animationen für Listen
- Respektiere `prefers-reduced-motion` für Accessibility

### DON'T ❌

- Kein Glassmorphism (`backdrop-blur`, `bg-white/5`)
- Keine Schatten (`shadow-*`)
- Keine komplexen Hintergründe (mehr als 2 Ebenen)
- Keine hardcodierten Farben (nutze CSS-Variablen)
- Keine abrupten Animationen ohne Transitions

---

## 📚 Weitere Ressourcen

- **shadcn/ui Dokumentation:** https://ui.shadcn.com/
- **Framer Motion Dokumentation:** https://www.framer.com/motion/
- **Tailwind CSS Dokumentation:** https://tailwindcss.com/docs
- **next-themes Dokumentation:** https://github.com/pacocoursey/next-themes

---

**Hinweis:** Dieses Design-System wurde im Januar 2025 vollständig implementiert und wird kontinuierlich gepflegt. Bei Fragen oder Verbesserungsvorschlägen bitte das Entwicklungsteam kontaktieren.
