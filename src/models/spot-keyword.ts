export interface SpotKeyword {
  id: string;
  name: string;
  nameLower: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpotKeywordDto {
  name: string;
}
