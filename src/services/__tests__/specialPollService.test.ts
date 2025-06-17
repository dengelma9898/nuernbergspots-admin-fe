// Special Poll Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    specialPolls: '/special-polls',
    specialPollById: (id: string) => `/special-polls/${id}`,
  },
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn((response) => response.data),
}));

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useMemo: jest.fn((fn) => fn()),
}));

import { useSpecialPollService } from '../specialPollService';
import { SpecialPollStatus } from '@/models/specialPoll';

describe('Special Poll Service', () => {
  let specialPollService: ReturnType<typeof useSpecialPollService>;

  beforeEach(() => {
    jest.clearAllMocks();
    specialPollService = useSpecialPollService();
  });

  describe('getSpecialPolls', () => {
    it('should fetch all special polls successfully', async () => {
      const mockPolls = [
        { 
          id: '1', 
          question: 'What is your favorite cuisine?', 
          status: 'active',
          responses: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        { 
          id: '2', 
          question: 'Best time for events?', 
          status: 'draft',
          responses: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
      ];
      mockApi.get.mockResolvedValue({ data: mockPolls });

      const result = await specialPollService.getSpecialPolls();

      expect(mockApi.get).toHaveBeenCalledWith('/special-polls');
      expect(result).toEqual(mockPolls);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(specialPollService.getSpecialPolls()).rejects.toThrow('Network error');
    });
  });

  describe('getSpecialPoll', () => {
    it('should fetch a specific special poll', async () => {
      const mockPoll = { 
        id: '1', 
        question: 'What is your favorite cuisine?', 
        status: 'active',
        responses: [
          { id: '1', text: 'Italian', votes: 5 },
          { id: '2', text: 'Asian', votes: 3 }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      mockApi.get.mockResolvedValue({ data: mockPoll });

      const result = await specialPollService.getSpecialPoll('1');

      expect(mockApi.get).toHaveBeenCalledWith('/special-polls/1');
      expect(result).toEqual(mockPoll);
    });

    it('should handle poll not found', async () => {
      mockApi.get.mockRejectedValue(new Error('Poll not found'));

      await expect(specialPollService.getSpecialPoll('999')).rejects.toThrow('Poll not found');
    });
  });

  describe('createSpecialPoll', () => {
    it('should create a new special poll', async () => {
      const pollData = {
        title: 'What is your favorite activity?'
      };
      const createdPoll = { 
        id: '1', 
        title: 'What is your favorite activity?',
        status: 'ACTIVE' as const,
        responses: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      mockApi.post.mockResolvedValue({ data: createdPoll });

      const result = await specialPollService.createSpecialPoll(pollData);

      expect(mockApi.post).toHaveBeenCalledWith('/special-polls', pollData);
      expect(result).toEqual(createdPoll);
    });

    it('should handle creation errors', async () => {
      const pollData = {
        title: 'Test question?'
      };
      mockApi.post.mockRejectedValue(new Error('Creation failed'));

      await expect(specialPollService.createSpecialPoll(pollData)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateSpecialPollStatus', () => {
    it('should update poll status', async () => {
      const statusData = { status: SpecialPollStatus.ACTIVE };
      const updatedPoll = { 
        id: '1', 
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        responses: [],
        updatedAt: '2024-01-02'
      };
      mockApi.patch.mockResolvedValue({ data: updatedPoll });

      const result = await specialPollService.updateSpecialPollStatus('1', statusData);

      expect(mockApi.patch).toHaveBeenCalledWith('/special-polls/1/status', statusData);
      expect(result).toEqual(updatedPoll);
    });

    it('should handle status update errors', async () => {
      const statusData = { status: SpecialPollStatus.ACTIVE };
      mockApi.patch.mockRejectedValue(new Error('Status update failed'));

      await expect(specialPollService.updateSpecialPollStatus('1', statusData))
        .rejects.toThrow('Status update failed');
    });
  });

  describe('addResponse', () => {
    it('should add a response to poll', async () => {
      const responseText = 'New response option';
      const updatedPoll = { 
        id: '1', 
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        responses: [
          { userId: '1', userName: 'User1', response: 'Existing response', createdAt: '2024-01-01' },
          { userId: '2', userName: 'User2', response: 'New response option', createdAt: '2024-01-01' }
        ]
      };
      mockApi.post.mockResolvedValue({ data: updatedPoll });

      const result = await specialPollService.addResponse('1', responseText);

      expect(mockApi.post).toHaveBeenCalledWith('/special-polls/1/responses', { response: responseText });
      expect(result).toEqual(updatedPoll);
    });

    it('should handle add response errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Add response failed'));

      await expect(specialPollService.addResponse('1', 'Test response'))
        .rejects.toThrow('Add response failed');
    });
  });

  describe('removeResponse', () => {
    it('should remove a response from poll', async () => {
      const updatedPoll = { 
        id: '1', 
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        responses: []
      };
      mockApi.delete.mockResolvedValue({ data: updatedPoll });

      const result = await specialPollService.removeResponse('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/special-polls/1/responses');
      expect(result).toEqual(updatedPoll);
    });

    it('should handle remove response errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Remove response failed'));

      await expect(specialPollService.removeResponse('1'))
        .rejects.toThrow('Remove response failed');
    });
  });

  describe('removeSpecialPoll', () => {
    it('should delete a special poll', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await specialPollService.removeSpecialPoll('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/special-polls/1');
    });

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(specialPollService.removeSpecialPoll('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('updateResponses', () => {
    it('should update all responses for a poll', async () => {
      const responses = [
        { userId: '1', userName: 'User1', response: 'Updated response 1', createdAt: '2024-01-01' },
        { userId: '2', userName: 'User2', response: 'Updated response 2', createdAt: '2024-01-01' },
        { userId: '3', userName: 'User3', response: 'New response 3', createdAt: '2024-01-01' }
      ];
      const updatedPoll = { 
        id: '1', 
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        responses
      };
      mockApi.patch.mockResolvedValue({ data: updatedPoll });

      const result = await specialPollService.updateResponses('1', responses);

      expect(mockApi.patch).toHaveBeenCalledWith('/special-polls/1/responses', { responses });
      expect(result).toEqual(updatedPoll);
    });

    it('should handle empty responses array', async () => {
      const responses: any[] = [];
      const updatedPoll = { 
        id: '1', 
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        responses: []
      };
      mockApi.patch.mockResolvedValue({ data: updatedPoll });

      const result = await specialPollService.updateResponses('1', responses);

      expect(mockApi.patch).toHaveBeenCalledWith('/special-polls/1/responses', { responses: [] });
      expect(result).toEqual(updatedPoll);
    });

    it('should handle update responses errors', async () => {
      const responses = [{ userId: '1', userName: 'User1', response: 'Test', createdAt: '2024-01-01' }];
      mockApi.patch.mockRejectedValue(new Error('Update responses failed'));

      await expect(specialPollService.updateResponses('1', responses))
        .rejects.toThrow('Update responses failed');
    });
  });

  describe('edge cases', () => {
    it('should handle very long poll titles', async () => {
      const longTitle = 'What is your opinion on '.repeat(100) + '?';
      const pollData = {
        title: longTitle
      };
      const createdPoll = { 
        id: '1', 
        title: longTitle,
        status: SpecialPollStatus.ACTIVE,
        responses: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      mockApi.post.mockResolvedValue({ data: createdPoll });

      const result = await specialPollService.createSpecialPoll(pollData);

      expect(result.title).toBe(longTitle);
    });

    it('should handle unicode characters in poll titles', async () => {
      const unicodeTitle = 'Was ist Ihr Lieblings-Café? 🍽️☕';
      const pollData = {
        title: unicodeTitle
      };
      const createdPoll = { 
        id: '1', 
        title: unicodeTitle,
        status: SpecialPollStatus.ACTIVE,
        responses: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      mockApi.post.mockResolvedValue({ data: createdPoll });

      const result = await specialPollService.createSpecialPoll(pollData);

      expect(result.title).toBe(unicodeTitle);
    });

    it('should handle multiple status transitions', async () => {
      // Pending -> Active
      const statusData1 = { status: SpecialPollStatus.ACTIVE };
      const updatedPoll1 = { id: '1', status: SpecialPollStatus.ACTIVE };
      mockApi.patch.mockResolvedValueOnce({ data: updatedPoll1 });

      await specialPollService.updateSpecialPollStatus('1', statusData1);

      // Active -> Closed
      const statusData2 = { status: SpecialPollStatus.CLOSED };
      const updatedPoll2 = { id: '1', status: SpecialPollStatus.CLOSED };
      mockApi.patch.mockResolvedValueOnce({ data: updatedPoll2 });

      const result = await specialPollService.updateSpecialPollStatus('1', statusData2);

      expect(mockApi.patch).toHaveBeenCalledTimes(2);
      expect(result.status).toBe(SpecialPollStatus.CLOSED);
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.get.mockRejectedValue(new Error('Request timeout'));

      await expect(specialPollService.getSpecialPolls()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Internal server error'));

      await expect(specialPollService.createSpecialPoll({
        title: 'Test?'
      })).rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.patch.mockRejectedValue(new Error('Unauthorized'));

      await expect(specialPollService.updateSpecialPollStatus('1', { status: SpecialPollStatus.ACTIVE }))
        .rejects.toThrow('Unauthorized');
    });
  });
}); 