import { Event, DailyTimeSlot } from '@/modules/events/models'
import { convertLegacyToTimeSlots, hasValidTimeSlots } from '@/modules/events/utils'

/**
 * Legacy Event structure from API
 */
export interface LegacyEventAPI {
  id: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  timeStart?: string
  timeEnd?: string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  price?: number
  categoryId?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  socialMedia?: {
    instagram?: string
    facebook?: string
    tiktok?: string
  }
  ticketsNeeded?: boolean
  isPromoted?: boolean
  maxParticipants?: number
  imageUrls?: string[]
  titleImageUrl?: string
  likeCount?: number
  interestedCount?: number
  createdAt: string
  updatedAt: string
  // New field that might come from API
  dailyTimeSlots?: DailyTimeSlot[]
}

/**
 * Modern Event structure for API requests
 */
export interface ModernEventAPI extends Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
  // Ensure dailyTimeSlots is always present
  dailyTimeSlots: DailyTimeSlot[]
}

/**
 * Maps legacy API response to modern Event interface
 */
export function mapLegacyEventToModern(legacyEvent: LegacyEventAPI): Event {
  // If the event already has dailyTimeSlots, use them
  let timeSlots = legacyEvent.dailyTimeSlots || []
  
  // If no dailyTimeSlots but has legacy time fields, convert them
  if (timeSlots.length === 0 && (legacyEvent.startDate || legacyEvent.endDate)) {
    // Create a temporary event object for conversion
    const tempEvent: Event = {
      id: legacyEvent.id,
      title: legacyEvent.title,
      description: legacyEvent.description,
      startDate: legacyEvent.startDate,
      endDate: legacyEvent.endDate,
      timeStart: legacyEvent.timeStart,
      timeEnd: legacyEvent.timeEnd,
      dailyTimeSlots: [],
      location: legacyEvent.location,
      price: legacyEvent.price || 0,
      categoryId: legacyEvent.categoryId,
      contactEmail: legacyEvent.contactEmail,
      contactPhone: legacyEvent.contactPhone,
      website: legacyEvent.website,
      socialMedia: legacyEvent.socialMedia || {},
      ticketsNeeded: legacyEvent.ticketsNeeded || false,
      isPromoted: legacyEvent.isPromoted || false,
      maxParticipants: legacyEvent.maxParticipants,
      imageUrls: legacyEvent.imageUrls || [],
      titleImageUrl: legacyEvent.titleImageUrl,
      likeCount: legacyEvent.likeCount || 0,
      interestedCount: legacyEvent.interestedCount || 0,
      createdAt: legacyEvent.createdAt,
      updatedAt: legacyEvent.updatedAt
    }
    
    timeSlots = convertLegacyToTimeSlots(tempEvent)
  }

  return {
    id: legacyEvent.id,
    title: legacyEvent.title,
    description: legacyEvent.description,
    dailyTimeSlots: timeSlots,
    location: legacyEvent.location,
    price: legacyEvent.price || 0,
    categoryId: legacyEvent.categoryId,
    contactEmail: legacyEvent.contactEmail,
    contactPhone: legacyEvent.contactPhone,
    website: legacyEvent.website,
    socialMedia: legacyEvent.socialMedia || {},
    ticketsNeeded: legacyEvent.ticketsNeeded || false,
    isPromoted: legacyEvent.isPromoted || false,
    maxParticipants: legacyEvent.maxParticipants,
    imageUrls: legacyEvent.imageUrls || [],
    titleImageUrl: legacyEvent.titleImageUrl,
    likeCount: legacyEvent.likeCount || 0,
    interestedCount: legacyEvent.interestedCount || 0,
    createdAt: legacyEvent.createdAt,
    updatedAt: legacyEvent.updatedAt
  }
}

/**
 * Maps modern Event to API request payload
 */
export function mapModernEventToAPI(event: Partial<Event>): Partial<ModernEventAPI> {
  return {
    title: event.title,
    description: event.description,
    dailyTimeSlots: event.dailyTimeSlots || [],
    location: event.location,
    price: event.price,
    categoryId: event.categoryId,
    contactEmail: event.contactEmail,
    contactPhone: event.contactPhone,
    website: event.website,
    socialMedia: event.socialMedia,
    ticketsNeeded: event.ticketsNeeded,
    isPromoted: event.isPromoted,
    maxParticipants: event.maxParticipants,
    imageUrls: event.imageUrls,
    titleImageUrl: event.titleImageUrl,
    likeCount: event.likeCount,
    interestedCount: event.interestedCount
  }
}

/**
 * Maps array of legacy events to modern events
 */
export function mapLegacyEventsToModern(legacyEvents: LegacyEventAPI[]): Event[] {
  return legacyEvents.map(mapLegacyEventToModern)
}

/**
 * Validates that an event has required fields for API submission
 */
export function validateEventForAPI(event: Partial<Event>): string[] {
  const errors: string[] = []

  if (!event.title?.trim()) {
    errors.push('Title is required')
  }

  if (!event.location?.address?.trim()) {
    errors.push('Location address is required')
  }

  if (!event.dailyTimeSlots || event.dailyTimeSlots.length === 0) {
    errors.push('At least one time slot is required')
  } else {
    // Validate each time slot
    event.dailyTimeSlots.forEach((slot, index) => {
      if (!slot.date) {
        errors.push(`Time slot ${index + 1} requires a date`)
      }
      
      // If both from and to are provided, validate they make sense
      if (slot.from && slot.to && slot.from >= slot.to) {
        errors.push(`Time slot ${index + 1}: start time must be before end time`)
      }
    })
  }

  if (event.price && event.price < 0) {
    errors.push('Price cannot be negative')
  }

  if (event.maxParticipants !== undefined && event.maxParticipants < 1) {
    errors.push('Maximum participants must be at least 1')
  }

  return errors
}

/**
 * Type guard to check if an API response contains legacy events
 */
export function isLegacyEventAPI(event: any): event is LegacyEventAPI {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof event.id === 'string' &&
    typeof event.title === 'string' &&
    (event.startDate !== undefined || event.endDate !== undefined || event.dailyTimeSlots !== undefined)
  )
} 