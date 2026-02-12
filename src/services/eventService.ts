import { Event } from '../models/events';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

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
      const response = await api.get<ApiResponse<Event[]>>(endpoints.events);
      return unwrapData(response);
    },

    /**
     * Lädt ein spezifisches Event
     */
    getEvent: async (eventId: string): Promise<Event> => {
      const response = await api.get<ApiResponse<Event>>(`${endpoints.events}/${eventId}`);
      return unwrapData(response);
    },

    /**
     * Erstellt ein neues Event
     */
    createEvent: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
      const response = await api.post<ApiResponse<Event>>(endpoints.events, event);
      return unwrapData(response);
    },

    /**
     * Aktualisiert ein Event
     */
    updateEvent: async (eventId: string, event: Partial<Event>): Promise<Event> => {
      const response = await api.patch<ApiResponse<Event>>(`${endpoints.events}/${eventId}`, event);
      return unwrapData(response);
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
      const response = await api.get<ApiResponse<Event[]>>(
        `${endpoints.events}/range?startDate=${startDate}&endDate=${endDate}`
      );
      return unwrapData(response);
    },

    /**
     * Lädt aktuelle Events (die noch nicht beendet sind)
     */
    getCurrentEvents: async (): Promise<Event[]> => {
      const response = await api.get<ApiResponse<Event[]>>(`${endpoints.events}/current`);
      return unwrapData(response);
    },

    /**
     * Lädt Events in der Nähe einer bestimmten Location
     */
    getNearbyEvents: async (
      latitude: number,
      longitude: number,
      radiusKm: number
    ): Promise<Event[]> => {
      const response = await api.get<ApiResponse<Event[]>>(
        `${endpoints.events}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
      );
      return unwrapData(response);
    },

    /**
     * Lädt die beliebtesten Events (basierend auf favoriteCount)
     */
    getPopularEvents: async (limit: number = 10): Promise<Event[]> => {
      const response = await api.get<ApiResponse<Event[]>>(
        `${endpoints.events}/popular?limit=${limit}`
      );
      return unwrapData(response);
    },

    /**
     * Aktualisiert die Bilder eines Events
     */
    updateEventImages: async (eventId: string, imageUrls: string[]): Promise<Event> => {
      const response = await api.put<ApiResponse<Event>>(`${endpoints.events}/${eventId}/images`, {
        imageUrls,
      });
      return unwrapData(response);
    },

    /**
     * Setzt das Titelbild eines Events
     */
    setEventTitleImage: async (eventId: string, titleImageUrl: string): Promise<Event> => {
      const response = await api.put<ApiResponse<Event>>(
        `${endpoints.events}/${eventId}/title-image`,
        {
          titleImageUrl,
        }
      );
      return unwrapData(response);
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

      const response = await api.patch<ApiResponse<{ urls: string[] }>>(
        `${endpoints.events}/${eventId}/images`,
        formData,
        { isFormData: true }
      );

      return unwrapData(response).urls;
    },

    /**
     * Lädt ein einzelnes Bild (Titelbild) für ein Event hoch
     */
    uploadEventTitleImage: async (eventId: string, file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.patch<ApiResponse<{ url: string }>>(
        `${endpoints.events}/${eventId}/title-image`,
        formData,
        { isFormData: true }
      );
      return unwrapData(response).url;
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
     * LLM-basierte Event-Extraktion von einer URL
     * @param url - Die URL der Seite, von der Events extrahiert werden sollen
     * @param useFallback - Ob bei Fehlern auf Puppeteer-Scraper zurückgegriffen werden soll (Standard: true)
     * @returns Array von extrahierten Events
     */
    scrapeEventsWithLlm: async (url: string, useFallback: boolean = true): Promise<Event[]> => {
      const response = await api.post<ApiResponse<{ events: Event[]; hasMorePages: boolean }>>(
        '/events/scrape/llm',
        {
          url,
          useFallback,
        }
      );
      const data = unwrapData(response);
      return data.events;
    },

    /**
     * @deprecated Verwende scrapeEventsWithLlm() stattdessen
     * Generischer Endpunkt zum Scrapen von Events
     */
    async scrapeEventsFromEventFinder(params: {
      type: string;
      category?: string | null;
      startDate: string;
      endDate: string;
      maxResults?: number;
    }): Promise<Event[]> {
      const query = new URLSearchParams(params as any).toString();
      const response = await api.get<ApiResponse<Event[]>>(`/events/scrape?${query}`);
      return unwrapData(response);
    },

    /**
     * Ruft die monatlichen Kosten für LLM-Extraktion ab
     * @returns Kosten-Struktur mit costs, total und currency
     */
    getLlmScrapingCosts: async (): Promise<{
      costs: Record<string, number>;
      total: number;
      currency: string;
    }> => {
      const response = await api.get<
        ApiResponse<{
          costs: Record<string, number>;
          total: number;
          currency: string;
        }>
      >('/events/scrape/llm/costs');
      return unwrapData(response);
    },

    /**
     * Ruft den Token-Verbrauch für LLM-Extraktion ab
     * @returns Token-Struktur mit usage und totals
     */
    getLlmScrapingTokens: async (): Promise<{
      usage: Record<string, { input: number; output: number }>;
      totals: {
        input: number;
        output: number;
        total: number;
      };
    }> => {
      const response = await api.get<
        ApiResponse<{
          usage: Record<string, { input: number; output: number }>;
          totals: {
            input: number;
            output: number;
            total: number;
          };
        }>
      >('/events/scrape/llm/tokens');
      return unwrapData(response);
    },

    /**
     * Importiert Events aus einer CSV-Datei
     * @param file - Die CSV-Datei (.csv, max. 5 MB)
     * @returns Import-Ergebnis mit Zusammenfassung und Details pro Zeile
     */
    importEventsFromCsv: async (file: File): Promise<CsvImportResult> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<CsvImportResult | ApiResponse<CsvImportResult>>(
        `${endpoints.events}/import/csv`,
        formData,
        { isFormData: true }
      );

      // Prüfe ob Response in data-Wrapper ist und unwrappe falls nötig
      let result: CsvImportResult;
      if ((response as any).data && typeof (response as any).data === 'object') {
        result = unwrapData(response as ApiResponse<CsvImportResult>);
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
