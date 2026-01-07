import { useApi } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import type { AppVersion, SetMinimumVersionDto } from '../models/app-version';

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
  };
}

