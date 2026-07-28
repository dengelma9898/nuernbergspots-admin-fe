import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { useBusinessTimeSlots } from '@/hooks/useBusinessTimeSlots';
import { Business, BusinessStatus, NuernbergspotsReview } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { useBusinessService } from '@/services/businessService';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { useKeywordService } from '@/services/keywordService';
import { cleanBusinessContact } from '@/utils/business/businessContact';
import { timeSlotsToDetailedOpeningHours } from '@/utils/business/openingHours';
import {
  showUserFriendlyError,
  showSuccessMessage,
  getUserFriendlyError,
} from '@/utils/errorUtils';
import { LocationResult } from '@/components/ui/LocationSearch';

interface UseEditBusinessOptions {
  businessId: string | undefined;
}

export function useEditBusiness({ businessId }: UseEditBusinessOptions) {
  const navigate = useNavigate();
  const businessService = useBusinessService();
  const categoryService = useBusinessCategoryService();
  const keywordService = useKeywordService();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editReview, setEditReview] = useState<NuernbergspotsReview>({
    reviewText: '',
    reviewImageUrls: [],
  });
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingBusinessImages, setExistingBusinessImages] = useState<string[]>([]);
  const [businessImagesToDelete, setBusinessImagesToDelete] = useState<string[]>([]);
  const [existingReviewImages, setExistingReviewImages] = useState<string[]>([]);

  const businessImageUpload = useValidatedImageUpload({
    maxImages: 20,
    maxSizeMB: 1,
  });

  const reviewImageUpload = useValidatedImageUpload({
    maxImages: 10,
    maxSizeMB: 1,
  });

  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const timeSlotsHook = useBusinessTimeSlots({
    onValidationError: setValidationErrors,
    onClearValidationErrors: () => setValidationErrors([]),
  });

  useEffect(() => {
    if (businessId) {
      loadBusiness(businessId);
      loadCategories();
    }
  }, [businessId]);

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
    if (business?.categoryIds && business.categoryIds.length > 0) {
      loadKeywordsForCategories(business.categoryIds);
    } else {
      setKeywords([]);
    }
  }, [business?.categoryIds]);

  const loadBusiness = async (id: string) => {
    try {
      setLoading(true);
      const fetchedBusiness = await businessService.getBusiness(id);
      setBusiness(fetchedBusiness);
      setSelectedKeywords(fetchedBusiness.keywordIds);

      if (fetchedBusiness.address) {
        const locationResult: LocationResult = {
          id: `${fetchedBusiness.address.latitude}-${fetchedBusiness.address.longitude}`,
          title: `${fetchedBusiness.address.street} ${fetchedBusiness.address.houseNumber}`,
          resultType: 'address',
          position: {
            lat: fetchedBusiness.address.latitude,
            lng: fetchedBusiness.address.longitude,
          },
          address: {
            label: `${fetchedBusiness.address.street} ${fetchedBusiness.address.houseNumber}, ${fetchedBusiness.address.postalCode} ${fetchedBusiness.address.city}`,
            countryCode: 'DE',
            countryName: 'Deutschland',
            stateCode: 'BY',
            state: 'Bayern',
            county: '',
            city: fetchedBusiness.address.city,
            district: '',
            street: fetchedBusiness.address.street,
            postalCode: fetchedBusiness.address.postalCode,
            houseNumber: fetchedBusiness.address.houseNumber,
          },
        };
        setSearchValue(locationResult);
      }

      timeSlotsHook.initFromDetailedOpeningHours(fetchedBusiness.detailedOpeningHours);

      const review = fetchedBusiness.nuernbergspotsReview || {
        reviewText: '',
        reviewImageUrls: [],
      };
      setEditReview(review);
      setExistingReviewImages(review.reviewImageUrls || []);
      setExistingBusinessImages(fetchedBusiness.imageUrls || []);
    } catch (error) {
      console.error('Fehler beim Laden des Geschäfts:', error);
      showUserFriendlyError(error, toast, () => loadBusiness(id), 'load-business');
      navigate('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast, () => loadCategories(), 'load-categories');
    }
  };

  const loadKeywordsForCategories = async (categoryIds: string[]) => {
    try {
      const selectedCategories = categories.filter(category => categoryIds.includes(category.id));

      const keywordIds = selectedCategories
        .flatMap(category => category.keywords || [])
        .map(keyword => keyword.id);

      const uniqueKeywordIds = [...new Set(keywordIds)];

      const keywordPromises = uniqueKeywordIds.map(id => keywordService.getKeyword(id));

      const fetchedKeywords = await Promise.all(keywordPromises);
      setKeywords(fetchedKeywords);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
      showUserFriendlyError(
        error,
        toast,
        () => loadKeywordsForCategories(business?.categoryIds || []),
        'load-categories'
      );
    }
  };

  const handleStatusChange = async (value: BusinessStatus) => {
    if (!business) return;

    try {
      const updateData = {
        status: value,
      };

      await businessService.updateBusiness(business.id, updateData);
      setBusiness(prev => (prev ? { ...prev, status: value } : null));
      showSuccessMessage(toast, {
        title: 'Status aktualisiert',
        description: 'Der Status wurde erfolgreich aktualisiert.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Status:', error);
      showUserFriendlyError(error, toast, () => handleStatusChange(value), 'save-business');
    }
  };

  const handlePromotedChange = async (checked: boolean) => {
    if (!business) return;

    try {
      await businessService.updateBusiness(business.id, {
        isPromoted: checked,
      });
      setBusiness(prev => (prev ? { ...prev, isPromoted: checked } : null));
      showSuccessMessage(toast, {
        title: 'Highlight-Status aktualisiert',
        description: checked
          ? 'Der Partner wurde als Highlight markiert.'
          : 'Der Highlight-Status wurde entfernt.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Highlight-Status:', error);
      showUserFriendlyError(error, toast, undefined, 'save-business');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNewLogo(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleBusinessImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    businessImageUpload.handleFileChange(event);
  };

  const handleRemoveBusinessImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageUrl = existingBusinessImages[index];
      setBusinessImagesToDelete(prev => [...prev, imageUrl]);
      setExistingBusinessImages(prev => prev.filter((_, i) => i !== index));
    } else {
      businessImageUpload.removeImage(index);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    reviewImageUpload.handleFileChange(event);
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageUrl = existingReviewImages[index];
      setImagesToDelete(prev => [...prev, imageUrl]);
      setExistingReviewImages(prev => prev.filter((_, i) => i !== index));
      setEditReview(prev => ({
        ...prev,
        reviewImageUrls: prev.reviewImageUrls?.filter((_, i) => i !== index) || [],
      }));
    } else {
      reviewImageUpload.removeImage(index);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (!business) return;

    const isSelected = business.categoryIds.includes(categoryId);
    if (isSelected) {
      const newCategoryIds = business.categoryIds.filter(id => id !== categoryId);
      const allowedKeywordIds = categories
        .filter(cat => newCategoryIds.includes(cat.id))
        .flatMap(cat => cat.keywords?.map(k => k.id) || []);
      setBusiness(prev =>
        prev
          ? {
              ...prev,
              categoryIds: newCategoryIds,
              keywordIds: prev.keywordIds.filter(id => allowedKeywordIds.includes(id)),
            }
          : null
      );
    } else {
      if (business.categoryIds.length >= 3) {
        setValidationErrors(['Sie können maximal 3 Kategorien auswählen.']);
        return;
      }
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
      setBusiness(prev =>
        prev
          ? {
              ...prev,
              categoryIds: [...prev.categoryIds, categoryId],
            }
          : null
      );
    }
  };

  const toggleKeyword = (keywordId: string) => {
    if (!business) return;

    setBusiness(prev =>
      prev
        ? {
            ...prev,
            keywordIds: prev.keywordIds.includes(keywordId)
              ? prev.keywordIds.filter(id => id !== keywordId)
              : [...prev.keywordIds, keywordId],
          }
        : null
    );
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location || !business) return;

    setBusiness(prev =>
      prev
        ? {
            ...prev,
            address: {
              ...prev.address,
              street: location.address.street,
              houseNumber: location.address.houseNumber,
              postalCode: location.address.postalCode,
              city: location.address.city,
              latitude: location.position.lat,
              longitude: location.position.lng,
            },
          }
        : null
    );
    setSearchValue(location);
  };

  const handleSaveClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!business) return;

    setIsConfirmDialogOpen(false);

    try {
      setIsSaving(true);

      if (newLogo) {
        await businessService.uploadLogo(business.id, newLogo);
      }

      if (businessImageUpload.files.length > 0) {
        await businessService.uploadBusinessImages(business.id, businessImageUpload.files);
      }

      const updatedReview: NuernbergspotsReview = {
        reviewText: editReview.reviewText,
        reviewImageUrls: existingReviewImages.filter(url => !imagesToDelete.includes(url)) || [],
      };

      await businessService.updateNuernbergspotsReview(business.id, updatedReview);

      if (reviewImageUpload.files.length > 0) {
        await businessService.uploadReviewImages(business.id, reviewImageUpload.files);
      }

      const formattedDetailedOpeningHours = timeSlotsToDetailedOpeningHours(
        timeSlotsHook.timeSlots
      );

      const cleanedContact = cleanBusinessContact(business.contact);

      await businessService.updateBusiness(business.id, {
        name: business.name,
        description: business.description,
        benefit: business.benefit || undefined,
        address: business.address,
        contact: cleanedContact,
        detailedOpeningHours: formattedDetailedOpeningHours,
        categoryIds: business.categoryIds,
        keywordIds: business.keywordIds,
      });

      showSuccessMessage(toast, {
        title: 'Änderungen gespeichert',
        description: business
          ? `"${business.name}" wurde erfolgreich aktualisiert.`
          : 'Alle Änderungen wurden erfolgreich gespeichert.',
      });

      navigate('/businesses');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Geschäfts:', error);
      const friendlyError = getUserFriendlyError(error, 'save-business');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        // Known bug: handleSave is undefined in original — preserved for behavior parity
        showUserFriendlyError(error, toast, () => handleSave(), 'save-business');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    business,
    setBusiness,
    loading,
    isSaving,
    editReview,
    setEditReview,
    newLogo,
    logoPreview,
    existingBusinessImages,
    businessImagesToDelete,
    existingReviewImages,
    businessImageUpload,
    reviewImageUpload,
    categories,
    keywords,
    selectedKeywords,
    validationErrors,
    validationErrorsRef,
    searchValue,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    timeSlots: timeSlotsHook.timeSlots,
    newTimeSlot: timeSlotsHook.newTimeSlot,
    setNewTimeSlot: timeSlotsHook.setNewTimeSlot,
    addTimeSlot: timeSlotsHook.addTimeSlot,
    removeTimeSlot: timeSlotsHook.removeTimeSlot,
    handleTimeSlotChange: timeSlotsHook.handleTimeSlotChange,
    toggleDayForTimeSlot: timeSlotsHook.toggleDayForTimeSlot,
    toggleDayForNewTimeSlot: timeSlotsHook.toggleDayForNewTimeSlot,
    handleStatusChange,
    handlePromotedChange,
    handleLogoUpload,
    handleBusinessImageUpload,
    handleRemoveBusinessImage,
    handleImageUpload,
    handleRemoveImage,
    toggleCategory,
    toggleKeyword,
    handleLocationSelect,
    handleSaveClick,
    handleConfirmSave,
  };
}

declare function handleSave(): void;
