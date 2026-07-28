// Job Category Service Tests

// Mock API
const mockApi = {
  getData: jest.fn(),
  postData: jest.fn(),
  patchData: jest.fn(),
  putData: jest.fn(),
  deleteData: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
}));

import { useJobCategoryService } from '../jobCategoryService';

describe('Job Category Service', () => {
  let jobCategoryService: ReturnType<typeof useJobCategoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    jobCategoryService = useJobCategoryService();
  });

  describe('getCategories', () => {
    it('should fetch all job categories successfully', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'IT & Software',
          description: 'Information Technology jobs',
          fallbackImages: ['it1.jpg', 'it2.jpg'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'Marketing',
          description: 'Marketing and advertising jobs',
          fallbackImages: ['marketing1.jpg'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      mockApi.getData.mockResolvedValue(mockCategories);

      const result = await jobCategoryService.getCategories();

      expect(mockApi.getData).toHaveBeenCalledWith('/job-offer-categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle API errors', async () => {
      mockApi.getData.mockRejectedValue(new Error('Network error'));

      await expect(jobCategoryService.getCategories()).rejects.toThrow('Network error');
    });
  });

  describe('getCategory', () => {
    it('should fetch a specific job category', async () => {
      const mockCategory = {
        id: '1',
        name: 'IT & Software',
        description: 'Information Technology jobs',
        fallbackImages: ['it1.jpg', 'it2.jpg'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.getData.mockResolvedValue(mockCategory);

      const result = await jobCategoryService.getCategory('1');

      expect(mockApi.getData).toHaveBeenCalledWith('/job-offer-categories/1');
      expect(result).toEqual(mockCategory);
    });

    it('should handle category not found', async () => {
      mockApi.getData.mockRejectedValue(new Error('Category not found'));

      await expect(jobCategoryService.getCategory('999')).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create a new job category', async () => {
      const categoryData = {
        name: 'Healthcare',
        description: 'Medical and healthcare jobs',
        colorCode: '#FF5733',
        iconName: 'medical',
        fallbackImages: [],
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdCategory);

      const result = await jobCategoryService.createCategory(categoryData);

      expect(mockApi.postData).toHaveBeenCalledWith('/job-offer-categories', categoryData);
      expect(result).toEqual(createdCategory);
    });

    it('should handle creation errors', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        colorCode: '#FF5733',
        iconName: 'test',
        fallbackImages: [],
      };
      mockApi.postData.mockRejectedValue(new Error('Creation failed'));

      await expect(jobCategoryService.createCategory(categoryData)).rejects.toThrow(
        'Creation failed'
      );
    });
  });

  describe('updateCategory', () => {
    it('should update an existing job category', async () => {
      const updateData = { name: 'Updated IT & Software', description: 'Updated description' };
      const updatedCategory = {
        id: '1',
        name: 'Updated IT & Software',
        description: 'Updated description',
        fallbackImages: ['it1.jpg'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      mockApi.patchData.mockResolvedValue(updatedCategory);

      const result = await jobCategoryService.updateCategory('1', updateData);

      expect(mockApi.patchData).toHaveBeenCalledWith('/job-offer-categories/1', updateData);
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
      mockApi.patchData.mockResolvedValue(updatedCategory);

      const result = await jobCategoryService.updateCategory('1', updateData);

      expect(mockApi.patchData).toHaveBeenCalledWith('/job-offer-categories/1', updateData);
      expect(result).toEqual(updatedCategory);
    });

    it('should handle update errors', async () => {
      const updateData = { name: 'Updated Name' };
      mockApi.patchData.mockRejectedValue(new Error('Update failed'));

      await expect(jobCategoryService.updateCategory('1', updateData)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a job category', async () => {
      mockApi.deleteData.mockResolvedValue(undefined);

      await jobCategoryService.deleteCategory('1');

      expect(mockApi.deleteData).toHaveBeenCalledWith('/job-offer-categories/1');
    });

    it('should handle delete errors', async () => {
      mockApi.deleteData.mockRejectedValue(new Error('Delete failed'));

      await expect(jobCategoryService.deleteCategory('1')).rejects.toThrow('Delete failed');
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
        name: 'IT & Software',
        description: 'IT jobs',
        fallbackImages: ['new-image1.jpg', 'new-image2.jpg'],
        updatedAt: '2024-01-02',
      };
      mockApi.patchData.mockResolvedValue(updatedCategory);

      const result = await jobCategoryService.updateFallbackImages('1', mockFiles);

      expect(mockApi.patchData).toHaveBeenCalledWith(
        '/job-offer-categories/1/fallback-images',
        expect.any(FormData),
        { isFormData: true }
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should handle empty files array', async () => {
      const mockFiles: File[] = [];
      const updatedCategory = {
        id: '1',
        name: 'IT & Software',
        fallbackImages: [],
      };
      mockApi.patchData.mockResolvedValue(updatedCategory);

      const result = await jobCategoryService.updateFallbackImages('1', mockFiles);

      const formDataCall = mockApi.patchData.mock.calls[0];
      const formData = formDataCall[1] as FormData;

      expect(formData).toBeInstanceOf(FormData);
      expect(result).toEqual(updatedCategory);
    });

    it('should handle image upload errors', async () => {
      const mockFiles = [new File(['image'], 'test.jpg', { type: 'image/jpeg' })];
      mockApi.patchData.mockRejectedValue(new Error('Upload failed'));

      await expect(jobCategoryService.updateFallbackImages('1', mockFiles)).rejects.toThrow(
        'Upload failed'
      );
    });
  });

  describe('deleteFallbackImage', () => {
    it('should delete a specific fallback image', async () => {
      const imageUrl = 'https://example.com/image1.jpg';
      const updatedCategory = {
        id: '1',
        name: 'IT & Software',
        fallbackImages: ['image2.jpg'], // image1.jpg removed
        updatedAt: '2024-01-02',
      };
      mockApi.patchData.mockResolvedValue(updatedCategory);

      const result = await jobCategoryService.deleteFallbackImage('1', imageUrl);

      expect(mockApi.patchData).toHaveBeenCalledWith(
        '/job-offer-categories/1/fallback-images/remove',
        {
          imageUrl,
        }
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should handle delete image errors', async () => {
      const imageUrl = 'https://example.com/nonexistent.jpg';
      mockApi.patchData.mockRejectedValue(new Error('Image not found'));

      await expect(jobCategoryService.deleteFallbackImage('1', imageUrl)).rejects.toThrow(
        'Image not found'
      );
    });

    it('should handle invalid image URLs', async () => {
      const invalidUrl = 'not-a-valid-url';
      mockApi.patchData.mockRejectedValue(new Error('Invalid image URL'));

      await expect(jobCategoryService.deleteFallbackImage('1', invalidUrl)).rejects.toThrow(
        'Invalid image URL'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long category names', async () => {
      const longName = 'Very Long Job Category Name '.repeat(100);
      const categoryData = {
        name: longName,
        description: 'Long name test',
        colorCode: '#FF5733',
        iconName: 'long',
        fallbackImages: [],
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdCategory);

      const result = await jobCategoryService.createCategory(categoryData);

      expect(result.name).toBe(longName);
    });

    it('should handle unicode characters in category names', async () => {
      const unicodeName = 'IT & Softwareentwicklung 💻🚀';
      const categoryData = {
        name: unicodeName,
        description: 'Unicode test',
        colorCode: '#FF5733',
        iconName: 'unicode',
        fallbackImages: [],
      };
      const createdCategory = {
        id: '1',
        ...categoryData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdCategory);

      const result = await jobCategoryService.createCategory(categoryData);

      expect(result.name).toBe(unicodeName);
    });

    it('should handle categories with many fallback images', async () => {
      const manyImages = Array.from({ length: 20 }, (_, i) => `job-image${i}.jpg`);
      const mockCategory = {
        id: '1',
        name: 'Popular Job Category',
        fallbackImages: manyImages,
      };
      mockApi.getData.mockResolvedValue(mockCategory);

      const result = await jobCategoryService.getCategory('1');

      expect(result.fallbackImages).toHaveLength(20);
    });

    it('should handle multiple image deletions', async () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

      // Delete first image
      mockApi.patchData.mockResolvedValueOnce({
        id: '1',
        fallbackImages: ['image2.jpg', 'image3.jpg'],
      });

      // Delete second image
      mockApi.patchData.mockResolvedValueOnce({
        id: '1',
        fallbackImages: ['image3.jpg'],
      });

      await jobCategoryService.deleteFallbackImage('1', images[0]);
      const result = await jobCategoryService.deleteFallbackImage('1', images[1]);

      expect(mockApi.patchData).toHaveBeenCalledTimes(2);
      expect(result.fallbackImages).toEqual(['image3.jpg']);
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.getData.mockRejectedValue(new Error('Request timeout'));

      await expect(jobCategoryService.getCategories()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Internal server error'));

      await expect(
        jobCategoryService.createCategory({
          name: 'Test',
          description: 'Test',
          colorCode: '#FF5733',
          iconName: 'test',
          fallbackImages: [],
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.patchData.mockRejectedValue(new Error('Unauthorized'));

      await expect(jobCategoryService.updateCategory('1', { name: 'New Name' })).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should handle invalid file types in image upload', async () => {
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      mockApi.patchData.mockRejectedValue(new Error('Invalid file type'));

      await expect(jobCategoryService.updateFallbackImages('1', [invalidFile])).rejects.toThrow(
        'Invalid file type'
      );
    });

    it('should handle file size limits', async () => {
      const oversizedFile = new File(['x'.repeat(50 * 1024 * 1024)], 'huge.jpg', {
        type: 'image/jpeg',
      });
      mockApi.patchData.mockRejectedValue(new Error('File too large'));

      await expect(jobCategoryService.updateFallbackImages('1', [oversizedFile])).rejects.toThrow(
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

      mockApi.patchData.mockResolvedValue({ id: '1', fallbackImages: [] });

      await jobCategoryService.updateFallbackImages('1', files);

      const [url, formData, options] = mockApi.patchData.mock.calls[0];

      expect(url).toBe('/job-offer-categories/1/fallback-images');
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

      mockApi.patchData.mockResolvedValue({ id: '1', fallbackImages: files.map(f => f.name) });

      const result = await jobCategoryService.updateFallbackImages('1', files);

      expect(result.fallbackImages).toEqual(['test.jpg', 'test.png', 'test.gif', 'test.webp']);
    });
  });
});
