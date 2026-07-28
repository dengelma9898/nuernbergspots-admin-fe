import { EventCategory, EventCategoryCreation } from '@/models/event-category';
import { useApi } from '@/lib/api';

export const useEventCategoryService = () => {
  const api = useApi();
  const baseUrl = '/event-categories';

  const getCategories = async (): Promise<EventCategory[]> => {
    return api.getData<EventCategory[]>(`${baseUrl}`);
  };

  const getCategory = async (id: string): Promise<EventCategory> => {
    return api.getData<EventCategory>(`${baseUrl}/${id}`);
  };

  const createCategory = async (category: EventCategoryCreation): Promise<EventCategory> => {
    return api.postData<EventCategory>(`${baseUrl}`, category);
  };

  const updateCategory = async (
    id: string,
    category: Partial<EventCategoryCreation>
  ): Promise<EventCategory> => {
    return api.patchData<EventCategory>(`${baseUrl}/${id}`, category);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await api.deleteData<void>(`${baseUrl}/${id}`);
  };

  const updateFallbackImages = async (id: string, files: File[]): Promise<EventCategory> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return api.patchData<EventCategory>(`${baseUrl}/${id}/fallback-images`, formData, {
      isFormData: true,
    });
  };

  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFallbackImages,
  };
};
