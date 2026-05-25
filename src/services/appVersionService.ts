import { useApi } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import type {
  AppVersion,
  SetMinimumVersionDto,
  Changelog,
  CreateChangelogDto,
  UpdateChangelogDto,
} from '../models/app-version';

export function useAppVersionService() {
  const api = useApi();

  return {
    /**
     * Lädt die aktuelle Mindestversion
     */
    getMinimumVersion: async (): Promise<AppVersion | null> => {
      const response = await api.get<ApiResponse<AppVersion | null>>(
        '/app-versions/admin/minimum-version'
      );
      const data = unwrapData(response);
      return data;
    },

    /**
     * Setzt die Mindestversion
     */
    setMinimumVersion: async (dto: SetMinimumVersionDto): Promise<AppVersion> => {
      const response = await api.post<ApiResponse<AppVersion>>(
        '/app-versions/admin/minimum-version',
        dto
      );
      return unwrapData(response);
    },

    // Changelog Methods

    /**
     * Lädt alle Changelogs sortiert nach Version (absteigend)
     */
    getAllChangelogs: async (): Promise<Changelog[]> => {
      const response = await api.get<ApiResponse<Changelog[]>>('/app-versions/admin/changelogs');
      return unwrapData(response) || [];
    },

    /**
     * Lädt einen Changelog für eine spezifische Version
     */
    getChangelogByVersion: async (version: string): Promise<Changelog | null> => {
      const response = await api.get<ApiResponse<Changelog | null>>(
        `/app-versions/admin/changelogs/${version}`
      );
      return unwrapData(response);
    },

    /**
     * Erstellt einen neuen Changelog
     */
    createChangelog: async (dto: CreateChangelogDto): Promise<Changelog> => {
      const response = await api.post<ApiResponse<Changelog>>(
        '/app-versions/admin/changelogs',
        dto
      );
      return unwrapData(response);
    },

    /**
     * Aktualisiert einen bestehenden Changelog
     */
    updateChangelog: async (version: string, dto: UpdateChangelogDto): Promise<Changelog> => {
      const response = await api.put<ApiResponse<Changelog>>(
        `/app-versions/admin/changelogs/${version}`,
        dto
      );
      return unwrapData(response);
    },

    /**
     * Löscht einen Changelog
     */
    deleteChangelog: async (version: string): Promise<void> => {
      await api.delete<ApiResponse<void>>(`/app-versions/admin/changelogs/${version}`);
    },
  };
}
