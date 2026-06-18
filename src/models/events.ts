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

/** Request-Body für PATCH /events/bulk/category */
export interface BulkUpdateEventCategoryRequest {
  eventIds: string[];
  categoryId: string;
}

/** Einzelergebnis pro Event beim Bulk-Kategorie-Update */
export interface BulkUpdateEventCategoryItemResult {
  eventId: string;
  success: boolean;
  event?: Event;
  message?: string;
}

/** Gesamtergebnis des Bulk-Kategorie-Updates */
export interface BulkUpdateEventCategoryResult {
  total: number;
  successful: number;
  failed: number;
  results: BulkUpdateEventCategoryItemResult[];
}
