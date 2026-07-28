import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { showUserFriendlyError } from '@/utils/errorUtils';

export function useEventImageEditorData() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const eventService = useEventService();
  const categoryService = useEventCategoryService();
  const eventServiceRef = useRef(eventService);
  eventServiceRef.current = eventService;
  const categoryServiceRef = useRef(categoryService);
  categoryServiceRef.current = categoryService;

  useEffect(() => {
    if (location.state?.events && !isInitialized) {
      setEvents(location.state.events);
      setCategoryName(location.state.categoryName);
      setCustomTitle(location.state.categoryName);
      setIsInitialized(true);
      return;
    }

    if (id && !isInitialized) {
      const loadEvent = async () => {
        try {
          const event = await eventServiceRef.current.getEvent(id);
          setEvents([event]);

          const category = await categoryServiceRef.current.getCategory(event.categoryId!);
          setCategoryName(category.name);
          setCustomTitle(category.name);
          setIsInitialized(true);
        } catch (error) {
          console.error('Fehler beim Laden des Events:', error);
          showUserFriendlyError(error, toast, () => loadEvent(), 'load-event');
          navigate('/events');
        }
      };
      void loadEvent();
      return;
    }

    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [id, navigate, location.state, isInitialized]);

  return {
    events,
    categoryName,
    customTitle,
    setCustomTitle,
    isInitialized,
  };
}
