import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem, Reaction } from '../models/news';

export function useNewsService() {
  const api = useApi();

  return {
    /**
     * Holt alle News
     */
    getAll: async (): Promise<NewsItem[]> => {
      const response = await api.get<ApiResponse<NewsItem[]>>(endpoints.news);
      return unwrapData(response);
    },

    /**
     * Holt eine News per ID
     */
    getById: async (id: string): Promise<NewsItem> => {
      const response = await api.get<ApiResponse<NewsItem>>(`${endpoints.news}/${id}`);
      return unwrapData(response);
    },

    /**
     * Erstellt eine Text-News
     */
    createTextNews: async (data: { content: string; authorId: string }): Promise<TextNewsItem> => {
      const response = await api.post<ApiResponse<TextNewsItem>>(`${endpoints.news}/text`, data);
      return unwrapData(response);
    },

    /**
     * Erstellt eine Image-News
     */
    createImageNews: async (data: Omit<ImageNewsItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'type'> & { authorId: string }): Promise<ImageNewsItem> => {
      const response = await api.post<ApiResponse<ImageNewsItem>>(`${endpoints.news}/image`, data);
      return unwrapData(response);
    },

    /**
     * Erstellt eine Poll-News
     */
    createPollNews: async (data: { content: string; authorId: string; pollInfo: { options: { id: string; text: string; voters: string[] }[]; allowMultipleChoices: boolean; expiresAt?: string } }): Promise<PollNewsItem> => {
      const response = await api.post<ApiResponse<PollNewsItem>>(`${endpoints.news}/poll`, data);
      return unwrapData(response);
    },

    /**
     * Stimmt bei einer Umfrage ab
     */
    votePoll: async (id: string, voteData: { optionId: string }): Promise<PollNewsItem> => {
      const response = await api.patch<ApiResponse<PollNewsItem>>(`${endpoints.news}/${id}/poll-vote`, voteData);
      return unwrapData(response);
    },

    /**
     * Reagiert auf eine News
     */
    postReaction: async (id: string, reactionData: Reaction): Promise<NewsItem> => {
      const response = await api.patch<ApiResponse<NewsItem>>(`${endpoints.news}/${id}/react`, reactionData);
      return unwrapData(response);
    },

    /**
     * Löscht eine News
     */
    delete: async (id: string): Promise<void> => {
      await api.delete(`${endpoints.news}/${id}`);
    },

    /**
     * Aktualisiert eine News
     */
    update: async (id: string, updateData: Partial<NewsItem>): Promise<NewsItem> => {
      const response = await api.put<ApiResponse<NewsItem>>(`${endpoints.news}/${id}`, updateData);
      return unwrapData(response);
    },

    /**
     * Aktualisiert die Bilder einer Image-News
     */
    updateNewsImages: async (id: string, files: File[]): Promise<ImageNewsItem> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      const response = await api.patch<ApiResponse<ImageNewsItem>>(
        `${endpoints.news}/${id}/images`,
        formData,
        { isFormData: true }
      );
      return unwrapData(response);
    },
  };
} 