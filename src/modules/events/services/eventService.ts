import { Event } from '@/modules/events/models';
import { useApi, endpoints } from '@/lib/api';
import { ApiResponse, unwrapData } from '@/lib/apiUtils';
import { 
  mapLegacyEventToModern, 
  mapLegacyEventsToModern,
  mapModernEventToAPI,
  validateEventForAPI,
  isLegacyEventAPI,
  type LegacyEventAPI 
} from './eventApiMapper';

export function useEventService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Events
     */
    getEvents: async (): Promise<Event[]> => {
      const response = await api.get<ApiResponse<LegacyEventAPI[]>>(endpoints.events);
      const legacyEvents = unwrapData(response);
      return mapLegacyEventsToModern(legacyEvents);
    },

    /**
     * Lädt ein spezifisches Event
     */
    getEvent: async (eventId: string): Promise<Event> => {
      const response = await api.get<ApiResponse<LegacyEventAPI>>(`${endpoints.events}/${eventId}`);
      const legacyEvent = unwrapData(response);
      return mapLegacyEventToModern(legacyEvent);
    },

    /**
     * Erstellt ein neues Event
     */
    createEvent: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
      // Validate event before sending to API
      const validationErrors = validateEventForAPI(event);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const apiPayload = mapModernEventToAPI(event);
      const response = await api.post<ApiResponse<LegacyEventAPI>>(endpoints.events, apiPayload);
      const createdEvent = unwrapData(response);
      return mapLegacyEventToModern(createdEvent);
    },

    /**
     * Aktualisiert ein Event
     */
    updateEvent: async (eventId: string, event: Partial<Event>): Promise<Event> => {
      // Validate event update before sending to API
      if (Object.keys(event).length > 0) {
        const validationErrors = validateEventForAPI(event);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
      }

      const apiPayload = mapModernEventToAPI(event);
      const response = await api.patch<ApiResponse<LegacyEventAPI>>(`${endpoints.events}/${eventId}`, apiPayload);
      const updatedEvent = unwrapData(response);
      return mapLegacyEventToModern(updatedEvent);
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
      const response = await api.get<ApiResponse<LegacyEventAPI[]>>(`${endpoints.events}/range?startDate=${startDate}&endDate=${endDate}`);
      const legacyEvents = unwrapData(response);
      return mapLegacyEventsToModern(legacyEvents);
    },

    /**
     * Lädt aktuelle Events (die noch nicht beendet sind)
     */
    getCurrentEvents: async (): Promise<Event[]> => {
      const response = await api.get<ApiResponse<LegacyEventAPI[]>>(`${endpoints.events}/current`);
      const legacyEvents = unwrapData(response);
      return mapLegacyEventsToModern(legacyEvents);
    },

    /**
     * Lädt Events in der Nähe einer bestimmten Location
     */
    getNearbyEvents: async (latitude: number, longitude: number, radiusKm: number): Promise<Event[]> => {
      const response = await api.get<ApiResponse<LegacyEventAPI[]>>(`${endpoints.events}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`);
      const legacyEvents = unwrapData(response);
      return mapLegacyEventsToModern(legacyEvents);
    },

    /**
     * Lädt die beliebtesten Events (basierend auf likeCount und interestedCount)
     */
    getPopularEvents: async (limit: number = 10): Promise<Event[]> => {
      const response = await api.get<ApiResponse<LegacyEventAPI[]>>(`${endpoints.events}/popular?limit=${limit}`);
      const legacyEvents = unwrapData(response);
      return mapLegacyEventsToModern(legacyEvents);
    },

    /**
     * Aktualisiert die Bilder eines Events
     */
    updateEventImages: async (eventId: string, imageUrls: string[]): Promise<Event> => {
      const response = await api.put<ApiResponse<LegacyEventAPI>>(`${endpoints.events}/${eventId}/images`, {
        imageUrls
      });
      const updatedEvent = unwrapData(response);
      return mapLegacyEventToModern(updatedEvent);
    },

    /**
     * Setzt das Titelbild eines Events
     */
    setEventTitleImage: async (eventId: string, titleImageUrl: string): Promise<Event> => {
      const response = await api.put<ApiResponse<LegacyEventAPI>>(`${endpoints.events}/${eventId}/title-image`, {
        titleImageUrl
      });
      const updatedEvent = unwrapData(response);
      return mapLegacyEventToModern(updatedEvent);
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
        imageUrl
      });
    },

    /**
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
      const response = await api.get<ApiResponse<LegacyEventAPI[]>>(`/events/scrape?${query}`);
      const legacyEvents = unwrapData(response);
      return mapLegacyEventsToModern(legacyEvents);
    },

    /**
     * Lädt Events basierend auf Filtern (modernisierte Suchfunktion)
     */
    searchEvents: async (filters: {
      search?: string;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
      limit?: number;
      offset?: number;
    }): Promise<{ events: Event[]; total: number }> => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get<ApiResponse<{ events: LegacyEventAPI[]; total: number }>>(
        `${endpoints.events}/search?${queryParams.toString()}`
      );
      
      const data = unwrapData(response);
      
      return {
        events: mapLegacyEventsToModern(data.events),
        total: data.total
      };
    },

    /**
     * Lädt Events mit Pagination
     */
    getEventsPaginated: async (page: number = 1, limit: number = 20): Promise<{ events: Event[]; total: number; hasMore: boolean }> => {
      const offset = (page - 1) * limit;
      const response = await api.get<ApiResponse<{ events: LegacyEventAPI[]; total: number }>>(
        `${endpoints.events}?limit=${limit}&offset=${offset}`
      );
      
      const data = unwrapData(response);
      const events = mapLegacyEventsToModern(data.events);
      
      return {
        events,
        total: data.total,
        hasMore: offset + limit < data.total
      };
    }
  };
} 