import {
  TaxiStand,
  CreateTaxiStandDto,
  UpdateTaxiStandDto,
  TaxiStandFeatureStatus,
} from '../models/taxi-stand';
import { useApi } from '../lib/api';

export function useTaxiStandService() {
  const api = useApi();
  const baseUrl = '/taxi-stands';

  return {
    /**
     * Lädt den Feature-Status der Taxistandorte
     */
    getFeatureStatus: async (): Promise<TaxiStandFeatureStatus> => {
      return api.getData<TaxiStandFeatureStatus>(`${baseUrl}/feature-status`);
    },

    /**
     * Setzt den Feature-Status der Taxistandorte (nur Admin/Super Admin)
     */
    setFeatureStatus: async (
      isFeatureActive: boolean,
      startDate?: string
    ): Promise<TaxiStandFeatureStatus> => {
      return api.putData<TaxiStandFeatureStatus>(`${baseUrl}/feature-status`, {
        isFeatureActive,
        startDate,
      });
    },

    /**
     * Lädt alle Taxistandorte
     */
    getAll: async (): Promise<TaxiStand[]> => {
      return api.getData<TaxiStand[]>(baseUrl);
    },

    /**
     * Lädt einen spezifischen Taxistandort
     */
    getById: async (id: string): Promise<TaxiStand> => {
      return api.getData<TaxiStand>(`${baseUrl}/${id}`);
    },

    /**
     * Erstellt einen neuen Taxistandort
     */
    create: async (dto: CreateTaxiStandDto): Promise<TaxiStand> => {
      return api.postData<TaxiStand>(baseUrl, dto);
    },

    /**
     * Aktualisiert einen Taxistandort
     */
    update: async (id: string, dto: UpdateTaxiStandDto): Promise<TaxiStand> => {
      return api.patchData<TaxiStand>(`${baseUrl}/${id}`, dto);
    },

    /**
     * Löscht einen Taxistandort
     */
    delete: async (id: string): Promise<void> => {
      await api.delete(`${baseUrl}/${id}`);
    },
  };
}
