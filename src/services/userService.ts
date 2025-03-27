import { UserProfile, BusinessUser } from '../models/users';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { useMemo } from 'react';

interface BusinessUsersInReview {
  count: number;
}

export function useUserService() {
  const api = useApi();

  return useMemo(() => ({
    /**
     * Lädt die Anzahl der Business-User, die auf Überprüfung warten
     */
    getBusinessUsersInReviewCount: async (): Promise<number> => {
      const response = await api.get<ApiResponse<BusinessUsersInReview>>(`${endpoints.users}/business-users/needs-review/count`);
      const result = unwrapData(response);
      return result.count;
    },

        /**
     * Lädt die Anzahl der Business-User, die auf Überprüfung warten
     */
    getBusinessUsersInReview: async (): Promise<BusinessUser[]> => {
        const response = await api.get<ApiResponse<BusinessUser[]>>(`${endpoints.users}/business-users/needs-review`);
        return unwrapData(response);
    },

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

    /**
     * Aktualisiert den Review-Status eines Business-Users
     */
    updateBusinessUserReviewStatus: async (userId: string, needsReview: boolean): Promise<void> => {
      await api.patch(`${endpoints.users}/${userId}/business-profile/needs-review`, {
        needsReview: needsReview,
      });
    },
  }), [api]);
} 