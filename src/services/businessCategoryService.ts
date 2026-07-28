import { BusinessCategory, BusinessCategoryCreation } from '../models/business-category';
import { useApi, endpoints } from '../lib/api';

export function useBusinessCategoryService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Business-Kategorien
     */
    getCategories: async (): Promise<BusinessCategory[]> => {
      return api.getData<BusinessCategory[]>(`${endpoints.businessCategories}/with-keywords`);
    },

    /**
     * Lädt eine spezifische Business-Kategorie
     */
    getCategory: async (categoryId: string): Promise<BusinessCategory> => {
      return api.getData<BusinessCategory>(`${endpoints.businessCategories}/${categoryId}`);
    },

    /**
     * Erstellt eine neue Business-Kategorie
     */
    createCategory: async (category: BusinessCategoryCreation): Promise<BusinessCategory> => {
      return api.postData<BusinessCategory>(endpoints.businessCategories, category);
    },

    /**
     * Aktualisiert eine Business-Kategorie
     */
    updateCategory: async (
      categoryId: string,
      category: Partial<BusinessCategoryCreation>
    ): Promise<BusinessCategory> => {
      return api.patchData<BusinessCategory>(
        `${endpoints.businessCategories}/${categoryId}`,
        category
      );
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
    updateCategoryKeywords: async (
      categoryId: string,
      keywordIds: string[]
    ): Promise<BusinessCategory> => {
      return api.putData<BusinessCategory>(
        `${endpoints.businessCategories}/${categoryId}/keywords`,
        {
          keywordIds,
        }
      );
    },

    /**
     * Lädt Kategorien nach Namen (Suche)
     */
    searchCategories: async (query: string): Promise<BusinessCategory[]> => {
      return api.getData<BusinessCategory[]>(
        `${endpoints.businessCategories}/search?q=${encodeURIComponent(query)}`
      );
    },

    /**
     * Lädt Kategorien nach Icon-Name
     */
    getCategoriesByIcon: async (iconName: string): Promise<BusinessCategory[]> => {
      return api.getData<BusinessCategory[]>(
        `${endpoints.businessCategories}/icon/${encodeURIComponent(iconName)}`
      );
    },
  };
}
