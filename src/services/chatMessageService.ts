import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

export interface Reaction {
  userId: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  reactions?: Reaction[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface CreateMessageDto {
  content: string;
  senderId: string;
  senderName: string;
}

export interface UpdateMessageDto {
  content: string;
}

export interface UpdateMessageReactionDto {
  type: ReactionType;
}

export function useChatMessageService() {
  const api = useApi();

  return {
    getMessages: async (chatroomId: string, limit?: number): Promise<ChatMessage[]> => {
      const response = await api.get<ApiResponse<ChatMessage[]>>(
        `${endpoints.chatroomMessages(chatroomId)}${limit ? `?limit=${limit}` : ''}`
      );
      return unwrapData(response);
    },

    createMessage: async (chatroomId: string, data: CreateMessageDto): Promise<ChatMessage> => {
      const response = await api.post<ApiResponse<ChatMessage>>(
        endpoints.chatroomMessages(chatroomId),
        data
      );
      return unwrapData(response);
    },

    updateMessage: async (chatroomId: string, messageId: string, data: UpdateMessageDto): Promise<ChatMessage> => {
      const response = await api.patch<ApiResponse<ChatMessage>>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}`,
        data
      );
      return unwrapData(response);
    },

    deleteMessage: async (chatroomId: string, messageId: string): Promise<void> => {
      await api.delete(`${endpoints.chatroomMessages(chatroomId)}/${messageId}`);
    },

    addReaction: async (chatroomId: string, messageId: string, reaction: UpdateMessageReactionDto): Promise<ChatMessage> => {
      const response = await api.post<ApiResponse<ChatMessage>>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}/reactions`,
        reaction
      );
      return unwrapData(response);
    },

    removeReaction: async (chatroomId: string, messageId: string): Promise<ChatMessage> => {
      const response = await api.delete<ApiResponse<ChatMessage>>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}/reactions`
      );
      return unwrapData(response);
    }
  };
} 