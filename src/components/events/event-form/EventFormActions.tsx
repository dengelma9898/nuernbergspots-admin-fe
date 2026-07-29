import React from 'react';
import { LoadingButton } from '@/components/LoadingButton';
import { buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
  loadingText: string;
}

export function EventFormActions({
  onCancel,
  onSubmit,
  loading,
  submitLabel,
  loadingText,
}: EventFormActionsProps) {
  return (
    <div className="flex flex-row items-center justify-end gap-4 pt-6 border-t border-secondary">
      <LoadingButton
        variant="ghost"
        onClick={onCancel}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0"
      >
        Abbrechen
      </LoadingButton>
      <LoadingButton
        variant="outline"
        onClick={onSubmit}
        isLoading={loading}
        loadingText={loadingText}
        className={cn(buttonPreset, 'flex items-center')}
      >
        {submitLabel}
      </LoadingButton>
    </div>
  );
}
