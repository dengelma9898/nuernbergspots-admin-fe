import { Variants } from 'framer-motion';

/**
 * Standard-Animation-Variants für die gesamte Anwendung
 *
 * Diese Variants können wiederverwendet werden, um konsistente
 * Animationen über die gesamte Anwendung hinweg zu gewährleisten.
 */

/**
 * Fade-In mit Slide-Up Animation
 * Verwendet für: Page-Transitions, Cards beim Laden
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

/**
 * Scale-In Animation
 * Verwendet für: Modals, Popovers, Dropdowns
 */
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
};

/**
 * Stagger Container für List-Animationen
 * Verwendet für: Card-Lists, Grid-Layouts
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger Item für einzelne List-Items
 * Verwendet zusammen mit staggerContainer
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Custom easing für smooth animation
    },
  },
};

/**
 * Fade-In Animation (einfach)
 * Verwendet für: Text, Icons, einfache Elemente
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * Slide-In von rechts
 * Verwendet für: Sidebars, Drawers, Notifications
 */
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 100,
  },
};

/**
 * Shake Animation für Error-States
 * Verwendet für: Formular-Fehler, Validierungs-Fehler
 */
export const shake: Variants = {
  initial: {
    x: 0,
  },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/**
 * Standard Transition-Einstellungen
 */
export const defaultTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const fastTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
