import {
  Event,
  BulkUpdateEventCategoryRequest,
  BulkUpdateEventCategoryResult,
} from '../models/events';
import { useApi, endpoints } from '../lib/api';

/**
 * Ergebnis eines CSV-Imports
 */
export interface CsvImportResult {
  totalRows: number;
  successful: number;
  failed: number;
  skipped: number;
  results: CsvImportRowResult[];
}

/**
 * Ergebnis pro CSV-Zeile
 */
export interface CsvImportRowResult {
  rowIndex: number;
  success: boolean;
  eventId?: string;
  skipped?: boolean;
  duplicateEventId?: string;
  errors: CsvImportError[];
}

/**
 * Fehler pro CSV-Zeile
 */
export interface CsvImportError {
  rowIndex: number;
  field?: string;
  message: string;
  value?: unknown;
}

export function useEventService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Events
     */
    getEvents: async (): Promise<Event[]> => {
      return api.getData<Event[]>(endpoints.events);
    },

    /**
     * Lädt alle ausstehenden Events (nur admin / super_admin).
     */
    getPendingEvents: async (): Promise<Event[]> => {
      return api.getData<Event[]>(`${endpoints.events}/pending`);
    },

    /**
     * Freigabe: PENDING → ACTIVE (nur admin / super_admin).
     */
    approveEvent: async (eventId: string): Promise<Event> => {
      return api.patchData<Event>(`${endpoints.events}/${eventId}/approve`, {});
    },

    /**
     * Lädt ein spezifisches Event
     */
    getEvent: async (eventId: string): Promise<Event> => {
      return api.getData<Event>(`${endpoints.events}/${eventId}`);
    },

    /**
     * Erstellt ein neues Event
     */
    createEvent: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
      return api.postData<Event>(endpoints.events, event);
    },

    /**
     * Aktualisiert ein Event
     */
    updateEvent: async (eventId: string, event: Partial<Event>): Promise<Event> => {
      return api.patchData<Event>(`${endpoints.events}/${eventId}`, event);
    },

    /**
     * Löscht ein Event
     */
    deleteEvent: async (eventId: string): Promise<void> => {
      return api.delete(`${endpoints.events}/${eventId}`);
    },

    /**
     * Lädt Events für einen bestimmten Zeitraum
     */
    getEventsByDateRange: async (startDate: string, endDate: string): Promise<Event[]> => {
      return api.getData<Event[]>(
        `${endpoints.events}/range?startDate=${startDate}&endDate=${endDate}`
      );
    },

    /**
     * Lädt aktuelle Events (die noch nicht beendet sind)
     */
    getCurrentEvents: async (): Promise<Event[]> => {
      return api.getData<Event[]>(`${endpoints.events}/current`);
    },

    /**
     * Lädt Events in der Nähe einer bestimmten Location
     */
    getNearbyEvents: async (
      latitude: number,
      longitude: number,
      radiusKm: number
    ): Promise<Event[]> => {
      return api.getData<Event[]>(
        `${endpoints.events}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
      );
    },

    /**
     * Lädt die beliebtesten Events (basierend auf favoriteCount)
     */
    getPopularEvents: async (limit: number = 10): Promise<Event[]> => {
      return api.getData<Event[]>(`${endpoints.events}/popular?limit=${limit}`);
    },

    /**
     * Aktualisiert die Bilder eines Events
     */
    updateEventImages: async (eventId: string, imageUrls: string[]): Promise<Event> => {
      return api.putData<Event>(`${endpoints.events}/${eventId}/images`, {
        imageUrls,
      });
    },

    /**
     * Setzt das Titelbild eines Events
     */
    setEventTitleImage: async (eventId: string, titleImageUrl: string): Promise<Event> => {
      return api.putData<Event>(`${endpoints.events}/${eventId}/title-image`, {
        titleImageUrl,
      });
    },

    /**
     * Lädt Bilder für ein Event hoch
     */
    uploadEventImages: async (eventId: string, files: File[]): Promise<string[]> => {
      const formData = new FormData();
      console.log('Uploading files:', files);
      files.forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.type, file.size);
        formData.append('images', file);
      });

      const response = await api.patchData<{ urls: string[] }>(
        `${endpoints.events}/${eventId}/images`,
        formData,
        { isFormData: true }
      );

      return response.urls;
    },

    /**
     * Lädt ein einzelnes Bild (Titelbild) für ein Event hoch
     */
    uploadEventTitleImage: async (eventId: string, file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.patchData<{ url: string }>(
        `${endpoints.events}/${eventId}/title-image`,
        formData,
        { isFormData: true }
      );
      return response.url;
    },

    /**
     * Entfernt ein Bild von einem Event
     */
    removeEventImage: async (eventId: string, imageUrl: string): Promise<void> => {
      await api.patch(`${endpoints.events}/${eventId}/images/remove`, {
        imageUrl,
      });
    },

    /**
     * Weist mehreren Events dieselbe Kategorie zu (nur admin / super_admin).
     */
    bulkUpdateCategory: async (
      payload: BulkUpdateEventCategoryRequest
    ): Promise<BulkUpdateEventCategoryResult> => {
      return api.patchData<BulkUpdateEventCategoryResult>(
        `${endpoints.events}/bulk/category`,
        payload
      );
    },

    /**
     * Importiert Events aus einer CSV-Datei
     * @param file - Die CSV-Datei (.csv, max. 5 MB)
     * @returns Import-Ergebnis mit Zusammenfassung und Details pro Zeile
     */
    importEventsFromCsv: async (file: File): Promise<CsvImportResult> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<CsvImportResult | { data: CsvImportResult }>(
        `${endpoints.events}/import/csv`,
        formData,
        { isFormData: true }
      );

      // Prüfe ob Response in data-Wrapper ist und unwrappe falls nötig
      let result: CsvImportResult;
      if (response && typeof response === 'object' && 'data' in response) {
        result = response.data;
      } else {
        result = response as CsvImportResult;
      }

      // Stelle sicher, dass results immer ein Array ist
      return {
        totalRows: result.totalRows || 0,
        successful: result.successful || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        results: Array.isArray(result.results) ? result.results : [],
      };
    },
  };
}
