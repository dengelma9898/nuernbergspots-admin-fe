import { Chatroom, CreateChatroomDto, UpdateChatroomDto } from '@/models/chatroom';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { useAuth } from '../contexts/AuthContext';

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
        createdBy: getUserId()
      });
      return unwrapData(response);
    },

    /**
     * Aktualisiert einen Chatroom
     */
    updateChatroom: async (chatroomId: string, data: UpdateChatroomDto): Promise<Chatroom> => {
      const response = await api.patch<ApiResponse<Chatroom>>(endpoints.chatroomById(chatroomId), data);
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
    getLastMessages: async (chatroomId: string, limit: number = 50): Promise<Chatroom['lastMessage'][]> => {
      const response = await api.get<ApiResponse<Chatroom['lastMessage'][]>>(
        `${endpoints.chatroomMessages(chatroomId)}?limit=${limit}`
      );
      return unwrapData(response);
    },

    /**
     * Lädt ein Bild für einen Chatroom hoch
     */
    uploadChatroomImage: async (chatroomId: string, file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      
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
    }
  };
} 