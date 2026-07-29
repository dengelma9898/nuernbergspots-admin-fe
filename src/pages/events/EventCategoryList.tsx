import { useEventCategoryList } from '@/hooks/useEventCategoryList';
import { EventCategoryListContent } from '@/components/events/EventCategoryListContent';

export function EventCategoryList() {
  const form = useEventCategoryList();
  return <EventCategoryListContent {...form} />;
}
