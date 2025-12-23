import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fastTransition } from '@/lib/animations';
import { ReactNode, ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
}

/**
 * AnimatedButton-Komponente mit Click-Animation
 * 
 * Features:
 * - Scale-Animation beim Klicken (0.95 → 1.0)
 * - Sanfte Hover-Effekte
 * - Besseres visuelles Feedback
 */
export function AnimatedButton({ 
  children, 
  ...props 
}: AnimatedButtonProps) {
  const { disabled } = props;
  return (
    <motion.div
      whileTap={disabled ? {} : { scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      transition={fastTransition}
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  );
}

