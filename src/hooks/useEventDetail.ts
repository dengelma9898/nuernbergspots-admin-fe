import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import {
  showUserFriendlyError,
  getUserFriendlyError,
  showSuccessMessage,
} from '@/utils/errorUtils';
import { useEventForm } from '@/hooks/useEventForm';
import { useImageUpload } from '@/hooks/useImageUpload';

export function useEventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldStartInEditMode =
    (location.state as { startInEditMode?: boolean } | null)?.startInEditMode === true;
  const eventListPathWithFilters = `/events${location.search}`;
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [fetchedEvent, fetchedCategories] = await Promise.all([
        eventService.getEvent(id),
        eventCategoryService.getCategories(),
      ]);
      setEvent(fetchedEvent);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Fehler beim Laden des Events:', error);
      showUserFriendlyError(error, toast, () => loadData(), 'load-event');
      const friendlyError = getUserFriendlyError(error, 'load-event');
      if (!friendlyError.isRetryable) {
        navigate(eventListPathWithFilters);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const eventForm = useEventForm({
    event,
    onEventUpdate: loadData,
  });

  const imageUpload = useImageUpload({
    event,
    onEventUpdate: loadData,
  });

  useEffect(() => {
    if (shouldStartInEditMode && event && !eventForm.isEditing) {
      eventForm.handleEdit();
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [shouldStartInEditMode, event, eventForm, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (event?.location && !eventForm.searchValue) {
      eventForm.setSearchValue({
        id: 'current',
        title: event.location.address,
        resultType: 'place',
        position: {
          lat: event.location.latitude,
          lng: event.location.longitude,
        },
        address: {
          label: event.location.address,
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
  }, [event, eventForm]);

  const handleDelete = async () => {
    await eventForm.handleDelete();
    navigate(eventListPathWithFilters);
  };

  const handleApprovePending = async () => {
    if (!event || isApproving || loading) {
      return;
    }
    try {
      setIsApproving(true);
      const updated = await eventService.approveEvent(event.id);
      setEvent(updated);
      showSuccessMessage(toast, {
        title: 'Event freigegeben',
        description: 'Das Event ist jetzt aktiv und für Nutzer sichtbar.',
      });
    } catch (error) {
      console.error('Fehler bei der Freigabe:', error);
      showUserFriendlyError(error, toast, () => void handleApprovePending(), 'approve-event');
    } finally {
      setIsApproving(false);
    }
  };

  return {
    navigate,
    eventListPathWithFilters,
    event,
    categories,
    loading,
    isApproving,
    eventForm,
    imageUpload,
    handleDelete,
    handleApprovePending,
  };
}
