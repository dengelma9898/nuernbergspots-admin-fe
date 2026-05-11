export interface DailyTimeSlot {
  date: string; // ISO date string (YYYY-MM-DD)
  from?: string; // Optional time (HH:mm)
  to?: string; // Optional time (HH:mm)
}

export type EventModerationStatus = 'ACTIVE' | 'PENDING';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  titleImageUrl?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
  favoriteCount?: number;
  ticketsNeeded?: boolean;
  price?: number;
  priceString?: string;
  categoryId?: string;
  isPromoted?: boolean;
  /** Freigabe-Status; fehlend entspricht ACTIVE (Backend-Abwärtskompatibilität). */
  status?: EventModerationStatus;
  dailyTimeSlots: DailyTimeSlot[];
  /**
   * Monat und Jahr für Events ohne genaues Datum.
   * Format: mm.yyyy (z.B. "02.2026")
   * Kann gleichzeitig mit dailyTimeSlots existieren.
   * Priorität: dailyTimeSlots > monthYear
   */
  monthYear?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  /**
   * @deprecated Verwende dailyTimeSlots!
   */
  startDate?: string;
}
