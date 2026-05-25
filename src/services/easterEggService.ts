import {
  EasterEgg,
  CreateEasterEggDto,
  UpdateEasterEggDto,
  AddWinnerDto,
  EasterEggFeatureStatus,
  EasterEggStatistics,
} from '../models/easter-egg';
import { useApi } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useEasterEggService() {
  const api = useApi();
  const baseUrl = '/easter-egg-hunt';

  return {
    /**
     * Lädt den Feature-Status der Ostereiersuche
     */
    getFeatureStatus: async (): Promise<EasterEggFeatureStatus> => {
      const response = await api.get<ApiResponse<EasterEggFeatureStatus>>(
        `${baseUrl}/feature-status`
      );
      return unwrapData(response);
    },

    /**
     * Setzt den Feature-Status der Ostereiersuche (nur Admin/Super Admin)
     */
    setFeatureStatus: async (
      isFeatureActive: boolean,
      startDate?: string
    ): Promise<EasterEggFeatureStatus> => {
      const response = await api.put<ApiResponse<EasterEggFeatureStatus>>(
        `${baseUrl}/feature-status`,
        { isFeatureActive, startDate }
      );
      return unwrapData(response);
    },

    /**
     * Lädt alle Ostereier (activeOnly=false für Admin, um alle inkl. inaktive zu laden)
     */
    getAll: async (activeOnly: boolean = false): Promise<EasterEgg[]> => {
      const response = await api.get<ApiResponse<EasterEgg[]>>(
        `${baseUrl}/eggs?activeOnly=${activeOnly}`
      );
      return unwrapData(response);
    },

    /**
     * Lädt ein spezifisches Osterei
     */
    getById: async (id: string): Promise<EasterEgg> => {
      const response = await api.get<ApiResponse<EasterEgg>>(`${baseUrl}/eggs/${id}`);
      return unwrapData(response);
    },

    /**
     * Erstellt ein neues Osterei
     */
    create: async (egg: CreateEasterEggDto): Promise<EasterEgg> => {
      const response = await api.post<ApiResponse<EasterEgg>>(`${baseUrl}/eggs`, egg);
      return unwrapData(response);
    },

    /**
     * Aktualisiert ein Osterei
     */
    update: async (id: string, egg: UpdateEasterEggDto): Promise<EasterEgg> => {
      const response = await api.patch<ApiResponse<EasterEgg>>(`${baseUrl}/eggs/${id}`, egg);
      return unwrapData(response);
    },

    /**
     * Löscht ein Osterei
     */
    delete: async (id: string): Promise<void> => {
      await api.delete(`${baseUrl}/eggs/${id}`);
    },

    /**
     * Lädt ein Bild für ein Osterei hoch
     */
    uploadImage: async (id: string, file: File): Promise<EasterEgg> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<EasterEgg>>(
        `${baseUrl}/eggs/${id}/image`,
        formData,
        { isFormData: true }
      );
      return unwrapData(response);
    },

    /**
     * Fügt einen Gewinner zu einem Osterei hinzu
     */
    addWinner: async (id: string, winnerDto: AddWinnerDto): Promise<EasterEgg> => {
      const response = await api.patch<ApiResponse<EasterEgg>>(
        `${baseUrl}/eggs/${id}/winners`,
        winnerDto
      );
      return unwrapData(response);
    },

    /**
     * Lost Gewinner für ein Osterei aus
     */
    drawWinners: async (id: string): Promise<EasterEgg> => {
      const response = await api.post<ApiResponse<EasterEgg>>(
        `${baseUrl}/eggs/${id}/draw-winners`,
        {}
      );
      return unwrapData(response);
    },

    /**
     * Lädt die Teilnehmer eines Ostereis
     */
    getParticipants: async (id: string): Promise<string[]> => {
      const response = await api.get<ApiResponse<string[]>>(`${baseUrl}/eggs/${id}/participants`);
      return unwrapData(response);
    },

    /**
     * Lädt Statistiken zur Ostereiersuche
     */
    getStatistics: async (): Promise<EasterEggStatistics> => {
      const response = await api.get<ApiResponse<EasterEggStatistics>>(`${baseUrl}/statistics`);
      return unwrapData(response);
    },
  };
}
