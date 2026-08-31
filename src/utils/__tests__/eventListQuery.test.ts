import { buildEventsListQueryParams, serializeEventsListQuery } from '@/utils/eventListQuery';

describe('eventListQuery', () => {
  it('mappt Filter auf API-Query-Parameter', () => {
    const params = buildEventsListQueryParams({
      searchQuery: 'Weihnachtsmarkt',
      statusFilter: 'future',
      approvalFilter: 'pending',
      categoryFilter: 'cat-1',
      dateFilter: 'with-date',
      timeFilter: 'month',
      selectedWeek: '',
      selectedMonth: '2026-08',
      page: 2,
    });

    expect(params).toMatchObject({
      q: 'Weihnachtsmarkt',
      status: 'future',
      approval: 'pending',
      category: 'cat-1',
      date: 'with-date',
      time: 'month',
      month: '2026-08',
      page: 2,
      limit: 50,
      facets: true,
    });
  });

  it('serialisiert Pagination-Defaults für Listen-Requests', () => {
    const query = serializeEventsListQuery({ page: 1, limit: 50, facets: true });
    expect(query).toContain('page=1');
    expect(query).toContain('limit=50');
    expect(query).toContain('facets=true');
    expect(query).toContain('sort=startDate');
    expect(query).toContain('order=desc');
  });

  it('serialisiert Export ohne Pagination', () => {
    const query = serializeEventsListQuery(
      { q: 'Test', facets: true },
      { includePaginationDefaults: false }
    );
    expect(query).toContain('q=Test');
    expect(query).not.toContain('page=');
    expect(query).not.toContain('limit=');
  });
});
