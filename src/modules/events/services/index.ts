// Event Services
export { useEventService } from './eventService'
export { useEventCategoryService } from './eventCategoryService'
export { useEventImageService } from './eventImageService'

// Performance-Optimized Services
export { useOptimizedEventService } from './eventServiceOptimized'

// API Mapper
export * from './eventApiMapper'

// Types
export type { ImageUploadResult, ImageUploadProgress } from './eventImageService'
export type { 
  LegacyEventAPI, 
  ModernEventAPI 
} from './eventApiMapper'

// Service recommendations based on use case
export const EventServiceRecommendations = {
  /**
   * Use for high-traffic pages with frequent event access
   */
  highPerformance: 'useOptimizedEventService',
  
  /**
   * Use for simple pages with single event access
   */
  standard: 'useEventService',
  
  /**
   * Use for admin/management interfaces
   */
  management: 'useEventService',
  
  /**
   * Use for image-heavy operations
   */
  imageHandling: 'useEventImageService'
} as const