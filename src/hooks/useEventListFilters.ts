import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function readParam(
  searchParams: URLSearchParams,
  key: string,
  allowed: string[],
  fallback: string
) {
  const value = searchParams.get(key) || '';
  return allowed.includes(value) ? value : fallback;
}

function readPage(searchParams: URLSearchParams): number {
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
}

export function useEventListFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTimeFilter = readParam(searchParams, 'time', ['all', 'week', 'month'], 'all');
  const initialStatusFilter = readParam(
    searchParams,
    'status',
    ['all', 'past', 'running', 'future'],
    'all'
  );
  const initialDateFilter = readParam(searchParams, 'date', ['all', 'with-date', 'no-date'], 'all');
  const initialApprovalFilter = readParam(
    searchParams,
    'approval',
    ['all', 'pending', 'active'],
    'all'
  );

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
  const [dateFilter, setDateFilter] = useState<string>(initialDateFilter);
  const [approvalFilter, setApprovalFilter] = useState<string>(initialApprovalFilter);
  const [page, setPage] = useState<number>(() => readPage(searchParams));
  const isFirstFilterEffect = useRef(true);

  useEffect(() => {
    if (timeFilter !== 'week' && selectedWeek) {
      setSelectedWeek('');
    }
    if (timeFilter !== 'month' && selectedMonth) {
      setSelectedMonth('');
    }
  }, [timeFilter, selectedMonth, selectedWeek]);

  useEffect(() => {
    if (isFirstFilterEffect.current) {
      isFirstFilterEffect.current = false;
      return;
    }
    setPage(1);
  }, [
    searchQuery,
    statusFilter,
    categoryFilter,
    timeFilter,
    selectedWeek,
    selectedMonth,
    dateFilter,
    approvalFilter,
  ]);

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

    if (page > 1) {
      nextParams.set('page', String(page));
    } else {
      nextParams.delete('page');
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    approvalFilter,
    categoryFilter,
    dateFilter,
    page,
    searchParams,
    searchQuery,
    selectedWeek,
    selectedMonth,
    setSearchParams,
    statusFilter,
    timeFilter,
  ]);

  const handleTimeFilterChange = (
    value: string,
    monthOptions: { key: string; label: string }[]
  ) => {
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
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    if (value === 'no-date') {
      setStatusFilter('all');
      setTimeFilter('all');
      setSelectedWeek('');
      setSelectedMonth('');
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTimeFilter('all');
    setSelectedWeek('');
    setSelectedMonth('');
    setDateFilter('all');
    setApprovalFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    timeFilter !== 'all' ||
    selectedWeek !== '' ||
    selectedMonth !== '' ||
    dateFilter !== 'all' ||
    approvalFilter !== 'all';

  const listQuery = useMemo(
    () => ({
      searchQuery,
      statusFilter,
      approvalFilter,
      categoryFilter,
      dateFilter,
      timeFilter,
      selectedWeek,
      selectedMonth,
      page,
    }),
    [
      searchQuery,
      statusFilter,
      approvalFilter,
      categoryFilter,
      dateFilter,
      timeFilter,
      selectedWeek,
      selectedMonth,
      page,
    ]
  );

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    timeFilter,
    setTimeFilter,
    selectedWeek,
    setSelectedWeek,
    selectedMonth,
    setSelectedMonth,
    dateFilter,
    setDateFilter,
    approvalFilter,
    setApprovalFilter,
    page,
    setPage,
    handleTimeFilterChange,
    handleDateFilterChange,
    resetAllFilters,
    hasActiveFilters,
    listQuery,
  };
}
