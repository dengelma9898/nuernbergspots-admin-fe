import { motion } from 'framer-motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition-Komponente für flüssige Übergänge zwischen Seiten
 *
 * Features:
 * - Fade-In + Slide-Up Animation beim Laden
 * - Smooth Exit-Animation beim Verlassen
 * - Respektiert prefers-reduced-motion
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  );
}
