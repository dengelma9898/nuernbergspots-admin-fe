import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  showUserFriendlyError,
  getUserFriendlyError,
  showSuccessMessage,
} from '@/utils/errorUtils';
import { JobOffer, JobOfferCreation } from '@/models/job-offer';
import { useJobOfferService } from '@/services/jobOfferService';
import { LocationResult } from '@/components/ui/LocationSearch';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { JobCategory } from '@/models/job-category';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

const initialFormData: JobOfferCreation = {
  title: '',
  companyLogo: '',
  generalDescription: '',
  neededProfile: '',
  tasks: [''],
  benefits: [''],
  images: [],
  location: {
    address: '',
    latitude: 0,
    longitude: 0,
  },
  typeOfEmployment: '',
  additionalNotesForTypeOfEmployment: null,
  homeOffice: false,
  additionalNotesHomeOffice: null,
  wage: null,
  startDate: '',
  contactData: {
    person: '',
    email: '',
    phone: '',
  },
  link: '',
  socialMedia: null,
  isHighlight: false,
  jobOfferCategoryId: '',
};

export function useJobOfferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobOfferService = useJobOfferService();
  const jobCategoryService = useJobCategoryService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string>('');
  const imageUpload = useValidatedImageUpload({
    maxImages: 10,
    maxSizeMB: 1,
  });
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [formData, setFormData] = useState<JobOfferCreation>(initialFormData);
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  useEffect(() => {
    jobCategoryService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (id) {
      loadJobOffer();
    }
  }, [id]);

  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorsRef.current) {
      setTimeout(() => {
        validationErrorsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [validationErrors]);

  useEffect(() => {
    if (formData.location.address) {
      setSearchValue({
        id: 'current',
        title: formData.location.address,
        resultType: 'place',
        position: {
          lat: formData.location.latitude,
          lng: formData.location.longitude,
        },
        address: {
          label: formData.location.address,
          countryCode: '',
          countryName: '',
          stateCode: '',
          state: '',
          county: '',
          city: '',
          district: '',
          street: '',
          postalCode: '',
          houseNumber: '',
        },
      });
    }
  }, [formData.location]);

  const loadJobOffer = async () => {
    try {
      setIsLoading(true);
      const jobOffer = await jobOfferService.getJobOffer(id!);
      setFormData({
        title: jobOffer.title,
        companyLogo: jobOffer.companyLogo,
        generalDescription: jobOffer.generalDescription,
        neededProfile: jobOffer.neededProfile,
        tasks: jobOffer.tasks,
        benefits: jobOffer.benefits,
        images: jobOffer.images,
        location: jobOffer.location,
        typeOfEmployment: jobOffer.typeOfEmployment,
        additionalNotesForTypeOfEmployment: jobOffer.additionalNotesForTypeOfEmployment || null,
        homeOffice: jobOffer.homeOffice,
        additionalNotesHomeOffice: jobOffer.additionalNotesHomeOffice || null,
        wage: jobOffer.wage || null,
        startDate: jobOffer.startDate,
        contactData: jobOffer.contactData,
        link: jobOffer.link,
        socialMedia: jobOffer.socialMedia || null,
        isHighlight: jobOffer.isHighlight || false,
        jobOfferCategoryId: jobOffer.jobOfferCategoryId || '',
      });
      setExistingImageUrls(jobOffer.images);

      if (jobOffer.companyLogo) {
        setCompanyLogoPreview(jobOffer.companyLogo);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Stellenangebots:', error);
      showUserFriendlyError(error, toast, () => loadJobOffer(), 'load-job-offer');
      const friendlyError = getUserFriendlyError(error, 'load-job-offer');
      if (!friendlyError.isRetryable) {
        navigate('/job-offers');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCompanyLogoPreview(previewUrl);
    }
  };

  const removeCompanyLogo = () => {
    if (companyLogoPreview) {
      URL.revokeObjectURL(companyLogoPreview);
    }
    setCompanyLogoFile(null);
    setCompanyLogoPreview('');
    setFormData(prev => ({ ...prev, companyLogo: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      let jobOffer: JobOffer;

      if (id) {
        jobOffer = await jobOfferService.updateJobOffer(id, formData);
      } else {
        jobOffer = await jobOfferService.createJobOffer(formData);
      }

      if (companyLogoFile) {
        await jobOfferService.updateCompanyLogo(jobOffer.id, companyLogoFile);
      }

      if (imageUpload.files.length > 0) {
        await jobOfferService.updateImages(jobOffer.id, imageUpload.files);
      }

      showSuccessMessage(toast, {
        title: `Stellenangebot ${id ? 'aktualisiert' : 'erstellt'}`,
        description: `"${formData.title}" wurde erfolgreich ${id ? 'aktualisiert' : 'erstellt'}.`,
      });
      navigate('/job-offers');
    } catch (error) {
      console.error(
        `Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Stellenangebots:`,
        error
      );
      const friendlyError = getUserFriendlyError(error, 'save-job-offer');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(e), 'save-job-offer');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      imageUpload.removeImage(index);
    }
  };

  const addArrayItem = (field: 'tasks' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'tasks' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: 'tasks' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setFormData(prev => ({
      ...prev,
      location: {
        address: location.address.label,
        latitude: location.position.lat,
        longitude: location.position.lng,
      },
    }));
    setSearchValue(location);
  };

  return {
    id,
    navigate,
    isLoading,
    isSaving,
    validationErrors,
    validationErrorsRef,
    existingImageUrls,
    companyLogoPreview,
    imageUpload,
    categories,
    formData,
    setFormData,
    searchValue,
    handleCompanyLogoSelect,
    removeCompanyLogo,
    handleSubmit,
    handleImageSelect,
    removeImage,
    addArrayItem,
    removeArrayItem,
    updateArrayItem,
    handleLocationSelect,
  };
}
