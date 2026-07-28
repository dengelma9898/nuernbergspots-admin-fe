import { CreateSpotKeywordDto, SpotKeyword } from '../models/spot-keyword';
import { useApi, endpoints } from '../lib/api';

export function useSpotKeywordService() {
  const api = useApi();

  return {
    /**
     * Prefix-Suche auf Spot-Keywords (authentifiziert; q darf nicht leer sein).
     */
    suggest: async (q: string, limit?: number): Promise<SpotKeyword[]> => {
      const trimmed = q.trim();
      if (!trimmed) {
        return [];
      }
      return api.getData<SpotKeyword[]>(endpoints.spotKeywordsSuggest(trimmed, limit));
    },

    /**
     * Legt ein Spot-Keyword an (Admin). Duplikat nach nameLower → bestehendes Dokument.
     */
    create: async (dto: CreateSpotKeywordDto): Promise<SpotKeyword> => {
      return api.postData<SpotKeyword>(endpoints.spotKeywords, dto);
    },

    /**
     * Lädt ein Spot-Keyword nach ID (z. B. Anzeigenamen in Bearbeitungsformularen).
     */
    getById: async (id: string): Promise<SpotKeyword> => {
      return api.getData<SpotKeyword>(endpoints.spotKeywordById(id));
    },
  };
}
