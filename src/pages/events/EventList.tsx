import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from '@/components/motion';
import { LoadingButton } from '@/components/LoadingButton';
import { BulkCategoryDialog } from '@/components/events/BulkCategoryDialog';
import { EventBulkPartialDialog } from '@/components/events/EventBulkPartialDialog';
import { EventDeleteDialog } from '@/components/events/EventDeleteDialog';
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
import { buildCategoryMap, groupEventsByMonth, sortMonthKeys } from '@/utils/eventListUtils';
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
  const groupedEventsByMonth = useMemo(() => groupEventsByMonth(displayEvents), [displayEvents]);
  const sortedMonths = useMemo(() => sortMonthKeys(groupedEventsByMonth), [groupedEventsByMonth]);
  const totalCount = meta?.total ?? displayEvents.length;

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
          />
        </motion.div>

        {totalCount === 0 ? (
          <div className={cn(cardPreset, 'p-8 text-center space-y-4')}>
            <div className="text-muted-foreground text-lg">
              {filters.hasActiveFilters
                ? 'Keine Events für die aktuelle Suche und Filter.'
                : 'Keine Events vorhanden.'}
            </div>
            {filters.searchQuery ? (
              <p className="text-sm text-muted-foreground">Suche: „{filters.searchQuery}“</p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {filters.hasActiveFilters ? (
                <LoadingButton
                  variant="outline"
                  onClick={filters.resetAllFilters}
                  className={cn(buttonPreset, 'w-full sm:w-auto')}
                >
                  Filter zurücksetzen
                </LoadingButton>
              ) : null}
              <LoadingButton
                onClick={() => navigate('/create-event')}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Event hinzufügen
              </LoadingButton>
            </div>
          </div>
        ) : (
          <>
            {meta ? (
              <EventListPagination meta={meta} loading={loading} onPageChange={handlePageChange} />
            ) : null}
            {sortedMonths.length === 0 ? (
              <div className={cn(cardPreset, 'p-8 text-center')}>
                <div className="text-muted-foreground text-lg">
                  Keine Gruppen gefunden auf dieser Seite.
                </div>
              </div>
            ) : (
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
            )}
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
