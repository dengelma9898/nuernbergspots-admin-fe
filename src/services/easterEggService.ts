import {
  EasterEgg,
  CreateEasterEggDto,
  UpdateEasterEggDto,
  AddWinnerDto,
  EasterEggFeatureStatus,
  EasterEggStatistics,
} from '../models/easter-egg';
import { useApi } from '../lib/api';

export function useEasterEggService() {
  const api = useApi();
  const baseUrl = '/easter-egg-hunt';

  return {
    /**
     * Lädt den Feature-Status der Ostereiersuche
     */
    getFeatureStatus: async (): Promise<EasterEggFeatureStatus> => {
      return api.getData<EasterEggFeatureStatus>(`${baseUrl}/feature-status`);
    },

    /**
     * Setzt den Feature-Status der Ostereiersuche (nur Admin/Super Admin)
     */
    setFeatureStatus: async (
      isFeatureActive: boolean,
      startDate?: string
    ): Promise<EasterEggFeatureStatus> => {
      return api.putData<EasterEggFeatureStatus>(`${baseUrl}/feature-status`, {
        isFeatureActive,
        startDate,
      });
    },

    /**
     * Lädt alle Ostereier (activeOnly=false für Admin, um alle inkl. inaktive zu laden)
     */
    getAll: async (activeOnly: boolean = false): Promise<EasterEgg[]> => {
      return api.getData<EasterEgg[]>(`${baseUrl}/eggs?activeOnly=${activeOnly}`);
    },

    /**
     * Lädt ein spezifisches Osterei
     */
    getById: async (id: string): Promise<EasterEgg> => {
      return api.getData<EasterEgg>(`${baseUrl}/eggs/${id}`);
    },

    /**
     * Erstellt ein neues Osterei
     */
    create: async (egg: CreateEasterEggDto): Promise<EasterEgg> => {
      return api.postData<EasterEgg>(`${baseUrl}/eggs`, egg);
    },

    /**
     * Aktualisiert ein Osterei
     */
    update: async (id: string, egg: UpdateEasterEggDto): Promise<EasterEgg> => {
      return api.patchData<EasterEgg>(`${baseUrl}/eggs/${id}`, egg);
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

      return api.postData<EasterEgg>(`${baseUrl}/eggs/${id}/image`, formData, {
        isFormData: true,
      });
    },

    /**
     * Fügt einen Gewinner zu einem Osterei hinzu
     */
    addWinner: async (id: string, winnerDto: AddWinnerDto): Promise<EasterEgg> => {
      return api.patchData<EasterEgg>(`${baseUrl}/eggs/${id}/winners`, winnerDto);
    },

    /**
     * Lost Gewinner für ein Osterei aus
     */
    drawWinners: async (id: string): Promise<EasterEgg> => {
      return api.postData<EasterEgg>(`${baseUrl}/eggs/${id}/draw-winners`, {});
    },

    /**
     * Lädt die Teilnehmer eines Ostereis
     */
    getParticipants: async (id: string): Promise<string[]> => {
      return api.getData<string[]>(`${baseUrl}/eggs/${id}/participants`);
    },

    /**
     * Lädt Statistiken zur Ostereiersuche
     */
    getStatistics: async (): Promise<EasterEggStatistics> => {
      return api.getData<EasterEggStatistics>(`${baseUrl}/statistics`);
    },
  };
}
