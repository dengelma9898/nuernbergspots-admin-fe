import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export interface DowntimeStatus {
  isDowntime: boolean;
}

export function useDowntimeService() {
  const api = useApi();

  return {
    /**
     * Lädt den aktuellen Downtime-Status
     */
    getDowntimeStatus: async (): Promise<DowntimeStatus> => {
      const response = await api.get<ApiResponse<DowntimeStatus>>(endpoints.downtime);
      return unwrapData(response);
    },

    /**
     * Setzt den Downtime-Status
     */
    setDowntimeStatus: async (isDowntime: boolean): Promise<DowntimeStatus> => {
      const response = await api.put<ApiResponse<DowntimeStatus>>(endpoints.downtime, {
        isDowntime,
      });
      return unwrapData(response);
    },
  };
}

