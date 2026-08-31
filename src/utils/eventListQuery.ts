import {
  EVENT_LIST_PAGE_SIZE,
  EventListQueryInput,
  EventsListQueryParams,
} from '@/models/events-list';

export function buildEventsListQueryParams(input: EventListQueryInput): EventsListQueryParams {
  const params: EventsListQueryParams = {
    page: input.page,
    limit: EVENT_LIST_PAGE_SIZE,
    sort: 'startDate',
    order: 'desc',
    facets: true,
  };

  const searchQuery = input.searchQuery.trim();
  if (searchQuery) {
    params.q = searchQuery;
  }
  if (input.statusFilter !== 'all') {
    params.status = input.statusFilter;
  }
  if (input.approvalFilter !== 'all') {
    params.approval = input.approvalFilter;
  }
  if (input.categoryFilter !== 'all') {
    params.category = input.categoryFilter;
  }
  if (input.dateFilter !== 'all') {
    params.date = input.dateFilter;
  }
  if (input.timeFilter !== 'all') {
    params.time = input.timeFilter;
  }
  if (input.timeFilter === 'week' && input.selectedWeek) {
    params.week = input.selectedWeek;
  }
  if (input.timeFilter === 'month' && input.selectedMonth) {
    params.month = input.selectedMonth;
  }

  return params;
}

export function serializeEventsListQuery(
  params: EventsListQueryParams,
  options?: { includePaginationDefaults?: boolean }
): string {
  const searchParams = new URLSearchParams();

  const entries: [keyof EventsListQueryParams, string | number | boolean | undefined][] = [
    ['q', params.q],
    ['status', params.status],
    ['approval', params.approval],
    ['category', params.category],
    ['date', params.date],
    ['time', params.time],
    ['week', params.week],
    ['month', params.month],
    ['page', params.page],
    ['limit', params.limit],
    ['sort', params.sort],
    ['order', params.order],
    ['facets', params.facets ? 'true' : undefined],
  ];

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    searchParams.set(key, String(value));
  }

  if (options?.includePaginationDefaults !== false) {
    if (!searchParams.has('page')) {
      searchParams.set('page', String(params.page ?? 1));
    }
    if (!searchParams.has('limit')) {
      searchParams.set('limit', String(params.limit ?? EVENT_LIST_PAGE_SIZE));
    }
    if (!searchParams.has('sort')) {
      searchParams.set('sort', params.sort ?? 'startDate');
    }
    if (!searchParams.has('order')) {
      searchParams.set('order', params.order ?? 'desc');
    }
  }

  return searchParams.toString();
}
