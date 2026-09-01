import { format, isFuture, isPast, isWithinInterval, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { formatMonthYear, hasDateInfo, monthYearToDate } from '@/utils/eventFormatters';
import { isEventPast, matchesCategoryFilter } from '@/utils/eventFilterUtils';

export const convertFFToHex = (ffColor: string): string =>
  `#${ffColor.replace('0x', '').slice(-6)}`;

export function getContrastTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return '#fff';
  }
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance > 0.5 ? '#1f2937' : '#fff';
}

export function mergeAdminEvents(activeFromApi: Event[], pendingFromApi: Event[]): Event[] {
  const activeIds = new Set(activeFromApi.map(e => e.id));
  const pendingOnly = pendingFromApi.filter(p => !activeIds.has(p.id));
  const merged = [...pendingOnly, ...activeFromApi];
  merged.sort((a, b) => {
    const aP = a.status === 'PENDING' ? 0 : 1;
    const bP = b.status === 'PENDING' ? 0 : 1;
    if (aP !== bP) return aP - bP;
    return new Date(b.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });
  return merged;
}

export interface EventListCacheData {
  events: Event[];
  categories: EventCategory[];
  pendingAccess: boolean;
  updatedAt: number;
}

let eventListCache: EventListCacheData | null = null;
export const shouldUseEventListCache = process.env.NODE_ENV !== 'test';

export function getEventListCache(): EventListCacheData | null {
  return shouldUseEventListCache ? eventListCache : null;
}

export function updateEventListCache(
  nextEvents: Event[],
  nextCategories: EventCategory[],
  nextPendingAccess: boolean
): void {
  if (!shouldUseEventListCache) {
    return;
  }
  eventListCache = {
    events: nextEvents,
    categories: nextCategories,
    pendingAccess: nextPendingAccess,
    updatedAt: Date.now(),
  };
}

export interface EventListFilterParams {
  searchQuery: string;
  statusFilter: string;
  approvalFilter: string;
  categoryFilter: string;
  dateFilter: string;
  timeFilter: string;
  selectedWeek: string;
  selectedMonth: string;
  isSelectionMode: boolean;
}

export function filterEvents(events: Event[], params: EventListFilterParams): Event[] {
  const {
    searchQuery,
    statusFilter,
    approvalFilter,
    categoryFilter,
    dateFilter,
    timeFilter,
    selectedWeek,
    selectedMonth,
    isSelectionMode,
  } = params;

  return events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isPendingModeration = event.status === 'PENDING';
    const matchesApproval =
      approvalFilter === 'all' ||
      (approvalFilter === 'pending' && isPendingModeration) ||
      (approvalFilter === 'active' && !isPendingModeration);
    if (!matchesApproval) return false;

    const eventHasDate = hasDateInfo(event);
    const matchesDateFilter =
      dateFilter === 'all' ||
      (dateFilter === 'with-date' && eventHasDate) ||
      (dateFilter === 'no-date' && !eventHasDate);

    if (!matchesDateFilter) return false;

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
      matchesStatus = true;
    } else if (statusFilter !== 'all') {
      matchesStatus = false;
    }

    const matchesCategory = matchesCategoryFilter(event, categoryFilter);

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

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesTime &&
      (!isSelectionMode || !isEventPast(event))
    );
  });
}

export interface EventMonthGroup {
  label: string;
  date: Date;
  events: Event[];
}

export function groupEventsByMonth(filteredEvents: Event[]): Record<string, EventMonthGroup> {
  return filteredEvents.reduce(
    (acc, event) => {
      let monthKey: string;
      let monthLabel: string;
      let groupDate: Date;

      if (event.dailyTimeSlots?.length > 0) {
        const firstSlot = event.dailyTimeSlots[0];
        const firstDate = new Date(firstSlot.date);
        monthKey = format(startOfMonth(firstDate), 'yyyy-MM', { locale: de });
        monthLabel = format(startOfMonth(firstDate), 'MMMM yyyy', { locale: de });
        groupDate = firstDate;
      } else if (event.monthYear) {
        const monthYearDate = monthYearToDate(event.monthYear);
        if (monthYearDate) {
          monthKey = format(startOfMonth(monthYearDate), 'yyyy-MM', { locale: de });
          monthLabel = formatMonthYear(event.monthYear);
          groupDate = monthYearDate;
        } else {
          monthKey = 'no-date';
          monthLabel = 'Ohne Datum';
          groupDate = new Date(0);
        }
      } else {
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
    {} as Record<string, EventMonthGroup>
  );
}

export function sortMonthKeys(groupedEventsByMonth: Record<string, EventMonthGroup>): string[] {
  return Object.keys(groupedEventsByMonth).sort((a, b) => {
    if (a === 'no-date') return 1;
    if (b === 'no-date') return -1;
    return groupedEventsByMonth[b].date.getTime() - groupedEventsByMonth[a].date.getTime();
  });
}

export function buildCategoryMap(categories: EventCategory[]): Map<string, EventCategory> {
  return new Map(categories.map(category => [category.id, category]));
}

export function getMonthOptions(events: Event[]): { key: string; label: string }[] {
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
}
