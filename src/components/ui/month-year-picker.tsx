import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { monthYearToHtml5, html5ToMonthYear } from '@/utils/eventFormatters';

export interface MonthYearPickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /**
   * Wert im Backend-Format (mm.yyyy)
   */
  value?: string | null;
  /**
   * Callback wenn sich der Wert ändert (im Backend-Format mm.yyyy)
   */
  onChange?: (value: string) => void;
}

/**
 * MonthYearPicker - Ein einfacher Monat/Jahr-Picker
 *
 * Verwendet das native HTML5 <input type="month"> Element und
 * konvertiert automatisch zwischen dem UI-Format (YYYY-MM) und
 * dem Backend-Format (mm.yyyy).
 */
export const MonthYearPicker = React.forwardRef<HTMLInputElement, MonthYearPickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Konvertiere Backend-Format (mm.yyyy) zu HTML5-Format (YYYY-MM)
    const html5Value = monthYearToHtml5(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const html5MonthValue = e.target.value;
      // Konvertiere HTML5-Format (YYYY-MM) zu Backend-Format (mm.yyyy)
      const backendValue = html5ToMonthYear(html5MonthValue);
      onChange?.(backendValue);
    };

    return (
      <Input
        ref={ref}
        type="month"
        value={html5Value}
        onChange={handleChange}
        className={cn(className)}
        {...props}
      />
    );
  }
);

MonthYearPicker.displayName = 'MonthYearPicker';
