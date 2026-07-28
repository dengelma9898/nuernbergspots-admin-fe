import { Business, BusinessResponse, BusinessCustomerScans } from '../models/business';
import { BusinessCategory } from '../models/business-category';
import { useApi, endpoints } from '../lib/api';
import { NuernbergspotsReview } from '@/models/business';
import { useMemo } from 'react';

interface PendingApprovalsCount {
  count: number;
}

export function useBusinessService() {
  const api = useApi();

  return useMemo(
    () => ({
      /**
       * Lädt die Anzahl der Geschäfte, die auf Genehmigung warten
       */
      getPendingApprovalsCount: async (): Promise<number> => {
        const result = await api.getData<PendingApprovalsCount>(
          `${endpoints.businesses}/pending-approvals/count`
        );
        return result.count;
      },

      /**
       * Lädt alle Businesses
       */
      getBusinesses: async (): Promise<BusinessResponse[]> => {
        return api.getData<BusinessResponse[]>(endpoints.businesses);
      },

      /**
       * Lädt ein spezifisches Business
       */
      getBusiness: async (businessId: string): Promise<BusinessResponse> => {
        return api.getData<BusinessResponse>(`${endpoints.businesses}/${businessId}`);
      },

      /**
       * Erstellt ein neues Business
       */
      createBusiness: async (
        business: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
      ): Promise<BusinessResponse> => {
        return api.postData<BusinessResponse>(endpoints.businesses, business);
      },

      /**
       * Aktualisiert ein Business
       */
      updateBusiness: async (
        businessId: string,
        business: Partial<Business>
      ): Promise<BusinessResponse> => {
        return api.patchData<BusinessResponse>(`${endpoints.businesses}/${businessId}`, {
          ...business,
        });
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
        return api.getData<BusinessCategory[]>(endpoints.businessCategories);
      },

      /**
       * Lädt Businesses nach Kategorie
       */
      getBusinessesByCategory: async (categoryId: string): Promise<BusinessResponse[]> => {
        return api.getData<BusinessResponse[]>(`${endpoints.businesses}/category/${categoryId}`);
      },

      /**
       * Lädt Businesses in der Nähe einer Location
       */
      getNearbyBusinesses: async (
        latitude: number,
        longitude: number,
        radiusKm: number
      ): Promise<BusinessResponse[]> => {
        return api.getData<BusinessResponse[]>(
          `${endpoints.businesses}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
        );
      },

      /**
       * Aktualisiert die Bilder eines Businesses
       */
      updateBusinessImages: async (
        businessId: string,
        imageUrls: string[]
      ): Promise<BusinessResponse> => {
        return api.putData<BusinessResponse>(`${endpoints.businesses}/${businessId}/images`, {
          imageUrls,
        });
      },

      /**
       * Setzt das Logo eines Businesses
       */
      setBusinessLogo: async (businessId: string, logoUrl: string): Promise<BusinessResponse> => {
        return api.putData<BusinessResponse>(`${endpoints.businesses}/${businessId}/logo`, {
          logoUrl,
        });
      },

      /**
       * Aktualisiert die Öffnungszeiten eines Businesses
       */
      updateOpeningHours: async (
        businessId: string,
        openingHours: Record<string, string>
      ): Promise<BusinessResponse> => {
        return api.putData<BusinessResponse>(
          `${endpoints.businesses}/${businessId}/opening-hours`,
          {
            openingHours,
          }
        );
      },

      /**
       * Aktualisiert die NuernbergspotsReview eines Businesses
       */
      updateNuernbergspotsReview: async (
        businessId: string,
        review: NuernbergspotsReview
      ): Promise<BusinessResponse> => {
        return api.patchData<BusinessResponse>(
          `${endpoints.businesses}/${businessId}/nuernbergspots-review`,
          {
            reviewText: review.reviewText,
            reviewImageUrls: review.reviewImageUrls,
          }
        );
      },

      uploadReviewImages: async (businessId: string, images: File[]): Promise<BusinessResponse> => {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });

        return api.postData<BusinessResponse>(
          `${endpoints.businesses}/${businessId}/nuernbergspots-review/images`,
          formData,
          { isFormData: true }
        );
      },

      deleteReviewImage: async (
        businessId: string,
        imageUrl: string
      ): Promise<BusinessResponse> => {
        return api.deleteData<BusinessResponse>(
          `${endpoints.businesses}/${businessId}/nuernbergspots-review/images`,
          imageUrl
        );
      },

      /**
       * Lädt die Kundenscans aller Geschäfte
       */
      getCustomerScans: async (): Promise<BusinessCustomerScans[]> => {
        return api.getData<BusinessCustomerScans[]>(`${endpoints.businesses}/customer-scans`);
      },

      uploadLogo: async (businessId: string, file: File): Promise<BusinessResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.postData<BusinessResponse>(
          `${endpoints.businesses}/${businessId}/logo`,
          formData,
          {
            isFormData: true,
          }
        );
      },

      uploadBusinessImages: async (
        businessId: string,
        files: File[]
      ): Promise<BusinessResponse> => {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });
        return api.postData<BusinessResponse>(
          `${endpoints.businesses}/${businessId}/images`,
          formData,
          {
            isFormData: true,
          }
        );
      },
    }),
    [api]
  );
}
