// Business Category Service Tests

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
    businessCategories: '/business-categories',
  },
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn(response => response.data),
}));

import { useBusinessCategoryService } from '../businessCategoryService';

describe('Business Category Service', () => {
  let businessCategoryService: ReturnType<typeof useBusinessCategoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    businessCategoryService = useBusinessCategoryService();
  });

  describe('getCategories', () => {
    it('should fetch all business categories with keywords', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Restaurant',
          icon: 'restaurant',
          keywords: ['food', 'dining', 'cuisine'],
        },
        {
          id: '2',
          name: 'Hotel',
          icon: 'hotel',
          keywords: ['accommodation', 'stay', 'lodging'],
        },
      ];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      const result = await businessCategoryService.getCategories();

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/with-keywords');
      expect(result).toEqual(mockCategories);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(businessCategoryService.getCategories()).rejects.toThrow('Network error');
    });
  });

  describe('getCategory', () => {
    it('should fetch a specific business category', async () => {
      const mockCategory = {
        id: '1',
        name: 'Restaurant',
        icon: 'restaurant',
        description: 'Food and dining establishments',
        keywords: ['food', 'dining'],
      };
      mockApi.get.mockResolvedValue({ data: mockCategory });

      const result = await businessCategoryService.getCategory('1');

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/1');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('should create a new business category', async () => {
      const categoryData = {
        name: 'Fitness Center',
        iconName: 'fitness',
        description: 'Gyms and fitness facilities',
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        keywords: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdCategory });

      const result = await businessCategoryService.createCategory(categoryData);

      expect(mockApi.post).toHaveBeenCalledWith('/business-categories', categoryData);
      expect(result).toEqual(createdCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update an existing business category', async () => {
      const updateData = { name: 'Updated Restaurant', color: '#E91E63' };
      const updatedCategory = {
        id: '1',
        name: 'Updated Restaurant',
        icon: 'restaurant',
        color: '#E91E63',
        updatedAt: '2024-01-02',
      };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      const result = await businessCategoryService.updateCategory('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/business-categories/1', updateData);
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a business category', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await businessCategoryService.deleteCategory('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/business-categories/1');
    });
  });

  describe('updateCategoryKeywords', () => {
    it('should update category keywords', async () => {
      const keywordIds = ['keyword1', 'keyword2', 'keyword3'];
      const updatedCategory = {
        id: '1',
        name: 'Restaurant',
        keywords: [
          { id: 'keyword1', name: 'food' },
          { id: 'keyword2', name: 'dining' },
          { id: 'keyword3', name: 'cuisine' },
        ],
      };
      mockApi.put.mockResolvedValue({ data: updatedCategory });

      const result = await businessCategoryService.updateCategoryKeywords('1', keywordIds);

      expect(mockApi.put).toHaveBeenCalledWith('/business-categories/1/keywords', {
        keywordIds,
      });
      expect(result).toEqual(updatedCategory);
    });

    it('should handle empty keyword array', async () => {
      const updatedCategory = {
        id: '1',
        name: 'Restaurant',
        keywords: [],
      };
      mockApi.put.mockResolvedValue({ data: updatedCategory });

      const result = await businessCategoryService.updateCategoryKeywords('1', []);

      expect(mockApi.put).toHaveBeenCalledWith('/business-categories/1/keywords', {
        keywordIds: [],
      });
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('searchCategories', () => {
    it('should search categories by query', async () => {
      const mockCategories = [
        { id: '1', name: 'Restaurant', icon: 'restaurant' },
        { id: '2', name: 'Fast Food Restaurant', icon: 'fastfood' },
      ];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      const result = await businessCategoryService.searchCategories('restaurant');

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/search?q=restaurant');
      expect(result).toEqual(mockCategories);
    });

    it('should properly encode search query', async () => {
      const mockCategories = [];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      await businessCategoryService.searchCategories('café & restaurant');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/business-categories/search?q=caf%C3%A9%20%26%20restaurant'
      );
    });

    it('should handle empty search results', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await businessCategoryService.searchCategories('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getCategoriesByIcon', () => {
    it('should fetch categories by icon name', async () => {
      const mockCategories = [
        { id: '1', name: 'Restaurant', icon: 'restaurant' },
        { id: '2', name: 'Fine Dining', icon: 'restaurant' },
      ];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      const result = await businessCategoryService.getCategoriesByIcon('restaurant');

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/icon/restaurant');
      expect(result).toEqual(mockCategories);
    });

    it('should properly encode icon name', async () => {
      const mockCategories = [];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      await businessCategoryService.getCategoriesByIcon('café-shop');

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/icon/caf%C3%A9-shop');
    });
  });

  describe('error handling', () => {
    it('should handle create category errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Creation failed'));

      await expect(
        businessCategoryService.createCategory({
          name: 'Test Category',
          iconName: 'test',
          description: 'Test description',
        })
      ).rejects.toThrow('Creation failed');
    });

    it('should handle update category errors', async () => {
      mockApi.patch.mockRejectedValue(new Error('Update failed'));

      await expect(
        businessCategoryService.updateCategory('1', { name: 'New Name' })
      ).rejects.toThrow('Update failed');
    });

    it('should handle delete category errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(businessCategoryService.deleteCategory('1')).rejects.toThrow('Delete failed');
    });

    it('should handle keyword update errors', async () => {
      mockApi.put.mockRejectedValue(new Error('Keyword update failed'));

      await expect(
        businessCategoryService.updateCategoryKeywords('1', ['keyword1'])
      ).rejects.toThrow('Keyword update failed');
    });

    it('should handle search errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Search failed'));

      await expect(businessCategoryService.searchCategories('test')).rejects.toThrow(
        'Search failed'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in search query', async () => {
      const mockCategories = [];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      await businessCategoryService.searchCategories('test@#$%^&*()');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/business-categories/search?q=test%40%23%24%25%5E%26*()'
      );
    });

    it('should handle empty search query', async () => {
      const mockCategories = [];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      await businessCategoryService.searchCategories('');

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/search?q=');
    });

    it('should handle unicode characters in icon name', async () => {
      const mockCategories = [];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      await businessCategoryService.getCategoriesByIcon('café');

      expect(mockApi.get).toHaveBeenCalledWith('/business-categories/icon/caf%C3%A9');
    });
  });
});
