export interface DailyTimeSlot {
  date: string;  // ISO date string (YYYY-MM-DD)
  from?: string; // Optional time (HH:mm)
  to?: string;   // Optional time (HH:mm)
}

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
} 