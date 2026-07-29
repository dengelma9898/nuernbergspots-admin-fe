import React from 'react';

import { useEventDetail } from '@/hooks/useEventDetail';
import { EventDetailContent } from '@/components/events/EventDetailContent';

export const EventDetail: React.FC = () => {
  const eventDetail = useEventDetail();
  return <EventDetailContent {...eventDetail} />;
};
