import { CreateSpotKeywordDto, SpotKeyword } from '../models/spot-keyword';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

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
      const response = await api.get<ApiResponse<SpotKeyword[]>>(
        endpoints.spotKeywordsSuggest(trimmed, limit)
      );
      return unwrapData(response);
    },

    /**
     * Legt ein Spot-Keyword an (Admin). Duplikat nach nameLower → bestehendes Dokument.
     */
    create: async (dto: CreateSpotKeywordDto): Promise<SpotKeyword> => {
      const response = await api.post<ApiResponse<SpotKeyword>>(endpoints.spotKeywords, dto);
      return unwrapData(response);
    },

    /**
     * Lädt ein Spot-Keyword nach ID (z. B. Anzeigenamen in Bearbeitungsformularen).
     */
    getById: async (id: string): Promise<SpotKeyword> => {
      const response = await api.get<ApiResponse<SpotKeyword>>(endpoints.spotKeywordById(id));
      return unwrapData(response);
    },
  };
}
