import {
  CuratedSpot,
  CreateCuratedSpotDto,
  CuratedSpotsUserRatingsSettings,
  PatchCuratedSpotDto,
} from '../models/curated-spot';
import { useApi, endpoints } from '../lib/api';

export function useCuratedSpotService() {
  const api = useApi();

  return {
    listAdmin: async (): Promise<CuratedSpot[]> => {
      return api.getData<CuratedSpot[]>(endpoints.curatedSpotsAdmin);
    },

    getAdmin: async (id: string): Promise<CuratedSpot> => {
      return api.getData<CuratedSpot>(endpoints.curatedSpotAdminById(id));
    },

    create: async (dto: CreateCuratedSpotDto): Promise<CuratedSpot> => {
      return api.postData<CuratedSpot>(endpoints.curatedSpots, dto);
    },

    patch: async (id: string, dto: PatchCuratedSpotDto): Promise<CuratedSpot> => {
      return api.patchData<CuratedSpot>(`${endpoints.curatedSpots}/${id}`, dto);
    },

    /** Soft-Delete; Response laut Doku: aktualisierter Spot mit isDeleted: true */
    delete: async (id: string): Promise<CuratedSpot> => {
      return api.deleteData<CuratedSpot>(`${endpoints.curatedSpots}/${id}`);
    },

    uploadImages: async (id: string, files: File[]): Promise<CuratedSpot> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      return api.postData<CuratedSpot>(endpoints.curatedSpotImages(id), formData, {
        isFormData: true,
      });
    },

    uploadVideo: async (id: string, file: File): Promise<CuratedSpot> => {
      const formData = new FormData();
      formData.append('file', file);
      return api.postData<CuratedSpot>(endpoints.curatedSpotVideo(id), formData, {
        isFormData: true,
      });
    },

    getUserRatingsSettings: async (): Promise<CuratedSpotsUserRatingsSettings> => {
      return api.getData<CuratedSpotsUserRatingsSettings>(
        endpoints.curatedSpotsUserRatingsSettings
      );
    },

    patchUserRatingsSettings: async (dto: {
      isEnabled: boolean;
    }): Promise<CuratedSpotsUserRatingsSettings> => {
      return api.patchData<CuratedSpotsUserRatingsSettings>(
        endpoints.curatedSpotsUserRatingsSettings,
        dto
      );
    },
  };
}
