import { EventCategory, EventCategoryCreation } from '@/models/event-category';
import { ApiResponse, unwrapData } from '@/lib/apiUtils';
import { useApi } from '@/lib/api';

export const useEventCategoryService = () => {
  const api = useApi();
  const baseUrl = '/event-categories';

  const getCategories = async (): Promise<EventCategory[]> => {
    const response = await api.get<ApiResponse<EventCategory[]>>(`${baseUrl}`);
    return unwrapData(response);
  };

  const getCategory = async (id: string): Promise<EventCategory> => {
    const response = await api.get<ApiResponse<EventCategory>>(`${baseUrl}/${id}`);
    return unwrapData(response);
  };

  const createCategory = async (category: EventCategoryCreation): Promise<EventCategory> => {
    const response = await api.post<ApiResponse<EventCategory>>(`${baseUrl}`, category);
    return unwrapData(response);
  };

  const updateCategory = async (id: string, category: Partial<EventCategoryCreation>): Promise<EventCategory> => {
    const response = await api.patch<ApiResponse<EventCategory>>(`${baseUrl}/${id}`, category);
    return unwrapData(response);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`${baseUrl}/${id}`);
  };

  const updateFallbackImages = async (id: string, files: File[]): Promise<EventCategory> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.patch<ApiResponse<EventCategory>>(
      `${baseUrl}/${id}/fallback-images`,
      formData,
      { isFormData: true }
    );

    return unwrapData(response);
  };

  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFallbackImages
  };
}; 