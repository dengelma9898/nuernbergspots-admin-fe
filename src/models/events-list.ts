import { Event } from '@/models/events';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EventsListFacets {
  pendingCount?: number;
  monthOptions: { key: string; label: string }[];
}

export interface EventsListResponse {
  data: Event[];
  meta: PaginationMeta;
  facets?: EventsListFacets;
}

export interface EventsListQueryParams {
  q?: string;
  status?: string;
  approval?: string;
  category?: string;
  date?: string;
  time?: string;
  week?: string;
  month?: string;
  page?: number;
  limit?: number;
  sort?: 'startDate' | 'updatedAt';
  order?: 'asc' | 'desc';
  facets?: boolean;
}

export type EventListSortOption = 'startDate-desc' | 'startDate-asc' | 'updatedAt-desc';

export const DEFAULT_EVENT_LIST_SORT: EventListSortOption = 'startDate-desc';

export const EVENT_LIST_SORT_OPTIONS: { value: EventListSortOption; label: string }[] = [
  { value: 'startDate-desc', label: 'Datum: neueste zuerst' },
  { value: 'startDate-asc', label: 'Datum: älteste zuerst' },
  { value: 'updatedAt-desc', label: 'Zuletzt geändert' },
];

export function parseEventListSortOption(value: string): {
  sort: NonNullable<EventsListQueryParams['sort']>;
  order: NonNullable<EventsListQueryParams['order']>;
} {
  switch (value) {
    case 'startDate-asc':
      return { sort: 'startDate', order: 'asc' };
    case 'updatedAt-desc':
      return { sort: 'updatedAt', order: 'desc' };
    case 'startDate-desc':
    default:
      return { sort: 'startDate', order: 'desc' };
  }
}

export interface EventListQueryInput {
  searchQuery: string;
  statusFilter: string;
  approvalFilter: string;
  categoryFilter: string;
  dateFilter: string;
  timeFilter: string;
  selectedWeek: string;
  selectedMonth: string;
  page: number;
  sortOption?: EventListSortOption;
}

export const EVENT_LIST_PAGE_SIZE = 50;
