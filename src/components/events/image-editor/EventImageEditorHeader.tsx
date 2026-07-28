import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export const EventImageEditorHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className={cn(cardPreset, 'p-6 mb-8')}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <div className="flex flex-row items-center gap-4">
        <LoadingButton
          variant="ghost"
          size="icon"
          onClick={() => navigate('/events')}
          className={cn(buttonPreset, 'rounded-full')}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Zurück zur Übersicht</span>
        </LoadingButton>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Event-Bild Editor
        </h1>
      </div>
    </motion.div>
  );
};
