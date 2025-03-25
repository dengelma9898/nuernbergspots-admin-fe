import { Event } from '../models/events';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

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
      const response = await api.put<ApiResponse<Event>>(`${endpoints.events}/${eventId}`, event);
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
      const response = await api.get<ApiResponse<Event[]>>(`${endpoints.events}/range?startDate=${startDate}&endDate=${endDate}`);
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
    getNearbyEvents: async (latitude: number, longitude: number, radiusKm: number): Promise<Event[]> => {
      const response = await api.get<ApiResponse<Event[]>>(`${endpoints.events}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`);
      return unwrapData(response);
    },

    /**
     * Lädt die beliebtesten Events (basierend auf favoriteCount)
     */
    getPopularEvents: async (limit: number = 10): Promise<Event[]> => {
      const response = await api.get<ApiResponse<Event[]>>(`${endpoints.events}/popular?limit=${limit}`);
      return unwrapData(response);
    },

    /**
     * Aktualisiert die Bilder eines Events
     */
    updateEventImages: async (eventId: string, imageUrls: string[]): Promise<Event> => {
      const response = await api.put<ApiResponse<Event>>(`${endpoints.events}/${eventId}/images`, {
        imageUrls
      });
      return unwrapData(response);
    },

    /**
     * Setzt das Titelbild eines Events
     */
    setEventTitleImage: async (eventId: string, titleImageUrl: string): Promise<Event> => {
      const response = await api.put<ApiResponse<Event>>(`${endpoints.events}/${eventId}/title-image`, {
        titleImageUrl
      });
      return unwrapData(response);
    }
  };
} 