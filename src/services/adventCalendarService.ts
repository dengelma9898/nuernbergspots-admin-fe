import {
  AdventCalendarEntry,
  CreateAdventCalendarEntryDto,
  UpdateAdventCalendarEntryDto,
  AddWinnerDto,
  AdventCalendarFeatureStatus,
} from '../models/advent-calendar';
import { useApi } from '../lib/api';

export function useAdventCalendarService() {
  const api = useApi();
  const baseUrl = '/advent-calendar';

  return {
    /**
     * Lädt alle Adventskalender-Einträge
     */
    getAll: async (): Promise<AdventCalendarEntry[]> => {
      return api.getData<AdventCalendarEntry[]>(baseUrl);
    },

    /**
     * Lädt einen spezifischen Adventskalender-Eintrag
     */
    getById: async (id: string): Promise<AdventCalendarEntry> => {
      return api.getData<AdventCalendarEntry>(`${baseUrl}/${id}`);
    },

    /**
     * Erstellt einen neuen Adventskalender-Eintrag
     */
    create: async (entry: CreateAdventCalendarEntryDto): Promise<AdventCalendarEntry> => {
      return api.postData<AdventCalendarEntry>(baseUrl, entry);
    },

    /**
     * Aktualisiert einen Adventskalender-Eintrag
     */
    update: async (
      id: string,
      entry: UpdateAdventCalendarEntryDto
    ): Promise<AdventCalendarEntry> => {
      return api.patchData<AdventCalendarEntry>(`${baseUrl}/${id}`, entry);
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

      return api.postData<AdventCalendarEntry>(`${baseUrl}/${id}/image`, formData, {
        isFormData: true,
      });
    },

    /**
     * Fügt einen Gewinner zu einem Adventskalender-Eintrag hinzu
     */
    addWinner: async (id: string, winnerDto: AddWinnerDto): Promise<AdventCalendarEntry> => {
      return api.patchData<AdventCalendarEntry>(`${baseUrl}/${id}/winners`, winnerDto);
    },

    /**
     * Lädt den Feature-Status des Adventskalenders
     */
    getFeatureStatus: async (): Promise<AdventCalendarFeatureStatus> => {
      return api.getData<AdventCalendarFeatureStatus>(`${baseUrl}/feature-status`);
    },

    /**
     * Setzt den Feature-Status des Adventskalenders (nur Admin/Super Admin)
     */
    setFeatureStatus: async (isFeatureActive: boolean): Promise<AdventCalendarFeatureStatus> => {
      return api.putData<AdventCalendarFeatureStatus>(`${baseUrl}/feature-status`, {
        isFeatureActive,
      });
    },
  };
}
