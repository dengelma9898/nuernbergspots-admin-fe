// Event Hooks
export { useEventDetail } from './useEventDetail'
export type { UseEventDetailReturn } from './useEventDetail'

// Performance Hooks
export { useEventCache } from './useEventCache'

// Import for hook combination
import { useEventCache } from './useEventCache'
import { useEventDetail } from './useEventDetail'

// Hook combinations for better performance
export const useOptimizedEventDetail = (eventId: string | undefined) => {
  const cache = useEventCache()
  const eventDetail = useEventDetail(eventId)
  
  // Try to get from cache first
  const cachedEvent = eventId ? cache.getEvent(eventId) : null
  
  // Use cached event if available, otherwise use hook result
  return {
    ...eventDetail,
    event: cachedEvent || eventDetail.event,
    // Cache the event when it's loaded
    refetchEvent: async () => {
      await eventDetail.refetchEvent()
      if (eventDetail.event && eventId) {
        cache.setEvent(eventId, eventDetail.event)
      }
    }
  }
} 