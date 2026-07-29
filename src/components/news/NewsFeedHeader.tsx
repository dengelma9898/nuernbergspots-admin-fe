import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsFeedHeaderProps {
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
}

export function NewsFeedHeader({ loading, onBack, onRefresh }: NewsFeedHeaderProps) {
  return (
    <motion.div
      className={cn(cardPreset, 'mx-2 mt-4 mb-6 p-4 md:p-6')}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <LoadingButton
            variant="ghost"
            size="icon"
            onClick={onBack}
            title="Zurück zum Dashboard"
            className={cn(buttonPreset, 'rounded-full')}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Zurück zum Dashboard</span>
          </LoadingButton>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">News Management</h1>
        </div>
        <LoadingButton
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          title="Neu laden"
          className={cn(buttonPreset, 'rounded-xl')}
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} />
        </LoadingButton>
      </div>
    </motion.div>
  );
}
