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
}>;
