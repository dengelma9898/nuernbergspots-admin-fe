import type { Mock } from 'vitest';
// Job Offer Service Tests

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
}));

import { useJobOfferService } from '../jobOfferService';

describe('Job Offer Service', () => {
  let jobOfferService: ReturnType<typeof useJobOfferService>;

  beforeEach(() => {
    vi.clearAllMocks();
    jobOfferService = useJobOfferService();
  });

  describe('getJobOffers', () => {
    it('should fetch all job offers successfully', async () => {
      const mockJobOffers = [
        { id: '1', title: 'Software Developer', company: 'Tech Corp', location: 'Berlin' },
        { id: '2', title: 'Product Manager', company: 'Startup Inc', location: 'Munich' },
      ];
      mockApi.getData.mockResolvedValue(mockJobOffers);

      const result = await jobOfferService.getJobOffers();

      expect(mockApi.getData).toHaveBeenCalledWith('/job-offers');
      expect(result).toEqual(mockJobOffers);
    });

    it('should handle API errors', async () => {
      mockApi.getData.mockRejectedValue(new Error('Network error'));

      await expect(jobOfferService.getJobOffers()).rejects.toThrow('Network error');
    });
  });

  describe('getJobOffer', () => {
    it('should fetch a specific job offer', async () => {
      const mockJobOffer = {
        id: '1',
        title: 'Software Developer',
        company: 'Tech Corp',
        description: 'Great opportunity',
        location: 'Berlin',
      };
      mockApi.getData.mockResolvedValue(mockJobOffer);

      const result = await jobOfferService.getJobOffer('1');

      expect(mockApi.getData).toHaveBeenCalledWith('/job-offers/1');
      expect(result).toEqual(mockJobOffer);
    });
  });

  describe('createJobOffer', () => {
    it('should create a new job offer', async () => {
      const jobOfferData = {
        title: 'New Job',
        companyLogo: 'logo.png',
        generalDescription: 'Job description',
        neededProfile: 'Developer profile',
        tasks: ['Development', 'Testing'],
        benefits: ['Health insurance', 'Flexible hours'],
        images: [],
        location: {
          address: 'Hamburg, Germany',
          latitude: 53.5511,
          longitude: 9.9937,
        },
        typeOfEmployment: 'Full-time',
        homeOffice: true,
        wage: '50000-70000',
        startDate: '2024-02-01',
        contactData: {
          email: 'hr@company.com',
          person: 'HR Manager',
        },
        link: 'https://company.com/jobs/1',
        isHighlight: false,
        jobOfferCategoryId: 'category1',
      };
      const createdJobOffer = {
        id: '1',
        ...jobOfferData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.postData.mockResolvedValue(createdJobOffer);

      const result = await jobOfferService.createJobOffer(jobOfferData);

      expect(mockApi.postData).toHaveBeenCalledWith('/job-offers', jobOfferData);
      expect(result).toEqual(createdJobOffer);
    });
  });

  describe('updateJobOffer', () => {
    it('should update an existing job offer', async () => {
      const updateData = { title: 'Updated Job Title', salary: '60000-80000' };
      const updatedJobOffer = {
        id: '1',
        title: 'Updated Job Title',
        company: 'Tech Corp',
        salary: '60000-80000',
        updatedAt: '2024-01-02',
      };
      mockApi.patchData.mockResolvedValue(updatedJobOffer);

      const result = await jobOfferService.updateJobOffer('1', updateData);

      expect(mockApi.patchData).toHaveBeenCalledWith('/job-offers/1', updateData);
      expect(result).toEqual(updatedJobOffer);
    });
  });

  describe('deleteJobOffer', () => {
    it('should delete a job offer', async () => {
      mockApi.deleteData.mockResolvedValue(undefined);

      await jobOfferService.deleteJobOffer('1');

      expect(mockApi.deleteData).toHaveBeenCalledWith('/job-offers/1');
    });
  });

  describe('updateImages', () => {
    it('should update job offer images', async () => {
      const mockFiles = [
        new File(['test'], 'office1.jpg', { type: 'image/jpeg' }),
        new File(['test'], 'office2.jpg', { type: 'image/jpeg' }),
      ];
      const updatedJobOffer = {
        id: '1',
        title: 'Software Developer',
        images: ['office1.jpg', 'office2.jpg'],
      };
      mockApi.patchData.mockResolvedValue(updatedJobOffer);

      const result = await jobOfferService.updateImages('1', mockFiles);

      expect(mockApi.patchData).toHaveBeenCalledWith('/job-offers/1/images', expect.any(FormData), {
        isFormData: true,
      });
      expect(result).toEqual(updatedJobOffer);
    });

    it('should handle empty files array', async () => {
      const updatedJobOffer = {
        id: '1',
        title: 'Software Developer',
        images: [],
      };
      mockApi.patchData.mockResolvedValue(updatedJobOffer);

      const result = await jobOfferService.updateImages('1', []);

      expect(mockApi.patchData).toHaveBeenCalledWith('/job-offers/1/images', expect.any(FormData), {
        isFormData: true,
      });
      expect(result).toEqual(updatedJobOffer);
    });
  });

  describe('updateCompanyLogo', () => {
    it('should update company logo', async () => {
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
      const updatedJobOffer = {
        id: '1',
        title: 'Software Developer',
        companyLogo: 'logo.png',
      };
      mockApi.patchData.mockResolvedValue(updatedJobOffer);

      const result = await jobOfferService.updateCompanyLogo('1', mockFile);

      expect(mockApi.patchData).toHaveBeenCalledWith(
        '/job-offers/1/company-logo',
        expect.any(FormData),
        { isFormData: true }
      );
      expect(result).toEqual(updatedJobOffer);
    });
  });

  describe('error handling', () => {
    it('should handle create job offer errors', async () => {
      mockApi.postData.mockRejectedValue(new Error('Creation failed'));

      await expect(
        jobOfferService.createJobOffer({
          title: 'Test Job',
          companyLogo: 'logo.png',
          generalDescription: 'Test description',
          neededProfile: 'Test profile',
          tasks: ['Task 1'],
          benefits: ['Benefit 1'],
          images: [],
          location: {
            address: 'Test Location',
            latitude: 0,
            longitude: 0,
          },
          typeOfEmployment: 'Full-time',
          homeOffice: false,
          startDate: '2024-01-01',
          contactData: {
            email: 'test@test.com',
          },
          link: 'https://test.com',
          isHighlight: false,
          jobOfferCategoryId: 'category1',
        })
      ).rejects.toThrow('Creation failed');
    });

    it('should handle update job offer errors', async () => {
      mockApi.patchData.mockRejectedValue(new Error('Update failed'));

      await expect(jobOfferService.updateJobOffer('1', { title: 'New Title' })).rejects.toThrow(
        'Update failed'
      );
    });

    it('should handle delete job offer errors', async () => {
      mockApi.deleteData.mockRejectedValue(new Error('Delete failed'));

      await expect(jobOfferService.deleteJobOffer('1')).rejects.toThrow('Delete failed');
    });

    it('should handle image update errors', async () => {
      const mockFiles = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })];
      mockApi.patchData.mockRejectedValue(new Error('Image update failed'));

      await expect(jobOfferService.updateImages('1', mockFiles)).rejects.toThrow(
        'Image update failed'
      );
    });

    it('should handle company logo update errors', async () => {
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
      mockApi.patchData.mockRejectedValue(new Error('Logo update failed'));

      await expect(jobOfferService.updateCompanyLogo('1', mockFile)).rejects.toThrow(
        'Logo update failed'
      );
    });
  });

  describe('FormData handling', () => {
    it('should properly append multiple files to FormData for images', async () => {
      const mockFiles = [
        new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'image2.jpg', { type: 'image/jpeg' }),
      ];
      const updatedJobOffer = { id: '1', images: ['image1.jpg', 'image2.jpg'] };
      mockApi.patchData.mockResolvedValue(updatedJobOffer);

      await jobOfferService.updateImages('1', mockFiles);

      const formDataCall = mockApi.patchData.mock.calls[0];
      const formData = formDataCall[1];

      expect(formData).toBeInstanceOf(FormData);
      expect(formDataCall[2]).toEqual({ isFormData: true });
    });

    it('should properly append single file to FormData for company logo', async () => {
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
      const updatedJobOffer = { id: '1', companyLogo: 'logo.png' };
      mockApi.patchData.mockResolvedValue(updatedJobOffer);

      await jobOfferService.updateCompanyLogo('1', mockFile);

      const formDataCall = mockApi.patchData.mock.calls[0];
      const formData = formDataCall[1];

      expect(formData).toBeInstanceOf(FormData);
      expect(formDataCall[2]).toEqual({ isFormData: true });
    });
  });
});
