import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

import { EventCard } from '@/components/events/EventListCard';
import { useEventListGridColumns } from '@/hooks/useEventListGridColumns';
import { EventCategory } from '@/models/event-category';
import { cn } from '@/lib/utils';
import { EventMonthGroup } from '@/utils/eventListUtils';
import {
  buildEventListVirtualRows,
  estimateVirtualRowSize,
  EventListVirtualRow,
} from '@/utils/eventListVirtualRows';

interface EventListVirtualizedProps {
  sortedMonths: string[];
  groupedEventsByMonth: Record<string, EventMonthGroup>;
  categoryById: Map<string, EventCategory>;
  pendingAccess: boolean;
  approvingEventId: string | null;
  isSelectionMode: boolean;
  selectedEventIds: Set<string>;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onCopy: (id: string) => void;
  onToggleSelection: (id: string) => void;
}

interface VirtualRowContentProps {
  row: EventListVirtualRow;
  categoryById: Map<string, EventCategory>;
  pendingAccess: boolean;
  approvingEventId: string | null;
  isSelectionMode: boolean;
  selectedEventIds: Set<string>;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onCopy: (id: string) => void;
  onToggleSelection: (id: string) => void;
}

const VirtualRowContent = React.memo(function VirtualRowContent({
  row,
  categoryById,
  pendingAccess,
  approvingEventId,
  isSelectionMode,
  selectedEventIds,
  onDelete,
  onApprove,
  onCopy,
  onToggleSelection,
}: VirtualRowContentProps) {
  if (row.type === 'header') {
    return <h2 className="text-2xl font-bold text-foreground mb-6 capitalize pt-2">{row.label}</h2>;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        row.isLastInMonth && !row.isLastMonth && 'mb-8'
      )}
    >
      {row.events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          category={event.categoryId ? categoryById.get(event.categoryId) : undefined}
          onDelete={onDelete}
          showApprove={pendingAccess && event.status === 'PENDING'}
          onApprove={onApprove}
          isApproving={approvingEventId === event.id}
          onCopy={onCopy}
          disableAnimation
          isSelectionMode={isSelectionMode}
          isSelected={selectedEventIds.has(event.id)}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  );
});

export function EventListVirtualized({
  sortedMonths,
  groupedEventsByMonth,
  categoryById,
  pendingAccess,
  approvingEventId,
  isSelectionMode,
  selectedEventIds,
  onDelete,
  onApprove,
  onCopy,
  onToggleSelection,
}: EventListVirtualizedProps) {
  const columns = useEventListGridColumns();
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const rows = useMemo(
    () => buildEventListVirtualRows(sortedMonths, groupedEventsByMonth, columns),
    [sortedMonths, groupedEventsByMonth, columns]
  );

  useLayoutEffect(() => {
    const updateScrollMargin = () => {
      if (listRef.current) {
        setScrollMargin(listRef.current.offsetTop);
      }
    };

    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);
    return () => window.removeEventListener('resize', updateScrollMargin);
  }, [rows.length, isSelectionMode]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: index => estimateVirtualRowSize(rows[index]),
    scrollMargin,
    overscan: 4,
    measureElement: element => element.getBoundingClientRect().height,
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <div ref={listRef} className="w-full" data-testid="event-list-virtualized">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              <VirtualRowContent
                row={row}
                categoryById={categoryById}
                pendingAccess={pendingAccess}
                approvingEventId={approvingEventId}
                isSelectionMode={isSelectionMode}
                selectedEventIds={selectedEventIds}
                onDelete={onDelete}
                onApprove={onApprove}
                onCopy={onCopy}
                onToggleSelection={onToggleSelection}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
