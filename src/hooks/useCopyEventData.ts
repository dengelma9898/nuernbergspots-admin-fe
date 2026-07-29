import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { LocationResult } from '@/components/ui/LocationSearch';
import { createEmptyEventFormState, NewEventFormState } from '@/components/events/event-form/types';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import {
  buildCopyEventPayload,
  formatEventPriceString,
  generateDailyTimeSlots,
  isValidEventLocation,
  updateTimeSlotInForm,
  urlToFile,
} from '@/utils/eventFormUtils';

export function useCopyEventData() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [copiedImages, setCopiedImages] = useState<File[]>([]);
  const [copiedTitleImage, setCopiedTitleImage] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(null);
  const [copyImages, setCopyImages] = useState(true);
  const [imageUrlsToCopy, setImageUrlsToCopy] = useState<string[]>([]);
  const [titleImageUrlToCopy, setTitleImageUrlToCopy] = useState<string | null>(null);
  const [hasValidLocation, setHasValidLocation] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventFormState>(createEmptyEventFormState());
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  const loadImagesForCopy = useCallback(async (event: Event) => {
    try {
      const imageFiles: File[] = [];
      const previews: string[] = [];
      const urlsToCopy: string[] = [];

      if (event.titleImageUrl) {
        try {
          const titleFile = await urlToFile(event.titleImageUrl, `title-${Date.now()}.jpg`);
          setCopiedTitleImage(titleFile);
          setTitleImagePreview(URL.createObjectURL(titleFile));
          setTitleImageUrlToCopy(null);
        } catch (error) {
          console.warn(
            'Titelbild kann nicht direkt geladen werden (CORS), verwende URL-Kopie:',
            error
          );
          setTitleImageUrlToCopy(event.titleImageUrl);
          setTitleImagePreview(event.titleImageUrl);
          setCopiedTitleImage(null);
        }
      }

      if (event.imageUrls && event.imageUrls.length > 0) {
        for (let i = 0; i < event.imageUrls.length; i++) {
          try {
            const imageFile = await urlToFile(event.imageUrls[i], `image-${i}-${Date.now()}.jpg`);
            imageFiles.push(imageFile);
            previews.push(URL.createObjectURL(imageFile));
          } catch (error) {
            console.warn(
              `Bild ${i} kann nicht direkt geladen werden (CORS), verwende URL-Kopie:`,
              error
            );
            urlsToCopy.push(event.imageUrls[i]);
            previews.push(event.imageUrls[i]);
          }
        }
        setCopiedImages(imageFiles);
        setImagePreviews(previews);
        setImageUrlsToCopy(urlsToCopy);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Bilder:', error);
      toast.info(
        'Die Bilder werden mit dem kopierten Event verknüpft. Beide Events zeigen die gleichen Bilder.'
      );
    }
  }, []);

  const loadEventAndCategories = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoadingEvent(true);
      const [fetchedEvent, fetchedCategories] = await Promise.all([
        eventService.getEvent(id),
        eventCategoryService.getCategories(),
      ]);

      setCategories(fetchedCategories);

      const firstSlot = fetchedEvent.dailyTimeSlots[0];
      const lastSlot = fetchedEvent.dailyTimeSlots[fetchedEvent.dailyTimeSlots.length - 1];
      const startDate = firstSlot ? format(parseISO(firstSlot.date), 'yyyy-MM-dd') : '';
      const endDate = lastSlot ? format(parseISO(lastSlot.date), 'yyyy-MM-dd') : '';

      const priceString = formatEventPriceString(
        fetchedEvent.priceString,
        fetchedEvent.price ?? null
      );

      const locationValid = isValidEventLocation(
        fetchedEvent.location?.address ?? '',
        fetchedEvent.location?.latitude ?? 0,
        fetchedEvent.location?.longitude ?? 0
      );

      setHasValidLocation(locationValid);

      setNewEvent({
        title: `${fetchedEvent.title} (Kopie)`,
        description: fetchedEvent.description,
        startDate,
        endDate,
        address: locationValid ? fetchedEvent.location.address : '',
        latitude: locationValid ? fetchedEvent.location.latitude : 0,
        longitude: locationValid ? fetchedEvent.location.longitude : 0,
        price: null,
        priceString,
        ticketsNeeded: fetchedEvent.ticketsNeeded ?? false,
        imageUrls: [],
        favoriteCount: 0,
        isPromoted: fetchedEvent.isPromoted ?? false,
        categoryId: fetchedEvent.categoryId ?? null,
        contactEmail: fetchedEvent.contactEmail ?? null,
        contactPhone: fetchedEvent.contactPhone ?? null,
        website: fetchedEvent.website ?? null,
        socialMedia: {
          instagram: fetchedEvent.socialMedia?.instagram ?? null,
          facebook: fetchedEvent.socialMedia?.facebook ?? null,
          tiktok: fetchedEvent.socialMedia?.tiktok ?? null,
        },
        dailyTimeSlots: fetchedEvent.dailyTimeSlots.map(slot => ({ ...slot })),
        titleImageUrl: undefined,
        monthYear: fetchedEvent.monthYear ?? null,
      });

      if (locationValid && fetchedEvent.location) {
        setSearchValue({
          address: {
            label: fetchedEvent.location.address,
          },
          position: {
            lat: fetchedEvent.location.latitude,
            lng: fetchedEvent.location.longitude,
          },
        });
      } else {
        setSearchValue(null);
      }

      await loadImagesForCopy(fetchedEvent);
    } catch (error) {
      console.error('Fehler beim Laden des Events:', error);
      showUserFriendlyError(error, toast, () => loadEventAndCategories(), 'load-event');
      navigate('/events');
    } finally {
      setLoadingEvent(false);
    }
  }, [id, eventService, eventCategoryService, loadImagesForCopy, navigate]);

  useEffect(() => {
    if (id) {
      loadEventAndCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    if (copyImages) {
      eventService
        .getEvent(id)
        .then(event => loadImagesForCopy(event))
        .catch(console.error);
    } else {
      setCopiedImages([]);
      setCopiedTitleImage(null);
      setImagePreviews([]);
      setTitleImagePreview(null);
      setImageUrlsToCopy([]);
      setTitleImageUrlToCopy(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyImages]);

  useEffect(() => {
    if (!newEvent.startDate || !newEvent.endDate) {
      return;
    }
    setNewEvent(prev => ({
      ...prev,
      dailyTimeSlots: generateDailyTimeSlots(prev.startDate, prev.endDate),
    }));
  }, [newEvent.startDate, newEvent.endDate]);

  const handleInputChange = (field: keyof NewEventFormState, value: unknown) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialMediaChange = (
    field: keyof NewEventFormState['socialMedia'],
    value: string
  ) => {
    setNewEvent(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [field]: value,
      },
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) {
      setHasValidLocation(false);
      return;
    }

    const isValid = isValidEventLocation(
      location.address?.label ?? '',
      location.position?.lat ?? 0,
      location.position?.lng ?? 0
    );

    setHasValidLocation(isValid);

    setNewEvent(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng,
    }));
    setSearchValue(location);
  };

  const handleUpdateTimeSlot = (date: string, field: 'from' | 'to', value: string) => {
    setNewEvent(prev => ({
      ...prev,
      dailyTimeSlots: updateTimeSlotInForm(prev.dailyTimeSlots, date, field, value),
    }));
  };

  const removeImagePreview = (index: number) => {
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newFiles = [...copiedImages];
    newFiles.splice(index, 1);
    setCopiedImages(newFiles);
  };

  const removeTitleImagePreview = () => {
    if (titleImagePreview) {
      URL.revokeObjectURL(titleImagePreview);
      setTitleImagePreview(null);
      setCopiedTitleImage(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!isValidEventLocation(newEvent.address, newEvent.latitude, newEvent.longitude)) {
        showUserFriendlyError(
          new Error('Bitte wählen Sie eine vollständige Adresse mit Koordinaten aus.'),
          toast,
          undefined,
          'save-event'
        );
        setLoading(false);
        return;
      }

      const finalEventData = buildCopyEventPayload(newEvent);
      // @ts-expect-error - API payload shape
      const createdEvent = await eventService.createEvent(finalEventData);

      if (copyImages) {
        if (copiedTitleImage) {
          await eventService.uploadEventTitleImage(createdEvent.id, copiedTitleImage);
        } else if (titleImageUrlToCopy) {
          await eventService.setEventTitleImage(createdEvent.id, titleImageUrlToCopy);
        }

        if (copiedImages.length > 0) {
          await eventService.uploadEventImages(createdEvent.id, copiedImages);
        }
        if (imageUrlsToCopy.length > 0) {
          const currentEvent = await eventService.getEvent(createdEvent.id);
          const existingUrls = currentEvent.imageUrls || [];
          await eventService.updateEventImages(createdEvent.id, [
            ...existingUrls,
            ...imageUrlsToCopy,
          ]);
        }
      }

      showSuccessMessage(toast, {
        title: 'Event kopiert',
        description: `"${newEvent.title}" wurde erfolgreich kopiert.`,
      });
      navigate('/events');
    } catch (error) {
      console.error('Fehler beim Kopieren des Events:', error);
      showUserFriendlyError(error, toast, () => handleSubmit(), 'save-event');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loadingEvent,
    categories,
    copyImages,
    setCopyImages,
    titleImagePreview,
    imagePreviews,
    titleImageUrlToCopy,
    imageUrlsToCopy,
    hasValidLocation,
    newEvent,
    searchValue,
    handleInputChange,
    handleSocialMediaChange,
    handleLocationSelect,
    handleUpdateTimeSlot,
    removeImagePreview,
    removeTitleImagePreview,
    handleSubmit,
    navigate,
  };
}
