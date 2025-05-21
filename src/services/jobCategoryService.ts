import { JobCategory, JobCategoryCreation } from '@/models/job-category';
import { ApiResponse, unwrapData } from '@/lib/apiUtils';
import { useApi } from '@/lib/api';

export const useJobCategoryService = () => {
  const api = useApi();
  const baseUrl = '/job-offer-categories';

  const getCategories = async (): Promise<JobCategory[]> => {
    const response = await api.get<ApiResponse<JobCategory[]>>(`${baseUrl}`);
    return unwrapData(response);
  };

  const getCategory = async (id: string): Promise<JobCategory> => {
    const response = await api.get<ApiResponse<JobCategory>>(`${baseUrl}/${id}`);
    return unwrapData(response);
  };

  const createCategory = async (category: JobCategoryCreation): Promise<JobCategory> => {
    const response = await api.post<ApiResponse<JobCategory>>(`${baseUrl}`, category);
    return unwrapData(response);
  };

  const updateCategory = async (id: string, category: Partial<JobCategoryCreation>): Promise<JobCategory> => {
    const response = await api.patch<ApiResponse<JobCategory>>(`${baseUrl}/${id}`, category);
    return unwrapData(response);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`${baseUrl}/${id}`);
  };

  const updateFallbackImages = async (id: string, files: File[]): Promise<JobCategory> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.patch<ApiResponse<JobCategory>>(
      `${baseUrl}/${id}/fallback-images`,
      formData,
      { isFormData: true }
    );

    return unwrapData(response);
  };

  const deleteFallbackImage = async (id: string, imageUrl: string): Promise<JobCategory> => {
    const response = await api.patch<ApiResponse<JobCategory>>(
      `${baseUrl}/${id}/fallback-images/remove`,
      { imageUrl }
    );
    return unwrapData(response);
  };

  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFallbackImages,
    deleteFallbackImage
  };
}; 