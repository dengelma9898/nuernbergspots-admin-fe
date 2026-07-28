import { Keyword } from '../models/keyword';
import { useApi, endpoints } from '../lib/api';

export function useKeywordService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Keywords
     */
    getKeywords: async (): Promise<Keyword[]> => {
      return api.getData<Keyword[]>(endpoints.keywords);
    },

    /**
     * Lädt ein spezifisches Keyword
     */
    getKeyword: async (keywordId: string): Promise<Keyword> => {
      return api.getData<Keyword>(`${endpoints.keywords}/${keywordId}`);
    },

    /**
     * Erstellt ein neues Keyword
     */
    createKeyword: async (
      keyword: Omit<Keyword, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Keyword> => {
      return api.postData<Keyword>(endpoints.keywords, keyword);
    },

    /**
     * Aktualisiert ein Keyword
     */
    updateKeyword: async (keywordId: string, keyword: Partial<Keyword>): Promise<Keyword> => {
      return api.patchData<Keyword>(`${endpoints.keywords}/${keywordId}`, keyword);
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
      return api.getData<Keyword[]>(`${endpoints.keywords}/search?q=${encodeURIComponent(query)}`);
    },
  };
}
