import { useApi } from '../lib/api';
import { ContactRequest } from '@/models/contact-requests';
import { useAuth } from '../contexts/AuthContext';

export const useContactService = () => {
  const baseUrl = '/contact';
  const api = useApi();
  const { getUserId } = useAuth();

  const getOpenContactRequestsCount = async (): Promise<number> => {
    return api.getData<number>(`${baseUrl}/open-requests/count`);
  };

  const getContactRequests = async (): Promise<ContactRequest[]> => {
    try {
      return await api.getData<ContactRequest[]>(`${baseUrl}`);
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

      return await api.getData<ContactRequest>(`${baseUrl}/user/${userId}/request/${requestId}`);
    } catch (error) {
      console.error('Fehler beim Abrufen der Kontaktanfrage:', error);
      throw error;
    }
  };

  const respondToContactRequest = async (
    requestId: string,
    message: string
  ): Promise<ContactRequest> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('Kein Benutzer angemeldet');
      }

      return await api.patchData<ContactRequest>(`${baseUrl}/user/${userId}/request/${requestId}`, {
        message,
      });
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
