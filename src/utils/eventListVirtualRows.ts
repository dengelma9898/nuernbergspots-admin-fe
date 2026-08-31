import { Event } from '@/models/events';
import { EventMonthGroup } from '@/utils/eventListUtils';

export type EventListVirtualRow =
  | { type: 'header'; monthKey: string; label: string }
  | {
      type: 'cards';
      monthKey: string;
      events: Event[];
      isLastInMonth: boolean;
      isLastMonth: boolean;
    };

export function buildEventListVirtualRows(
  sortedMonths: string[],
  groupedEventsByMonth: Record<string, EventMonthGroup>,
  columns: number
): EventListVirtualRow[] {
  const safeColumns = Math.max(1, columns);
  const rows: EventListVirtualRow[] = [];

  sortedMonths.forEach((monthKey, monthIndex) => {
    const group = groupedEventsByMonth[monthKey];
    if (!group) {
      return;
    }

    const isLastMonth = monthIndex === sortedMonths.length - 1;
    rows.push({ type: 'header', monthKey, label: group.label });

    for (let index = 0; index < group.events.length; index += safeColumns) {
      const events = group.events.slice(index, index + safeColumns);
      rows.push({
        type: 'cards',
        monthKey,
        events,
        isLastInMonth: index + safeColumns >= group.events.length,
        isLastMonth,
      });
    }
  });

  return rows;
}

export function estimateVirtualRowSize(row: EventListVirtualRow): number {
  if (row.type === 'header') {
    return 56;
  }

  const hasImage = row.events.some(event =>
    Boolean(event.titleImageUrl || (event.imageUrls && event.imageUrls.length > 0))
  );
  const baseHeight = hasImage ? 500 : 340;
  const monthGap = row.isLastInMonth && !row.isLastMonth ? 32 : 0;

  return baseHeight + monthGap;
}
