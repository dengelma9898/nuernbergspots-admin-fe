import { useState } from 'react';

import {
  TimeSlot,
  WeekdayKey,
  detailedOpeningHoursToTimeSlots,
  DetailedOpeningHours,
} from '@/utils/business/openingHours';

const DEFAULT_NEW_TIME_SLOT: Omit<TimeSlot, 'id'> = {
  from: '09:00',
  to: '18:00',
  days: [],
};

interface UseBusinessTimeSlotsOptions {
  onValidationError: (errors: string[]) => void;
  onClearValidationErrors: () => void;
}

export function useBusinessTimeSlots({
  onValidationError,
  onClearValidationErrors,
}: UseBusinessTimeSlotsOptions) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>(DEFAULT_NEW_TIME_SLOT);

  const initFromDetailedOpeningHours = (detailedOpeningHours: DetailedOpeningHours | undefined) => {
    setTimeSlots(detailedOpeningHoursToTimeSlots(detailedOpeningHours));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.days.length === 0) {
      onValidationError([
        'Bitte wählen Sie mindestens einen Tag aus. Ein Zeitraum muss für mindestens einen Tag gelten.',
      ]);
      return;
    }

    onClearValidationErrors();

    const id = Date.now().toString();
    setTimeSlots(prev => [...prev, { ...newTimeSlot, id }]);
    setNewTimeSlot(DEFAULT_NEW_TIME_SLOT);
  };

  const removeTimeSlot = (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const handleTimeSlotChange = (
    slotId: string,
    field: keyof Omit<TimeSlot, 'id'>,
    value: string | WeekdayKey[]
  ) => {
    setTimeSlots(prev =>
      prev.map(slot => (slot.id === slotId ? { ...slot, [field]: value } : slot))
    );
  };

  const toggleDayForTimeSlot = (day: WeekdayKey, slotId: string) => {
    setTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          const days = slot.days.includes(day)
            ? slot.days.filter(d => d !== day)
            : [...slot.days, day];
          return { ...slot, days };
        }
        return slot;
      })
    );
  };

  const toggleDayForNewTimeSlot = (day: WeekdayKey) => {
    setNewTimeSlot(prev => {
      const days = prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day];
      return { ...prev, days };
    });
  };

  return {
    timeSlots,
    newTimeSlot,
    setNewTimeSlot,
    initFromDetailedOpeningHours,
    addTimeSlot,
    removeTimeSlot,
    handleTimeSlotChange,
    toggleDayForTimeSlot,
    toggleDayForNewTimeSlot,
  };
}
