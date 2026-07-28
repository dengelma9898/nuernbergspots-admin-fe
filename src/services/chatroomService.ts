import { Chatroom, CreateChatroomDto, UpdateChatroomDto } from '@/models/chatroom';
import { useApi, endpoints } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { validateImageFile } from '@/utils/fileValidationUtils';

export function useChatroomService() {
  const api = useApi();
  const { getUserId } = useAuth();

  return {
    /**
     * Lädt alle Chatrooms
     */
    getChatrooms: async (): Promise<Chatroom[]> => {
      const data = await api.getData<Chatroom[]>(endpoints.chatrooms);
      return Array.isArray(data) ? data : [];
    },

    /**
     * Lädt einen spezifischen Chatroom
     */
    getChatroom: async (chatroomId: string): Promise<Chatroom> => {
      return api.getData<Chatroom>(endpoints.chatroomById(chatroomId));
    },

    /**
     * Erstellt einen neuen Chatroom
     */
    createChatroom: async (data: CreateChatroomDto): Promise<Chatroom> => {
      return api.postData<Chatroom>(endpoints.chatrooms, {
        ...data,
        createdBy: getUserId(),
      });
    },

    /**
     * Aktualisiert einen Chatroom
     */
    updateChatroom: async (chatroomId: string, data: UpdateChatroomDto): Promise<Chatroom> => {
      return api.patchData<Chatroom>(endpoints.chatroomById(chatroomId), data);
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
      return api.postData<Chatroom>(endpoints.chatroomParticipants(chatroomId), { userId });
    },

    /**
     * Entfernt einen Teilnehmer aus dem Chatroom
     */
    removeParticipant: async (chatroomId: string, userId: string): Promise<Chatroom> => {
      return api.deleteData<Chatroom>(`${endpoints.chatroomParticipants(chatroomId)}/${userId}`);
    },

    /**
     * Lädt die letzten Nachrichten eines Chatrooms
     */
    getLastMessages: async (
      chatroomId: string,
      limit: number = 50
    ): Promise<Chatroom['lastMessage'][]> => {
      return api.getData<Chatroom['lastMessage'][]>(
        `${endpoints.chatroomMessages(chatroomId)}?limit=${limit}`
      );
    },

    /**
     * Lädt ein Bild für einen Chatroom hoch
     * Validiert die Datei vor dem Upload (max 1 MB für Chatrooms)
     */
    uploadChatroomImage: async (chatroomId: string, file: File): Promise<string> => {
      // Validiere Datei vor Upload (max 1 MB für Chatrooms)
      const validation = validateImageFile(file, 1);
      if (!validation.isValid && validation.error) {
        const error = new Error(validation.error.message);
        (error as any).validationError = validation.error;
        throw error;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.patchData<{ imageUrl: string }>(
        `${endpoints.chatroomById(chatroomId)}/image`,
        formData,
        { isFormData: true }
      );

      return response.imageUrl;
    },

    /**
     * Entfernt das Bild eines Chatrooms
     */
    removeChatroomImage: async (chatroomId: string): Promise<void> => {
      await api.delete(`${endpoints.chatroomById(chatroomId)}/image`);
    },
  };
}
