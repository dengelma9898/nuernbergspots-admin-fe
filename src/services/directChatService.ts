import { IDirectChatSettings, IUpdateDirectChatSettingsDto } from '@/models/direct-chat';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useDirectChatService() {
  const api = useApi();

  return {
    /**
     * Lädt die DirectChat-Settings
     * Zugriff: Alle authentifizierten User
     */
    getSettings: async (): Promise<IDirectChatSettings> => {
      const response = await api.get<ApiResponse<IDirectChatSettings>>(endpoints.directChatSettings);
      return unwrapData(response);
    },

    /**
     * Aktualisiert die DirectChat-Settings (Feature aktivieren/deaktivieren)
     * Zugriff: Nur super_admin
     */
    updateSettings: async (data: IUpdateDirectChatSettingsDto): Promise<IDirectChatSettings> => {
      const response = await api.patch<ApiResponse<IDirectChatSettings>>(endpoints.directChatSettings, data);
      return unwrapData(response);
    },
  };
}

