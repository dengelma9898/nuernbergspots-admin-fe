import { format, isFuture, isPast, isWithinInterval, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { formatMonthYear, hasDateInfo, monthYearToDate } from '@/utils/eventFormatters';
import { isEventPast, matchesCategoryFilter } from '@/utils/eventFilterUtils';

export const convertFFToHex = (ffColor?: string): string => {
  if (!ffColor) return '#000000';
  return `#${ffColor.replace('0x', '').slice(-6)}`;
};

export type ActiveFilterType = 'search' | 'status' | 'approval' | 'category' | 'time' | 'date';

export interface ActiveFilterChip {
  id: ActiveFilterType;
  label: string;
}

export interface BuildActiveFilterChipsParams {
  searchQuery?: string;
  statusFilter?: string;
  approvalFilter?: string;
  categoryFilter?: string;
  timeFilter?: string;
  selectedWeek?: string;
  selectedMonth?: string;
  dateFilter?: string;
  categoryById?: Map<string, EventCategory | { name: string }>;
  monthOptions?: { key: string; label: string }[];
}

export function buildActiveFilterChips(params: BuildActiveFilterChipsParams): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (params.searchQuery && params.searchQuery.trim().length > 0) {
    chips.push({
      id: 'search',
      label: `Suche: „${params.searchQuery.trim()}“`,
    });
  }

  if (params.statusFilter && params.statusFilter !== 'all') {
    const statusLabels: Record<string, string> = {
      past: 'Beendet',
      running: 'Läuft',
      future: 'Kommend',
    };
    chips.push({
      id: 'status',
      label: `Status: ${statusLabels[params.statusFilter] ?? params.statusFilter}`,
    });
  }

  if (params.approvalFilter && params.approvalFilter !== 'all') {
    const approvalLabels: Record<string, string> = {
      pending: 'Ausstehend',
      active: 'Freigegeben',
    };
    chips.push({
      id: 'approval',
      label: `Moderation: ${approvalLabels[params.approvalFilter] ?? params.approvalFilter}`,
    });
  }

  if (params.categoryFilter && params.categoryFilter !== 'all') {
    let catName = 'Ohne Kategorie';
    if (params.categoryFilter !== 'no-category') {
      const found = params.categoryById?.get(params.categoryFilter);
      catName = found?.name ?? params.categoryFilter;
    }
    chips.push({
      id: 'category',
      label: `Kategorie: ${catName}`,
    });
  }

  if (params.timeFilter && params.timeFilter !== 'all') {
    if (params.timeFilter === 'week') {
      chips.push({
        id: 'time',
        label: params.selectedWeek
          ? `Zeitraum: KW ${params.selectedWeek}`
          : 'Zeitraum: Kalenderwoche',
      });
    } else if (params.timeFilter === 'month') {
      const monthOption = params.monthOptions?.find(m => m.key === params.selectedMonth);
      const label = monthOption?.label ?? params.selectedMonth ?? 'Monat';
      chips.push({
        id: 'time',
        label: `Zeitraum: ${label}`,
      });
    }
  }

  if (params.dateFilter && params.dateFilter !== 'all') {
    const dateLabels: Record<string, string> = {
      'with-date': 'Mit Datum',
      'no-date': 'Ohne Datum',
    };
    chips.push({
      id: 'date',
      label: `Datum: ${dateLabels[params.dateFilter] ?? params.dateFilter}`,
    });
  }

  return chips;
}

export interface BadgeColorStyle {
  isFilled: boolean;
  style: React.CSSProperties;
  className: string;
  dotColor?: string;
}

const DARK_TEXT_LUMINANCE = 0.021; // Relative luminance of #1f2937

export function getRelativeLuminance(hexColor: string): number | null {
  if (!hexColor) return null;
  let hex = hexColor.trim();
  if (hex.startsWith('0x')) hex = hex.slice(2);
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length > 6) hex = hex.slice(-6);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  if (hex.length !== 6) return null;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  const toLinear = (val: number) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getBadgeColorStyle(colorInput?: string): BadgeColorStyle {
  if (!colorInput) {
    return {
      isFilled: false,
      style: {},
      className: 'bg-card text-card-foreground border border-secondary',
    };
  }

  const hex = colorInput.startsWith('#')
    ? colorInput
    : `#${colorInput.replace('0x', '').slice(-6)}`;
  const lum = getRelativeLuminance(hex);

  if (lum === null) {
    return {
      isFilled: false,
      style: {},
      className: 'bg-card text-card-foreground border border-secondary',
    };
  }

  const ratioWhite = getContrastRatio(1.0, lum);
  const ratioDark = getContrastRatio(lum, DARK_TEXT_LUMINANCE);

  // If contrast against white is at least 4.5:1 and better than or equal to dark
  if (ratioWhite >= 4.5 && ratioWhite >= ratioDark) {
    return {
      isFilled: true,
      style: { backgroundColor: hex, color: '#fff' },
      className: 'border-transparent',
    };
  }

  // If contrast against dark text is at least 4.5:1
  if (ratioDark >= 4.5) {
    return {
      isFilled: true,
      style: { backgroundColor: hex, color: '#1f2937' },
      className: 'border-secondary/40',
    };
  }

  // Mid-tones where neither meets 4.5:1: Fallback to high-contrast outline with category color accent
  return {
    isFilled: false,
    style: { borderColor: hex },
    className: 'bg-card text-card-foreground border',
    dotColor: hex,
  };
}

export function getContrastTextColor(backgroundColor: string): string {
  const lum = getRelativeLuminance(backgroundColor);
  if (lum === null) {
    return '#fff';
  }
  const ratioWhite = getContrastRatio(1.0, lum);
  const ratioDark = getContrastRatio(lum, DARK_TEXT_LUMINANCE);
  return ratioDark > ratioWhite ? '#1f2937' : '#fff';
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

export function sortMonthKeys(
  groupedEventsByMonth: Record<string, EventMonthGroup>,
  direction: 'asc' | 'desc' = 'desc'
): string[] {
  const factor = direction === 'asc' ? -1 : 1;
  return Object.keys(groupedEventsByMonth).sort((a, b) => {
    if (a === 'no-date') return 1;
    if (b === 'no-date') return -1;
    return (
      factor * (groupedEventsByMonth[b].date.getTime() - groupedEventsByMonth[a].date.getTime())
    );
  });
}

export const UPDATED_AT_GROUP_KEY = 'updated-at';

/** Flache Gruppe (ohne Monatsüberschriften) für die Sortierung nach „Zuletzt geändert“. */
export function groupEventsFlat(
  events: Event[],
  label = 'Zuletzt geändert'
): Record<string, EventMonthGroup> {
  if (events.length === 0) {
    return {};
  }
  return {
    [UPDATED_AT_GROUP_KEY]: { label, date: new Date(), events },
  };
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

export type EventListEmptyStateVariant =
  | 'selection-no-selectable'
  | 'page-out-of-range'
  | 'pending-clear'
  | 'period'
  | 'filtered'
  | 'empty';

export type EventListEmptyStateAction =
  | 'reset-all-filters'
  | 'clear-search'
  | 'clear-time-filter'
  | 'show-all-events'
  | 'exit-selection-mode'
  | 'go-to-first-page'
  | 'create-event'
  | 'import-csv';

export interface EventListEmptyStateData {
  variant: EventListEmptyStateVariant;
  title: string;
  description?: string;
  actions: EventListEmptyStateAction[];
}

export interface GetEventListEmptyStateInput {
  totalCount: number;
  displayCount: number;
  isSelectionMode?: boolean;
  page?: number;
  totalPages?: number;
  hasActiveFilters: boolean;
  searchQuery?: string;
  statusFilter?: string;
  approvalFilter?: string;
  categoryFilter?: string;
  timeFilter?: string;
  selectedWeek?: string;
  selectedMonth?: string;
  dateFilter?: string;
  monthOptions?: { key: string; label: string }[];
  categoryById?: Map<string, EventCategory | { name: string }>;
}

export function getEventListEmptyState(
  input: GetEventListEmptyStateInput
): EventListEmptyStateData {
  if (input.isSelectionMode && input.totalCount > 0 && input.displayCount === 0) {
    return {
      variant: 'selection-no-selectable',
      title: 'Keine auswählbaren Events',
      description: 'Im Auswahlmodus werden vergangene Events automatisch ausgeblendet.',
      actions: ['exit-selection-mode'],
    };
  }

  if (
    typeof input.page === 'number' &&
    typeof input.totalPages === 'number' &&
    input.totalPages > 0 &&
    input.page > input.totalPages
  ) {
    return {
      variant: 'page-out-of-range',
      title: 'Seite nicht gefunden',
      description: `Die angeforderte Seite ${input.page} existiert nicht. Es sind ${input.totalPages} ${input.totalPages === 1 ? 'Seite' : 'Seiten'} verfügbar.`,
      actions: ['go-to-first-page'],
    };
  }

  const hasSearch = Boolean(input.searchQuery && input.searchQuery.trim().length > 0);
  const isStatusDefault = !input.statusFilter || input.statusFilter === 'all';
  const isCategoryDefault = !input.categoryFilter || input.categoryFilter === 'all';
  const isTimeDefault = !input.timeFilter || input.timeFilter === 'all';
  const isDateDefault = !input.dateFilter || input.dateFilter === 'all';

  if (
    input.approvalFilter === 'pending' &&
    !hasSearch &&
    isStatusDefault &&
    isCategoryDefault &&
    isTimeDefault &&
    isDateDefault
  ) {
    return {
      variant: 'pending-clear',
      title: 'Keine ausstehenden Events',
      description: 'Alles moderiert! Aktuell liegen keine Events zur Freigabe vor.',
      actions: ['show-all-events'],
    };
  }

  if (
    input.timeFilter &&
    input.timeFilter !== 'all' &&
    !hasSearch &&
    isStatusDefault &&
    (!input.approvalFilter || input.approvalFilter === 'all') &&
    isCategoryDefault &&
    isDateDefault
  ) {
    let periodTitle = 'Keine Events im gewählten Zeitraum';
    if (input.timeFilter === 'week') {
      periodTitle = input.selectedWeek
        ? `Keine Events in KW ${input.selectedWeek}`
        : 'Keine Events in der gewählten Kalenderwoche';
    } else if (input.timeFilter === 'month') {
      const foundMonth = input.monthOptions?.find(m => m.key === input.selectedMonth);
      const monthLabel = foundMonth?.label;
      periodTitle = monthLabel
        ? `Keine Events im ${monthLabel}`
        : 'Keine Events im gewählten Monat';
    }

    return {
      variant: 'period',
      title: periodTitle,
      description: 'Für diesen Zeitraum wurden bisher keine Events eingetragen.',
      actions: ['clear-time-filter', 'create-event'],
    };
  }

  if (input.hasActiveFilters) {
    const chips = buildActiveFilterChips(input);
    const filterSummary = chips.map(c => c.label).join(', ');
    const description = filterSummary
      ? `Aktive Filter: ${filterSummary}`
      : 'Keine Events stimmen mit den gewählten Filterkriterien überein.';
    const actions: EventListEmptyStateAction[] = ['reset-all-filters'];
    if (hasSearch) {
      actions.push('clear-search');
    }
    actions.push('create-event');

    return {
      variant: 'filtered',
      title: 'Keine Events für die aktuelle Suche und Filter.',
      description,
      actions,
    };
  }

  return {
    variant: 'empty',
    title: 'Keine Events vorhanden.',
    description: 'Erstelle das erste Event oder importiere bestehende Termine per CSV.',
    actions: ['create-event', 'import-csv'],
  };
}
