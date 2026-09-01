import type { Mock } from 'vitest';
// Chatroom Service Tests

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

// Mock Auth Context
const mockAuth = {
  getUserId: vi.fn(),
};

vi.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    chatrooms: '/chatrooms',
    chatroomById: (id: string) => `/chatrooms/${id}`,
    chatroomParticipants: (id: string) => `/chatrooms/${id}/participants`,
    chatroomMessages: (id: string) => `/chatrooms/${id}/messages`,
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

import { useChatroomService } from '../chatroomService';

describe('Chatroom Service', () => {
  let chatroomService: ReturnType<typeof useChatroomService>;

  beforeEach(() => {
    vi.clearAllMocks();
    chatroomService = useChatroomService();
    mockAuth.getUserId.mockReturnValue('user123');
  });

  describe('getChatrooms', () => {
    it('should fetch all chatrooms successfully', async () => {
      const mockChatrooms = [
        { id: '1', name: 'Chatroom 1', description: 'Test chatroom 1' },
        { id: '2', name: 'Chatroom 2', description: 'Test chatroom 2' },
      ];
      mockApi.getData.mockResolvedValue(mockChatrooms);

      const result = await chatroomService.getChatrooms();

      expect(mockApi.getData).toHaveBeenCalledWith('/chatrooms');
      expect(result).toEqual(mockChatrooms);
    });

    it('should handle API errors', async () => {
      mockApi.getData.mockRejectedValue(new Error('Network error'));

      await expect(chatroomService.getChatrooms()).rejects.toThrow('Network error');
    });
  });

  describe('getChatroom', () => {
    it('should fetch a specific chatroom', async () => {
      const mockChatroom = { id: '1', name: 'Test Chatroom', description: 'Test description' };
      mockApi.getData.mockResolvedValue(mockChatroom);

      const result = await chatroomService.getChatroom('1');

      expect(mockApi.getData).toHaveBeenCalledWith('/chatrooms/1');
      expect(result).toEqual(mockChatroom);
    });
  });

  describe('createChatroom', () => {
    it('should create a new chatroom', async () => {
      const chatroomData = {
        title: 'New Chatroom',
        description: 'New description',
        participants: [],
      };
      const createdChatroom = {
        id: '1',
        ...chatroomData,
        createdBy: 'user123',
        createdAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdChatroom);

      const result = await chatroomService.createChatroom(chatroomData);

      expect(mockApi.postData).toHaveBeenCalledWith('/chatrooms', {
        ...chatroomData,
        createdBy: 'user123',
      });
      expect(result).toEqual(createdChatroom);
    });
  });

  describe('updateChatroom', () => {
    it('should update an existing chatroom', async () => {
      const updateData = { title: 'Updated Chatroom' };
      const updatedChatroom = { id: '1', title: 'Updated Chatroom', description: 'Test' };
      mockApi.patchData.mockResolvedValue(updatedChatroom);

      const result = await chatroomService.updateChatroom('1', updateData);

      expect(mockApi.patchData).toHaveBeenCalledWith('/chatrooms/1', updateData);
      expect(result).toEqual(updatedChatroom);
    });
  });

  describe('deleteChatroom', () => {
    it('should delete a chatroom', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await chatroomService.deleteChatroom('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/chatrooms/1');
    });
  });

  describe('addParticipant', () => {
    it('should add a participant to chatroom', async () => {
      const updatedChatroom = {
        id: '1',
        name: 'Test Chatroom',
        participants: ['user123', 'user456'],
      };
      mockApi.postData.mockResolvedValue(updatedChatroom);

      const result = await chatroomService.addParticipant('1', 'user456');

      expect(mockApi.postData).toHaveBeenCalledWith('/chatrooms/1/participants', {
        userId: 'user456',
      });
      expect(result).toEqual(updatedChatroom);
    });
  });

  describe('removeParticipant', () => {
    it('should remove a participant from chatroom', async () => {
      const updatedChatroom = {
        id: '1',
        name: 'Test Chatroom',
        participants: ['user123'],
      };
      mockApi.deleteData.mockResolvedValue(updatedChatroom);

      const result = await chatroomService.removeParticipant('1', 'user456');

      expect(mockApi.deleteData).toHaveBeenCalledWith('/chatrooms/1/participants/user456');
      expect(result).toEqual(updatedChatroom);
    });
  });

  describe('getLastMessages', () => {
    it('should fetch last messages with default limit', async () => {
      const mockMessages = [
        { id: '1', content: 'Message 1', senderId: 'user1' },
        { id: '2', content: 'Message 2', senderId: 'user2' },
      ];
      mockApi.getData.mockResolvedValue(mockMessages);

      const result = await chatroomService.getLastMessages('1');

      expect(mockApi.getData).toHaveBeenCalledWith('/chatrooms/1/messages?limit=50');
      expect(result).toEqual(mockMessages);
    });

    it('should fetch last messages with custom limit', async () => {
      const mockMessages = [{ id: '1', content: 'Message 1', senderId: 'user1' }];
      mockApi.getData.mockResolvedValue(mockMessages);

      const result = await chatroomService.getLastMessages('1', 10);

      expect(mockApi.getData).toHaveBeenCalledWith('/chatrooms/1/messages?limit=10');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('uploadChatroomImage', () => {
    it('should upload chatroom image', async () => {
      const mockFile = new File(['test'], 'chatroom.jpg', { type: 'image/jpeg' });
      const mockImageUrl = 'https://example.com/chatroom.jpg';
      mockApi.patchData.mockResolvedValue({ imageUrl: mockImageUrl });

      const result = await chatroomService.uploadChatroomImage('1', mockFile);

      expect(mockApi.patchData).toHaveBeenCalledWith('/chatrooms/1/image', expect.any(FormData), {
        isFormData: true,
      });
      expect(result).toBe(mockImageUrl);
    });
  });

  describe('removeChatroomImage', () => {
    it('should remove chatroom image', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await chatroomService.removeChatroomImage('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/chatrooms/1/image');
    });
  });

  describe('error handling', () => {
    it('should handle create chatroom errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Creation failed'));

      await expect(
        chatroomService.createChatroom({ title: 'Test', description: 'Test', participants: [] })
      ).rejects.toThrow('Creation failed');
    });

    it('should handle add participant errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Add participant failed'));

      await expect(chatroomService.addParticipant('1', 'user456')).rejects.toThrow(
        'Add participant failed'
      );
    });

    it('should handle remove participant errors', async () => {
      mockApi.deleteData.mockRejectedValue(new Error('Remove participant failed'));

      await expect(chatroomService.removeParticipant('1', 'user456')).rejects.toThrow(
        'Remove participant failed'
      );
    });

    it('should handle image upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockApi.patchData.mockRejectedValue(new Error('Upload failed'));

      await expect(chatroomService.uploadChatroomImage('1', mockFile)).rejects.toThrow(
        'Upload failed'
      );
    });
  });

  describe('authentication integration', () => {
    it('should use current user ID when creating chatroom', async () => {
      const chatroomData = { title: 'Test', description: 'Test', participants: [] };
      const createdChatroom = { id: '1', ...chatroomData, createdBy: 'user123' };
      mockApi.postData.mockResolvedValue(createdChatroom);

      await chatroomService.createChatroom(chatroomData);

      expect(mockAuth.getUserId).toHaveBeenCalled();
      expect(mockApi.postData).toHaveBeenCalledWith('/chatrooms', {
        ...chatroomData,
        createdBy: 'user123',
      });
    });
  });
});
