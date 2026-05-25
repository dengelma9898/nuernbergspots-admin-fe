import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Image as ImageIcon,
  Heart,
  Ticket,
  Euro,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowLeft,
  Tag,
  Star,
  StarOff,
  Plus,
  Copy,
  CheckSquare,
  Square,
  X,
  CalendarDays,
  FileSpreadsheet,
  Eye,
  Pencil,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { format, isPast, isFuture, isWithinInterval, startOfMonth } from 'date-fns';
import { formatMonthYear, monthYearToDate, hasDateInfo } from '@/utils/eventFormatters';
import { matchesCategoryFilter } from '@/utils/eventFilterUtils';
import { de } from 'date-fns/locale';
import { convertFFToHex } from '@/utils/colorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getIconComponent } from '@/utils/iconUtils';
import { CalendarWeekSelect } from '@/components/ui/calendar-week-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingButton } from '@/components/LoadingButton';
import { scaleIn } from '@/lib/animations';

function mergeAdminEvents(activeFromApi: Event[], pendingFromApi: Event[]): Event[] {
  const activeIds = new Set(activeFromApi.map(e => e.id));
  const pendingOnly = pendingFromApi.filter(p => !activeIds.has(p.id));
  const merged = [...pendingOnly, ...activeFromApi];
  merged.sort((a, b) => {
    const aP = a.status === 'PENDING' ? 0 : 1;
    const bP = b.status === 'PENDING' ? 0 : 1;
    if (aP !== bP) return aP - bP;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  return merged;
}

interface EventListCacheData {
  events: Event[];
  categories: EventCategory[];
  pendingAccess: boolean;
  updatedAt: number;
}

let eventListCache: EventListCacheData | null = null;
const shouldUseEventListCache = process.env.NODE_ENV !== 'test';

export const EventList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTimeFilter = ['all', 'week', 'month'].includes(searchParams.get('time') || '')
    ? (searchParams.get('time') as string)
    : 'all';
  const initialStatusFilter = ['all', 'past', 'running', 'future'].includes(
    searchParams.get('status') || ''
  )
    ? (searchParams.get('status') as string)
    : 'all';
  const initialDateFilter = ['all', 'with-date', 'no-date'].includes(searchParams.get('date') || '')
    ? (searchParams.get('date') as string)
    : 'all';
  const initialApprovalFilter = ['all', 'pending', 'active'].includes(
    searchParams.get('approval') || ''
  )
    ? (searchParams.get('approval') as string)
    : 'all';
  const cachedData = shouldUseEventListCache ? eventListCache : null;
  const [events, setEvents] = useState<Event[]>(cachedData?.events ?? []);
  const [categories, setCategories] = useState<EventCategory[]>(cachedData?.categories ?? []);
  const [pendingAccess, setPendingAccess] = useState<boolean>(cachedData?.pendingAccess ?? false);
  const [loading, setLoading] = useState(!cachedData);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [timeFilter, setTimeFilter] = useState<string>(initialTimeFilter);
  const [selectedWeek, setSelectedWeek] = useState<string>(
    initialTimeFilter === 'week' ? searchParams.get('week') || '' : ''
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialTimeFilter === 'month' ? searchParams.get('month') || '' : ''
  );
  const [dateFilter, setDateFilter] = useState<string>(initialDateFilter); // 'all' | 'with-date' | 'no-date'
  const [approvalFilter, setApprovalFilter] = useState<string>(initialApprovalFilter);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  // State für den Auswahlmodus
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const isLoadingRef = useRef(false);
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const navigate = useNavigate();

  const updateEventListCache = (
    nextEvents: Event[],
    nextCategories: EventCategory[],
    nextPendingAccess: boolean
  ) => {
    if (!shouldUseEventListCache) {
      return;
    }
    eventListCache = {
      events: nextEvents,
      categories: nextCategories,
      pendingAccess: nextPendingAccess,
      updatedAt: Date.now(),
    };
  };

  const loadData = async (forceRefresh = false): Promise<boolean> => {
    if (isLoadingRef.current) {
      return false;
    }
    if (loading && !forceRefresh) {
      return false;
    }
    if (!forceRefresh && shouldUseEventListCache && eventListCache) {
      setEvents(eventListCache.events);
      setCategories(eventListCache.categories);
      setPendingAccess(eventListCache.pendingAccess);
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
      updateEventListCache(mergedEvents, fetchedCategories, nextPendingAccess);
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
    if (shouldUseEventListCache && eventListCache) {
      setEvents(eventListCache.events);
      setCategories(eventListCache.categories);
      setPendingAccess(eventListCache.pendingAccess);
      setLoading(false);
      return;
    }
    loadData(true);
  }, []);

  useEffect(() => {
    if (timeFilter !== 'week' && selectedWeek) {
      setSelectedWeek('');
    }
    if (timeFilter !== 'month' && selectedMonth) {
      setSelectedMonth('');
    }
  }, [timeFilter, selectedMonth, selectedWeek]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (searchQuery) {
      nextParams.set('q', searchQuery);
    } else {
      nextParams.delete('q');
    }

    if (statusFilter !== 'all') {
      nextParams.set('status', statusFilter);
    } else {
      nextParams.delete('status');
    }

    if (categoryFilter !== 'all') {
      nextParams.set('category', categoryFilter);
    } else {
      nextParams.delete('category');
    }

    if (timeFilter !== 'all') {
      nextParams.set('time', timeFilter);
    } else {
      nextParams.delete('time');
    }

    if (timeFilter === 'week' && selectedWeek) {
      nextParams.set('week', selectedWeek);
    } else {
      nextParams.delete('week');
    }
    if (timeFilter === 'month' && selectedMonth) {
      nextParams.set('month', selectedMonth);
    } else {
      nextParams.delete('month');
    }

    if (dateFilter !== 'all') {
      nextParams.set('date', dateFilter);
    } else {
      nextParams.delete('date');
    }

    if (approvalFilter !== 'all') {
      nextParams.set('approval', approvalFilter);
    } else {
      nextParams.delete('approval');
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    approvalFilter,
    categoryFilter,
    dateFilter,
    searchParams,
    searchQuery,
    selectedWeek,
    selectedMonth,
    setSearchParams,
    statusFilter,
    timeFilter,
  ]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (eventId: string) => {
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
        updateEventListCache(nextEvents, categories, pendingAccess);
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
        updateEventListCache(nextEvents, categories, pendingAccess);
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

  const monthOptions = useMemo(() => {
    const monthKeys = new Set<string>();
    for (const event of events) {
      if (event.dailyTimeSlots?.length) {
        for (const slot of event.dailyTimeSlots) {
          monthKeys.add(format(new Date(slot.date), 'yyyy-MM', { locale: de }));
        }
      } else if (event.monthYear) {
        const parsedMonthYearDate = monthYearToDate(event.monthYear);
        if (parsedMonthYearDate) {
          monthKeys.add(format(startOfMonth(parsedMonthYearDate), 'yyyy-MM', { locale: de }));
        }
      }
    }

    return Array.from(monthKeys)
      .sort((a, b) => b.localeCompare(a))
      .map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(Number(year), Number(month) - 1, 1);
        return {
          key: monthKey,
          label: format(monthDate, 'MMMM yyyy', { locale: de }),
        };
      });
  }, [events]);

  const pendingModerationCount = useMemo(
    () => events.filter(e => e.status === 'PENDING').length,
    [events]
  );

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isPendingModeration = event.status === 'PENDING';
    const matchesApproval =
      approvalFilter === 'all' ||
      (approvalFilter === 'pending' && isPendingModeration) ||
      (approvalFilter === 'active' && !isPendingModeration);
    if (!matchesApproval) return false;

    // Datums-Filter (mit/ohne Zeiteinordnung)
    const eventHasDate = hasDateInfo(event);
    const matchesDateFilter =
      dateFilter === 'all' ||
      (dateFilter === 'with-date' && eventHasDate) ||
      (dateFilter === 'no-date' && !eventHasDate);

    if (!matchesDateFilter) return false;

    // Status-Filterung nur für Events mit dailyTimeSlots
    // Events mit nur monthYear (ohne dailyTimeSlots) kommen durch, da sie bereits durch dateFilter gefiltert wurden
    let matchesStatus = true;
    if (event.dailyTimeSlots?.length > 0) {
      const firstSlot = event.dailyTimeSlots[0];
      const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
      const firstDate = new Date(firstSlot.date);
      const lastDate = new Date(lastSlot.date);

      matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'past' && isPast(lastDate)) ||
        (statusFilter === 'running' &&
          isWithinInterval(new Date(), {
            start: firstDate,
            end: lastDate,
          })) ||
        (statusFilter === 'future' && isFuture(firstDate));
    } else if (event.monthYear) {
      // Events mit nur monthYear kommen durch Status-Filter durch
      // (sie wurden bereits durch dateFilter gefiltert)
      matchesStatus = true;
    } else if (statusFilter !== 'all') {
      // Events ohne jegliche Zeiteinordnung können keinen Status haben
      matchesStatus = false;
    }

    const matchesCategory = matchesCategoryFilter(event, categoryFilter);

    // Zeitfilter (KW) gilt nur für Events mit konkreten Tagesdaten (dailyTimeSlots)
    // und nur für das aktuelle Kalenderjahr.
    let matchesTime = true;
    if (timeFilter === 'week') {
      if (!selectedWeek || !event.dailyTimeSlots?.length) {
        matchesTime = false;
      } else {
        const currentYear = new Date().getFullYear();
        matchesTime = event.dailyTimeSlots.some(slot => {
          const slotDate = new Date(slot.date);
          const slotWeek = format(slotDate, 'w', { locale: de });
          return slotDate.getFullYear() === currentYear && slotWeek === selectedWeek;
        });
      }
    } else if (timeFilter === 'month') {
      if (!selectedMonth) {
        matchesTime = false;
      } else if (event.dailyTimeSlots?.length) {
        matchesTime = event.dailyTimeSlots.some(slot => {
          const slotDate = new Date(slot.date);
          return format(slotDate, 'yyyy-MM', { locale: de }) === selectedMonth;
        });
      } else if (event.monthYear) {
        const parsedMonthYearDate = monthYearToDate(event.monthYear);
        if (!parsedMonthYearDate) {
          matchesTime = false;
        } else {
          matchesTime =
            format(startOfMonth(parsedMonthYearDate), 'yyyy-MM', { locale: de }) === selectedMonth;
        }
      } else {
        matchesTime = false;
      }
    }

    const finalResult = matchesSearch && matchesStatus && matchesCategory && matchesTime;
    return finalResult;
  });

  // Gruppiere Events nach Monat (basierend auf Startmonat)
  // Priorität: dailyTimeSlots > monthYear > keine Zeiteinordnung
  const groupedEventsByMonth = filteredEvents.reduce(
    (acc, event) => {
      let monthKey: string;
      let monthLabel: string;
      let groupDate: Date;

      // Priorität 1: dailyTimeSlots
      if (event.dailyTimeSlots?.length > 0) {
        const firstSlot = event.dailyTimeSlots[0];
        const firstDate = new Date(firstSlot.date);
        monthKey = format(startOfMonth(firstDate), 'yyyy-MM', { locale: de });
        monthLabel = format(startOfMonth(firstDate), 'MMMM yyyy', { locale: de });
        groupDate = firstDate;
      }
      // Priorität 2: monthYear
      else if (event.monthYear) {
        const monthYearDate = monthYearToDate(event.monthYear);
        if (monthYearDate) {
          monthKey = format(startOfMonth(monthYearDate), 'yyyy-MM', { locale: de });
          monthLabel = formatMonthYear(event.monthYear);
          groupDate = monthYearDate;
        } else {
          // Fallback wenn monthYear ungültig
          monthKey = 'no-date';
          monthLabel = 'Ohne Datum';
          groupDate = new Date(0);
        }
      }
      // Priorität 3: Keine Zeiteinordnung
      else {
        monthKey = 'no-date';
        monthLabel = 'Ohne Datum';
        groupDate = new Date(0);
      }

      if (!acc[monthKey]) {
        acc[monthKey] = {
          label: monthLabel,
          date: groupDate,
          events: [],
        };
      }

      acc[monthKey].events.push(event);
      return acc;
    },
    {} as Record<string, { label: string; date: Date; events: Event[] }>
  );

  // Sortiere die Monate absteigend (neueste zuerst), "no-date" am Ende
  const sortedMonths = Object.keys(groupedEventsByMonth).sort((a, b) => {
    // "no-date" immer am Ende
    if (a === 'no-date') return 1;
    if (b === 'no-date') return -1;
    return groupedEventsByMonth[b].date.getTime() - groupedEventsByMonth[a].date.getTime();
  });

  // Auswahlmodus Funktionen
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      // Auswahlmodus beenden und Auswahl zurücksetzen
      setIsSelectionMode(false);
      setSelectedEventIds(new Set());
    } else {
      // Auswahlmodus aktivieren
      setIsSelectionMode(true);
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const selectAllVisibleEvents = () => {
    setSelectedEventIds(new Set(filteredEvents.map(e => e.id)));
  };

  const deselectAllEvents = () => {
    setSelectedEventIds(new Set());
  };

  const handleGenerateImage = () => {
    const eventsForImage = isSelectionMode
      ? filteredEvents.filter(e => selectedEventIds.has(e.id))
      : filteredEvents;

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

    // Auswahlmodus beenden nach Navigation
    setIsSelectionMode(false);
    setSelectedEventIds(new Set());
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
            {/* Header Skeleton */}
            <div className={cn(glassCard, 'p-6 mb-8')}>
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
                <Skeleton className="bg-muted h-10 w-full sm:w-48 rounded-lg" />
                <Skeleton className="bg-muted h-8 w-32 rounded" />
                <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
                  <Skeleton className="bg-muted h-10 w-full sm:w-32 rounded-lg" />
                  <Skeleton className="bg-muted h-10 w-full sm:w-32 rounded-lg" />
                  <Skeleton className="bg-muted h-10 w-full sm:w-40 rounded-lg" />
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <Skeleton className="bg-muted h-10 flex-1 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
              </div>
            </div>

            {/* Event Cards Grid Skeleton */}
            <div className="space-y-8">
              {[...Array(3)].map((_, sectionIndex) => (
                <div key={sectionIndex}>
                  <Skeleton className="bg-muted h-8 w-48 mb-6 rounded" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, cardIndex) => (
                      <Card key={cardIndex} className={cn(glassCard, 'flex flex-col')}>
                        <Skeleton className="bg-muted h-48 w-full rounded-t-lg" />
                        <div className="p-6">
                          <Skeleton className="bg-muted h-6 w-40 rounded mb-2" />
                          <Skeleton className="bg-muted h-4 w-32 rounded" />
                        </div>
                        <div className="px-6 pb-6 flex-grow">
                          <Skeleton className="bg-muted h-4 w-full rounded mb-2" />
                          <Skeleton className="bg-muted h-4 w-3/4 rounded" />
                        </div>
                        <div className="px-6 pb-6">
                          <div className="flex justify-between items-center">
                            <Skeleton className="bg-muted h-3 w-24 rounded" />
                            <div className="flex gap-2">
                              <Skeleton className="bg-muted h-8 w-20 rounded-lg" />
                              <Skeleton className="bg-muted h-8 w-16 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className={cn(glassButton, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Events</h1>
              {pendingAccess && pendingModerationCount > 0 ? (
                <Badge
                  variant="outline"
                  className="border-amber-400/60 text-foreground bg-amber-500/10 shrink-0"
                >
                  {pendingModerationCount} ausstehend
                </Badge>
              ) : null}
              <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
                {isSelectionMode ? (
                  <>
                    <AnimatedButton
                      variant="outline"
                      onClick={selectAllVisibleEvents}
                      className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Alle auswählen
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      onClick={deselectAllEvents}
                      className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                    >
                      <Square className="h-4 w-4" />
                      Auswahl aufheben
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={handleGenerateImage}
                      disabled={selectedEventIds.size === 0}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Bild generieren ({selectedEventIds.size})
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      onClick={toggleSelectionMode}
                      className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                    >
                      <X className="h-4 w-4" />
                      Abbrechen
                    </AnimatedButton>
                  </>
                ) : (
                  <>
                    <AnimatedButton
                      variant="outline"
                      onClick={toggleSelectionMode}
                      className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                    >
                      <ImageIcon className="h-4 w-4" />
                      Bild generieren
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      onClick={handleManualRefresh}
                      disabled={loading}
                      className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                    >
                      <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                      Aktualisieren
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      onClick={() => navigate('/events/import/csv')}
                      className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV Import
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => navigate('/create-event')}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Event hinzufügen
                    </AnimatedButton>
                  </>
                )}
              </div>
            </div>

            {/* Auswahlmodus Banner */}
            {isSelectionMode && (
              <motion.div
                className="mb-4 p-4 rounded-xl bg-primary/20 border border-primary/40 backdrop-blur-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-3 text-foreground">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    Auswahlmodus aktiv – Wählen Sie die Events für das Bild aus
                  </span>
                  <span className="ml-auto text-sm opacity-80">
                    {selectedEventIds.size} von {filteredEvents.length} ausgewählt
                  </span>
                </div>
              </motion.div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="relative flex-1 mb-2 md:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Event-Namen suchen..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(glassInput, 'pl-10')}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[200px] mb-2 md:mb-0')}>
                  <SelectValue placeholder="Zeitraum-Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Zeiträume (Status)</SelectItem>
                  <SelectItem value="past">Vergangene Events</SelectItem>
                  <SelectItem value="running">Laufende Events</SelectItem>
                  <SelectItem value="future">Zukünftige Events</SelectItem>
                </SelectContent>
              </Select>
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[200px] mb-2 md:mb-0')}>
                  <SelectValue placeholder="Freigabe filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Freigaben</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="active">Freigegeben</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px] mb-2 md:mb-0')}>
                  <SelectValue placeholder="Kategorie filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="no-category">Ohne Kategorie</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={timeFilter}
                onValueChange={value => {
                  setTimeFilter(value);
                  if (value !== 'week') {
                    setSelectedWeek('');
                  }
                  if (value === 'month') {
                    if (!selectedMonth && monthOptions.length > 0) {
                      setSelectedMonth(monthOptions[0].key);
                    }
                  } else {
                    setSelectedMonth('');
                  }
                }}
              >
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px]')}>
                  <SelectValue placeholder="Zeitraum filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Zeiträume</SelectItem>
                  <SelectItem value="week">Kalenderwoche</SelectItem>
                  <SelectItem value="month">Monat</SelectItem>
                </SelectContent>
              </Select>
              {timeFilter === 'week' && (
                <CalendarWeekSelect value={selectedWeek} onChange={setSelectedWeek} />
              )}
              {timeFilter === 'month' && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className={cn(glassInput, 'w-full sm:w-[220px]')}>
                    <SelectValue placeholder="Monat auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(monthOption => (
                      <SelectItem key={monthOption.key} value={monthOption.key}>
                        {monthOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                value={dateFilter}
                onValueChange={value => {
                  setDateFilter(value);
                  // Reset andere Filter wenn dateFilter geändert wird, um Konflikte zu vermeiden
                  if (value === 'no-date') {
                    // Events ohne Datum können keinen Status/Zeitfilter haben
                    setStatusFilter('all');
                    setTimeFilter('all');
                    setSelectedWeek('');
                    setSelectedMonth('');
                  }
                }}
              >
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px]')}>
                  <SelectValue placeholder="Datum filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Events</SelectItem>
                  <SelectItem value="with-date">Mit Datum</SelectItem>
                  <SelectItem value="no-date">Ohne Datum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Content Area */}
          {filteredEvents.length === 0 ? (
            <motion.div
              className={cn(glassCard, 'p-8 text-center')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="text-muted-foreground text-lg">Keine Events gefunden.</div>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {sortedMonths.length === 0 ? (
                <motion.div
                  className={cn(glassCard, 'p-8 text-center')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={defaultTransition}
                >
                  <div className="text-muted-foreground text-lg">
                    Keine Gruppen gefunden (aber {filteredEvents.length} Events gefiltert).
                  </div>
                </motion.div>
              ) : (
                sortedMonths.map((monthKey, monthIndex) => {
                  const monthGroup = groupedEventsByMonth[monthKey];
                  return (
                    <motion.div
                      key={monthKey}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                    >
                      <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
                        {monthGroup.label}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {monthGroup.events.map((event, eventIndex) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            category={categories.find(cat => cat.id === event.categoryId)}
                            onDelete={handleDelete}
                            showApprove={pendingAccess && event.status === 'PENDING'}
                            onApprove={handleApproveEvent}
                            isApproving={approvingEventId === event.id}
                            onCopy={id => {
                              navigate(`/events/${id}/copy`);
                              showSuccessMessage(toast, {
                                title: 'Event wird kopiert',
                                description: 'Sie werden zur Kopier-Seite weitergeleitet.',
                              });
                            }}
                            index={monthIndex * 10 + eventIndex}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedEventIds.has(event.id)}
                            onToggleSelection={toggleEventSelection}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Hidden elements for test compatibility */}
          <div className="sr-only">
            <div>Events</div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className={cn(glassCard)}>
              <motion.div variants={scaleIn} initial="initial" animate="animate" exit="exit">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Event löschen</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Möchten Sie dieses Event wirklich löschen? Diese Aktion kann nicht rückgängig
                    gemacht werden.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setEventToDelete(null);
                    }}
                    disabled={isDeleting}
                    className={cn(glassButton)}
                  >
                    Abbrechen
                  </AnimatedButton>
                  <LoadingButton
                    variant="destructive"
                    onClick={confirmDelete}
                    isLoading={isDeleting}
                    loadingText="Wird gelöscht..."
                  >
                    Löschen
                  </LoadingButton>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
};

interface EventCardProps {
  event: Event;
  category?: EventCategory;
  onDelete: (id: string) => void;
  onCopy?: (id: string) => void;
  showApprove?: boolean;
  onApprove?: (id: string) => void;
  isApproving?: boolean;
  isPreview?: boolean;
  onEdit?: () => void;
  showDeleteButton?: boolean;
  index?: number;
  // Auswahlmodus Props
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  category,
  onDelete,
  onCopy,
  showApprove = false,
  onApprove,
  isApproving = false,
  isPreview = false,
  onEdit,
  showDeleteButton = false,
  index = 0,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection(event.id);
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const formatPrice = (event: Event) => {
    if (event.priceString) {
      return event.priceString;
    }
    if (event.price) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(event.price);
    }
    return 'Kostenlos';
  };

  const getEventDateTime = (event: Event) => {
    // Priorität 1: dailyTimeSlots
    if (event.dailyTimeSlots?.length) {
      const firstSlot = event.dailyTimeSlots[0];
      const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

      if (firstSlot.date === lastSlot.date) {
        return formatDate(firstSlot.date);
      }
      return `${formatDate(firstSlot.date)} - ${formatDate(lastSlot.date)}`;
    }

    // Priorität 2: monthYear
    if (event.monthYear) {
      return formatMonthYear(event.monthYear);
    }

    // Priorität 3: Keine Zeiteinordnung
    return 'Kein Datum';
  };

  const getEventStatus = (event: Event) => {
    // Events mit dailyTimeSlots -> normale Status-Berechnung
    if (event.dailyTimeSlots?.length) {
      const now = new Date();
      const firstSlot = event.dailyTimeSlots[0];
      const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

      const firstDate = new Date(firstSlot.date);
      const lastDate = new Date(lastSlot.date);

      if (isPast(lastDate)) {
        return {
          label: 'Beendet',
          icon: <CheckCircle2 className="h-4 w-4" />,
          variant: 'secondary' as const,
        };
      }

      if (isWithinInterval(now, { start: firstDate, end: lastDate })) {
        return {
          label: 'Läuft jetzt',
          icon: <Clock className="h-4 w-4" />,
          variant: 'default' as const,
        };
      }

      if (isFuture(firstDate)) {
        return {
          label: 'Kommend',
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'outline' as const,
        };
      }
    }

    // Events nur mit monthYear -> vereinfachte Status-Berechnung
    if (event.monthYear) {
      const monthYearDate = monthYearToDate(event.monthYear);
      if (monthYearDate) {
        // Letzter Tag des Monats
        const endOfMonthDate = new Date(
          monthYearDate.getFullYear(),
          monthYearDate.getMonth() + 1,
          0
        );

        if (isPast(endOfMonthDate)) {
          return {
            label: 'Beendet',
            icon: <CheckCircle2 className="h-4 w-4" />,
            variant: 'secondary' as const,
          };
        }

        if (isFuture(monthYearDate)) {
          return {
            label: 'Kommend',
            icon: <CalendarDays className="h-4 w-4" />,
            variant: 'outline' as const,
          };
        }

        // Aktueller Monat
        return {
          label: 'Diesen Monat',
          icon: <CalendarDays className="h-4 w-4" />,
          variant: 'default' as const,
        };
      }
    }

    // Events ohne Zeiteinordnung
    return {
      label: 'Ohne Datum',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'secondary' as const,
    };
  };

  const getRandomFallbackImage = (category?: EventCategory): string | undefined => {
    if (!category?.fallbackImages?.length) return undefined;
    const randomIndex = Math.floor(Math.random() * category.fallbackImages.length);
    return category.fallbackImages[randomIndex];
  };

  const status = getEventStatus(event);
  const fallbackImage = getRandomFallbackImage(category);
  const hasVisibleImage = Boolean(
    event.titleImageUrl || (event.imageUrls && event.imageUrls.length > 0) || fallbackImage
  );

  return (
    <AnimatedCard
      index={index}
      className={cn(
        glassCard,
        'flex flex-col relative',
        hasVisibleImage && 'pt-0 overflow-hidden',
        isSelectionMode && 'cursor-pointer transition-all duration-300',
        isSelectionMode && isSelected && 'ring-4 ring-primary ring-offset-2 ring-offset-background'
      )}
      onClick={isSelectionMode ? handleCardClick : undefined}
    >
      {/* Auswahlmodus Checkbox-Overlay */}
      {isSelectionMode && (
        <div
          className={cn(
            'absolute top-4 left-4 z-20 rounded-lg p-2 transition-all duration-300',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/80 text-foreground backdrop-blur-sm'
          )}
        >
          {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
        </div>
      )}
      {event.titleImageUrl ? (
        <div className="relative h-48 w-full">
          <img src={event.titleImageUrl} alt={event.title} className="object-cover w-full h-full" />
          {event.imageUrls && event.imageUrls.length > 0 && (
            <div className="absolute bottom-2 left-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded-lg border border-secondary">
              +{event.imageUrls.length} weitere Bilder
            </div>
          )}
        </div>
      ) : event.imageUrls && event.imageUrls.length > 0 ? (
        <div className="relative h-48 w-full">
          <img src={event.imageUrls[0]} alt={event.title} className="object-cover w-full h-full" />
          {event.imageUrls.length > 1 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/90 border-secondary text-foreground"
            >
              <ImageIcon className="mr-1 h-3 w-3" />+{event.imageUrls.length - 1}
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 bg-tertiary text-tertiary-foreground border-secondary">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Promoted
            </Badge>
          )}
        </div>
      ) : fallbackImage ? (
        <div className="relative h-48 w-full">
          <img
            src={fallbackImage}
            alt={`${event.title} - Kategoriebild`}
            className="object-cover w-full h-full opacity-80"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/90 border-secondary text-foreground"
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            Kategoriebild
          </Badge>
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 bg-tertiary text-tertiary-foreground border-secondary">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Promoted
            </Badge>
          )}
        </div>
      ) : null}
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 w-full">
            <div className="flex items-center gap-1 min-w-0">
              <CardTitle className="text-xl text-foreground whitespace-nowrap">
                {event.title}
              </CardTitle>
              {event.isPromoted && <Star className="h-4 w-4 text-tertiary fill-current" />}
            </div>
            {category ? (
              <Badge
                className="text-xs flex items-center max-w-[60%] truncate border-secondary"
                style={{
                  backgroundColor: convertFFToHex(category.colorCode),
                  color: '#fff',
                }}
                title={category.name}
              >
                <span className="mr-1 flex items-center">
                  {getIconComponent(category.iconName)}
                </span>
                <span className="truncate">{category.name}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs flex items-center max-w-[60%] truncate border-secondary"
              >
                <Tag className="w-3 h-3 mr-1" />
                Keine Kategorie
              </Badge>
            )}
            {event.status === 'PENDING' ? (
              <Badge
                variant="outline"
                className="border-amber-400/70 text-amber-100 bg-amber-500/15 border-secondary"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Ausstehend
              </Badge>
            ) : null}
            <Badge variant={status.variant} className="ml-auto mt-1 sm:mt-0 border-secondary">
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <CardDescription className="mt-1 text-muted-foreground">
            {getEventDateTime(event)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{event.description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{event.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Heart className="mr-2 h-4 w-4" />
            {event.favoriteCount || 0} Likes
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Ticket className="mr-2 h-4 w-4" />
            {event.ticketsNeeded ? 'Tickets erforderlich' : 'Keine Tickets erforderlich'}
          </div>
          {(event.priceString || event.price) && (
            <div className="flex items-center text-sm text-foreground">
              <Euro className="mr-2 h-4 w-4" />
              {formatPrice(event)}
            </div>
          )}
          <div className="flex items-center text-sm">
            {event.isPromoted ? (
              <>
                <Star className="mr-2 h-4 w-4 text-tertiary fill-current" />
                <span className="text-tertiary font-medium">Promoted Event</span>
              </>
            ) : (
              <>
                <StarOff className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Standard Event</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Erstellt am {formatDate(event.createdAt)}
        </div>
        {isSelectionMode ? (
          <div className="text-sm text-muted-foreground italic">
            {isSelected ? 'Ausgewählt' : 'Klicken zum Auswählen'}
          </div>
        ) : (
          <div className="flex gap-2">
            {isPreview ? (
              <>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className={cn(glassButton)}
                >
                  Bearbeiten
                </AnimatedButton>
                {onCopy && (
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(event.id)}
                    className={cn(glassButton)}
                    title="Event kopieren"
                  >
                    <Copy className="h-4 w-4" />
                  </AnimatedButton>
                )}
                {showDeleteButton && (
                  <AnimatedButton
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(event.id)}
                  >
                    Löschen
                  </AnimatedButton>
                )}
              </>
            ) : (
              <>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/events/${event.id}${location.search}`)}
                  className={cn(glassButton)}
                  title="Details"
                  aria-label="Details"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/events/${event.id}${location.search}`, {
                      state: { startInEditMode: true },
                    })
                  }
                  className={cn(glassButton)}
                  title="Bearbeiten"
                  aria-label="Bearbeiten"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Bearbeiten</span>
                </AnimatedButton>
                {showApprove && onApprove ? (
                  <AnimatedButton
                    size="sm"
                    onClick={() => onApprove(event.id)}
                    disabled={isApproving}
                    className="bg-emerald-600/90 text-white hover:bg-emerald-600 border-0 gap-1"
                    title="Freigeben"
                    aria-label="Event freigeben"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Freigeben</span>
                  </AnimatedButton>
                ) : null}
                {onCopy && (
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(event.id)}
                    className={cn(glassButton)}
                    title="Event kopieren"
                  >
                    <Copy className="h-4 w-4" />
                  </AnimatedButton>
                )}
                <AnimatedButton variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
                  Löschen
                </AnimatedButton>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </AnimatedCard>
  );
};
