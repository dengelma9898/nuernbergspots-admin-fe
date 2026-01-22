import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { BusinessEventsSettings } from '../models/business-events-settings';
import { useMemo } from 'react';

export function useBusinessEventsSettingsService() {
  const api = useApi();

  return useMemo(
    () => ({
      /**
       * Lädt die aktuellen Business Events Settings
       */
      getBusinessEventsSettings: async (): Promise<BusinessEventsSettings | null> => {
        try {
          const response = await api.get<ApiResponse<BusinessEventsSettings>>(
            endpoints.businessEventsSettings
          );
          return unwrapData(response);
        } catch (error) {
          // Wenn die API null zurückgibt oder ein Fehler auftritt, geben wir null zurück
          // null wird als false behandelt
          return null;
        }
      },

      /**
       * Aktualisiert die Business Events Settings
       */
      updateBusinessEventsSettings: async (
        isEnabled: boolean
      ): Promise<BusinessEventsSettings> => {
        const response = await api.patch<ApiResponse<BusinessEventsSettings>>(
          endpoints.businessEventsSettings,
          { isEnabled }
        );
        return unwrapData(response);
      },
    }),
    [api]
  );
}
