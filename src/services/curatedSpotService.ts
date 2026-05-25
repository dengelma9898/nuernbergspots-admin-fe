import {
  CuratedSpot,
  CreateCuratedSpotDto,
  CuratedSpotsUserRatingsSettings,
  PatchCuratedSpotDto,
} from '../models/curated-spot';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useCuratedSpotService() {
  const api = useApi();

  return {
    listAdmin: async (): Promise<CuratedSpot[]> => {
      const response = await api.get<ApiResponse<CuratedSpot[]>>(endpoints.curatedSpotsAdmin);
      return unwrapData(response);
    },

    getAdmin: async (id: string): Promise<CuratedSpot> => {
      const response = await api.get<ApiResponse<CuratedSpot>>(endpoints.curatedSpotAdminById(id));
      return unwrapData(response);
    },

    create: async (dto: CreateCuratedSpotDto): Promise<CuratedSpot> => {
      const response = await api.post<ApiResponse<CuratedSpot>>(endpoints.curatedSpots, dto);
      return unwrapData(response);
    },

    patch: async (id: string, dto: PatchCuratedSpotDto): Promise<CuratedSpot> => {
      const response = await api.patch<ApiResponse<CuratedSpot>>(
        `${endpoints.curatedSpots}/${id}`,
        dto
      );
      return unwrapData(response);
    },

    /** Soft-Delete; Response laut Doku: aktualisierter Spot mit isDeleted: true */
    delete: async (id: string): Promise<CuratedSpot> => {
      const response = await api.delete<ApiResponse<CuratedSpot>>(
        `${endpoints.curatedSpots}/${id}`
      );
      return unwrapData(response);
    },

    uploadImages: async (id: string, files: File[]): Promise<CuratedSpot> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      const response = await api.post<ApiResponse<CuratedSpot>>(
        endpoints.curatedSpotImages(id),
        formData,
        { isFormData: true }
      );
      return unwrapData(response);
    },

    uploadVideo: async (id: string, file: File): Promise<CuratedSpot> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<ApiResponse<CuratedSpot>>(
        endpoints.curatedSpotVideo(id),
        formData,
        { isFormData: true }
      );
      return unwrapData(response);
    },

    getUserRatingsSettings: async (): Promise<CuratedSpotsUserRatingsSettings> => {
      const response = await api.get<ApiResponse<CuratedSpotsUserRatingsSettings>>(
        endpoints.curatedSpotsUserRatingsSettings
      );
      return unwrapData(response);
    },

    patchUserRatingsSettings: async (dto: {
      isEnabled: boolean;
    }): Promise<CuratedSpotsUserRatingsSettings> => {
      const response = await api.patch<ApiResponse<CuratedSpotsUserRatingsSettings>>(
        endpoints.curatedSpotsUserRatingsSettings,
        dto
      );
      return unwrapData(response);
    },
  };
}
