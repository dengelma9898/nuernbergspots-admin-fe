import { Business, BusinessResponse, BusinessStatus } from '../models/business';
import { BusinessCategory } from '../models/business-category';
import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { NuernbergspotsReview } from '@/models/business';

export function useBusinessService() {
  const api = useApi();

  return {
    /**
     * Lädt alle Businesses
     */
    getBusinesses: async (): Promise<BusinessResponse[]> => {
      const response = await api.get<ApiResponse<BusinessResponse[]>>(endpoints.businesses);
      return unwrapData(response);
    },

    /**
     * Lädt ein spezifisches Business
     */
    getBusiness: async (businessId: string): Promise<BusinessResponse> => {
      const response = await api.get<ApiResponse<BusinessResponse>>(`${endpoints.businesses}/${businessId}`);
      return unwrapData(response);
    },

    /**
     * Erstellt ein neues Business
     */
    createBusiness: async (business: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<BusinessResponse> => {
      const response = await api.post<ApiResponse<BusinessResponse>>(endpoints.businesses, business);
      return unwrapData(response);
    },

    /**
     * Aktualisiert ein Business
     */
    updateBusiness: async (businessId: string, business: Partial<Business>): Promise<BusinessResponse> => {
      console.log('updateBusiness: business', business);
      const response = await api.patch<ApiResponse<BusinessResponse>>(
        `${endpoints.businesses}/${businessId}`, 
        { ...business }
      );
      return unwrapData(response);
    },

    /**
     * Löscht ein Business (Soft Delete)
     */
    deleteBusiness: async (businessId: string): Promise<void> => {
      await api.delete(`${endpoints.businesses}/${businessId}`);
    },

    /**
     * Lädt alle Business-Kategorien
     */
    getCategories: async (): Promise<BusinessCategory[]> => {
      const response = await api.get<ApiResponse<BusinessCategory[]>>(endpoints.businessCategories);
      return unwrapData(response);
    },

    /**
     * Lädt Businesses nach Kategorie
     */
    getBusinessesByCategory: async (categoryId: string): Promise<BusinessResponse[]> => {
      const response = await api.get<ApiResponse<BusinessResponse[]>>(`${endpoints.businesses}/category/${categoryId}`);
      return unwrapData(response);
    },

    /**
     * Lädt Businesses in der Nähe einer Location
     */
    getNearbyBusinesses: async (latitude: number, longitude: number, radiusKm: number): Promise<BusinessResponse[]> => {
      const response = await api.get<ApiResponse<BusinessResponse[]>>(`${endpoints.businesses}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`);
      return unwrapData(response);
    },

    /**
     * Aktualisiert die Bilder eines Businesses
     */
    updateBusinessImages: async (businessId: string, imageUrls: string[]): Promise<BusinessResponse> => {
      const response = await api.put<ApiResponse<BusinessResponse>>(`${endpoints.businesses}/${businessId}/images`, {
        imageUrls
      });
      return unwrapData(response);
    },

    /**
     * Setzt das Logo eines Businesses
     */
    setBusinessLogo: async (businessId: string, logoUrl: string): Promise<BusinessResponse> => {
      const response = await api.put<ApiResponse<BusinessResponse>>(`${endpoints.businesses}/${businessId}/logo`, {
        logoUrl
      });
      return unwrapData(response);
    },

    /**
     * Aktualisiert die Öffnungszeiten eines Businesses
     */
    updateOpeningHours: async (businessId: string, openingHours: Record<string, string>): Promise<BusinessResponse> => {
      const response = await api.put<ApiResponse<BusinessResponse>>(`${endpoints.businesses}/${businessId}/opening-hours`, {
        openingHours
      });
      return unwrapData(response);
    },

    /**
     * Aktualisiert die NuernbergspotsReview eines Businesses
     */
    updateNuernbergspotsReview: async (businessId: string, review: NuernbergspotsReview): Promise<BusinessResponse> => {
      const response = await api.patch<ApiResponse<BusinessResponse>>(
         `${endpoints.businesses}/${businessId}/nuernbergspots-review`,
        {
            'reviewText': review.reviewText,
            'reviewImageUrls': review.reviewImageUrls,
        }
      );
      return unwrapData(response);
    },

    uploadReviewImages: async (businessId: string, images: File[]): Promise<BusinessResponse> => {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await api.post<ApiResponse<BusinessResponse>>(
        `${endpoints.businesses}/${businessId}/nuernbergspots-review/images`,
        formData,
        { isFormData: true }
      );
      return unwrapData(response);
    },

    deleteReviewImage: async (businessId: string, imageUrl: string): Promise<BusinessResponse> => {
      const response = await api.delete<ApiResponse<BusinessResponse>>(
        `${endpoints.businesses}/${businessId}/nuernbergspots-review/images`,
        imageUrl
      );
      return unwrapData(response);
    }
  };
} 