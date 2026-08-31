import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { EventListQueryInput, EventsListFacets, PaginationMeta } from '@/models/events-list';
import { UserType } from '@/models/users';
import { useAuth } from '@/contexts/AuthContext';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { useUserService } from '@/services/userService';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';
import { buildEventsListQueryParams } from '@/utils/eventListQuery';

const EMPTY_FACETS: EventsListFacets = { monthOptions: [] };
const shouldUseEventCategoryCache = process.env.NODE_ENV !== 'test';

let cachedEventCategories: EventCategory[] | null = null;

export function useEventListData(listQuery: EventListQueryInput) {
  const [events, setEvents] = useState<Event[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [facets, setFacets] = useState<EventsListFacets>(EMPTY_FACETS);
  const [categories, setCategories] = useState<EventCategory[]>(
    shouldUseEventCategoryCache && cachedEventCategories ? cachedEventCategories : []
  );
  const [loading, setLoading] = useState(true);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const listRequestIdRef = useRef(0);
  const categoriesLoadedRef = useRef(shouldUseEventCategoryCache && cachedEventCategories !== null);
  const eventService = useEventService();
  const eventServiceRef = useRef(eventService);
  eventServiceRef.current = eventService;
  const eventCategoryService = useEventCategoryService();
  const eventCategoryServiceRef = useRef(eventCategoryService);
  eventCategoryServiceRef.current = eventCategoryService;
  const userService = useUserService();
  const userServiceRef = useRef(userService);
  userServiceRef.current = userService;
  const { getUserId } = useAuth();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;
  const pendingAccess = isAdminOrSuperAdmin;
  const pendingModerationCount = facets.pendingCount ?? 0;
  const monthOptions = facets.monthOptions;

  const apiQueryParams = useMemo(() => buildEventsListQueryParams(listQuery), [listQuery]);

  const loadList = useCallback(
    async (options?: { silent?: boolean }) => {
      const requestId = ++listRequestIdRef.current;

      if (!options?.silent) {
        setLoading(true);
      }

      try {
        const response = await eventServiceRef.current.getEventsList(apiQueryParams);
        if (requestId !== listRequestIdRef.current) {
          return false;
        }
        setEvents(response.data);
        setMeta(response.meta);
        setFacets(response.facets ?? EMPTY_FACETS);
        return true;
      } catch (error) {
        if (requestId !== listRequestIdRef.current) {
          return false;
        }
        console.error('Fehler beim Laden der Events:', error);
        showUserFriendlyError(error, toast, () => void loadList(options), 'load-event');
        return false;
      } finally {
        if (requestId === listRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [apiQueryParams]
  );

  useEffect(() => {
    if (categoriesLoadedRef.current) {
      return;
    }

    let cancelled = false;

    const loadCategoriesOnce = async () => {
      try {
        const fetchedCategories = await eventCategoryServiceRef.current.getCategories();
        if (cancelled) {
          return;
        }
        if (shouldUseEventCategoryCache) {
          cachedEventCategories = fetchedCategories;
        }
        categoriesLoadedRef.current = true;
        setCategories(fetchedCategories);
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error('Fehler beim Laden der Kategorien:', error);
        showUserFriendlyError(
          error,
          toast,
          () => {
            categoriesLoadedRef.current = false;
            void loadCategoriesOnce();
          },
          'load-event-categories'
        );
      }
    };

    void loadCategoriesOnce();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

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

  const handleDelete = useCallback((eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      await eventService.deleteEvent(eventToDelete);
      showSuccessMessage(toast, {
        title: 'Event gelöscht',
        description: 'Das Event wurde erfolgreich gelöscht.',
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      await loadList({ silent: true });
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error);
      showUserFriendlyError(error, toast, () => confirmDelete(), 'delete-event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveEvent = useCallback(
    async (eventId: string) => {
      if (approvingEventId !== null || loading) {
        return;
      }
      try {
        setApprovingEventId(eventId);
        await eventService.approveEvent(eventId);
        showSuccessMessage(toast, {
          title: 'Event freigegeben',
          description: 'Das Event ist jetzt aktiv und für Nutzer sichtbar.',
        });
        await loadList({ silent: true });
      } catch (error) {
        console.error('Fehler bei der Freigabe:', error);
        showUserFriendlyError(
          error,
          toast,
          () => void handleApproveEvent(eventId),
          'approve-event'
        );
      } finally {
        setApprovingEventId(null);
      }
    },
    [approvingEventId, eventService, loadList, loading]
  );

  const handleManualRefresh = async () => {
    if (loading) {
      return;
    }
    const didRefresh = await loadList();
    if (didRefresh) {
      showSuccessMessage(toast, {
        title: 'Events aktualisiert',
        description: 'Die Event-Liste wurde neu geladen.',
      });
    }
  };

  const updateEventsLocally = useCallback((updater: Event[] | ((prev: Event[]) => Event[])) => {
    setEvents(prev => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  return {
    events,
    meta,
    facets,
    monthOptions,
    setEvents: updateEventsLocally,
    categories,
    pendingAccess,
    loading,
    approvingEventId,
    isAdminOrSuperAdmin,
    pendingModerationCount,
    deleteDialogOpen,
    setDeleteDialogOpen,
    eventToDelete,
    setEventToDelete,
    isDeleting,
    handleDelete,
    confirmDelete,
    handleApproveEvent,
    handleManualRefresh,
    reloadList: loadList,
    eventServiceRef,
    apiQueryParams,
  };
}
