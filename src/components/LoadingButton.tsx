import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fastTransition, defaultTransition } from '@/lib/animations';
import { ReactNode, ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonProps = ComponentProps<typeof Button>;

interface LoadingButtonProps extends ButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * LoadingButton-Komponente mit erweiterten Mikroanimationen
 *
 * Features:
 * - Scale-Animation beim Klicken (0.95 → 1.0)
 * - Sanfte Hover-Effekte
 * - Loading-State mit Spinner-Animation
 * - Text-Übergang beim Laden (sanfter Fade)
 * - Pulse-Animation während des Ladens
 * - Disabled-State mit visuellem Feedback
 */
export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.div
      whileTap={isDisabled ? {} : { scale: 0.95 }}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      animate={
        isLoading
          ? {
              scale: [1, 1.02, 1],
            }
          : {}
      }
      transition={
        isLoading
          ? {
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : fastTransition
      }
    >
      <Button
        {...props}
        disabled={isDisabled}
        className={cn('relative overflow-hidden', isLoading && 'cursor-wait', className)}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={defaultTransition}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Loader2 className="h-4 w-4" />
              </motion.div>
              {loadingText && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {loadingText}
                </motion.span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={defaultTransition}
              className="flex items-center justify-center gap-2 w-full h-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
