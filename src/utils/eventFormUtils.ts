import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { DailyTimeSlot } from '@/models/events';
import { NewEventFormState } from '@/components/events/event-form/types';

export function generateDailyTimeSlots(startDate: string, endDate: string): DailyTimeSlot[] {
  if (!startDate || !endDate) {
    return [];
  }

  const days = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  return days.map(day => ({
    date: format(day, 'yyyy-MM-dd'),
    from: undefined,
    to: undefined,
  }));
}

export function updateTimeSlotInForm(
  slots: DailyTimeSlot[],
  date: string,
  field: 'from' | 'to',
  value: string
): DailyTimeSlot[] {
  return slots.map(slot => (slot.date === date ? { ...slot, [field]: value } : slot));
}

export function buildCreateEventPayload(newEvent: NewEventFormState) {
  return {
    ...newEvent,
    location: {
      address: newEvent.address,
      latitude: newEvent.latitude,
      longitude: newEvent.longitude,
    },
  };
}

export function buildCopyEventPayload(newEvent: NewEventFormState) {
  const { startDate: _startDate, endDate: _endDate, price: _price, ...eventData } = newEvent;

  return {
    ...eventData,
    address: newEvent.address,
    latitude: newEvent.latitude,
    longitude: newEvent.longitude,
    priceString: newEvent.priceString || undefined,
  };
}

export async function urlToFile(url: string, filename: string): Promise<File> {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  } catch (error) {
    throw new Error('CORS_ERROR: Image cannot be loaded directly. Backend proxy needed.', {
      cause: error,
    });
  }
}

export function isValidEventLocation(
  address: string,
  latitude: number,
  longitude: number
): boolean {
  return (
    Boolean(address && address.trim()) &&
    latitude !== undefined &&
    latitude !== null &&
    latitude !== 0 &&
    longitude !== undefined &&
    longitude !== null &&
    longitude !== 0
  );
}

export function formatEventPriceString(
  priceString: string | null | undefined,
  price: number | null | undefined
): string | null {
  if (priceString) {
    return priceString;
  }
  if (price !== undefined && price !== null) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
  return null;
}
