export interface AppVersion {
  id: string;
  minimumVersion: string; // Format: "X.Y.Z"
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface SetMinimumVersionDto {
  minimumVersion: string; // Format: "X.Y.Z"
}

