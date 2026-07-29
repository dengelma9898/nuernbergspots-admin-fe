import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessStatus } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { useBusinessService } from '@/services/businessService';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { useKeywordService } from '@/services/keywordService';
import { LocationResult } from '@/components/ui/LocationSearch';
import { toast } from 'sonner';
import {
  showUserFriendlyError,
  showSuccessMessage,
  getUserFriendlyError,
} from '@/utils/errorUtils';

export const WEEKDAYS = {
  Montag: 'Montag',
  Dienstag: 'Dienstag',
  Mittwoch: 'Mittwoch',
  Donnerstag: 'Donnerstag',
  Freitag: 'Freitag',
  Samstag: 'Samstag',
  Sonntag: 'Sonntag',
} as const;

export type WeekdayKey = keyof typeof WEEKDAYS;

export interface TimeSlot {
  id: string;
  openTime: string;
  closeTime: string;
  days: WeekdayKey[];
}

export function useCreateBusiness() {
  const navigate = useNavigate();
  const businessService = useBusinessService();
  const categoryService = useBusinessCategoryService();
  const keywordService = useKeywordService();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    categoryIds: [] as string[],
    address: '',
    benefit: '',
    latitude: 0,
    longitude: 0,
    contact: {
      phoneNumber: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
    },
    openingHours: {} as Record<string, string>,
    status: BusinessStatus.PENDING,
    imageUrls: [] as string[],
    keywordIds: [] as string[],
    isPromoted: false,
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      openTime: '09:00',
      closeTime: '18:00',
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
    },
  ]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    openTime: '09:00',
    closeTime: '18:00',
    days: [],
  });

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (newBusiness.categoryIds.length > 0) {
      loadKeywordsForCategories(newBusiness.categoryIds);
    } else {
      setKeywords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBusiness.categoryIds]);

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
        () => loadKeywordsForCategories(categoryIds),
        'load-categories'
      );
    }
  };

  const handleInputChange = (field: keyof typeof newBusiness, value: unknown) => {
    setNewBusiness(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setNewBusiness(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng,
    }));
    setSearchValue(location);
  };

  const toggleKeyword = (keywordId: string) => {
    setSelectedKeywords(prev => {
      const isSelected = prev.includes(keywordId);
      if (isSelected) {
        return prev.filter(id => id !== keywordId);
      }
      return [...prev, keywordId];
    });
  };

  const toggleCategory = (categoryId: string) => {
    setNewBusiness(prev => {
      const isSelected = prev.categoryIds.includes(categoryId);
      if (isSelected) {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter(id => id !== categoryId),
        };
      }
      if (prev.categoryIds.length >= 3) {
        setValidationErrors(['Sie können maximal 3 Kategorien auswählen.']);
        return prev;
      }
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
      return {
        ...prev,
        categoryIds: [...prev.categoryIds, categoryId],
      };
    });
  };

  const handleTimeSlotChange = (id: string, field: keyof Omit<TimeSlot, 'id'>, value: unknown) => {
    setTimeSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, [field]: value } : slot)));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.days.length === 0) {
      setValidationErrors([
        'Bitte wählen Sie mindestens einen Tag aus. Ein Zeitraum muss für mindestens einen Tag gelten.',
      ]);
      return;
    }

    setValidationErrors([]);
    const id = Date.now().toString();
    setTimeSlots(prev => [...prev, { ...newTimeSlot, id }]);
    setNewTimeSlot({ openTime: '09:00', closeTime: '18:00', days: [] });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const toggleDayForTimeSlot = (day: WeekdayKey, slotId: string) => {
    setTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          const days = slot.days.includes(day)
            ? slot.days.filter(d => d !== day)
            : [...slot.days, day];
          return { ...slot, days };
        }
        return slot;
      })
    );
  };

  const toggleDayForNewTimeSlot = (day: WeekdayKey) => {
    setNewTimeSlot(prev => {
      const days = prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day];
      return { ...prev, days };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const addressParts = newBusiness.address.split(',');
      const streetWithNumber = addressParts[0].trim();
      const [street, houseNumber] = streetWithNumber.split(' ').reduce(
        ([str, num], part) => {
          if (/\d/.test(part)) {
            return [str, (num + ' ' + part).trim()];
          }
          return [(str + ' ' + part).trim(), num];
        },
        ['', '']
      );

      const postalAndCity = addressParts[1]?.trim().split(' ') || [];
      const postalCode = postalAndCity[0] || '';

      const formattedDetailedOpeningHours: Record<string, Array<{ from: string; to: string }>> = {};

      timeSlots.forEach(slot => {
        slot.days.forEach(day => {
          if (!formattedDetailedOpeningHours[day]) {
            formattedDetailedOpeningHours[day] = [];
          }
          formattedDetailedOpeningHours[day].push({
            from: slot.openTime,
            to: slot.closeTime,
          });
        });
      });

      const cleanedContact = {
        email: newBusiness.contact.email || undefined,
        phoneNumber: newBusiness.contact.phoneNumber || undefined,
        website: newBusiness.contact.website || undefined,
        instagram: newBusiness.contact.instagram || undefined,
        facebook: newBusiness.contact.facebook || undefined,
        tiktok: newBusiness.contact.tiktok || undefined,
      };

      const businessToCreate = {
        ...newBusiness,
        hasAccount: false,
        isAdmin: true,
        address: {
          street,
          houseNumber,
          postalCode,
          city: 'Nürnberg',
          latitude: newBusiness.latitude,
          longitude: newBusiness.longitude,
        },
        contact: cleanedContact,
        detailedOpeningHours: formattedDetailedOpeningHours,
        keywordIds: selectedKeywords,
      };

      // @ts-expect-error - API payload shape
      await businessService.createBusiness(businessToCreate);
      showSuccessMessage(toast, {
        title: 'Geschäft erstellt',
        description: `"${newBusiness.name}" wurde erfolgreich erstellt.`,
        nextSteps: ['Du kannst jetzt weitere Details hinzufügen', 'Oder Bilder hochladen'],
      });
      navigate('/businesses');
    } catch (error) {
      console.error('Fehler beim Erstellen des Geschäfts:', error);
      const friendlyError = getUserFriendlyError(error, 'save-business');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(), 'save-business');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    loading,
    categories,
    keywords,
    validationErrors,
    validationErrorsRef,
    selectedKeywords,
    newBusiness,
    setNewBusiness,
    searchValue,
    timeSlots,
    newTimeSlot,
    setNewTimeSlot,
    handleInputChange,
    handleLocationSelect,
    toggleKeyword,
    toggleCategory,
    handleTimeSlotChange,
    addTimeSlot,
    removeTimeSlot,
    toggleDayForTimeSlot,
    toggleDayForNewTimeSlot,
    handleSubmit,
  };
}
