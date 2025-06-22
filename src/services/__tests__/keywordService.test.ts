// Keyword Service Tests

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
    keywords: '/keywords',
  },
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn(response => response.data),
}));

import { useKeywordService } from '../keywordService';

describe('Keyword Service', () => {
  let keywordService: ReturnType<typeof useKeywordService>;

  beforeEach(() => {
    jest.clearAllMocks();
    keywordService = useKeywordService();
  });

  describe('getKeywords', () => {
    it('should fetch all keywords successfully', async () => {
      const mockKeywords = [
        {
          id: '1',
          name: 'Restaurant',
          description: 'Food related keyword',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'Hotel',
          description: 'Accommodation keyword',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockApi.get.mockResolvedValue({ data: mockKeywords });

      const result = await keywordService.getKeywords();

      expect(mockApi.get).toHaveBeenCalledWith('/keywords');
      expect(result).toEqual(mockKeywords);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(keywordService.getKeywords()).rejects.toThrow('Network error');
    });
  });

  describe('getKeyword', () => {
    it('should fetch a specific keyword', async () => {
      const mockKeyword = {
        id: '1',
        name: 'Restaurant',
        description: 'Food related keyword',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.get.mockResolvedValue({ data: mockKeyword });

      const result = await keywordService.getKeyword('1');

      expect(mockApi.get).toHaveBeenCalledWith('/keywords/1');
      expect(result).toEqual(mockKeyword);
    });

    it('should handle keyword not found', async () => {
      mockApi.get.mockRejectedValue(new Error('Keyword not found'));

      await expect(keywordService.getKeyword('999')).rejects.toThrow('Keyword not found');
    });
  });

  describe('createKeyword', () => {
    it('should create a new keyword', async () => {
      const keywordData = {
        name: 'Fitness',
        description: 'Health and fitness related keyword',
      };
      const createdKeyword = {
        id: '1',
        ...keywordData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdKeyword });

      const result = await keywordService.createKeyword(keywordData);

      expect(mockApi.post).toHaveBeenCalledWith('/keywords', keywordData);
      expect(result).toEqual(createdKeyword);
    });

    it('should handle creation errors', async () => {
      const keywordData = {
        name: 'Test',
        description: 'Test keyword',
      };
      mockApi.post.mockRejectedValue(new Error('Creation failed'));

      await expect(keywordService.createKeyword(keywordData)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateKeyword', () => {
    it('should update an existing keyword', async () => {
      const updateData = { name: 'Updated Restaurant', description: 'Updated description' };
      const updatedKeyword = {
        id: '1',
        name: 'Updated Restaurant',
        description: 'Updated description',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      mockApi.patch.mockResolvedValue({ data: updatedKeyword });

      const result = await keywordService.updateKeyword('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/keywords/1', updateData);
      expect(result).toEqual(updatedKeyword);
    });

    it('should handle partial updates', async () => {
      const updateData = { name: 'New Name Only' };
      const updatedKeyword = {
        id: '1',
        name: 'New Name Only',
        description: 'Original description',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      mockApi.patch.mockResolvedValue({ data: updatedKeyword });

      const result = await keywordService.updateKeyword('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/keywords/1', updateData);
      expect(result).toEqual(updatedKeyword);
    });
  });

  describe('deleteKeyword', () => {
    it('should delete a keyword', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await keywordService.deleteKeyword('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/keywords/1');
    });

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(keywordService.deleteKeyword('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('searchKeywords', () => {
    it('should search keywords by query', async () => {
      const mockKeywords = [
        { id: '1', name: 'Restaurant', description: 'Food related' },
        { id: '2', name: 'Fast Food Restaurant', description: 'Quick service food' },
      ];
      mockApi.get.mockResolvedValue({ data: mockKeywords });

      const result = await keywordService.searchKeywords('restaurant');

      expect(mockApi.get).toHaveBeenCalledWith('/keywords/search?q=restaurant');
      expect(result).toEqual(mockKeywords);
    });

    it('should properly encode search query', async () => {
      const mockKeywords = [];
      mockApi.get.mockResolvedValue({ data: mockKeywords });

      await keywordService.searchKeywords('café & restaurant');

      expect(mockApi.get).toHaveBeenCalledWith('/keywords/search?q=caf%C3%A9%20%26%20restaurant');
    });

    it('should handle empty search results', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await keywordService.searchKeywords('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle special characters in search', async () => {
      const mockKeywords = [];
      mockApi.get.mockResolvedValue({ data: mockKeywords });

      await keywordService.searchKeywords('test@#$%^&*()');

      expect(mockApi.get).toHaveBeenCalledWith('/keywords/search?q=test%40%23%24%25%5E%26*()');
    });

    it('should handle search errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Search failed'));

      await expect(keywordService.searchKeywords('test')).rejects.toThrow('Search failed');
    });
  });

  describe('edge cases', () => {
    it('should handle empty keyword name', async () => {
      const keywordData = {
        name: '',
        description: 'Empty name test',
      };
      mockApi.post.mockRejectedValue(new Error('Name cannot be empty'));

      await expect(keywordService.createKeyword(keywordData)).rejects.toThrow(
        'Name cannot be empty'
      );
    });

    it('should handle very long keyword names', async () => {
      const longName = 'a'.repeat(1000);
      const keywordData = {
        name: longName,
        description: 'Long name test',
      };
      const createdKeyword = {
        id: '1',
        ...keywordData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdKeyword });

      const result = await keywordService.createKeyword(keywordData);

      expect(result.name).toBe(longName);
    });

    it('should handle unicode characters in keyword names', async () => {
      const keywordData = {
        name: 'Café & Résturant 🍽️',
        description: 'Unicode test',
      };
      const createdKeyword = {
        id: '1',
        ...keywordData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdKeyword });

      const result = await keywordService.createKeyword(keywordData);

      expect(result.name).toBe('Café & Résturant 🍽️');
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.get.mockRejectedValue(new Error('Request timeout'));

      await expect(keywordService.getKeywords()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Internal server error'));

      await expect(
        keywordService.createKeyword({ name: 'Test', description: 'Test' })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.patch.mockRejectedValue(new Error('Unauthorized'));

      await expect(keywordService.updateKeyword('1', { name: 'New Name' })).rejects.toThrow(
        'Unauthorized'
      );
    });
  });
});
