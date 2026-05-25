export interface AdventCalendarEntry {
  id: string;
  number: number;
  canParticipate: boolean;
  isActive: boolean;
  date: string; // ISO 8601 Format
  isSpecial: boolean;
  description: string;
  linkUrl?: string;
  imageUrl?: string;
  winners?: string[]; // Array von User IDs
  participants?: string[]; // Array von User IDs (Teilnehmer)
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdventCalendarEntryDto {
  number: number;
  canParticipate: boolean;
  isActive: boolean;
  date: string; // ISO 8601 Format
  isSpecial: boolean;
  description: string;
  linkUrl?: string;
}

export interface UpdateAdventCalendarEntryDto {
  number?: number;
  canParticipate?: boolean;
  isActive?: boolean;
  date?: string; // ISO 8601 Format
  isSpecial?: boolean;
  description?: string;
  linkUrl?: string;
  imageUrl?: string;
}

export interface AddWinnerDto {
  userId: string;
}

export interface AdventCalendarFeatureStatus {
  isFeatureActive: boolean;
}

export interface AdventCalendarParticipant {
  userId: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  participatedAt: string;
}
