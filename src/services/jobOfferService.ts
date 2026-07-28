import { JobOffer, JobOfferCreation } from '@/models/job-offer';
import { useApi } from '@/lib/api';

export const useJobOfferService = () => {
  const api = useApi();
  const baseUrl = '/job-offers';

  const getJobOffers = async (): Promise<JobOffer[]> => {
    return api.getData<JobOffer[]>(`${baseUrl}`);
  };

  const getJobOffer = async (id: string): Promise<JobOffer> => {
    return api.getData<JobOffer>(`${baseUrl}/${id}`);
  };

  const createJobOffer = async (jobOffer: JobOfferCreation): Promise<JobOffer> => {
    return api.postData<JobOffer>(`${baseUrl}`, jobOffer);
  };

  const updateJobOffer = async (
    id: string,
    jobOffer: Partial<JobOfferCreation>
  ): Promise<JobOffer> => {
    return api.patchData<JobOffer>(`${baseUrl}/${id}`, jobOffer);
  };

  const deleteJobOffer = async (id: string): Promise<void> => {
    await api.deleteData<void>(`${baseUrl}/${id}`);
  };

  const updateImages = async (id: string, files: File[]): Promise<JobOffer> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return api.patchData<JobOffer>(`${baseUrl}/${id}/images`, formData, {
      isFormData: true,
    });
  };

  const updateCompanyLogo = async (id: string, file: File): Promise<JobOffer> => {
    const formData = new FormData();
    formData.append('file', file);

    return api.patchData<JobOffer>(`${baseUrl}/${id}/company-logo`, formData, {
      isFormData: true,
    });
  };

  return {
    getJobOffers,
    getJobOffer,
    createJobOffer,
    updateJobOffer,
    deleteJobOffer,
    updateImages,
    updateCompanyLogo,
  };
};
