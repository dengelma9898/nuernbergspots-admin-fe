import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from '@/components/motion';
import { LoadingButton } from '@/components/LoadingButton';
import { BulkCategoryDialog } from '@/components/events/BulkCategoryDialog';
import { EventBulkPartialDialog } from '@/components/events/EventBulkPartialDialog';
import { EventDeleteDialog } from '@/components/events/EventDeleteDialog';
import { EventListEmptyState } from '@/components/events/EventListEmptyState';
import { EventListFilters } from '@/components/events/EventListFilters';
import { EventListHeader } from '@/components/events/EventListHeader';
import { EventListPagination } from '@/components/events/EventListPagination';
import { EventListVirtualized } from '@/components/events/EventListVirtualized';
import { EventListSelectionBanner } from '@/components/events/EventListSelectionBanner';
import { EventListSkeleton } from '@/components/events/EventListSkeleton';
import { useEventBulkSelection } from '@/hooks/useEventBulkSelection';
import { useEventListData } from '@/hooks/useEventListData';
import { useEventListFilters } from '@/hooks/useEventListFilters';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';
import {
  buildCategoryMap,
  getEventListEmptyState,
  groupEventsByMonth,
  groupEventsFlat,
  sortMonthKeys,
} from '@/utils/eventListUtils';
import { downloadCsvContent } from '@/utils/csvExport';

export { EventCard } from '@/components/events/EventListCard';

export const EventList: React.FC = () => {
  const navigate = useNavigate();
  const filters = useEventListFilters();
  const {
    events,
    meta,
    setEvents,
    categories,
    pendingAccess,
    loading,
    approvingEventId,
    isAdminOrSuperAdmin,
    pendingModerationCount,
    monthOptions,
    deleteDialogOpen,
    setDeleteDialogOpen,
    eventToDelete,
    setEventToDelete,
    isDeleting,
    handleDelete,
    confirmDelete,
    handleApproveEvent,
    handleManualRefresh,
    reloadList,
    eventServiceRef,
    apiQueryParams,
  } = useEventListData(filters.listQuery);

  const categoryById = useMemo(() => buildCategoryMap(categories), [categories]);

  const bulk = useEventBulkSelection({
    events,
    categories,
    categoryFilter: filters.categoryFilter,
    setEvents,
    reloadList,
    eventServiceRef,
  });

  const displayEvents = bulk.visibleEvents;
  const isFlatSort = filters.sortOption === 'updatedAt-desc';
  const groupedEventsByMonth = useMemo(
    () => (isFlatSort ? groupEventsFlat(displayEvents) : groupEventsByMonth(displayEvents)),
    [displayEvents, isFlatSort]
  );
  const sortedMonths = useMemo(
    () =>
      isFlatSort
        ? Object.keys(groupedEventsByMonth)
        : sortMonthKeys(
            groupedEventsByMonth,
            filters.sortOption === 'startDate-asc' ? 'asc' : 'desc'
          ),
    [groupedEventsByMonth, isFlatSort, filters.sortOption]
  );
  const totalCount = meta?.total ?? displayEvents.length;

  const emptyState = useMemo(
    () =>
      getEventListEmptyState({
        totalCount,
        displayCount: displayEvents.length,
        isSelectionMode: bulk.isSelectionMode,
        page: filters.page,
        totalPages: meta?.totalPages,
        hasActiveFilters: filters.hasActiveFilters,
        searchQuery: filters.searchQuery,
        statusFilter: filters.statusFilter,
        approvalFilter: filters.approvalFilter,
        categoryFilter: filters.categoryFilter,
        timeFilter: filters.timeFilter,
        selectedWeek: filters.selectedWeek,
        selectedMonth: filters.selectedMonth,
        dateFilter: filters.dateFilter,
        monthOptions,
        categoryById,
      }),
    [
      totalCount,
      displayEvents.length,
      bulk.isSelectionMode,
      filters.page,
      meta?.totalPages,
      filters.hasActiveFilters,
      filters.searchQuery,
      filters.statusFilter,
      filters.approvalFilter,
      filters.categoryFilter,
      filters.timeFilter,
      filters.selectedWeek,
      filters.selectedMonth,
      filters.dateFilter,
      monthOptions,
      categoryById,
    ]
  );

  const handleCopy = useCallback(
    (id: string) => {
      navigate(`/events/${id}/copy`);
      showSuccessMessage(toast, {
        title: 'Event wird kopiert',
        description: 'Sie werden zur Kopier-Seite weitergeleitet.',
      });
    },
    [navigate]
  );

  const handleExportCsv = async () => {
    if (totalCount === 0 || loading) return;
    try {
      const csv = await eventServiceRef.current.exportEventsList(apiQueryParams);
      downloadCsvContent(`events-export-${new Date().toISOString().slice(0, 10)}`, csv);
      showSuccessMessage(toast, {
        title: 'Export gestartet',
        description: `${totalCount} Events als CSV exportiert.`,
      });
    } catch (error) {
      console.error('Fehler beim CSV-Export:', error);
      showUserFriendlyError(error, toast, () => void handleExportCsv(), 'export-events');
    }
  };

  const handlePageChange = useCallback(
    (nextPage: number) => {
      filters.setPage(nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [filters]
  );

  if (loading && events.length === 0) {
    return <EventListSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
        <motion.div
          className={listSectionPreset}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <EventListHeader
            pendingAccess={pendingAccess}
            pendingModerationCount={pendingModerationCount}
            onFilterPending={() => filters.setApprovalFilter('pending')}
            isSelectionMode={bulk.isSelectionMode}
            isAdminOrSuperAdmin={isAdminOrSuperAdmin}
            selectedCount={bulk.selectedEventIds.size}
            loading={loading}
            onSelectAll={bulk.selectAllVisibleEvents}
            onDeselectAll={bulk.deselectAllEvents}
            onOpenBulkCategory={() => bulk.setBulkCategoryDialogOpen(true)}
            onGenerateImage={bulk.handleGenerateImage}
            onToggleSelectionMode={bulk.toggleSelectionMode}
            onManualRefresh={handleManualRefresh}
            onNavigateCsvImport={() => navigate('/events/import/csv')}
            onNavigateCreateEvent={() => navigate('/create-event')}
            onExportCsv={() => void handleExportCsv()}
          />

          {bulk.isSelectionMode ? (
            <EventListSelectionBanner
              selectedCount={bulk.selectedEventIds.size}
              totalCount={displayEvents.length}
            />
          ) : null}

          <EventListFilters
            searchQuery={filters.searchQuery}
            onSearchQueryChange={filters.setSearchQuery}
            statusFilter={filters.statusFilter}
            onStatusFilterChange={filters.setStatusFilter}
            approvalFilter={filters.approvalFilter}
            onApprovalFilterChange={filters.setApprovalFilter}
            categoryFilter={filters.categoryFilter}
            onCategoryFilterChange={filters.setCategoryFilter}
            timeFilter={filters.timeFilter}
            onTimeFilterChange={value => filters.handleTimeFilterChange(value, monthOptions)}
            selectedWeek={filters.selectedWeek}
            onSelectedWeekChange={filters.setSelectedWeek}
            selectedMonth={filters.selectedMonth}
            onSelectedMonthChange={filters.setSelectedMonth}
            dateFilter={filters.dateFilter}
            onDateFilterChange={filters.handleDateFilterChange}
            categories={categories}
            monthOptions={monthOptions}
            categoryById={categoryById}
            onClearFilter={filters.clearFilter}
            onResetAllFilters={filters.resetAllFilters}
            sortOption={filters.sortOption}
            onSortOptionChange={filters.setSortOption}
          />
        </motion.div>

        {displayEvents.length === 0 ? (
          <EventListEmptyState
            emptyState={emptyState}
            onResetAllFilters={filters.resetAllFilters}
            onClearSearch={() => filters.clearFilter('search')}
            onClearTimeFilter={() => filters.clearFilter('time')}
            onShowAllEvents={() => filters.clearFilter('approval')}
            onExitSelectionMode={bulk.exitSelectionMode}
            onGoToFirstPage={() => handlePageChange(1)}
            onCreateEvent={() => navigate('/create-event')}
            onImportCsv={() => navigate('/events/import/csv')}
          />
        ) : (
          <>
            {meta ? (
              <EventListPagination meta={meta} loading={loading} onPageChange={handlePageChange} />
            ) : null}
            <EventListVirtualized
              sortedMonths={sortedMonths}
              groupedEventsByMonth={groupedEventsByMonth}
              categoryById={categoryById}
              pendingAccess={pendingAccess}
              approvingEventId={approvingEventId}
              isSelectionMode={bulk.isSelectionMode}
              selectedEventIds={bulk.selectedEventIds}
              onDelete={handleDelete}
              onApprove={handleApproveEvent}
              onCopy={handleCopy}
              onToggleSelection={bulk.toggleEventSelection}
            />
            {meta ? (
              <EventListPagination meta={meta} loading={loading} onPageChange={handlePageChange} />
            ) : null}
          </>
        )}

        <div className="sr-only">
          <div>Events</div>
        </div>

        <EventDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setEventToDelete(null);
          }}
        />

        <BulkCategoryDialog
          open={bulk.bulkCategoryDialogOpen}
          onOpenChange={bulk.setBulkCategoryDialogOpen}
          selectedEvents={bulk.selectedEventsForBulk}
          categories={categories}
          onConfirm={bulk.handleBulkCategorySubmit}
          submitting={bulk.bulkSubmitting}
        />

        <EventBulkPartialDialog
          open={bulk.bulkPartialDialogOpen}
          onOpenChange={bulk.handleBulkPartialDialogClose}
          result={bulk.bulkPartialResult}
          events={events}
        />
      </div>
    </div>
  );
};
