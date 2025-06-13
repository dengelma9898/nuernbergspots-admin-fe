import { EventCategory, EventCategoryCreation } from '@/modules/events/models';
import { ApiResponse, unwrapData } from '@/lib/apiUtils';
import { useApi, endpoints } from '@/lib/api';

export const useEventCategoryService = () => {
  const api = useApi();

  const getCategories = async (): Promise<EventCategory[]> => {
    const response = await api.get<ApiResponse<EventCategory[]>>(endpoints.eventCategories);
    return unwrapData(response);
  };

  const getCategory = async (id: string): Promise<EventCategory> => {
    const response = await api.get<ApiResponse<EventCategory>>(`${endpoints.eventCategories}/${id}`);
    return unwrapData(response);
  };

  const createCategory = async (category: EventCategoryCreation): Promise<EventCategory> => {
    // Validate category data
    if (!category.name?.trim()) {
      throw new Error('Category name is required');
    }
    
    if (!category.colorCode?.trim()) {
      throw new Error('Category color is required');
    }

    const response = await api.post<ApiResponse<EventCategory>>(endpoints.eventCategories, category);
    return unwrapData(response);
  };

  const updateCategory = async (id: string, category: Partial<EventCategoryCreation>): Promise<EventCategory> => {
    // Validate update data if provided
    if (category.name !== undefined && !category.name?.trim()) {
      throw new Error('Category name cannot be empty');
    }
    
    if (category.colorCode !== undefined && !category.colorCode?.trim()) {
      throw new Error('Category color cannot be empty');
    }

    const response = await api.patch<ApiResponse<EventCategory>>(`${endpoints.eventCategories}/${id}`, category);
    return unwrapData(response);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`${endpoints.eventCategories}/${id}`);
  };

  const updateFallbackImages = async (id: string, files: File[]): Promise<EventCategory> => {
    if (files.length === 0) {
      throw new Error('At least one image file is required');
    }

    const formData = new FormData();
    files.forEach((file) => {
      // Validate file types
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not a valid image`);
      }
      
      // Validate file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large (max 5MB)`);
      }
      
      formData.append('images', file);
    });

    const response = await api.patch<ApiResponse<EventCategory>>(
      `${endpoints.eventCategories}/${id}/fallback-images`,
      formData,
      { isFormData: true }
    );

    return unwrapData(response);
  };

  const getCategoriesWithEventCount = async (): Promise<(EventCategory & { eventCount: number })[]> => {
    const response = await api.get<ApiResponse<(EventCategory & { eventCount: number })[]>>(
      `${endpoints.eventCategories}/with-counts`
    );
    return unwrapData(response);
  };

  const getPopularCategories = async (limit: number = 10): Promise<EventCategory[]> => {
    const response = await api.get<ApiResponse<EventCategory[]>>(
      `${endpoints.eventCategories}/popular?limit=${limit}`
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
    getCategoriesWithEventCount,
    getPopularCategories
  };
}; 