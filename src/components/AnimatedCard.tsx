import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { staggerItem, fastTransition } from '@/lib/animations';
import { ReactNode, ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type CardProps = ComponentProps<typeof Card>;

interface AnimatedCardProps extends CardProps {
  children: ReactNode;
  index?: number;
  delay?: number;
}

/**
 * AnimatedCard-Komponente mit Stagger-Animation
 * 
 * Features:
 * - Stagger-Animation für List-Items
 * - Sanfte Hover-Effekte
 * - Konfigurierbare Delay für Stagger-Effekt
 */
export function AnimatedCard({ 
  children, 
  index = 0,
  delay = 0,
  className,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerItem}
      transition={{
        ...fastTransition,
        delay: delay + (index * 0.05)
      }}
      whileHover={{ 
        scale: 1.02,
        transition: fastTransition
      }}
    >
      <Card className={cn(className)} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

