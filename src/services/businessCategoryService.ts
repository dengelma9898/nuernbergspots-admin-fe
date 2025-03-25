import { BusinessCategory } from '../models/business-category';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useBusinessCategoryService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Business-Kategorien
     */
    getCategories: async (): Promise<BusinessCategory[]> => {
      const response = await api.get<ApiResponse<BusinessCategory[]>>(endpoints.businessCategories);
      return unwrapData(response);
    },

    /**
     * Lädt eine spezifische Business-Kategorie
     */
    getCategory: async (categoryId: string): Promise<BusinessCategory> => {
      const response = await api.get<ApiResponse<BusinessCategory>>(`${endpoints.businessCategories}/${categoryId}`);
      return unwrapData(response);
    },

    /**
     * Erstellt eine neue Business-Kategorie
     */
    createCategory: async (category: Omit<BusinessCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCategory> => {
      const response = await api.post<ApiResponse<BusinessCategory>>(endpoints.businessCategories, category);
      return unwrapData(response);
    },

    /**
     * Aktualisiert eine Business-Kategorie
     */
    updateCategory: async (categoryId: string, category: Partial<BusinessCategory>): Promise<BusinessCategory> => {
      const response = await api.put<ApiResponse<BusinessCategory>>(`${endpoints.businessCategories}/${categoryId}`, category);
      return unwrapData(response);
    },

    /**
     * Löscht eine Business-Kategorie
     */
    deleteCategory: async (categoryId: string): Promise<void> => {
      return api.delete(`${endpoints.businessCategories}/${categoryId}`);
    },

    /**
     * Aktualisiert die Keywords einer Kategorie
     */
    updateCategoryKeywords: async (categoryId: string, keywordIds: string[]): Promise<BusinessCategory> => {
      const response = await api.put<ApiResponse<BusinessCategory>>(`${endpoints.businessCategories}/${categoryId}/keywords`, {
        keywordIds
      });
      return unwrapData(response);
    },

    /**
     * Lädt Kategorien nach Namen (Suche)
     */
    searchCategories: async (query: string): Promise<BusinessCategory[]> => {
      const response = await api.get<ApiResponse<BusinessCategory[]>>(`${endpoints.businessCategories}/search?q=${encodeURIComponent(query)}`);
      return unwrapData(response);
    },

    /**
     * Lädt Kategorien nach Icon-Name
     */
    getCategoriesByIcon: async (iconName: string): Promise<BusinessCategory[]> => {
      const response = await api.get<ApiResponse<BusinessCategory[]>>(`${endpoints.businessCategories}/icon/${encodeURIComponent(iconName)}`);
      return unwrapData(response);
    }
  };
} 