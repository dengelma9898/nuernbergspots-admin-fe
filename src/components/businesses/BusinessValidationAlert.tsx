import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface BusinessValidationAlertProps {
  validationErrors: string[];
  validationErrorsRef?: React.RefObject<HTMLDivElement | null>;
}

export const BusinessValidationAlert: React.FC<BusinessValidationAlertProps> = ({
  validationErrors,
  validationErrorsRef,
}) => {
  if (validationErrors.length === 0) {
    return null;
  }

  return (
    <Alert
      ref={validationErrorsRef}
      variant="destructive"
      className={cn(cardPreset, 'border-destructive/50')}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1">
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
