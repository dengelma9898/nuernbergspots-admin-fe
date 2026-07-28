import { UserProfile, BusinessUser, User, BlockUserRequest } from '../models/users';
import { useApi, endpoints } from '../lib/api';
import { useMemo } from 'react';

interface BusinessUsersInReview {
  count: number;
}

export function useUserService() {
  const api = useApi();

  return useMemo(
    () => ({
      /**
       * Lädt die Anzahl der Business-User, die auf Überprüfung warten
       */
      getBusinessUsersInReviewCount: async (): Promise<number> => {
        const result = await api.getData<BusinessUsersInReview>(
          `${endpoints.users}/business-users/needs-review/count`
        );
        return result.count;
      },

      /**
       * Lädt die Anzahl der Business-User, die auf Überprüfung warten
       */
      getBusinessUsersInReview: async (): Promise<BusinessUser[]> => {
        return api.getData<BusinessUser[]>(`${endpoints.users}/business-users/needs-review`);
      },

      /**
       * Lädt das Profil eines Benutzers
       */
      getUserProfile: async (userId: string): Promise<UserProfile> => {
        return api.getData<UserProfile>(endpoints.userProfile(userId));
      },

      /**
       * Aktualisiert das Profil eines Benutzers
       */
      updateUserProfile: async (
        userId: string,
        profile: Partial<UserProfile>
      ): Promise<UserProfile> => {
        return api.putData<UserProfile>(endpoints.userProfile(userId), profile);
      },

      /**
       * Lädt alle Business-Benutzer
       */
      getBusinessUsers: async (): Promise<BusinessUser[]> => {
        return api.getData<BusinessUser[]>(endpoints.businessUsers);
      },

      /**
       * Lädt einen spezifischen Business-Benutzer
       */
      getBusinessUser: async (userId: string): Promise<BusinessUser> => {
        return api.getData<BusinessUser>(endpoints.businessUserById(userId));
      },

      /**
       * Aktualisiert einen Business-Benutzer
       */
      updateBusinessUser: async (
        userId: string,
        user: Partial<BusinessUser>
      ): Promise<BusinessUser> => {
        return api.putData<BusinessUser>(endpoints.businessUserById(userId), user);
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
        return api.postData<UserProfile>(`${endpoints.userProfile(userId)}/favorites/businesses`, {
          businessId,
        });
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
        return api.postData<UserProfile>(`${endpoints.userProfile(userId)}/favorites/events`, {
          eventId,
        });
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
        return api.putData<UserProfile>(`${endpoints.userProfile(userId)}/preferences`, {
          preferences,
        });
      },

      /**
       * Aktualisiert den Review-Status eines Business-Users
       */
      updateBusinessUserReviewStatus: async (
        userId: string,
        needsReview: boolean
      ): Promise<void> => {
        await api.patch(`${endpoints.users}/${userId}/business-profile/needs-review`, {
          needsReview: needsReview,
        });
      },

      /**
       * Blockiert oder entsperrt einen User
       */
      blockUser: async (request: BlockUserRequest): Promise<User> => {
        return api.patchData<User>(`${endpoints.users}/block`, {
          customerId: request.customerId,
          isBlocked: request.isBlocked,
          blockReason: request.blockReason,
        });
      },

      /**
       * Lädt alle User (für Super Admin)
       */
      getAllUsers: async (): Promise<User[]> => {
        return api.getData<User[]>(endpoints.users);
      },

      /**
       * Sucht User nach E-Mail oder Name
       */
      searchUsers: async (query: string): Promise<User[]> => {
        return api.getData<User[]>(`${endpoints.users}/search?q=${encodeURIComponent(query)}`);
      },
    }),
    [api]
  );
}
