import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface JobOfferFormHeaderProps {
  title: string;
  onBack: () => void;
}

export function JobOfferFormHeader({ title, onBack }: JobOfferFormHeaderProps) {
  return (
    <motion.div
      className={cn(cardPreset, 'p-4 sm:p-6 mb-6 sm:mb-8')}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <LoadingButton
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={cn(buttonPreset, 'rounded-full')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Zurück zur Übersicht</span>
          </LoadingButton>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        </div>
      </div>
    </motion.div>
  );
}
