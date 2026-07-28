import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { UserType } from '@/models/users';
import { useAuth } from '@/contexts/AuthContext';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { useUserService } from '@/services/userService';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';
import {
  getEventListCache,
  mergeAdminEvents,
  shouldUseEventListCache,
  updateEventListCache,
} from '@/utils/eventListUtils';

export function useEventListData() {
  const cachedData = getEventListCache();
  const [events, setEvents] = useState<Event[]>(cachedData?.events ?? []);
  const [categories, setCategories] = useState<EventCategory[]>(cachedData?.categories ?? []);
  const [pendingAccess, setPendingAccess] = useState<boolean>(cachedData?.pendingAccess ?? false);
  const [loading, setLoading] = useState(!cachedData);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoadingRef = useRef(false);
  const eventService = useEventService();
  const eventServiceRef = useRef(eventService);
  eventServiceRef.current = eventService;
  const eventCategoryService = useEventCategoryService();
  const userService = useUserService();
  const userServiceRef = useRef(userService);
  userServiceRef.current = userService;
  const { getUserId } = useAuth();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const syncCache = (
    nextEvents: Event[],
    nextCategories: EventCategory[],
    nextPendingAccess: boolean
  ) => {
    updateEventListCache(nextEvents, nextCategories, nextPendingAccess);
  };

  const loadData = async (forceRefresh = false): Promise<boolean> => {
    if (isLoadingRef.current) {
      return false;
    }
    if (loading && !forceRefresh) {
      return false;
    }
    const cache = getEventListCache();
    if (!forceRefresh && shouldUseEventListCache && cache) {
      setEvents(cache.events);
      setCategories(cache.categories);
      setPendingAccess(cache.pendingAccess);
      setLoading(false);
      return true;
    }

    isLoadingRef.current = true;
    try {
      setLoading(true);
      const [fetchedEvents, fetchedCategories] = await Promise.all([
        eventService.getEvents(),
        eventCategoryService.getCategories(),
      ]);

      let pendingList: Event[] = [];
      let nextPendingAccess = false;
      try {
        pendingList = await eventService.getPendingEvents();
        nextPendingAccess = true;
      } catch (pendingError: unknown) {
        const status = (pendingError as { status?: number }).status;
        if (status !== 403) {
          console.error('Fehler beim Laden ausstehender Events:', pendingError);
          showUserFriendlyError(
            pendingError,
            toast,
            () => {
              void loadData(true);
            },
            'load-pending-events'
          );
        }
        pendingList = [];
        nextPendingAccess = false;
      }

      const mergedEvents = mergeAdminEvents(fetchedEvents, pendingList);
      setEvents(mergedEvents);
      setCategories(fetchedCategories);
      setPendingAccess(nextPendingAccess);
      syncCache(mergedEvents, fetchedCategories, nextPendingAccess);
      return true;
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      showUserFriendlyError(error, toast, () => loadData(forceRefresh), 'load-event');
      return false;
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldUseEventListCache && getEventListCache()) {
      const cache = getEventListCache()!;
      setEvents(cache.events);
      setCategories(cache.categories);
      setPendingAccess(cache.pendingAccess);
      setLoading(false);
      return;
    }
    loadData(true);
  }, []);

  useEffect(() => {
    const loadUserRole = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const profile = await userServiceRef.current.getUserProfile(userId);
        setUserRole(profile.userType);
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerrolle:', error);
      }
    };
    void loadUserRole();
  }, [getUserId]);

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      await eventService.deleteEvent(eventToDelete);
      showSuccessMessage(toast, {
        title: 'Event gelöscht',
        description: 'Das Event wurde erfolgreich gelöscht.',
      });
      setEvents(prevEvents => {
        const nextEvents = prevEvents.filter(event => event.id !== eventToDelete);
        syncCache(nextEvents, categories, pendingAccess);
        return nextEvents;
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error);
      showUserFriendlyError(error, toast, () => confirmDelete(), 'delete-event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    if (approvingEventId !== null || loading) {
      return;
    }
    try {
      setApprovingEventId(eventId);
      const updated = await eventService.approveEvent(eventId);
      setEvents(prevEvents => {
        const nextEvents = prevEvents.map(e => (e.id === eventId ? { ...e, ...updated } : e));
        syncCache(nextEvents, categories, pendingAccess);
        return nextEvents;
      });
      showSuccessMessage(toast, {
        title: 'Event freigegeben',
        description: 'Das Event ist jetzt aktiv und für Nutzer sichtbar.',
      });
    } catch (error) {
      console.error('Fehler bei der Freigabe:', error);
      showUserFriendlyError(error, toast, () => void handleApproveEvent(eventId), 'approve-event');
    } finally {
      setApprovingEventId(null);
    }
  };

  const handleManualRefresh = async () => {
    if (loading) {
      return;
    }
    const didRefresh = await loadData(true);
    if (didRefresh) {
      showSuccessMessage(toast, {
        title: 'Events aktualisiert',
        description: 'Die Event-Liste wurde neu geladen.',
      });
    }
  };

  const setEventsWithCache = (updater: Event[] | ((prev: Event[]) => Event[])) => {
    setEvents(prev => {
      const nextEvents = typeof updater === 'function' ? updater(prev) : updater;
      syncCache(nextEvents, categories, pendingAccess);
      return nextEvents;
    });
  };

  return {
    events,
    setEvents: setEventsWithCache,
    categories,
    pendingAccess,
    loading,
    approvingEventId,
    isAdminOrSuperAdmin,
    pendingModerationCount: events.filter(e => e.status === 'PENDING').length,
    deleteDialogOpen,
    setDeleteDialogOpen,
    eventToDelete,
    setEventToDelete,
    isDeleting,
    handleDelete,
    confirmDelete,
    handleApproveEvent,
    handleManualRefresh,
    eventServiceRef,
  };
}
