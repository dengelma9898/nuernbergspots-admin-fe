import { motion } from '@/components/motion';
import { EventCard } from '@/components/events/EventListCard';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { fadeInUp } from '@/lib/animations';
import { EventMonthGroup } from '@/utils/eventListUtils';

interface EventListMonthGroupProps {
  monthKey: string;
  monthGroup: EventMonthGroup;
  monthIndex: number;
  categories: EventCategory[];
  pendingAccess: boolean;
  approvingEventId: string | null;
  isSelectionMode: boolean;
  selectedEventIds: Set<string>;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onCopy: (id: string) => void;
  onToggleSelection: (id: string) => void;
}

export function EventListMonthGroup({
  monthKey,
  monthGroup,
  monthIndex,
  categories,
  pendingAccess,
  approvingEventId,
  isSelectionMode,
  selectedEventIds,
  onDelete,
  onApprove,
  onCopy,
  onToggleSelection,
}: EventListMonthGroupProps) {
  return (
    <motion.div key={monthKey} variants={fadeInUp} initial="initial" animate="animate">
      <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">{monthGroup.label}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {monthGroup.events.map((event, eventIndex) => (
          <EventCard
            key={event.id}
            event={event}
            category={categories.find(cat => cat.id === event.categoryId)}
            onDelete={onDelete}
            showApprove={pendingAccess && event.status === 'PENDING'}
            onApprove={onApprove}
            isApproving={approvingEventId === event.id}
            onCopy={onCopy}
            index={monthIndex * 10 + eventIndex}
            isSelectionMode={isSelectionMode}
            isSelected={selectedEventIds.has(event.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    </motion.div>
  );
}
