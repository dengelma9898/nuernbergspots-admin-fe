import { cn } from './utils';

/**
 * Minimalistisches Border-Design Utility-Funktionen für konsistente Styling
 *
 * Verwendet das neue Farbschema: Weiß Primary, Schwarz Secondary, Rot Tertiary
 * Mit Dark Mode Support (Primary/Secondary vertauscht)
 *
 * Design-Prinzipien:
 * - Kein Glassmorphism (kein backdrop-blur)
 * - Keine Schatten (kein shadow)
 * - Klare Borders mit Secondary Color
 * - Minimalistisches Design
 */

/**
 * Basis-Klassen für Cards mit Secondary Color Border
 */
export const glassCard = cn(
  'bg-card',
  'border',
  'border-secondary',
  'rounded-lg',
  'transition-all duration-300'
);

/**
 * Card-Klassen mit Hover-Effekt (Border bleibt Secondary)
 */
export const glassCardHover = cn(glassCard, 'hover:border-secondary/80', 'cursor-pointer');

/**
 * Input-Feld-Klassen mit Secondary Color Border
 */
export const glassInput = cn(
  'bg-background',
  'border',
  'border-secondary',
  'text-foreground',
  'placeholder:text-muted-foreground',
  'focus:border-secondary',
  'focus:outline-none',
  'rounded-lg',
  'transition-all duration-300'
);

/**
 * Button-Klassen mit Secondary Color Border
 */
export const glassButton = cn(
  'bg-background',
  'border',
  'border-secondary',
  'text-foreground',
  'hover:bg-secondary/5',
  'hover:border-secondary/80',
  'rounded-lg',
  'transition-all duration-300'
);

/**
 * Badge/Label-Klassen mit Secondary Color Border
 */
export const glassBadge = cn(
  'bg-background',
  'border',
  'border-secondary',
  'text-foreground',
  'rounded-md'
);
