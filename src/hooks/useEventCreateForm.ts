import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCategory } from '@/models/event-category';
import { LocationResult } from '@/components/ui/LocationSearch';
import { createEmptyEventFormState, NewEventFormState } from '@/components/events/event-form/types';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import {
  showUserFriendlyError,
  showSuccessMessage,
  getUserFriendlyError,
} from '@/utils/errorUtils';
import {
  buildCreateEventPayload,
  generateDailyTimeSlots,
  updateTimeSlotInForm,
} from '@/utils/eventFormUtils';

export function useEventCreateForm() {
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);
  const [newEvent, setNewEvent] = useState<NewEventFormState>(createEmptyEventFormState());
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const fetchedCategories = await eventCategoryService.getCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        setNewEvent(prev => ({
          ...prev,
          categoryId: fetchedCategories[0].id,
        }));
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast, () => loadCategories(), 'load-categories');
    }
  }, [eventCategoryService]);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      return;
    }

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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const eventToCreate = buildCreateEventPayload(newEvent);
      // @ts-expect-error - API payload shape
      await eventService.createEvent(eventToCreate);
      showSuccessMessage(toast, {
        title: 'Event erstellt',
        description: `"${newEvent.title}" wurde erfolgreich erstellt.`,
      });
      navigate('/events');
    } catch (error) {
      console.error('Fehler beim Erstellen des Events:', error);
      const friendlyError = getUserFriendlyError(error, 'save-event');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(), 'save-event');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    categories,
    validationErrors,
    validationErrorsRef,
    newEvent,
    searchValue,
    handleInputChange,
    handleSocialMediaChange,
    handleLocationSelect,
    handleUpdateTimeSlot,
    handleSubmit,
    navigate,
  };
}
