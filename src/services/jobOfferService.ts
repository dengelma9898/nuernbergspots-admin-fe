import { JobOffer, JobOfferCreation } from '@/models/job-offer';
import { ApiResponse, unwrapData } from '@/lib/apiUtils';
import { useApi } from '@/lib/api';

export const useJobOfferService = () => {
  const api = useApi();
  const baseUrl = '/job-offers';

  const getJobOffers = async (): Promise<JobOffer[]> => {
    const response = await api.get<ApiResponse<JobOffer[]>>(`${baseUrl}`);
    return unwrapData(response);
  };

  const getJobOffer = async (id: string): Promise<JobOffer> => {
    const response = await api.get<ApiResponse<JobOffer>>(`${baseUrl}/${id}`);
    return unwrapData(response);
  };

  const createJobOffer = async (jobOffer: JobOfferCreation): Promise<JobOffer> => {
    const response = await api.post<ApiResponse<JobOffer>>(`${baseUrl}`, jobOffer);
    return unwrapData(response);
  };

  const updateJobOffer = async (id: string, jobOffer: Partial<JobOfferCreation>): Promise<JobOffer> => {
    const response = await api.patch<ApiResponse<JobOffer>>(`${baseUrl}/${id}`, jobOffer);
    return unwrapData(response);
  };

  const deleteJobOffer = async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`${baseUrl}/${id}`);
  };

  const updateImages = async (id: string, files: File[]): Promise<JobOffer> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.patch<ApiResponse<JobOffer>>(
      `${baseUrl}/${id}/images`,
      formData,
      { isFormData: true }
    );

    return unwrapData(response);
  };

  const updateCompanyLogo = async (id: string, file: File): Promise<JobOffer> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.patch<ApiResponse<JobOffer>>(
      `${baseUrl}/${id}/company-logo`,
      formData,
      { isFormData: true }
    );

    return unwrapData(response);
  };

  return {
    getJobOffers,
    getJobOffer,
    createJobOffer,
    updateJobOffer,
    deleteJobOffer,
    updateImages,
    updateCompanyLogo
  };
}; 