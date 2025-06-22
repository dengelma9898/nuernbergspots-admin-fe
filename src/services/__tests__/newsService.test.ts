// News Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    news: '/news',
  },
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn(response => response.data),
}));

import { useNewsService } from '../newsService';

describe('News Service', () => {
  let newsService: ReturnType<typeof useNewsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    newsService = useNewsService();
  });

  describe('getAll', () => {
    it('should fetch all news items successfully', async () => {
      const mockNews = [
        { id: '1', type: 'text', content: 'News 1', authorId: 'author1' },
        { id: '2', type: 'image', content: 'News 2', authorId: 'author2' },
      ];
      mockApi.get.mockResolvedValue({ data: mockNews });

      const result = await newsService.getAll();

      expect(mockApi.get).toHaveBeenCalledWith('/news');
      expect(result).toEqual(mockNews);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(newsService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch a specific news item', async () => {
      const mockNews = { id: '1', type: 'text', content: 'Test News', authorId: 'author1' };
      mockApi.get.mockResolvedValue({ data: mockNews });

      const result = await newsService.getById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/news/1');
      expect(result).toEqual(mockNews);
    });
  });

  describe('createTextNews', () => {
    it('should create a text news item', async () => {
      const newsData = { content: 'New text news', authorId: 'author1' };
      const createdNews = { id: '1', type: 'text', ...newsData, createdAt: '2024-01-01' };
      mockApi.post.mockResolvedValue({ data: createdNews });

      const result = await newsService.createTextNews(newsData);

      expect(mockApi.post).toHaveBeenCalledWith('/news/text', newsData);
      expect(result).toEqual(createdNews);
    });
  });

  describe('createImageNews', () => {
    it('should create an image news item', async () => {
      const newsData = {
        content: 'New image news',
        authorId: 'author1',
        imageUrls: ['image1.jpg', 'image2.jpg'],
      };
      const createdNews = { id: '1', type: 'image', ...newsData, createdAt: '2024-01-01' };
      mockApi.post.mockResolvedValue({ data: createdNews });

      const result = await newsService.createImageNews(newsData);

      expect(mockApi.post).toHaveBeenCalledWith('/news/image', newsData);
      expect(result).toEqual(createdNews);
    });
  });

  describe('createPollNews', () => {
    it('should create a poll news item', async () => {
      const newsData = {
        content: 'New poll news',
        authorId: 'author1',
        pollInfo: {
          options: [
            { id: '1', text: 'Option 1', voters: [] },
            { id: '2', text: 'Option 2', voters: [] },
          ],
          allowMultipleChoices: false,
          expiresAt: '2024-12-31T23:59:59Z',
        },
      };
      const createdNews = { id: '1', type: 'poll', ...newsData, createdAt: '2024-01-01' };
      mockApi.post.mockResolvedValue({ data: createdNews });

      const result = await newsService.createPollNews(newsData);

      expect(mockApi.post).toHaveBeenCalledWith('/news/poll', newsData);
      expect(result).toEqual(createdNews);
    });
  });

  describe('votePoll', () => {
    it('should vote on a poll', async () => {
      const voteData = { optionId: '1' };
      const updatedPoll = {
        id: '1',
        type: 'poll',
        content: 'Poll question',
        pollInfo: {
          options: [
            { id: '1', text: 'Option 1', voters: ['voter1'] },
            { id: '2', text: 'Option 2', voters: [] },
          ],
          allowMultipleChoices: false,
        },
      };
      mockApi.patch.mockResolvedValue({ data: updatedPoll });

      const result = await newsService.votePoll('1', voteData);

      expect(mockApi.patch).toHaveBeenCalledWith('/news/1/poll-vote', voteData);
      expect(result).toEqual(updatedPoll);
    });
  });

  describe('postReaction', () => {
    it('should post a reaction to news', async () => {
      const reactionData = { type: 'like', userId: 'user1' };
      const updatedNews = {
        id: '1',
        content: 'Test news',
        reactions: [reactionData],
      };
      mockApi.patch.mockResolvedValue({ data: updatedNews });

      const result = await newsService.postReaction('1', reactionData);

      expect(mockApi.patch).toHaveBeenCalledWith('/news/1/react', reactionData);
      expect(result).toEqual(updatedNews);
    });
  });

  describe('delete', () => {
    it('should delete a news item', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await newsService.delete('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/news/1');
    });
  });

  describe('update', () => {
    it('should update a news item', async () => {
      const updateData = { content: 'Updated content' };
      const updatedNews = { id: '1', content: 'Updated content', authorId: 'author1' };
      mockApi.put.mockResolvedValue({ data: updatedNews });

      const result = await newsService.update('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/news/1', updateData);
      expect(result).toEqual(updatedNews);
    });
  });

  describe('updateNewsImages', () => {
    it('should update news images', async () => {
      const mockFiles = [
        new File(['test'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const updatedNews = {
        id: '1',
        type: 'image',
        content: 'Image news',
        imageUrls: ['new1.jpg', 'new2.jpg'],
      };
      mockApi.patch.mockResolvedValue({ data: updatedNews });

      const result = await newsService.updateNewsImages('1', mockFiles);

      expect(mockApi.patch).toHaveBeenCalledWith('/news/1/images', expect.any(FormData), {
        isFormData: true,
      });
      expect(result).toEqual(updatedNews);
    });
  });

  describe('error handling', () => {
    it('should handle create text news errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Creation failed'));

      await expect(
        newsService.createTextNews({ content: 'test', authorId: 'author1' })
      ).rejects.toThrow('Creation failed');
    });

    it('should handle vote poll errors', async () => {
      mockApi.patch.mockRejectedValue(new Error('Vote failed'));

      await expect(newsService.votePoll('1', { optionId: '1' })).rejects.toThrow('Vote failed');
    });

    it('should handle update errors', async () => {
      mockApi.put.mockRejectedValue(new Error('Update failed'));

      await expect(newsService.update('1', { content: 'new content' })).rejects.toThrow(
        'Update failed'
      );
    });
  });
});
