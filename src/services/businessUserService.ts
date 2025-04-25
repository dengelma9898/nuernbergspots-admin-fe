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

  }), [api, user?.uid]);
} 