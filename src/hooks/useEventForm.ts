import { useState, useCallback } from 'react';
import { Event } from '@/models/events';
import { LocationResult } from '@/components/ui/LocationSearch';
import { toast } from 'sonner';
import { useEventService } from '@/services/eventService';

interface UseEventFormProps {
  event: Event | null;
  onEventUpdate: () => void;
}

interface UseEventFormReturn {
  isEditing: boolean;
  editedEvent: Partial<Event>;
  searchValue: LocationResult | null;
  setIsEditing: (value: boolean) => void;
  handleEdit: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleDelete: () => Promise<void>;
  handleInputChange: (field: keyof Event, value: any) => void;
  handleSocialMediaChange: (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => void;
  handleLocationSelect: (location: LocationResult | null) => void;
  setSearchValue: (value: LocationResult | null) => void;
}

export const useEventForm = ({ event, onEventUpdate }: UseEventFormProps): UseEventFormReturn => {
  const eventService = useEventService();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  const handleEdit = useCallback(() => {
    setEditedEvent(event || {});
    setIsEditing(true);
  }, [event]);

  const handleSave = useCallback(async () => {
    if (!event?.id || !editedEvent) return;
    try {
      await eventService.updateEvent(event.id, editedEvent);
      toast.success('Event aktualisiert', {
        description: 'Das Event wurde erfolgreich aktualisiert.',
      });
      setIsEditing(false);
      onEventUpdate();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren', {
        description:
          'Das Event konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, [event?.id, editedEvent, eventService, onEventUpdate]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedEvent({});
  }, []);

  const handleDelete = useCallback(async () => {
    if (!event?.id) return;
    try {
      await eventService.deleteEvent(event.id);
      toast.success('Event gelöscht', {
        description: 'Das Event wurde erfolgreich gelöscht.',
      });
      // Navigation wird in der Komponente gehandhabt
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description:
          'Das Event konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
      });
    }
  }, [event?.id, eventService]);

  const handleInputChange = useCallback((field: keyof Event, value: any) => {
    if (field === 'socialMedia') {
      setEditedEvent(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          ...value,
        },
      }));
    } else {
      setEditedEvent(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  }, []);

  const handleSocialMediaChange = useCallback(
    (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => {
      setEditedEvent(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value,
        },
      }));
    },
    []
  );

  const handleLocationSelect = useCallback((location: LocationResult | null) => {
    if (!location) return;

    setEditedEvent(prev => ({
      ...prev,
      location: {
        address: location.address.label,
        latitude: location.position.lat,
        longitude: location.position.lng,
      },
    }));
    setSearchValue(location);
  }, []);

  return {
    isEditing,
    editedEvent,
    searchValue,
    setIsEditing,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleInputChange,
    handleSocialMediaChange,
    handleLocationSelect,
    setSearchValue,
  };
};

