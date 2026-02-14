import {
  TaxiStand,
  CreateTaxiStandDto,
  UpdateTaxiStandDto,
  TaxiStandFeatureStatus,
} from '../models/taxi-stand';
import { useApi } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';

export function useTaxiStandService() {
  const api = useApi();
  const baseUrl = '/taxi-stands';

  return {
    /**
     * Lädt den Feature-Status der Taxistandorte
     */
    getFeatureStatus: async (): Promise<TaxiStandFeatureStatus> => {
      const response = await api.get<ApiResponse<TaxiStandFeatureStatus>>(
        `${baseUrl}/feature-status`
      );
      return unwrapData(response);
    },

    /**
     * Setzt den Feature-Status der Taxistandorte (nur Admin/Super Admin)
     */
    setFeatureStatus: async (
      isFeatureActive: boolean,
      startDate?: string
    ): Promise<TaxiStandFeatureStatus> => {
      const response = await api.put<ApiResponse<TaxiStandFeatureStatus>>(
        `${baseUrl}/feature-status`,
        { isFeatureActive, startDate }
      );
      return unwrapData(response);
    },

    /**
     * Lädt alle Taxistandorte
     */
    getAll: async (): Promise<TaxiStand[]> => {
      const response = await api.get<ApiResponse<TaxiStand[]>>(baseUrl);
      return unwrapData(response);
    },

    /**
     * Lädt einen spezifischen Taxistandort
     */
    getById: async (id: string): Promise<TaxiStand> => {
      const response = await api.get<ApiResponse<TaxiStand>>(`${baseUrl}/${id}`);
      return unwrapData(response);
    },

    /**
     * Erstellt einen neuen Taxistandort
     */
    create: async (dto: CreateTaxiStandDto): Promise<TaxiStand> => {
      const response = await api.post<ApiResponse<TaxiStand>>(baseUrl, dto);
      return unwrapData(response);
    },

    /**
     * Aktualisiert einen Taxistandort
     */
    update: async (id: string, dto: UpdateTaxiStandDto): Promise<TaxiStand> => {
      const response = await api.patch<ApiResponse<TaxiStand>>(`${baseUrl}/${id}`, dto);
      return unwrapData(response);
    },

    /**
     * Löscht einen Taxistandort
     */
    delete: async (id: string): Promise<void> => {
      await api.delete(`${baseUrl}/${id}`);
    },
  };
}
