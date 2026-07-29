import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from '@/components/motion';
import { BulkCategoryDialog } from '@/components/events/BulkCategoryDialog';
import { EventBulkPartialDialog } from '@/components/events/EventBulkPartialDialog';
import { EventDeleteDialog } from '@/components/events/EventDeleteDialog';
import { EventListFilters } from '@/components/events/EventListFilters';
import { EventListHeader } from '@/components/events/EventListHeader';
import { EventListMonthGroup } from '@/components/events/EventListMonthGroup';
import { EventListSelectionBanner } from '@/components/events/EventListSelectionBanner';
import { EventListSkeleton } from '@/components/events/EventListSkeleton';
import { useEventBulkSelection } from '@/hooks/useEventBulkSelection';
import { useEventListData } from '@/hooks/useEventListData';
import { useEventListFilters } from '@/hooks/useEventListFilters';
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/animations';
import { cardPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { showSuccessMessage } from '@/utils/errorUtils';
import { getMonthOptions, groupEventsByMonth, sortMonthKeys } from '@/utils/eventListUtils';
import { downloadCsv } from '@/utils/csvExport';

export { EventCard } from '@/components/events/EventListCard';

export const EventList: React.FC = () => {
  const navigate = useNavigate();
  const filters = useEventListFilters();
  const {
    events,
    setEvents,
    categories,
    pendingAccess,
    loading,
    approvingEventId,
    isAdminOrSuperAdmin,
    pendingModerationCount,
    deleteDialogOpen,
    setDeleteDialogOpen,
    eventToDelete,
    setEventToDelete,
    isDeleting,
    handleDelete,
    confirmDelete,
    handleApproveEvent,
    handleManualRefresh,
    eventServiceRef,
  } = useEventListData();

  const monthOptions = useMemo(() => getMonthOptions(events), [events]);

  const filterParams = useMemo(
    () => ({
      searchQuery: filters.searchQuery,
      statusFilter: filters.statusFilter,
      approvalFilter: filters.approvalFilter,
      categoryFilter: filters.categoryFilter,
      dateFilter: filters.dateFilter,
      timeFilter: filters.timeFilter,
      selectedWeek: filters.selectedWeek,
      selectedMonth: filters.selectedMonth,
    }),
    [
      filters.searchQuery,
      filters.statusFilter,
      filters.approvalFilter,
      filters.categoryFilter,
      filters.dateFilter,
      filters.timeFilter,
      filters.selectedWeek,
      filters.selectedMonth,
    ]
  );

  const bulk = useEventBulkSelection({
    events,
    categories,
    categoryFilter: filters.categoryFilter,
    filterParams,
    setEvents,
    eventServiceRef,
  });

  const displayFilteredEvents = bulk.filteredEvents;
  const groupedEventsByMonth = useMemo(
    () => groupEventsByMonth(displayFilteredEvents),
    [displayFilteredEvents]
  );
  const sortedMonths = useMemo(() => sortMonthKeys(groupedEventsByMonth), [groupedEventsByMonth]);

  const handleCopy = (id: string) => {
    navigate(`/events/${id}/copy`);
    showSuccessMessage(toast, {
      title: 'Event wird kopiert',
      description: 'Sie werden zur Kopier-Seite weitergeleitet.',
    });
  };

  const handleExportCsv = () => {
    if (displayFilteredEvents.length === 0) return;
    downloadCsv(
      `events-export-${new Date().toISOString().slice(0, 10)}`,
      displayFilteredEvents.map(event => ({
        id: event.id,
        title: event.title,
        status: event.status ?? 'ACTIVE',
        categoryId: event.categoryId ?? '',
        startDate: event.startDate ?? event.dailyTimeSlots?.[0]?.date ?? '',
        location: event.location?.address ?? '',
        isPromoted: event.isPromoted ?? false,
      }))
    );
    showSuccessMessage(toast, {
      title: 'Export gestartet',
      description: `${displayFilteredEvents.length} Events als CSV exportiert.`,
    });
  };

  if (loading) {
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
            onNavigateDashboard={() => navigate('/dashboard')}
            onSelectAll={bulk.selectAllVisibleEvents}
            onDeselectAll={bulk.deselectAllEvents}
            onOpenBulkCategory={() => bulk.setBulkCategoryDialogOpen(true)}
            onGenerateImage={bulk.handleGenerateImage}
            onToggleSelectionMode={bulk.toggleSelectionMode}
            onManualRefresh={handleManualRefresh}
            onNavigateCsvImport={() => navigate('/events/import/csv')}
            onNavigateCreateEvent={() => navigate('/create-event')}
            onExportCsv={handleExportCsv}
          />

          {bulk.isSelectionMode ? (
            <EventListSelectionBanner
              selectedCount={bulk.selectedEventIds.size}
              totalCount={displayFilteredEvents.length}
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

        {displayFilteredEvents.length === 0 ? (
          <motion.div
            className={cn(cardPreset, 'p-8 text-center')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="text-muted-foreground text-lg">Keine Events gefunden.</div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sortedMonths.length === 0 ? (
              <motion.div
                className={cn(cardPreset, 'p-8 text-center')}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={defaultTransition}
              >
                <div className="text-muted-foreground text-lg">
                  Keine Gruppen gefunden (aber {displayFilteredEvents.length} Events gefiltert).
                </div>
              </motion.div>
            ) : (
              sortedMonths.map((monthKey, monthIndex) => (
                <EventListMonthGroup
                  key={monthKey}
                  monthKey={monthKey}
                  monthGroup={groupedEventsByMonth[monthKey]}
                  monthIndex={monthIndex}
                  categories={categories}
                  pendingAccess={pendingAccess}
                  approvingEventId={approvingEventId}
                  isSelectionMode={bulk.isSelectionMode}
                  selectedEventIds={bulk.selectedEventIds}
                  onDelete={handleDelete}
                  onApprove={handleApproveEvent}
                  onCopy={handleCopy}
                  onToggleSelection={bulk.toggleEventSelection}
                />
              ))
            )}
          </motion.div>
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
