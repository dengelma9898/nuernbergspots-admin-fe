import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { JobOffer } from '@/models/job-offer';
import { JobCategory } from '@/models/job-category';
import { useJobOfferService } from '@/services/jobOfferService';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

export function useJobOffersManagement() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [homeOfficeFilter, setHomeOfficeFilter] = useState<string>('all');
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const jobOfferService = useJobOfferService();
  const jobCategoryService = useJobCategoryService();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedJobOffers = await jobOfferService.getJobOffers();
      setJobOffers(fetchedJobOffers);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      showUserFriendlyError(error, toast, () => loadData(), 'load-job-offer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    jobCategoryService.getCategories().then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (jobOfferId: string) => {
    try {
      await jobOfferService.deleteJobOffer(jobOfferId);
      showSuccessMessage(toast, {
        title: 'Stellenangebot gelöscht',
        description: 'Das Stellenangebot wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      console.error('Fehler beim Löschen des Stellenangebots:', error);
      showUserFriendlyError(error, toast, () => handleDelete(jobOfferId), 'delete-job-offer');
    }
  };

  const filteredJobOffers = jobOffers.filter(jobOffer => {
    const matchesSearch = jobOffer.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || jobOffer.typeOfEmployment === typeFilter;
    const matchesHomeOffice =
      homeOfficeFilter === 'all' ||
      (homeOfficeFilter === 'yes' && jobOffer.homeOffice) ||
      (homeOfficeFilter === 'no' && !jobOffer.homeOffice);

    return matchesSearch && matchesType && matchesHomeOffice;
  });

  return {
    navigate,
    loading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    homeOfficeFilter,
    setHomeOfficeFilter,
    categories,
    filteredJobOffers,
    handleDelete,
  };
}
