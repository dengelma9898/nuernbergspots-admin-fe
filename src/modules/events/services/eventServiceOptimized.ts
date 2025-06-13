import { useMemo, useCallback } from 'react'
import { Event } from '@/modules/events/models'
import { useEventService } from './eventService'
import { useEventCache } from '../hooks/useEventCache'

/**
 * Performance-optimized wrapper for event service
 * 
 * Features:
 * - Automatic caching with TTL
 * - Request deduplication
 * - Batch loading optimization
 * - Intelligent prefetching
 */
export const useOptimizedEventService = () => {
  const eventService = useEventService()
  const cache = useEventCache({
    ttl: 10 * 60 * 1000, // 10 minutes for service cache
    maxSize: 200,
    autoCleanup: true
  })

  // Map to track pending requests (deduplication)
  const pendingRequests = useMemo(() => new Map<string, Promise<Event>>(), [])

  /**
   * Get event with caching and deduplication
   */
  const getEvent = useCallback(async (eventId: string): Promise<Event> => {
    // Check cache first
    const cachedEvent = cache.getEvent(eventId)
    if (cachedEvent) {
      return cachedEvent
    }

    // Check if request is already pending
    const pendingRequest = pendingRequests.get(eventId)
    if (pendingRequest) {
      return pendingRequest
    }

    // Make new request
    const request = eventService.getEvent(eventId).then(event => {
      // Cache the result
      cache.setEvent(eventId, event)
      // Remove from pending
      pendingRequests.delete(eventId)
      return event
    }).catch(error => {
      // Remove from pending on error
      pendingRequests.delete(eventId)
      throw error
    })

    // Track pending request
    pendingRequests.set(eventId, request)
    
    return request
  }, [eventService, cache, pendingRequests])

  /**
   * Get multiple events with batch optimization
   */
  const getEventsBatch = useCallback(async (eventIds: string[]): Promise<Event[]> => {
    const results: Event[] = []
    const uncachedIds: string[] = []

    // Separate cached from uncached
    eventIds.forEach(id => {
      const cached = cache.getEvent(id)
      if (cached) {
        results.push(cached)
      } else {
        uncachedIds.push(id)
      }
    })

    // Fetch uncached events
    if (uncachedIds.length > 0) {
      const fetchPromises = uncachedIds.map(id => getEvent(id))
      const uncachedEvents = await Promise.allSettled(fetchPromises)
      
      uncachedEvents.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        }
      })
    }

    // Return in original order
    return eventIds.map(id => results.find(event => event.id === id)).filter(Boolean) as Event[]
  }, [cache, getEvent])

  /**
   * Get events with intelligent prefetching
   */
  const getEventsWithPrefetch = useCallback(async (
    page: number = 1, 
    limit: number = 20,
    prefetchNext: boolean = true
  ): Promise<{ events: Event[]; total: number; hasMore: boolean }> => {
    const result = await eventService.getEventsPaginated(page, limit)
    
    // Cache all loaded events
    result.events.forEach(event => {
      cache.setEvent(event.id, event)
    })

    // Prefetch next page if enabled and has more data
    if (prefetchNext && result.hasMore) {
      // Fire and forget - don't await
      eventService.getEventsPaginated(page + 1, limit)
        .then(nextResult => {
          nextResult.events.forEach(event => {
            cache.setEvent(event.id, event)
          })
        })
        .catch(() => {
          // Ignore prefetch errors
        })
    }

    return result
  }, [eventService, cache])

  /**
   * Search events with caching
   */
  const searchEventsOptimized = useCallback(async (
    filters: Parameters<typeof eventService.searchEvents>[0]
  ) => {
    // Create cache key from filters
    const cacheKey = `search_${JSON.stringify(filters)}`
    
    // Check if we have cached search results
    const cachedResults = cache.getEvent(cacheKey as any)
    if (cachedResults) {
      return cachedResults as any
    }

    const results = await eventService.searchEvents(filters)
    
    // Cache individual events
    results.events.forEach(event => {
      cache.setEvent(event.id, event)
    })

    // Cache search results (with shorter TTL)
    cache.setEvent(cacheKey as any, results as any)

    return results
  }, [eventService, cache])

  /**
   * Update event and invalidate cache
   */
  const updateEvent = useCallback(async (eventId: string, event: Partial<Event>): Promise<Event> => {
    const updatedEvent = await eventService.updateEvent(eventId, event)
    
    // Update cache with new data
    cache.setEvent(eventId, updatedEvent)
    
    return updatedEvent
  }, [eventService, cache])

  /**
   * Create event and cache it
   */
  const createEvent = useCallback(async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const createdEvent = await eventService.createEvent(event)
    
    // Cache the new event
    cache.setEvent(createdEvent.id, createdEvent)
    
    return createdEvent
  }, [eventService, cache])

  /**
   * Delete event and remove from cache
   */
  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    await eventService.deleteEvent(eventId)
    
    // Remove from cache
    cache.removeEvent(eventId)
  }, [eventService, cache])

  /**
   * Preload events for better UX
   */
  const preloadEvents = useCallback(async (eventIds: string[]): Promise<void> => {
    const uncachedIds = eventIds.filter(id => !cache.hasEvent(id))
    
    if (uncachedIds.length > 0) {
      // Load in batches to avoid overwhelming the server
      const batchSize = 10
      for (let i = 0; i < uncachedIds.length; i += batchSize) {
        const batch = uncachedIds.slice(i, i + batchSize)
        const batchPromises = batch.map(id => getEvent(id).catch(() => null))
        await Promise.allSettled(batchPromises)
      }
    }
  }, [cache, getEvent])

  /**
   * Get cache performance metrics
   */
  const getCacheMetrics = useCallback(() => {
    return cache.getCacheStats()
  }, [cache])

  /**
   * Clear cache manually
   */
  const clearCache = useCallback(() => {
    cache.clearCache()
    pendingRequests.clear()
  }, [cache, pendingRequests])

  // Expose all original service methods plus optimized ones
  return {
    // Original service methods (for compatibility)
    ...eventService,
    
    // Optimized methods (override originals)
    getEvent,
    getEventsBatch,
    getEventsWithPrefetch,
    searchEventsOptimized,
    updateEvent,
    createEvent,
    deleteEvent,
    preloadEvents,
    
    // Cache management
    getCacheMetrics,
    clearCache,
    
    // Override with optimized versions
    searchEvents: searchEventsOptimized,
    getEventsPaginated: getEventsWithPrefetch
  }
} 