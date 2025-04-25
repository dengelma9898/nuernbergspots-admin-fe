import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export interface BusinessUser {
  id: string;
  email: string;
  businessIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  needsReview: boolean;
  eventIds?: string[];
  contactRequestIds?: string[];
}

export function useBusinessUserService() {
  const api = useApi();
  const { user } = useAuth();

  return useMemo(() => ({
    /**
     * Lädt alle Business-User für den eingeloggten Benutzer
     */
    getBusinessUsers: async (): Promise<BusinessUser[]> => {
      if (!user?.uid) {
        throw new Error('Kein eingeloggter Benutzer gefunden');
      }
      
      const response = await api.get<ApiResponse<BusinessUser[]>>(`/users/${user.uid}/business-users`);
      return unwrapData(response);
    },

    getBusinessUser: async (businessUserId: string): Promise<BusinessUser> => {
        const response = await api.get<ApiResponse<BusinessUser>>(`/users/${businessUserId}/profile`);
        return unwrapData(response);
    },

    /**
     * Fügt ein Geschäft zu einem Business-User hinzu
     */
    addBusinessToUser: async (businessUserId: string, businessId: string): Promise<void> => {
      if (!user?.uid) {
        throw new Error('Kein eingeloggter Benutzer gefunden');
      }

      await api.post(`/users/${businessUserId}/business-user/businesses/${businessId}`, {});
    }
  }), [api, user?.uid]);
} 