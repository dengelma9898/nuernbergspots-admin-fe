import { useApi, endpoints } from '../lib/api';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem, Reaction } from '../models/news';

export function useNewsService() {
  const api = useApi();

  return {
    /**
     * Holt alle News
     */
    getAll: async (): Promise<NewsItem[]> => {
      const data = await api.getData<NewsItem[]>(endpoints.news);
      return Array.isArray(data) ? data : [];
    },

    /**
     * Holt eine News per ID
     */
    getById: async (id: string): Promise<NewsItem> => {
      return api.getData<NewsItem>(`${endpoints.news}/${id}`);
    },

    /**
     * Erstellt eine Text-News
     */
    createTextNews: async (data: { content: string; authorId: string }): Promise<TextNewsItem> => {
      return api.postData<TextNewsItem>(`${endpoints.news}/text`, data);
    },

    /**
     * Erstellt eine Image-News
     */
    createImageNews: async (
      data: Omit<ImageNewsItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'type'> & {
        authorId: string;
      }
    ): Promise<ImageNewsItem> => {
      return api.postData<ImageNewsItem>(`${endpoints.news}/image`, data);
    },

    /**
     * Erstellt eine Poll-News
     */
    createPollNews: async (data: {
      content: string;
      authorId: string;
      pollInfo: {
        options: { id: string; text: string; voters: string[] }[];
        allowMultipleChoices: boolean;
        expiresAt?: string;
      };
    }): Promise<PollNewsItem> => {
      return api.postData<PollNewsItem>(`${endpoints.news}/poll`, data);
    },

    /**
     * Stimmt bei einer Umfrage ab
     */
    votePoll: async (id: string, voteData: { optionId: string }): Promise<PollNewsItem> => {
      return api.patchData<PollNewsItem>(`${endpoints.news}/${id}/poll-vote`, voteData);
    },

    /**
     * Reagiert auf eine News
     */
    postReaction: async (id: string, reactionData: Reaction): Promise<NewsItem> => {
      return api.patchData<NewsItem>(`${endpoints.news}/${id}/react`, reactionData);
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
      return api.putData<NewsItem>(`${endpoints.news}/${id}`, updateData);
    },

    /**
     * Aktualisiert die Bilder einer Image-News
     */
    updateNewsImages: async (id: string, files: File[]): Promise<ImageNewsItem> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      return api.patchData<ImageNewsItem>(`${endpoints.news}/${id}/images`, formData, {
        isFormData: true,
      });
    },
  };
}
