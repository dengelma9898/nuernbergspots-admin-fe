export interface DailyTimeSlot {
  date: string;  // ISO date string (YYYY-MM-DD)
  from?: string; // Optional time (HH:mm)
  to?: string;   // Optional time (HH:mm)
}

export interface Event {
  id: string;
  title: string;
  description?: string;
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
  likeCount?: number;
  interestedCount?: number;
  ticketsNeeded?: boolean;
  price?: number;
  maxParticipants?: number;
  categoryId?: string;
  isPromoted?: boolean;
  dailyTimeSlots: DailyTimeSlot[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  
  // Legacy properties - use dailyTimeSlots instead
  /**
   * @deprecated Verwende dailyTimeSlots stattdessen
   */
  startDate?: string;
  /**
   * @deprecated Verwende dailyTimeSlots stattdessen  
   */
  endDate?: string;
  /**
   * @deprecated Verwende dailyTimeSlots[].from stattdessen
   */
  timeStart?: string;
  /**
   * @deprecated Verwende dailyTimeSlots[].to stattdessen
   */
  timeEnd?: string;
} 