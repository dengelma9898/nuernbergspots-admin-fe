import {
  AdventCalendarEntry,
  CreateAdventCalendarEntryDto,
  UpdateAdventCalendarEntryDto,
  AddWinnerDto,
  AdventCalendarFeatureStatus,
} from '../models/advent-calendar';
import { useApi } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useAdventCalendarService() {
  const api = useApi();
  const baseUrl = '/advent-calendar';

  return {
    /**
     * Lädt alle Adventskalender-Einträge
     */
    getAll: async (): Promise<AdventCalendarEntry[]> => {
      const response = await api.get<ApiResponse<AdventCalendarEntry[]>>(baseUrl);
      return unwrapData(response);
    },

    /**
     * Lädt einen spezifischen Adventskalender-Eintrag
     */
    getById: async (id: string): Promise<AdventCalendarEntry> => {
      const response = await api.get<ApiResponse<AdventCalendarEntry>>(`${baseUrl}/${id}`);
      return unwrapData(response);
    },

    /**
     * Erstellt einen neuen Adventskalender-Eintrag
     */
    create: async (entry: CreateAdventCalendarEntryDto): Promise<AdventCalendarEntry> => {
      const response = await api.post<ApiResponse<AdventCalendarEntry>>(baseUrl, entry);
      return unwrapData(response);
    },

    /**
     * Aktualisiert einen Adventskalender-Eintrag
     */
    update: async (
      id: string,
      entry: UpdateAdventCalendarEntryDto
    ): Promise<AdventCalendarEntry> => {
      const response = await api.patch<ApiResponse<AdventCalendarEntry>>(`${baseUrl}/${id}`, entry);
      return unwrapData(response);
    },

    /**
     * Löscht einen Adventskalender-Eintrag
     */
    delete: async (id: string): Promise<void> => {
      await api.delete(`${baseUrl}/${id}`);
    },

    /**
     * Lädt ein Bild für einen Adventskalender-Eintrag hoch
     */
    uploadImage: async (id: string, file: File): Promise<AdventCalendarEntry> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<AdventCalendarEntry>>(
        `${baseUrl}/${id}/image`,
        formData,
        { isFormData: true }
      );

      return unwrapData(response);
    },

    /**
     * Fügt einen Gewinner zu einem Adventskalender-Eintrag hinzu
     */
    addWinner: async (id: string, winnerDto: AddWinnerDto): Promise<AdventCalendarEntry> => {
      const response = await api.patch<ApiResponse<AdventCalendarEntry>>(
        `${baseUrl}/${id}/winners`,
        winnerDto
      );
      return unwrapData(response);
    },

    /**
     * Lädt den Feature-Status des Adventskalenders
     */
    getFeatureStatus: async (): Promise<AdventCalendarFeatureStatus> => {
      const response = await api.get<ApiResponse<AdventCalendarFeatureStatus>>(
        `${baseUrl}/feature-status`
      );
      return unwrapData(response);
    },

    /**
     * Setzt den Feature-Status des Adventskalenders (nur Admin/Super Admin)
     */
    setFeatureStatus: async (isFeatureActive: boolean): Promise<AdventCalendarFeatureStatus> => {
      const response = await api.put<ApiResponse<AdventCalendarFeatureStatus>>(
        `${baseUrl}/feature-status`,
        { isFeatureActive }
      );
      return unwrapData(response);
    },
  };
}
