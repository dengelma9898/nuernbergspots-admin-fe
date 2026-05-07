import type { BusinessAddress } from './business-address';

export type CuratedSpotStatus = 'PENDING' | 'ACTIVE';

/** Gleiche Struktur wie Partner-Adresse (`BusinessAddressDto`). */
export type CuratedSpotAddress = BusinessAddress;

export interface CuratedSpot {
  id: string;
  name: string;
  nameLower: string;
  descriptionMarkdown: string;
  imageUrls: string[];
  keywordIds: string[];
  /** Pflicht laut API; bei älteren Clients optional bis Migration. */
  address?: CuratedSpotAddress;
  videoUrl: string | null;
  instagramUrl: string | null;
  status: CuratedSpotStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  /** Redaktionsbewertung 1–5; null bis zur ersten Vergabe (siehe Backend-Doku). */
  adminRating?: number | null;
  adminRatedAt?: string | null;
  userRatingAverage?: number | null;
  userRatingCount?: number;
}

export interface CreateCuratedSpotDto {
  name: string;
  descriptionMarkdown: string;
  address: CuratedSpotAddress;
  keywordIds?: string[];
  newKeywordNames?: string[];
  videoUrl?: string | null;
  instagramUrl?: string | null;
  status?: CuratedSpotStatus;
  /** Optional bei Anlage; nur Ganzzahl 1–5. */
  adminRating?: number;
}

export type PatchCuratedSpotDto = Partial<{
  name: string;
  descriptionMarkdown: string;
  address: CuratedSpotAddress;
  keywordIds: string[];
  newKeywordNames: string[];
  videoUrl: string | null;
  instagramUrl: string | null;
  status: CuratedSpotStatus;
  adminRating: number;
}>;

/** Toggle: Endnutzer dürfen Spot-Bewertungen abgeben (GET/PATCH gleicher Pfad). */
export interface CuratedSpotsUserRatingsSettings {
  id: 'curated_spots_user_ratings_settings';
  isEnabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}
