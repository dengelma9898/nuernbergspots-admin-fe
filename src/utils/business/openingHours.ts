export const WEEKDAYS = {
  Montag: 'Montag',
  Dienstag: 'Dienstag',
  Mittwoch: 'Mittwoch',
  Donnerstag: 'Donnerstag',
  Freitag: 'Freitag',
  Samstag: 'Samstag',
  Sonntag: 'Sonntag',
} as const;

export type WeekdayKey = keyof typeof WEEKDAYS;

export interface TimeSlot {
  id: string;
  from: string;
  to: string;
  days: WeekdayKey[];
}

export type DetailedOpeningHours = Record<string, Array<{ from: string; to: string }>>;

export function detailedOpeningHoursToTimeSlots(
  detailedOpeningHours: DetailedOpeningHours | undefined
): TimeSlot[] {
  if (!detailedOpeningHours) {
    return [];
  }

  const slots: TimeSlot[] = [];
  Object.entries(detailedOpeningHours).forEach(([day, timeRanges]) => {
    timeRanges.forEach((range, index) => {
      const existingSlot = slots.find(slot => slot.from === range.from && slot.to === range.to);

      if (existingSlot) {
        existingSlot.days.push(day as WeekdayKey);
      } else {
        slots.push({
          id: `${day}-${index}`,
          from: range.from,
          to: range.to,
          days: [day as WeekdayKey],
        });
      }
    });
  });
  return slots;
}

export function timeSlotsToDetailedOpeningHours(timeSlots: TimeSlot[]): DetailedOpeningHours {
  const formatted: DetailedOpeningHours = {};

  timeSlots.forEach(slot => {
    slot.days.forEach(day => {
      if (!formatted[day]) {
        formatted[day] = [];
      }
      formatted[day].push({
        from: slot.from,
        to: slot.to,
      });
    });
  });

  return formatted;
}
