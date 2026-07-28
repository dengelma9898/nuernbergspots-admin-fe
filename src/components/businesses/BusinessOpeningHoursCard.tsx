import React from 'react';

import { BusinessValidationAlert } from '@/components/businesses/BusinessValidationAlert';
import { LoadingButton } from '@/components/LoadingButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectableBadge } from '@/components/ui/SelectableBadge';
import { TimeSlot, WEEKDAYS, WeekdayKey } from '@/utils/business/openingHours';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface BusinessOpeningHoursCardProps {
  timeSlots: TimeSlot[];
  newTimeSlot: Omit<TimeSlot, 'id'>;
  validationErrors: string[];
  validationErrorsRef: React.RefObject<HTMLDivElement | null>;
  onNewTimeSlotChange: React.Dispatch<React.SetStateAction<Omit<TimeSlot, 'id'>>>;
  onTimeSlotChange: (
    slotId: string,
    field: keyof Omit<TimeSlot, 'id'>,
    value: string | WeekdayKey[]
  ) => void;
  onRemoveTimeSlot: (slotId: string) => void;
  onToggleDayForTimeSlot: (day: WeekdayKey, slotId: string) => void;
  onToggleDayForNewTimeSlot: (day: WeekdayKey) => void;
  onAddTimeSlot: () => void;
}

export const BusinessOpeningHoursCard: React.FC<BusinessOpeningHoursCardProps> = ({
  timeSlots,
  newTimeSlot,
  validationErrors,
  validationErrorsRef,
  onNewTimeSlotChange,
  onTimeSlotChange,
  onRemoveTimeSlot,
  onToggleDayForTimeSlot,
  onToggleDayForNewTimeSlot,
  onAddTimeSlot,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Öffnungszeiten</CardTitle>
        <CardDescription className="text-muted-foreground">
          Definieren Sie die Öffnungszeiten des Partners
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BusinessValidationAlert
          validationErrors={validationErrors}
          validationErrorsRef={validationErrorsRef}
        />

        <div className="space-y-4">
          {timeSlots.map(slot => (
            <div key={slot.id} className={cn(cardPreset, 'p-4 space-y-4')}>
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-foreground">Zeitraum</h4>
                <LoadingButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTimeSlot(slot.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </LoadingButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Von</Label>
                  <Input
                    type="time"
                    value={slot.from}
                    onChange={e => onTimeSlotChange(slot.id, 'from', e.target.value)}
                    className={cn(inputPreset)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Bis</Label>
                  <Input
                    type="time"
                    value={slot.to}
                    onChange={e => onTimeSlotChange(slot.id, 'to', e.target.value)}
                    className={cn(inputPreset)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Gültig an</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                    <SelectableBadge
                      key={day}
                      isSelected={slot.days.includes(day as WeekdayKey)}
                      onClick={() => onToggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                    >
                      {dayName}
                    </SelectableBadge>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className={cn(cardPreset, 'p-4 space-y-4')}>
            <h4 className="font-medium text-foreground">Neuer Zeitraum</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Von</Label>
                <Input
                  type="time"
                  value={newTimeSlot.from}
                  onChange={e => onNewTimeSlotChange(prev => ({ ...prev, from: e.target.value }))}
                  className={cn(inputPreset)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Bis</Label>
                <Input
                  type="time"
                  value={newTimeSlot.to}
                  onChange={e => onNewTimeSlotChange(prev => ({ ...prev, to: e.target.value }))}
                  className={cn(inputPreset)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Gültig an</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                  <SelectableBadge
                    key={day}
                    isSelected={newTimeSlot.days.includes(day as WeekdayKey)}
                    onClick={() => onToggleDayForNewTimeSlot(day as WeekdayKey)}
                  >
                    {dayName}
                  </SelectableBadge>
                ))}
              </div>
            </div>
            <LoadingButton
              onClick={onAddTimeSlot}
              className="w-full"
              disabled={newTimeSlot.days.length === 0}
            >
              Zeitraum hinzufügen
            </LoadingButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
