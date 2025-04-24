import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { ContactRequest } from '@/models/contact-requests';
import { useAuth } from '../contexts/AuthContext';

export const useContactService = () => {
  const baseUrl = '/contact';
  const api = useApi();
  const { getUserId } = useAuth();

  const getOpenContactRequestsCount = async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(`${baseUrl}/open-requests/count`);
    return response.data;
  };

  const getContactRequests = async (): Promise<ContactRequest[]> => {
    try {
      const response = await api.get<ApiResponse<ContactRequest[]>>(`${baseUrl}`);
      return unwrapData(response);
    } catch (error) {
      console.error('Fehler beim Abrufen der Kontaktanfragen:', error);
      return [];
    }
  };

  const getContactRequestById = async (requestId: string): Promise<ContactRequest> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Kein Benutzer angemeldet');
      }
      
      const response = await api.get<ApiResponse<ContactRequest>>(
        `${baseUrl}/user/${userId}/request/${requestId}`
      );
      return unwrapData(response);
    } catch (error) {
      console.error('Fehler beim Abrufen der Kontaktanfrage:', error);
      throw error;
    }
  };

  const respondToContactRequest = async (requestId: string, message: string): Promise<ContactRequest> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Kein Benutzer angemeldet');
      }

      const response = await api.patch<ApiResponse<ContactRequest>>(
        `${baseUrl}/user/${userId}/request/${requestId}`,
        { message }
      );
      return unwrapData(response);
    } catch (error) {
      console.error('Fehler beim Senden der Antwort:', error);
      throw error;
    }
  };

  return {
    getOpenContactRequestsCount,
    getContactRequests,
    getContactRequestById,
    respondToContactRequest,
  };
}; 