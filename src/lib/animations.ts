/**
 * CSS-basierte Animation-Utilities (ersetzt framer-motion Variants)
 */

export const fadeInUp = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
} as const;

export const scaleIn = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
} as const;

export const staggerContainer = {
  initial: 'initial',
  animate: 'animate',
} as const;

export const staggerItem = { __motion: 'stagger-item' } as const;

export const fadeIn = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
} as const;

export const slideInRight = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
} as const;

export const shake = {
  initial: 'initial',
  animate: 'animate',
} as const;

export const defaultTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const fastTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
