import { useApi, endpoints } from '../lib/api';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
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
  editedByAdmin?: boolean;
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
      return api.getData<ChatMessage[]>(
        `${endpoints.chatroomMessages(chatroomId)}${limit ? `?limit=${limit}` : ''}`
      );
    },

    createMessage: async (chatroomId: string, data: CreateMessageDto): Promise<ChatMessage> => {
      return api.postData<ChatMessage>(endpoints.chatroomMessages(chatroomId), data);
    },

    updateMessage: async (
      chatroomId: string,
      messageId: string,
      data: UpdateMessageDto
    ): Promise<ChatMessage> => {
      return api.patchData<ChatMessage>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}`,
        data
      );
    },

    deleteMessage: async (chatroomId: string, messageId: string): Promise<void> => {
      await api.delete(`${endpoints.chatroomMessages(chatroomId)}/${messageId}`);
    },

    adminUpdateMessage: async (
      chatroomId: string,
      messageId: string,
      data: UpdateMessageDto
    ): Promise<ChatMessage> => {
      return api.patchData<ChatMessage>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}/admin`,
        data
      );
    },

    adminDeleteMessage: async (chatroomId: string, messageId: string): Promise<void> => {
      await api.delete(`${endpoints.chatroomMessages(chatroomId)}/${messageId}/admin`);
    },

    addReaction: async (
      chatroomId: string,
      messageId: string,
      reaction: UpdateMessageReactionDto
    ): Promise<ChatMessage> => {
      return api.postData<ChatMessage>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}/reactions`,
        reaction
      );
    },

    removeReaction: async (chatroomId: string, messageId: string): Promise<ChatMessage> => {
      return api.deleteData<ChatMessage>(
        `${endpoints.chatroomMessages(chatroomId)}/${messageId}/reactions`
      );
    },
  };
}
