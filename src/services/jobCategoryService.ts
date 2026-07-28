import { JobCategory, JobCategoryCreation } from '@/models/job-category';
import { useApi } from '@/lib/api';

export const useJobCategoryService = () => {
  const api = useApi();
  const baseUrl = '/job-offer-categories';

  const getCategories = async (): Promise<JobCategory[]> => {
    return api.getData<JobCategory[]>(`${baseUrl}`);
  };

  const getCategory = async (id: string): Promise<JobCategory> => {
    return api.getData<JobCategory>(`${baseUrl}/${id}`);
  };

  const createCategory = async (category: JobCategoryCreation): Promise<JobCategory> => {
    return api.postData<JobCategory>(`${baseUrl}`, category);
  };

  const updateCategory = async (
    id: string,
    category: Partial<JobCategoryCreation>
  ): Promise<JobCategory> => {
    return api.patchData<JobCategory>(`${baseUrl}/${id}`, category);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await api.deleteData<void>(`${baseUrl}/${id}`);
  };

  const updateFallbackImages = async (id: string, files: File[]): Promise<JobCategory> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return api.patchData<JobCategory>(`${baseUrl}/${id}/fallback-images`, formData, {
      isFormData: true,
    });
  };

  const deleteFallbackImage = async (id: string, imageUrl: string): Promise<JobCategory> => {
    return api.patchData<JobCategory>(`${baseUrl}/${id}/fallback-images/remove`, { imageUrl });
  };

  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFallbackImages,
    deleteFallbackImage,
  };
};
