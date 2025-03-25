import { Keyword } from '../models/keyword';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useKeywordService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Keywords
     */
    getKeywords: async (): Promise<Keyword[]> => {
      const response = await api.get<ApiResponse<Keyword[]>>(endpoints.keywords);
      return unwrapData(response);
    },

    /**
     * Lädt ein spezifisches Keyword
     */
    getKeyword: async (keywordId: string): Promise<Keyword> => {
      const response = await api.get<ApiResponse<Keyword>>(`${endpoints.keywords}/${keywordId}`);
      return unwrapData(response);
    },

    /**
     * Erstellt ein neues Keyword
     */
    createKeyword: async (keyword: Omit<Keyword, 'id' | 'createdAt' | 'updatedAt'>): Promise<Keyword> => {
      const response = await api.post<ApiResponse<Keyword>>(endpoints.keywords, keyword);
      return unwrapData(response);
    },

    /**
     * Aktualisiert ein Keyword
     */
    updateKeyword: async (keywordId: string, keyword: Partial<Keyword>): Promise<Keyword> => {
      const response = await api.put<ApiResponse<Keyword>>(`${endpoints.keywords}/${keywordId}`, keyword);
      return unwrapData(response);
    },

    /**
     * Löscht ein Keyword
     */
    deleteKeyword: async (keywordId: string): Promise<void> => {
      return api.delete(`${endpoints.keywords}/${keywordId}`);
    },

    /**
     * Lädt Keywords nach Namen (Suche)
     */
    searchKeywords: async (query: string): Promise<Keyword[]> => {
      const response = await api.get<ApiResponse<Keyword[]>>(`${endpoints.keywords}/search?q=${encodeURIComponent(query)}`);
      return unwrapData(response);
    }
  };
} 