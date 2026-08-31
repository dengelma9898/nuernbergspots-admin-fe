import { useCallback, useMemo, useState, type MutableRefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Event, BulkUpdateEventCategoryResult } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';
import { applyBulkCategoryResult, BULK_CATEGORY_MAX_EVENTS } from '@/utils/eventBulkUtils';
import { isEventPast } from '@/utils/eventFilterUtils';
import type { useEventService } from '@/services/eventService';

interface UseEventBulkSelectionParams {
  events: Event[];
  categories: EventCategory[];
  categoryFilter: string;
  isSelectionMode: boolean;
  setEvents: (updater: Event[] | ((prev: Event[]) => Event[])) => void;
  reloadList: () => Promise<boolean>;
  eventServiceRef: MutableRefObject<ReturnType<typeof useEventService>>;
}

export function useEventBulkSelection({
  events,
  categories,
  categoryFilter,
  setEvents,
  reloadList,
  eventServiceRef,
}: UseEventBulkSelectionParams) {
  const navigate = useNavigate();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [bulkCategoryDialogOpen, setBulkCategoryDialogOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkPartialResult, setBulkPartialResult] = useState<BulkUpdateEventCategoryResult | null>(
    null
  );
  const [bulkPartialDialogOpen, setBulkPartialDialogOpen] = useState(false);

  const selectableEvents = useMemo(
    () => (isSelectionMode ? events.filter(event => !isEventPast(event)) : events),
    [events, isSelectionMode]
  );

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedEventIds(new Set());
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      exitSelectionMode();
    } else {
      setIsSelectionMode(true);
    }
  };

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        if (newSet.size >= BULK_CATEGORY_MAX_EVENTS) {
          toast.warning('Auswahllimit erreicht', {
            description: `Maximal ${BULK_CATEGORY_MAX_EVENTS} Events pro Bulk-Aktion.`,
          });
          return prev;
        }
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const selectAllVisibleEvents = () => {
    const visibleIds = selectableEvents.map(event => event.id);
    if (visibleIds.length > BULK_CATEGORY_MAX_EVENTS) {
      toast.warning('Auswahllimit', {
        description: `Es wurden nur die ersten ${BULK_CATEGORY_MAX_EVENTS} von ${visibleIds.length} Events auf dieser Seite ausgewählt.`,
      });
      setSelectedEventIds(new Set(visibleIds.slice(0, BULK_CATEGORY_MAX_EVENTS)));
      return;
    }
    setSelectedEventIds(new Set(visibleIds));
  };

  const deselectAllEvents = () => {
    setSelectedEventIds(new Set());
  };

  const handleGenerateImage = () => {
    const eventsForImage = isSelectionMode
      ? selectableEvents.filter(event => selectedEventIds.has(event.id))
      : selectableEvents;

    navigate('/events/image-editor', {
      state: {
        events: eventsForImage,
        categoryName:
          categoryFilter !== 'all'
            ? categories.find(cat => cat.id === categoryFilter)?.name || ''
            : categories.length > 0
              ? categories[0].name
              : '',
      },
    });

    exitSelectionMode();
  };

  const handleBulkCategorySubmit = async (categoryId: string) => {
    if (bulkSubmitting || selectedEventIds.size === 0) return;
    if (selectedEventIds.size > BULK_CATEGORY_MAX_EVENTS) {
      toast.error('Zu viele Events ausgewählt', {
        description: `Maximal ${BULK_CATEGORY_MAX_EVENTS} Events pro Bulk-Aktion.`,
      });
      return;
    }
    setBulkSubmitting(true);
    try {
      const result = await eventServiceRef.current.bulkUpdateCategory({
        eventIds: [...selectedEventIds],
        categoryId,
      });
      setEvents(prevEvents => applyBulkCategoryResult(prevEvents, result));

      if (result.failed === 0) {
        showSuccessMessage(toast, {
          title: 'Kategorien aktualisiert',
          description: `${result.successful} Event${result.successful === 1 ? '' : 's'} wurde${result.successful === 1 ? '' : 'n'} aktualisiert.`,
        });
        setBulkCategoryDialogOpen(false);
        exitSelectionMode();
        await reloadList();
      } else {
        setBulkPartialResult(result);
        setBulkPartialDialogOpen(true);
        setBulkCategoryDialogOpen(false);
        toast.warning('Teilweise erfolgreich', {
          description: `${result.successful} von ${result.total} Events aktualisiert, ${result.failed} fehlgeschlagen.`,
        });
        await reloadList();
      }
    } catch (error) {
      console.error('Fehler beim Bulk-Kategorie-Update:', error);
      showUserFriendlyError(
        error,
        toast,
        () => void handleBulkCategorySubmit(categoryId),
        'bulk-category'
      );
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkPartialDialogClose = (open: boolean) => {
    setBulkPartialDialogOpen(open);
    if (!open) {
      setBulkPartialResult(null);
      exitSelectionMode();
    }
  };

  const selectedEventsForBulk = useMemo(
    () => selectableEvents.filter(event => selectedEventIds.has(event.id)),
    [selectableEvents, selectedEventIds]
  );

  return {
    isSelectionMode,
    selectedEventIds,
    visibleEvents: selectableEvents,
    bulkCategoryDialogOpen,
    setBulkCategoryDialogOpen,
    bulkSubmitting,
    bulkPartialResult,
    bulkPartialDialogOpen,
    toggleSelectionMode,
    toggleEventSelection,
    selectAllVisibleEvents,
    deselectAllEvents,
    handleGenerateImage,
    handleBulkCategorySubmit,
    handleBulkPartialDialogClose,
    selectedEventsForBulk,
  };
}
