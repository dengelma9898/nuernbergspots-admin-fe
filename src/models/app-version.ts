export interface AppVersion {
  id: string;
  minimumVersion: string; // Format: "X.Y.Z"
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface SetMinimumVersionDto {
  minimumVersion: string; // Format: "X.Y.Z"
}

// Changelog Models
export interface Changelog {
  version: string; // Format: "X.Y.Z"
  content: string; // Markdown content
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface CreateChangelogDto {
  version: string; // Format: "X.Y.Z"
  content: string; // Markdown content
}

export interface UpdateChangelogDto {
  content: string; // Markdown content
}

