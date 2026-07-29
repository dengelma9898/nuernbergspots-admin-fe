import React, { RefObject } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventFormValidationAlertProps {
  errors: string[];
  alertRef?: RefObject<HTMLDivElement | null>;
}

export function EventFormValidationAlert({ errors, alertRef }: EventFormValidationAlertProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Alert ref={alertRef} variant="destructive" className={cn(cardPreset, 'border-destructive/50')}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
