/**
 * Events Module - Comprehensive event management system
 * 
 * This module provides a complete solution for event management including:
 * - Modern dailyTimeSlots structure with backward compatibility
 * - Image upload and management
 * - Category management
 * - Advanced search and filtering
 * - Form validation and error handling
 */

// === MODELS ===
export * from './models'
export type { 
  Event, 
  DailyTimeSlot, 
  EventCategory, 
  EventCategoryCreation 
} from './models'

// === COMPONENTS ===
export * from './components'
export { 
  EventStatus, 
  EventBasicInfo, 
  EventImageGallery, 
  EventEditForm,
  EventComponents 
} from './components'

// === SERVICES ===
export * from './services'
export { 
  useEventService, 
  useEventCategoryService, 
  useEventImageService 
} from './services'
export type { 
  ImageUploadResult, 
  ImageUploadProgress 
} from './services'

// === HOOKS ===
export { useEventDetail } from './hooks/useEventDetail'
export type { UseEventDetailReturn } from './hooks/useEventDetail'

// === UTILITIES ===
export * from './utils'
export { 
  getEventTimeInfo, 
  getEventStatus, 
  hasValidTimeSlots, 
  convertLegacyToTimeSlots 
} from './utils'

// === PAGES (for internal module use) ===
export { EventDetailPage } from './pages/EventDetailPage'
export { EventListPage } from './pages/EventListPage'
export { CreateEventPage } from './pages/CreateEventPage'

// === MODULE CONFIGURATION ===
export const EventsModuleConfig = {
  name: 'Events',
  version: '2.0.0',
  features: {
    dailyTimeSlots: true,
    imageUpload: true,
    categoryManagement: true,
    advancedSearch: true,
    legacyCompatibility: true
  },
  maxImagesPerEvent: 10,
  supportedImageFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxImageSize: 10 * 1024 * 1024 // 10MB
} as const 