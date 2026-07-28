import { useApi } from '../lib/api';
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
      return api.getData<AppVersion | null>('/app-versions/admin/minimum-version');
    },

    /**
     * Setzt die Mindestversion
     */
    setMinimumVersion: async (dto: SetMinimumVersionDto): Promise<AppVersion> => {
      return api.postData<AppVersion>('/app-versions/admin/minimum-version', dto);
    },

    // Changelog Methods

    /**
     * Lädt alle Changelogs sortiert nach Version (absteigend)
     */
    getAllChangelogs: async (): Promise<Changelog[]> => {
      const data = await api.getData<Changelog[]>('/app-versions/admin/changelogs');
      return data || [];
    },

    /**
     * Lädt einen Changelog für eine spezifische Version
     */
    getChangelogByVersion: async (version: string): Promise<Changelog | null> => {
      return api.getData<Changelog | null>(`/app-versions/admin/changelogs/${version}`);
    },

    /**
     * Erstellt einen neuen Changelog
     */
    createChangelog: async (dto: CreateChangelogDto): Promise<Changelog> => {
      return api.postData<Changelog>('/app-versions/admin/changelogs', dto);
    },

    /**
     * Aktualisiert einen bestehenden Changelog
     */
    updateChangelog: async (version: string, dto: UpdateChangelogDto): Promise<Changelog> => {
      return api.putData<Changelog>(`/app-versions/admin/changelogs/${version}`, dto);
    },

    /**
     * Löscht einen Changelog
     */
    deleteChangelog: async (version: string): Promise<void> => {
      await api.deleteData<void>(`/app-versions/admin/changelogs/${version}`);
    },
  };
}
