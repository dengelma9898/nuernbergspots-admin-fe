// Event Category Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn(response => response.data),
}));

import { useEventCategoryService } from '../eventCategoryService';

describe('Event Category Service', () => {
  let eventCategoryService: ReturnType<typeof useEventCategoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    eventCategoryService = useEventCategoryService();
  });

  describe('getCategories', () => {
    it('should fetch all event categories successfully', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Music',
          description: 'Music events and concerts',
          fallbackImages: ['music1.jpg', 'music2.jpg'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'Sports',
          description: 'Sports events and activities',
          fallbackImages: ['sports1.jpg'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockApi.get.mockResolvedValue({ data: mockCategories });

      const result = await eventCategoryService.getCategories();

      expect(mockApi.get).toHaveBeenCalledWith('/event-categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(eventCategoryService.getCategories()).rejects.toThrow('Network error');
    });
  });

  describe('getCategory', () => {
    it('should fetch a specific event category', async () => {
      const mockCategory = {
        id: '1',
        name: 'Music',
        description: 'Music events and concerts',
        fallbackImages: ['music1.jpg', 'music2.jpg'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.get.mockResolvedValue({ data: mockCategory });

      const result = await eventCategoryService.getCategory('1');

      expect(mockApi.get).toHaveBeenCalledWith('/event-categories/1');
      expect(result).toEqual(mockCategory);
    });

    it('should handle category not found', async () => {
      mockApi.get.mockRejectedValue(new Error('Category not found'));

      await expect(eventCategoryService.getCategory('999')).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create a new event category', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Tech conferences and workshops',
        colorCode: '#007ACC',
        iconName: 'tech-icon',
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        fallbackImages: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdCategory });

      const result = await eventCategoryService.createCategory(categoryData);

      expect(mockApi.post).toHaveBeenCalledWith('/event-categories', categoryData);
      expect(result).toEqual(createdCategory);
    });

    it('should handle creation errors', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        colorCode: '#FF0000',
        iconName: 'test-icon',
      };
      mockApi.post.mockRejectedValue(new Error('Creation failed'));

      await expect(eventCategoryService.createCategory(categoryData)).rejects.toThrow(
        'Creation failed'
      );
    });
  });

  describe('updateCategory', () => {
    it('should update an existing event category', async () => {
      const updateData = { name: 'Updated Music', description: 'Updated description' };
      const updatedCategory = {
        id: '1',
        name: 'Updated Music',
        description: 'Updated description',
        fallbackImages: ['music1.jpg'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      const result = await eventCategoryService.updateCategory('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/event-categories/1', updateData);
      expect(result).toEqual(updatedCategory);
    });

    it('should handle partial updates', async () => {
      const updateData = { name: 'New Name Only' };
      const updatedCategory = {
        id: '1',
        name: 'New Name Only',
        description: 'Original description',
        fallbackImages: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      const result = await eventCategoryService.updateCategory('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/event-categories/1', updateData);
      expect(result).toEqual(updatedCategory);
    });

    it('should handle update errors', async () => {
      const updateData = { name: 'Updated Name' };
      mockApi.patch.mockRejectedValue(new Error('Update failed'));

      await expect(eventCategoryService.updateCategory('1', updateData)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete an event category', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await eventCategoryService.deleteCategory('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/event-categories/1');
    });

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(eventCategoryService.deleteCategory('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('updateFallbackImages', () => {
    it('should update fallback images for a category', async () => {
      const mockFiles = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.jpg', { type: 'image/jpeg' }),
      ];
      const updatedCategory = {
        id: '1',
        name: 'Music',
        description: 'Music events',
        fallbackImages: ['new-image1.jpg', 'new-image2.jpg'],
        updatedAt: '2024-01-02',
      };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      const result = await eventCategoryService.updateFallbackImages('1', mockFiles);

      expect(mockApi.patch).toHaveBeenCalledWith(
        '/event-categories/1/fallback-images',
        expect.any(FormData),
        { isFormData: true }
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should handle empty files array', async () => {
      const mockFiles: File[] = [];
      const updatedCategory = {
        id: '1',
        name: 'Music',
        fallbackImages: [],
      };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      const result = await eventCategoryService.updateFallbackImages('1', mockFiles);

      const formDataCall = mockApi.patch.mock.calls[0];
      const formData = formDataCall[1] as FormData;

      // FormData with no files should still be sent
      expect(formData).toBeInstanceOf(FormData);
      expect(result).toEqual(updatedCategory);
    });

    it('should properly append files to FormData', async () => {
      const mockFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.png', { type: 'image/png' }),
      ];
      const updatedCategory = { id: '1', fallbackImages: ['test1.jpg', 'test2.png'] };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      await eventCategoryService.updateFallbackImages('1', mockFiles);

      const formDataCall = mockApi.patch.mock.calls[0];
      const formData = formDataCall[1] as FormData;

      expect(formData).toBeInstanceOf(FormData);
      expect(mockApi.patch).toHaveBeenCalledWith('/event-categories/1/fallback-images', formData, {
        isFormData: true,
      });
    });

    it('should handle image upload errors', async () => {
      const mockFiles = [new File(['image'], 'test.jpg', { type: 'image/jpeg' })];
      mockApi.patch.mockRejectedValue(new Error('Upload failed'));

      await expect(eventCategoryService.updateFallbackImages('1', mockFiles)).rejects.toThrow(
        'Upload failed'
      );
    });

    it('should handle large file uploads', async () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const mockFiles = [new File([largeContent], 'large.jpg', { type: 'image/jpeg' })];
      const updatedCategory = { id: '1', fallbackImages: ['large.jpg'] };
      mockApi.patch.mockResolvedValue({ data: updatedCategory });

      const result = await eventCategoryService.updateFallbackImages('1', mockFiles);

      expect(result).toEqual(updatedCategory);
    });
  });

  describe('edge cases', () => {
    it('should handle very long category names', async () => {
      const longName = 'Very Long Category Name '.repeat(100);
      const categoryData = {
        name: longName,
        description: 'Long name test',
        colorCode: '#00FF00',
        iconName: 'long-icon',
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        fallbackImages: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdCategory });

      const result = await eventCategoryService.createCategory(categoryData);

      expect(result.name).toBe(longName);
    });

    it('should handle unicode characters in category names', async () => {
      const unicodeName = 'Musik & Künste 🎵🎨';
      const categoryData = {
        name: unicodeName,
        description: 'Unicode test',
        colorCode: '#FF00FF',
        iconName: 'unicode-icon',
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        fallbackImages: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdCategory });

      const result = await eventCategoryService.createCategory(categoryData);

      expect(result.name).toBe(unicodeName);
    });

    it('should handle empty category name', async () => {
      const categoryData = {
        name: '',
        description: 'Empty name test',
        colorCode: '#000000',
        iconName: 'empty-icon',
      };
      mockApi.post.mockRejectedValue(new Error('Name cannot be empty'));

      await expect(eventCategoryService.createCategory(categoryData)).rejects.toThrow(
        'Name cannot be empty'
      );
    });

    it('should handle categories with many fallback images', async () => {
      const manyImages = Array.from({ length: 50 }, (_, i) => `image${i}.jpg`);
      const mockCategory = {
        id: '1',
        name: 'Popular Category',
        fallbackImages: manyImages,
      };
      mockApi.get.mockResolvedValue({ data: mockCategory });

      const result = await eventCategoryService.getCategory('1');

      expect(result.fallbackImages).toHaveLength(50);
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.get.mockRejectedValue(new Error('Request timeout'));

      await expect(eventCategoryService.getCategories()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Internal server error'));

      await expect(
        eventCategoryService.createCategory({
          name: 'Test',
          description: 'Test',
          colorCode: '#CCCCCC',
          iconName: 'server-error-icon',
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.patch.mockRejectedValue(new Error('Unauthorized'));

      await expect(eventCategoryService.updateCategory('1', { name: 'New Name' })).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should handle invalid file types in image upload', async () => {
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      mockApi.patch.mockRejectedValue(new Error('Invalid file type'));

      await expect(eventCategoryService.updateFallbackImages('1', [invalidFile])).rejects.toThrow(
        'Invalid file type'
      );
    });

    it('should handle file size limits', async () => {
      // Erstelle eine große Datei mit einem kleineren Wert, um Speicherprobleme zu vermeiden
      // 10MB sollte ausreichen, um die Größenbeschränkung zu testen
      const largeContent = new Array(10 * 1024 * 1024).fill('x').join('');
      const oversizedFile = new File([largeContent], 'huge.jpg', {
        type: 'image/jpeg',
      });
      mockApi.patch.mockRejectedValue(new Error('File too large'));

      await expect(eventCategoryService.updateFallbackImages('1', [oversizedFile])).rejects.toThrow(
        'File too large'
      );
    });
  });

  describe('FormData handling', () => {
    it('should create FormData correctly for multiple files', async () => {
      const files = [
        new File(['1'], 'file1.jpg', { type: 'image/jpeg' }),
        new File(['2'], 'file2.png', { type: 'image/png' }),
        new File(['3'], 'file3.gif', { type: 'image/gif' }),
      ];

      mockApi.patch.mockResolvedValue({ data: { id: '1', fallbackImages: [] } });

      await eventCategoryService.updateFallbackImages('1', files);

      const [url, formData, options] = mockApi.patch.mock.calls[0];

      expect(url).toBe('/event-categories/1/fallback-images');
      expect(formData).toBeInstanceOf(FormData);
      expect(options).toEqual({ isFormData: true });
    });

    it('should handle different image file types', async () => {
      const files = [
        new File(['jpg'], 'test.jpg', { type: 'image/jpeg' }),
        new File(['png'], 'test.png', { type: 'image/png' }),
        new File(['gif'], 'test.gif', { type: 'image/gif' }),
        new File(['webp'], 'test.webp', { type: 'image/webp' }),
      ];

      mockApi.patch.mockResolvedValue({
        data: { id: '1', fallbackImages: files.map(f => f.name) },
      });

      const result = await eventCategoryService.updateFallbackImages('1', files);

      expect(result.fallbackImages).toEqual(['test.jpg', 'test.png', 'test.gif', 'test.webp']);
    });
  });
});
