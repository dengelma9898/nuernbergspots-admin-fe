import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SelectableBadgeProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * SelectableBadge - Eine wiederverwendbare Komponente für auswählbare Tags/Badges
 * 
 * Features:
 * - Automatisches Checkmark-Icon bei ausgewählten Tags
 * - Subtile Animationen (Hover & Tap)
 * - Konsistentes Styling für ausgewählte/nicht-ausgewählte Zustände
 * - Globale Lösung für alle auswählbaren Tags in der App
 */
export function SelectableBadge({
  children,
  isSelected,
  onClick,
  className,
  disabled = false,
}: SelectableBadgeProps) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge
        variant={isSelected ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer transition-all duration-200',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        {isSelected && <Check className="h-3 w-3" />}
        {children}
      </Badge>
    </motion.div>
  );
}

