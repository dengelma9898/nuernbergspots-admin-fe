import React from 'react';
import { Check } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface JobOfferFormActionsProps {
  isEdit: boolean;
  isSaving: boolean;
  onCancel: () => void;
}

export function JobOfferFormActions({ isEdit, isSaving, onCancel }: JobOfferFormActionsProps) {
  return (
    <motion.div className="mt-6 flex flex-row items-center justify-end gap-4" variants={fadeInUp}>
      <LoadingButton
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isSaving}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0"
      >
        Abbrechen
      </LoadingButton>
      <LoadingButton
        type="submit"
        variant="outline"
        disabled={isSaving}
        isLoading={isSaving}
        loadingText={isEdit ? 'Wird gespeichert...' : 'Wird erstellt...'}
        className={cn(buttonPreset, 'flex items-center')}
      >
        {!isSaving && (
          <>
            <Check className="h-4 w-4" />
            {isEdit ? 'Speichern' : 'Erstellen'}
          </>
        )}
      </LoadingButton>
    </motion.div>
  );
}
