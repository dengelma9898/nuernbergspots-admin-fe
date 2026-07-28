import { useApi, endpoints } from '../lib/api';

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
      return api.getData<DowntimeStatus>(endpoints.downtime);
    },

    /**
     * Setzt den Downtime-Status
     */
    setDowntimeStatus: async (isDowntime: boolean): Promise<DowntimeStatus> => {
      return api.putData<DowntimeStatus>(endpoints.downtime, {
        isDowntime,
      });
    },
  };
}
