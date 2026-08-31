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
}

export const EVENT_LIST_PAGE_SIZE = 50;
