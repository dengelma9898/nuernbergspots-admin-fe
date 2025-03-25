import { UserProfile, BusinessUser } from '../models/users';
import { useApi, endpoints } from '../lib/api';

interface ApiResponse<T> {
  data: T;
}

export function useUserService() {
  const api = useApi();

  // Hilfsfunktion zum Entpacken der Response
  const unwrapData = <T>(response: ApiResponse<T>): T => {
    return response.data;
  };

  return {
    /**
     * Lädt das Profil eines Benutzers
     */
    getUserProfile: async (userId: string): Promise<UserProfile> => {
      const response = await api.get<ApiResponse<UserProfile>>(endpoints.userProfile(userId));
      return unwrapData(response);
    },

    /**
     * Aktualisiert das Profil eines Benutzers
     */
    updateUserProfile: async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.put<ApiResponse<UserProfile>>(endpoints.userProfile(userId), profile);
      return unwrapData(response);
    },

    /**
     * Lädt alle Business-Benutzer
     */
    getBusinessUsers: async (): Promise<BusinessUser[]> => {
      const response = await api.get<ApiResponse<BusinessUser[]>>(endpoints.businessUsers);
      return unwrapData(response);
    },

    /**
     * Lädt einen spezifischen Business-Benutzer
     */
    getBusinessUser: async (userId: string): Promise<BusinessUser> => {
      const response = await api.get<ApiResponse<BusinessUser>>(endpoints.businessUserById(userId));
      return unwrapData(response);
    },

    /**
     * Aktualisiert einen Business-Benutzer
     */
    updateBusinessUser: async (userId: string, user: Partial<BusinessUser>): Promise<BusinessUser> => {
      const response = await api.put<ApiResponse<BusinessUser>>(endpoints.businessUserById(userId), user);
      return unwrapData(response);
    },

    /**
     * Löscht einen Business-Benutzer (Soft Delete)
     */
    deleteBusinessUser: async (userId: string): Promise<void> => {
      return api.delete(endpoints.businessUserById(userId));
    },

    /**
     * Fügt ein Business zu den Favoriten hinzu
     */
    addFavoriteBusiness: async (userId: string, businessId: string): Promise<UserProfile> => {
      const response = await api.post<ApiResponse<UserProfile>>(`${endpoints.userProfile(userId)}/favorites/businesses`, { businessId });
      return unwrapData(response);
    },

    /**
     * Entfernt ein Business aus den Favoriten
     */
    removeFavoriteBusiness: async (userId: string, businessId: string): Promise<void> => {
      return api.delete(`${endpoints.userProfile(userId)}/favorites/businesses/${businessId}`);
    },

    /**
     * Fügt ein Event zu den Favoriten hinzu
     */
    addFavoriteEvent: async (userId: string, eventId: string): Promise<UserProfile> => {
      const response = await api.post<ApiResponse<UserProfile>>(`${endpoints.userProfile(userId)}/favorites/events`, { eventId });
      return unwrapData(response);
    },

    /**
     * Entfernt ein Event aus den Favoriten
     */
    removeFavoriteEvent: async (userId: string, eventId: string): Promise<void> => {
      return api.delete(`${endpoints.userProfile(userId)}/favorites/events/${eventId}`);
    },

    /**
     * Aktualisiert die Benutzereinstellungen
     */
    updatePreferences: async (userId: string, preferences: string[]): Promise<UserProfile> => {
      const response = await api.put<ApiResponse<UserProfile>>(`${endpoints.userProfile(userId)}/preferences`, { preferences });
      return unwrapData(response);
    },
  };
} 