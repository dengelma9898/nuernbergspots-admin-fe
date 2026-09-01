// Special Poll Service Tests

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

vi.mock('../../lib/api', async () => ({
  useApi: () => mockApi,
  endpoints: {
    specialPolls: (opts?: { highlighted?: boolean }) =>
      opts?.highlighted === true ? '/special-polls?highlighted=true' : '/special-polls',
    specialPollById: (id: string) => `/special-polls/${id}`,
    specialPollHighlight: (id: string) => `/special-polls/${id}/highlight`,
    specialPollResponseUpvote: (pollId: string, responseId: string) =>
      `/special-polls/${pollId}/responses/${encodeURIComponent(responseId)}/upvote`,
    specialPollResponsesMe: (pollId: string) => `/special-polls/${pollId}/responses/me`,
  },
}));

vi.mock('react', async () => ({
  ...(await vi.importActual('react')),
  useMemo: vi.fn(fn => fn()),
}));

import { SpecialPollResponse, SpecialPollStatus } from '@/models/specialPoll';

import { useSpecialPollService } from '../specialPollService';

describe('Special Poll Service', () => {
  let specialPollService: ReturnType<typeof useSpecialPollService>;

  beforeEach(() => {
    vi.clearAllMocks();
    specialPollService = useSpecialPollService();
  });

  describe('getSpecialPolls', () => {
    it('should fetch all special polls successfully', async () => {
      const mockPolls = [
        {
          id: '1',
          title: 'What is your favorite cuisine?',
          status: SpecialPollStatus.ACTIVE,
          isHighlighted: false,
          responses: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Best time for events?',
          status: SpecialPollStatus.PENDING,
          isHighlighted: true,
          responses: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockApi.getData.mockResolvedValue(mockPolls);

      const result = await specialPollService.getSpecialPolls();

      expect(mockApi.getData).toHaveBeenCalledWith('/special-polls');
      expect(result).toEqual(mockPolls);
    });

    it('should fetch highlighted polls when requested', async () => {
      mockApi.getData.mockResolvedValue([]);

      await specialPollService.getSpecialPolls({ highlighted: true });

      expect(mockApi.getData).toHaveBeenCalledWith('/special-polls?highlighted=true');
    });

    it('should handle API errors', async () => {
      mockApi.getData.mockRejectedValue(new Error('Network error'));

      await expect(specialPollService.getSpecialPolls()).rejects.toThrow('Network error');
    });
  });

  describe('getSpecialPoll', () => {
    it('should fetch a specific special poll', async () => {
      const mockPoll = {
        id: '1',
        title: 'What is your favorite cuisine?',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [
          {
            id: 'r1',
            userId: 'u1',
            userName: 'A',
            response: 'Italian',
            createdAt: '2024-01-01',
            upvotedUserIds: ['x'],
          },
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.getData.mockResolvedValue(mockPoll);

      const result = await specialPollService.getSpecialPoll('1');

      expect(mockApi.getData).toHaveBeenCalledWith('/special-polls/1');
      expect(result).toEqual(mockPoll);
    });

    it('should handle poll not found', async () => {
      mockApi.getData.mockRejectedValue(new Error('Poll not found'));

      await expect(specialPollService.getSpecialPoll('999')).rejects.toThrow('Poll not found');
    });
  });

  describe('createSpecialPoll', () => {
    it('should create a new special poll', async () => {
      const pollData = {
        title: 'What is your favorite activity?',
        isHighlighted: true,
      };
      const createdPoll = {
        id: '1',
        title: 'What is your favorite activity?',
        status: SpecialPollStatus.PENDING,
        isHighlighted: true,
        responses: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdPoll);

      const result = await specialPollService.createSpecialPoll(pollData);

      expect(mockApi.postData).toHaveBeenCalledWith('/special-polls', pollData);
      expect(result).toEqual(createdPoll);
    });

    it('should handle creation errors', async () => {
      const pollData = {
        title: 'Test question?',
      };
      mockApi.postData.mockRejectedValue(new Error('Creation failed'));

      await expect(specialPollService.createSpecialPoll(pollData)).rejects.toThrow(
        'Creation failed'
      );
    });
  });

  describe('updateSpecialPollStatus', () => {
    it('should update poll status', async () => {
      const statusData = { status: SpecialPollStatus.ACTIVE };
      const updatedPoll = {
        id: '1',
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [],
        updatedAt: '2024-01-02',
        createdAt: '2024-01-01',
      };
      mockApi.patchData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.updateSpecialPollStatus('1', statusData);

      expect(mockApi.patchData).toHaveBeenCalledWith('/special-polls/1/status', statusData);
      expect(result).toEqual(updatedPoll);
    });

    it('should handle status update errors', async () => {
      const statusData = { status: SpecialPollStatus.ACTIVE };
      mockApi.patchData.mockRejectedValue(new Error('Status update failed'));

      await expect(specialPollService.updateSpecialPollStatus('1', statusData)).rejects.toThrow(
        'Status update failed'
      );
    });
  });

  describe('updateSpecialPollHighlight', () => {
    it('should patch highlight endpoint', async () => {
      const body = { isHighlighted: true };
      const updatedPoll = {
        id: '1',
        title: 'T',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: true,
        responses: [],
        createdAt: '',
        updatedAt: '',
      };
      mockApi.patchData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.updateSpecialPollHighlight('1', body);

      expect(mockApi.patchData).toHaveBeenCalledWith('/special-polls/1/highlight', body);
      expect(result).toEqual(updatedPoll);
    });
  });

  describe('addResponse', () => {
    it('should add a response to poll', async () => {
      const responseText = 'New response option';
      const updatedPoll = {
        id: '1',
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [] as SpecialPollResponse[],
      };
      mockApi.postData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.addResponse('1', responseText);

      expect(mockApi.postData).toHaveBeenCalledWith('/special-polls/1/responses', {
        response: responseText,
      });
      expect(result).toEqual(updatedPoll);
    });

    it('should handle add response errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Add response failed'));

      await expect(specialPollService.addResponse('1', 'Test response')).rejects.toThrow(
        'Add response failed'
      );
    });
  });

  describe('removeResponse', () => {
    it('should DELETE own response via responses/me', async () => {
      const updatedPoll = {
        id: '1',
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [],
        createdAt: '',
        updatedAt: '',
      };
      mockApi.deleteData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.removeResponse('1');

      expect(mockApi.deleteData).toHaveBeenCalledWith('/special-polls/1/responses/me');
      expect(result).toEqual(updatedPoll);
    });

    it('should handle remove response errors', async () => {
      mockApi.deleteData.mockRejectedValue(new Error('Remove response failed'));

      await expect(specialPollService.removeResponse('1')).rejects.toThrow(
        'Remove response failed'
      );
    });
  });

  describe('upvoteResponse', () => {
    it('should POST upvote endpoint with empty JSON body', async () => {
      const updatedPoll = {
        id: '1',
        title: 'T',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [],
        createdAt: '',
        updatedAt: '',
      };
      mockApi.postData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.upvoteResponse('1', 'resp-uuid');

      expect(mockApi.postData).toHaveBeenCalledWith(
        '/special-polls/1/responses/resp-uuid/upvote',
        {}
      );
      expect(result).toEqual(updatedPoll);
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
      const responses: SpecialPollResponse[] = [
        {
          id: 'r1',
          userId: '1',
          userName: 'User1',
          response: 'Updated response 1',
          createdAt: '2024-01-01',
          upvotedUserIds: [],
        },
        {
          id: 'r2',
          userId: '2',
          userName: 'User2',
          response: 'Updated response 2',
          createdAt: '2024-01-01',
          upvotedUserIds: ['u'],
        },
      ];
      const updatedPoll = {
        id: '1',
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses,
        createdAt: '',
        updatedAt: '',
      };
      mockApi.patchData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.updateResponses('1', responses);

      expect(mockApi.patchData).toHaveBeenCalledWith('/special-polls/1/responses', { responses });
      expect(result).toEqual(updatedPoll);
    });

    it('should handle empty responses array', async () => {
      const responses: SpecialPollResponse[] = [];
      const updatedPoll = {
        id: '1',
        title: 'Test question?',
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [],
        createdAt: '',
        updatedAt: '',
      };
      mockApi.patchData.mockResolvedValue(updatedPoll);

      const result = await specialPollService.updateResponses('1', responses);

      expect(mockApi.patchData).toHaveBeenCalledWith('/special-polls/1/responses', {
        responses: [],
      });
      expect(result).toEqual(updatedPoll);
    });

    it('should handle update responses errors', async () => {
      const responses: SpecialPollResponse[] = [
        {
          id: 'r1',
          userId: '1',
          userName: 'User1',
          response: 'Test',
          createdAt: '2024-01-01',
          upvotedUserIds: [],
        },
      ];
      mockApi.patchData.mockRejectedValue(new Error('Update responses failed'));

      await expect(specialPollService.updateResponses('1', responses)).rejects.toThrow(
        'Update responses failed'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long poll titles', async () => {
      const longTitle = 'What is your opinion on '.repeat(100) + '?';
      const pollData = {
        title: longTitle,
      };
      const createdPoll = {
        id: '1',
        title: longTitle,
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdPoll);

      const result = await specialPollService.createSpecialPoll(pollData);

      expect(result.title).toBe(longTitle);
    });

    it('should handle unicode characters in poll titles', async () => {
      const unicodeTitle = 'Was ist Ihr Lieblings-Café? 🍽️☕';
      const pollData = {
        title: unicodeTitle,
      };
      const createdPoll = {
        id: '1',
        title: unicodeTitle,
        status: SpecialPollStatus.ACTIVE,
        isHighlighted: false,
        responses: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdPoll);

      const result = await specialPollService.createSpecialPoll(pollData);

      expect(result.title).toBe(unicodeTitle);
    });

    it('should handle multiple status transitions (nur ACTIVE/PENDING)', async () => {
      const statusData1 = { status: SpecialPollStatus.ACTIVE };
      const updatedPoll1 = { id: '1', status: SpecialPollStatus.ACTIVE };
      mockApi.patchData.mockResolvedValueOnce(updatedPoll1);

      await specialPollService.updateSpecialPollStatus('1', statusData1);

      const statusData2 = { status: SpecialPollStatus.PENDING };
      const updatedPoll2 = { id: '1', status: SpecialPollStatus.PENDING };
      mockApi.patchData.mockResolvedValueOnce(updatedPoll2);

      const result = await specialPollService.updateSpecialPollStatus('1', statusData2);

      expect(mockApi.patchData).toHaveBeenCalledTimes(2);
      expect(result.status).toBe(SpecialPollStatus.PENDING);
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.getData.mockRejectedValue(new Error('Request timeout'));

      await expect(specialPollService.getSpecialPolls()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Internal server error'));

      await expect(
        specialPollService.createSpecialPoll({
          title: 'Test?',
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.patchData.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        specialPollService.updateSpecialPollStatus('1', { status: SpecialPollStatus.ACTIVE })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
