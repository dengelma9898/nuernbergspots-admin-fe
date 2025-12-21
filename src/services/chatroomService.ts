import { Chatroom, CreateChatroomDto, UpdateChatroomDto } from '@/models/chatroom';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { useAuth } from '../contexts/AuthContext';
import { compressImage, isImageTooLarge } from '@/utils/imageUtils';

export function useChatroomService() {
  const api = useApi();
  const { getUserId } = useAuth();

  return {
    /**
     * Lädt alle Chatrooms
     */
    getChatrooms: async (): Promise<Chatroom[]> => {
      const response = await api.get<ApiResponse<Chatroom[]>>(endpoints.chatrooms);
      return unwrapData(response);
    },

    /**
     * Lädt einen spezifischen Chatroom
     */
    getChatroom: async (chatroomId: string): Promise<Chatroom> => {
      const response = await api.get<ApiResponse<Chatroom>>(endpoints.chatroomById(chatroomId));
      return unwrapData(response);
    },

    /**
     * Erstellt einen neuen Chatroom
     */
    createChatroom: async (data: CreateChatroomDto): Promise<Chatroom> => {
      const response = await api.post<ApiResponse<Chatroom>>(endpoints.chatrooms, {
        ...data,
        createdBy: getUserId(),
      });
      return unwrapData(response);
    },

    /**
     * Aktualisiert einen Chatroom
     */
    updateChatroom: async (chatroomId: string, data: UpdateChatroomDto): Promise<Chatroom> => {
      const response = await api.patch<ApiResponse<Chatroom>>(
        endpoints.chatroomById(chatroomId),
        data
      );
      return unwrapData(response);
    },

    /**
     * Löscht einen Chatroom
     */
    deleteChatroom: async (chatroomId: string): Promise<void> => {
      return api.delete(endpoints.chatroomById(chatroomId));
    },

    /**
     * Fügt einen Teilnehmer zum Chatroom hinzu
     */
    addParticipant: async (chatroomId: string, userId: string): Promise<Chatroom> => {
      const response = await api.post<ApiResponse<Chatroom>>(
        endpoints.chatroomParticipants(chatroomId),
        { userId }
      );
      return unwrapData(response);
    },

    /**
     * Entfernt einen Teilnehmer aus dem Chatroom
     */
    removeParticipant: async (chatroomId: string, userId: string): Promise<Chatroom> => {
      const response = await api.delete<ApiResponse<Chatroom>>(
        `${endpoints.chatroomParticipants(chatroomId)}/${userId}`
      );
      return unwrapData(response);
    },

    /**
     * Lädt die letzten Nachrichten eines Chatrooms
     */
    getLastMessages: async (
      chatroomId: string,
      limit: number = 50
    ): Promise<Chatroom['lastMessage'][]> => {
      const response = await api.get<ApiResponse<Chatroom['lastMessage'][]>>(
        `${endpoints.chatroomMessages(chatroomId)}?limit=${limit}`
      );
      return unwrapData(response);
    },

    /**
     * Lädt ein Bild für einen Chatroom hoch
     * Komprimiert das Bild automatisch vor dem Upload
     */
    uploadChatroomImage: async (chatroomId: string, file: File): Promise<string> => {
      // Prüfe Dateigröße (max 5MB vor Komprimierung)
      if (isImageTooLarge(file, 5)) {
        throw new Error('Bild ist zu groß. Maximale Größe: 5 MB');
      }

      // Komprimiere Bild vor Upload (max 1920x1920, Qualität 0.8, max 2MB)
      const compressedFile = await compressImage(file, 1920, 1920, 0.8, 2);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await api.patch<ApiResponse<{ imageUrl: string }>>(
        `${endpoints.chatroomById(chatroomId)}/image`,
        formData,
        { isFormData: true }
      );

      return unwrapData(response).imageUrl;
    },

    /**
     * Entfernt das Bild eines Chatrooms
     */
    removeChatroomImage: async (chatroomId: string): Promise<void> => {
      await api.delete(`${endpoints.chatroomById(chatroomId)}/image`);
    },
  };
}
