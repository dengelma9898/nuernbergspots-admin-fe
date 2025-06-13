import { useState, useCallback, useRef, useMemo } from 'react'
import { Event } from '@/modules/events/models'

/**
 * Cache configuration for event data
 */
interface EventCacheConfig {
  /** Cache duration in milliseconds (default: 5 minutes) */
  ttl?: number
  /** Maximum number of cached events (default: 100) */
  maxSize?: number
  /** Enable automatic cleanup of expired entries (default: true) */
  autoCleanup?: boolean
}

interface CacheEntry {
  data: Event
  timestamp: number
  accessCount: number
  lastAccessed: number
}

interface EventCache {
  [eventId: string]: CacheEntry
}

/**
 * Performance-optimized cache hook for event data
 * 
 * Features:
 * - TTL-based expiration
 * - LRU eviction when cache is full
 * - Automatic cleanup of expired entries
 * - Access tracking for analytics
 * 
 * @param config Cache configuration options
 */
export const useEventCache = (config: EventCacheConfig = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    maxSize = 100,
    autoCleanup = true
  } = config

  const [cache, setCache] = useState<EventCache>({})
  const cleanupIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Start automatic cleanup if enabled
  useMemo(() => {
    if (autoCleanup && !cleanupIntervalRef.current) {
      cleanupIntervalRef.current = setInterval(() => {
        setCache(currentCache => {
          const now = Date.now()
          const cleaned: EventCache = {}
          
          Object.entries(currentCache).forEach(([id, entry]) => {
            if (now - entry.timestamp < ttl) {
              cleaned[id] = entry
            }
          })
          
          return cleaned
        })
      }, ttl / 2) // Cleanup every half TTL period
    }

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [autoCleanup, ttl])

  /**
   * Get event from cache if valid
   */
  const getEvent = useCallback((eventId: string): Event | null => {
    const entry = cache[eventId]
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > ttl) {
      // Entry expired, remove it
      setCache(prev => {
        const { [eventId]: removed, ...rest } = prev
        return rest
      })
      return null
    }

    // Update access statistics
    setCache(prev => ({
      ...prev,
      [eventId]: {
        ...entry,
        accessCount: entry.accessCount + 1,
        lastAccessed: now
      }
    }))

    return entry.data
  }, [cache, ttl])

  /**
   * Store event in cache
   */
  const setEvent = useCallback((eventId: string, event: Event) => {
    const now = Date.now()
    
    setCache(prev => {
      let newCache = { ...prev }

      // If cache is full, remove least recently used item
      if (Object.keys(newCache).length >= maxSize && !newCache[eventId]) {
        const lruId = Object.entries(newCache)
          .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)[0][0]
        delete newCache[lruId]
      }

      newCache[eventId] = {
        data: event,
        timestamp: now,
        accessCount: newCache[eventId]?.accessCount || 0,
        lastAccessed: now
      }

      return newCache
    })
  }, [maxSize])

  /**
   * Remove event from cache
   */
  const removeEvent = useCallback((eventId: string) => {
    setCache(prev => {
      const { [eventId]: removed, ...rest } = prev
      return rest
    })
  }, [])

  /**
   * Clear entire cache
   */
  const clearCache = useCallback(() => {
    setCache({})
  }, [])

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const entries = Object.values(cache)
    const now = Date.now()
    
    return {
      size: entries.length,
      maxSize,
      validEntries: entries.filter(entry => now - entry.timestamp < ttl).length,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length 
        : 0,
      hitRate: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length 
        : 0
    }
  }, [cache, maxSize, ttl])

  /**
   * Check if event exists in cache and is valid
   */
  const hasEvent = useCallback((eventId: string): boolean => {
    const entry = cache[eventId]
    if (!entry) return false
    
    const now = Date.now()
    return now - entry.timestamp < ttl
  }, [cache, ttl])

  /**
   * Preload multiple events into cache
   */
  const preloadEvents = useCallback((events: Event[]) => {
    const now = Date.now()
    
    setCache(prev => {
      const newCache = { ...prev }
      
      events.forEach(event => {
        newCache[event.id] = {
          data: event,
          timestamp: now,
          accessCount: 0,
          lastAccessed: now
        }
      })
      
      return newCache
    })
  }, [])

  return {
    getEvent,
    setEvent,
    removeEvent,
    clearCache,
    hasEvent,
    preloadEvents,
    getCacheStats
  }
} 