import { useEffect, useState } from 'react';
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
    handleTimeFilterChange,
    handleDateFilterChange,
  };
}
