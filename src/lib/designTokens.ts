import { cn } from './utils';

/**
 * Design-Token-Utilities für konsistentes Styling.
 * Siehe CONSTITUTION.md — Minimalismus, klare Borders, kein Glassmorphism.
 */

/** Basis-Klassen für Cards mit Secondary Color Border */
export const cardPreset = cn(
  'bg-card',
  'border',
  'border-secondary',
  'rounded-lg',
  'transition-all duration-300'
);

/** Card-Klassen mit Hover-Effekt */
export const cardPresetHover = cn(cardPreset, 'hover:border-secondary/80', 'cursor-pointer');

/** Input-Feld-Klassen */
export const inputPreset = cn(
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

/** Button-Klassen */
export const buttonPreset = cn(
  'bg-background',
  'border',
  'border-secondary',
  'text-foreground',
  'hover:bg-secondary/5',
  'hover:border-secondary/80',
  'rounded-lg',
  'transition-all duration-300'
);

/** Badge/Label-Klassen */
export const badgePreset = cn(
  'bg-background',
  'border',
  'border-secondary',
  'text-foreground',
  'rounded-md'
);

/** Listen-Header und Filter-Sections (kompakte Admin-Dichte) */
export const listSectionPreset = cn(cardPreset, 'p-4 mb-6');
