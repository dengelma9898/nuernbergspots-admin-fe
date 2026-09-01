import type { Mock } from 'vitest';
// Chat Message Service Tests

// Mock API
const mockApi = {
  getData: vi.fn(),
  postData: vi.fn(),
  patchData: vi.fn(),
  putData: vi.fn(),
  deleteData: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    chatroomMessages: (chatroomId: string) => `/chatrooms/${chatroomId}/messages`,
  },
}));

import { useChatMessageService, ReactionType } from '../chatMessageService';

describe('Chat Message Service', () => {
  let chatMessageService: ReturnType<typeof useChatMessageService>;

  beforeEach(() => {
    vi.clearAllMocks();
    chatMessageService = useChatMessageService();
  });

  describe('getMessages', () => {
    it('should fetch messages for a chatroom successfully', async () => {
      const mockMessages = [
        {
          id: '1',
          senderId: 'user1',
          senderName: 'John Doe',
          content: 'Hello everyone!',
          reactions: [],
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          senderId: 'user2',
          senderName: 'Jane Smith',
          content: 'Hi there!',
          reactions: [{ userId: 'user1', type: 'like' }],
          createdAt: '2024-01-01T10:01:00Z',
          updatedAt: '2024-01-01T10:01:00Z',
        },
      ];
      mockApi.getData.mockResolvedValue(mockMessages);

      const result = await chatMessageService.getMessages('chatroom1');

      expect(mockApi.getData).toHaveBeenCalledWith('/chatrooms/chatroom1/messages');
      expect(result).toEqual(mockMessages);
    });

    it('should fetch messages with limit', async () => {
      const mockMessages = [
        {
          id: '1',
          senderId: 'user1',
          senderName: 'John Doe',
          content: 'Hello!',
          reactions: [],
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
        },
      ];
      mockApi.getData.mockResolvedValue(mockMessages);

      const result = await chatMessageService.getMessages('chatroom1', 10);

      expect(mockApi.getData).toHaveBeenCalledWith('/chatrooms/chatroom1/messages?limit=10');
      expect(result).toEqual(mockMessages);
    });

    it('should handle API errors', async () => {
      mockApi.getData.mockRejectedValue(new Error('Network error'));

      await expect(chatMessageService.getMessages('chatroom1')).rejects.toThrow('Network error');
    });
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const messageData = {
        content: 'New message content',
        senderId: 'user1',
        senderName: 'John Doe',
      };
      const createdMessage = {
        id: '1',
        ...messageData,
        reactions: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };
      mockApi.postData.mockResolvedValue(createdMessage);

      const result = await chatMessageService.createMessage('chatroom1', messageData);

      expect(mockApi.postData).toHaveBeenCalledWith('/chatrooms/chatroom1/messages', messageData);
      expect(result).toEqual(createdMessage);
    });

    it('should handle creation errors', async () => {
      const messageData = {
        content: 'Test message',
        senderId: 'user1',
        senderName: 'John Doe',
      };
      mockApi.postData.mockRejectedValue(new Error('Creation failed'));

      await expect(chatMessageService.createMessage('chatroom1', messageData)).rejects.toThrow(
        'Creation failed'
      );
    });
  });

  describe('updateMessage', () => {
    it('should update an existing message', async () => {
      const updateData = { content: 'Updated message content' };
      const updatedMessage = {
        id: '1',
        senderId: 'user1',
        senderName: 'John Doe',
        content: 'Updated message content',
        reactions: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:05:00Z',
        editedAt: '2024-01-01T10:05:00Z',
      };
      mockApi.patchData.mockResolvedValue(updatedMessage);

      const result = await chatMessageService.updateMessage('chatroom1', 'message1', updateData);

      expect(mockApi.patchData).toHaveBeenCalledWith(
        '/chatrooms/chatroom1/messages/message1',
        updateData
      );
      expect(result).toEqual(updatedMessage);
    });

    it('should handle update errors', async () => {
      const updateData = { content: 'Updated content' };
      mockApi.patchData.mockRejectedValue(new Error('Update failed'));

      await expect(
        chatMessageService.updateMessage('chatroom1', 'message1', updateData)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await chatMessageService.deleteMessage('chatroom1', 'message1');

      expect(mockApi.delete).toHaveBeenCalledWith('/chatrooms/chatroom1/messages/message1');
    });

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(chatMessageService.deleteMessage('chatroom1', 'message1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('adminUpdateMessage', () => {
    it('should update any message as admin', async () => {
      const updateData = { content: 'Admin updated message content' };
      const updatedMessage = {
        id: '1',
        senderId: 'user1',
        senderName: 'John Doe',
        content: 'Admin updated message content',
        reactions: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:05:00Z',
        editedAt: '2024-01-01T10:05:00Z',
      };
      mockApi.patchData.mockResolvedValue(updatedMessage);

      const result = await chatMessageService.adminUpdateMessage(
        'chatroom1',
        'message1',
        updateData
      );

      expect(mockApi.patchData).toHaveBeenCalledWith(
        '/chatrooms/chatroom1/messages/message1/admin',
        updateData
      );
      expect(result).toEqual(updatedMessage);
    });

    it('should handle admin update errors', async () => {
      const updateData = { content: 'Updated content' };
      mockApi.patchData.mockRejectedValue(new Error('Admin update failed'));

      await expect(
        chatMessageService.adminUpdateMessage('chatroom1', 'message1', updateData)
      ).rejects.toThrow('Admin update failed');
    });
  });

  describe('adminDeleteMessage', () => {
    it('should delete any message as admin', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await chatMessageService.adminDeleteMessage('chatroom1', 'message1');

      expect(mockApi.delete).toHaveBeenCalledWith('/chatrooms/chatroom1/messages/message1/admin');
    });

    it('should handle admin delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Admin delete failed'));

      await expect(chatMessageService.adminDeleteMessage('chatroom1', 'message1')).rejects.toThrow(
        'Admin delete failed'
      );
    });
  });

  describe('addReaction', () => {
    it('should add a reaction to a message', async () => {
      const reactionData = { type: ReactionType.LIKE };
      const updatedMessage = {
        id: '1',
        senderId: 'user1',
        senderName: 'John Doe',
        content: 'Test message',
        reactions: [{ userId: 'user2', type: 'like' }],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:01:00Z',
      };
      mockApi.postData.mockResolvedValue(updatedMessage);

      const result = await chatMessageService.addReaction('chatroom1', 'message1', reactionData);

      expect(mockApi.postData).toHaveBeenCalledWith(
        '/chatrooms/chatroom1/messages/message1/reactions',
        reactionData
      );
      expect(result).toEqual(updatedMessage);
    });

    it('should handle different reaction types', async () => {
      const reactionTypes = [
        ReactionType.LIKE,
        ReactionType.LOVE,
        ReactionType.LAUGH,
        ReactionType.WOW,
        ReactionType.SAD,
        ReactionType.ANGRY,
      ];

      for (const type of reactionTypes) {
        const reactionData = { type };
        const updatedMessage = {
          id: '1',
          reactions: [{ userId: 'user1', type }],
        };
        mockApi.postData.mockResolvedValue(updatedMessage);

        const result = await chatMessageService.addReaction('chatroom1', 'message1', reactionData);

        expect(result.reactions).toContainEqual({ userId: 'user1', type });
      }
    });

    it('should handle add reaction errors', async () => {
      const reactionData = { type: ReactionType.LIKE };
      mockApi.postData.mockRejectedValue(new Error('Add reaction failed'));

      await expect(
        chatMessageService.addReaction('chatroom1', 'message1', reactionData)
      ).rejects.toThrow('Add reaction failed');
    });
  });

  describe('removeReaction', () => {
    it('should remove a reaction from a message', async () => {
      const updatedMessage = {
        id: '1',
        senderId: 'user1',
        senderName: 'John Doe',
        content: 'Test message',
        reactions: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:01:00Z',
      };
      mockApi.deleteData.mockResolvedValue(updatedMessage);

      const result = await chatMessageService.removeReaction('chatroom1', 'message1');

      expect(mockApi.deleteData).toHaveBeenCalledWith(
        '/chatrooms/chatroom1/messages/message1/reactions'
      );
      expect(result).toEqual(updatedMessage);
    });

    it('should handle remove reaction errors', async () => {
      mockApi.deleteData.mockRejectedValue(new Error('Remove reaction failed'));

      await expect(chatMessageService.removeReaction('chatroom1', 'message1')).rejects.toThrow(
        'Remove reaction failed'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long message content', async () => {
      const longContent = 'This is a very long message. '.repeat(1000);
      const messageData = {
        content: longContent,
        senderId: 'user1',
        senderName: 'John Doe',
      };
      const createdMessage = {
        id: '1',
        ...messageData,
        reactions: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };
      mockApi.postData.mockResolvedValue(createdMessage);

      const result = await chatMessageService.createMessage('chatroom1', messageData);

      expect(result.content).toBe(longContent);
    });

    it('should handle unicode characters in messages', async () => {
      const unicodeContent = 'Hello! 👋 Café ☕ Résumé 📄 🎉';
      const messageData = {
        content: unicodeContent,
        senderId: 'user1',
        senderName: 'John Doe',
      };
      const createdMessage = {
        id: '1',
        ...messageData,
        reactions: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };
      mockApi.postData.mockResolvedValue(createdMessage);

      const result = await chatMessageService.createMessage('chatroom1', messageData);

      expect(result.content).toBe(unicodeContent);
    });

    it('should handle empty message content', async () => {
      const messageData = {
        content: '',
        senderId: 'user1',
        senderName: 'John Doe',
      };
      mockApi.postData.mockRejectedValue(new Error('Message content cannot be empty'));

      await expect(chatMessageService.createMessage('chatroom1', messageData)).rejects.toThrow(
        'Message content cannot be empty'
      );
    });

    it('should handle multiple reactions on same message', async () => {
      const updatedMessage = {
        id: '1',
        content: 'Popular message',
        reactions: [
          { userId: 'user1', type: 'like' },
          { userId: 'user2', type: 'love' },
          { userId: 'user3', type: 'laugh' },
          { userId: 'user4', type: 'wow' },
        ],
      };
      mockApi.postData.mockResolvedValue(updatedMessage);

      const result = await chatMessageService.addReaction('chatroom1', 'message1', {
        type: ReactionType.LIKE,
      });

      expect(result.reactions).toHaveLength(4);
      expect(result.reactions).toContainEqual({ userId: 'user1', type: 'like' });
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.getData.mockRejectedValue(new Error('Request timeout'));

      await expect(chatMessageService.getMessages('chatroom1')).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Internal server error'));

      await expect(
        chatMessageService.createMessage('chatroom1', {
          content: 'Test',
          senderId: 'user1',
          senderName: 'John',
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.patchData.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        chatMessageService.updateMessage('chatroom1', 'message1', { content: 'New content' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should handle message not found', async () => {
      mockApi.patchData.mockRejectedValue(new Error('Message not found'));

      await expect(
        chatMessageService.updateMessage('chatroom1', 'nonexistent', { content: 'Update' })
      ).rejects.toThrow('Message not found');
    });

    it('should handle chatroom not found', async () => {
      mockApi.getData.mockRejectedValue(new Error('Chatroom not found'));

      await expect(chatMessageService.getMessages('nonexistent')).rejects.toThrow(
        'Chatroom not found'
      );
    });
  });

  describe('ReactionType enum', () => {
    it('should have all expected reaction types', () => {
      expect(ReactionType.LIKE).toBe('like');
      expect(ReactionType.LOVE).toBe('love');
      expect(ReactionType.LAUGH).toBe('laugh');
      expect(ReactionType.WOW).toBe('wow');
      expect(ReactionType.SAD).toBe('sad');
      expect(ReactionType.ANGRY).toBe('angry');
    });
  });
});
