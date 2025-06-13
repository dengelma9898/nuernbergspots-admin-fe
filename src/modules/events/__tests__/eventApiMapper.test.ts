import { describe, it, expect } from 'vitest'
import { 
  mapLegacyEventToModern,
  mapModernEventToAPI,
  mapLegacyEventsToModern,
  validateEventForAPI,
  isLegacyEventAPI,
  type LegacyEventAPI
} from '../services/eventApiMapper'
import { Event } from '../models/events'

describe('eventApiMapper', () => {
  const mockLegacyEvent: LegacyEventAPI = {
    id: 'event-1',
    title: 'Legacy Event',
    description: 'Legacy description',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    timeStart: '10:00',
    timeEnd: '12:00',
    location: {
      address: 'Test Address',
      latitude: 49.4521,
      longitude: 11.0767
    },
    price: 10,
    categoryId: 'cat-1',
    contactEmail: 'test@example.com',
    contactPhone: '+49 123 456789',
    website: 'https://test.com',
    socialMedia: {
      instagram: 'testaccount',
      facebook: 'https://facebook.com/test',
      tiktok: 'testaccount'
    },
    ticketsNeeded: true,
    isPromoted: false,
    maxParticipants: 50,
    imageUrls: ['image1.jpg', 'image2.jpg'],
    titleImageUrl: 'title.jpg',
    likeCount: 5,
    interestedCount: 10,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z'
  }

  const mockModernEvent: Event = {
    id: 'event-1',
    title: 'Modern Event',
    description: 'Modern description',
    dailyTimeSlots: [
      { date: '2024-01-15', from: '10:00', to: '12:00' }
    ],
    location: {
      address: 'Test Address',
      latitude: 49.4521,
      longitude: 11.0767
    },
    price: 10,
    categoryId: 'cat-1',
    contactEmail: 'test@example.com',
    contactPhone: '+49 123 456789',
    website: 'https://test.com',
    socialMedia: {
      instagram: 'testaccount',
      facebook: 'https://facebook.com/test',
      tiktok: 'testaccount'
    },
    ticketsNeeded: true,
    isPromoted: false,
    maxParticipants: 50,
    imageUrls: ['image1.jpg', 'image2.jpg'],
    titleImageUrl: 'title.jpg',
    likeCount: 5,
    interestedCount: 10,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z'
  }

  describe('mapLegacyEventToModern', () => {
    it('should convert legacy event to modern event', () => {
      const result = mapLegacyEventToModern(mockLegacyEvent)

      expect(result.id).toBe('event-1')
      expect(result.title).toBe('Legacy Event')
      expect(result.dailyTimeSlots).toEqual([
        { date: '2024-01-15', from: '10:00', to: '12:00' }
      ])
      expect(result.location).toEqual(mockLegacyEvent.location)
      expect(result.price).toBe(10)
      expect(result.likeCount).toBe(5)
      expect(result.interestedCount).toBe(10)
    })

    it('should use existing dailyTimeSlots if present', () => {
      const legacyWithTimeSlots: LegacyEventAPI = {
        ...mockLegacyEvent,
        dailyTimeSlots: [
          { date: '2024-01-15', from: '14:00', to: '16:00' },
          { date: '2024-01-16', from: '10:00', to: '12:00' }
        ]
      }

      const result = mapLegacyEventToModern(legacyWithTimeSlots)

      expect(result.dailyTimeSlots).toEqual([
        { date: '2024-01-15', from: '14:00', to: '16:00' },
        { date: '2024-01-16', from: '10:00', to: '12:00' }
      ])
    })

    it('should handle missing optional fields', () => {
      const minimalLegacy: LegacyEventAPI = {
        id: 'event-1',
        title: 'Minimal Event',
        location: {
          address: 'Test Address',
          latitude: 49.4521,
          longitude: 11.0767
        },
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      }

      const result = mapLegacyEventToModern(minimalLegacy)

      expect(result.title).toBe('Minimal Event')
      expect(result.price).toBe(0)
      expect(result.likeCount).toBe(0)
      expect(result.interestedCount).toBe(0)
      expect(result.ticketsNeeded).toBe(false)
      expect(result.isPromoted).toBe(false)
      expect(result.socialMedia).toEqual({})
      expect(result.imageUrls).toEqual([])
    })
  })

  describe('mapModernEventToAPI', () => {
    it('should convert modern event to API payload', () => {
      const result = mapModernEventToAPI(mockModernEvent)

      expect(result.title).toBe('Modern Event')
      expect(result.dailyTimeSlots).toEqual([
        { date: '2024-01-15', from: '10:00', to: '12:00' }
      ])
      expect(result.location).toEqual(mockModernEvent.location)
      expect(result.price).toBe(10)
      expect(result.likeCount).toBe(5)
      expect(result.interestedCount).toBe(10)
      
      // Should not include id, createdAt, updatedAt
      expect(result).not.toHaveProperty('id')
      expect(result).not.toHaveProperty('createdAt')
      expect(result).not.toHaveProperty('updatedAt')
    })

    it('should handle partial event data', () => {
      const partialEvent: Partial<Event> = {
        title: 'Partial Event',
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }]
      }

      const result = mapModernEventToAPI(partialEvent)

      expect(result.title).toBe('Partial Event')
      expect(result.dailyTimeSlots).toEqual([{ date: '2024-01-15', from: '10:00', to: '12:00' }])
      expect(result.price).toBeUndefined()
    })
  })

  describe('mapLegacyEventsToModern', () => {
    it('should convert array of legacy events', () => {
      const legacyEvents = [mockLegacyEvent, { ...mockLegacyEvent, id: 'event-2', title: 'Event 2' }]
      const result = mapLegacyEventsToModern(legacyEvents)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('event-1')
      expect(result[1].id).toBe('event-2')
      expect(result[1].title).toBe('Event 2')
    })

    it('should handle empty array', () => {
      const result = mapLegacyEventsToModern([])
      expect(result).toEqual([])
    })
  })

  describe('validateEventForAPI', () => {
    it('should pass validation for valid event', () => {
      const validEvent: Partial<Event> = {
        title: 'Valid Event',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }],
        price: 10,
        maxParticipants: 50
      }

      const errors = validateEventForAPI(validEvent)
      expect(errors).toEqual([])
    })

    it('should fail validation for missing title', () => {
      const invalidEvent: Partial<Event> = {
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }]
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Title is required')
    })

    it('should fail validation for empty title', () => {
      const invalidEvent: Partial<Event> = {
        title: '   ',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }]
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Title is required')
    })

    it('should fail validation for missing location address', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }]
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Location address is required')
    })

    it('should fail validation for missing time slots', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 }
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('At least one time slot is required')
    })

    it('should fail validation for empty time slots', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: []
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('At least one time slot is required')
    })

    it('should fail validation for time slot without date', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '', from: '10:00', to: '12:00' }]
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Time slot 1 requires a date')
    })

    it('should fail validation for invalid time range', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15', from: '12:00', to: '10:00' }]
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Time slot 1: start time must be before end time')
    })

    it('should fail validation for negative price', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }],
        price: -10
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Price cannot be negative')
    })

    it('should fail validation for invalid max participants', () => {
      const invalidEvent: Partial<Event> = {
        title: 'Valid Title',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }],
        maxParticipants: 0
      }

      const errors = validateEventForAPI(invalidEvent)
      expect(errors).toContain('Maximum participants must be at least 1')
    })

    it('should allow time slots without times (all-day events)', () => {
      const validEvent: Partial<Event> = {
        title: 'All Day Event',
        location: { address: 'Valid Address', latitude: 49.4521, longitude: 11.0767 },
        dailyTimeSlots: [{ date: '2024-01-15' }]
      }

      const errors = validateEventForAPI(validEvent)
      expect(errors).toEqual([])
    })
  })

  describe('isLegacyEventAPI', () => {
    it('should identify legacy event API structure', () => {
      const result = isLegacyEventAPI(mockLegacyEvent)
      expect(result).toBe(true)
    })

    it('should identify modern event with dailyTimeSlots', () => {
      const modernLegacy = {
        id: 'event-1',
        title: 'Modern Event',
        dailyTimeSlots: [{ date: '2024-01-15', from: '10:00', to: '12:00' }]
      }

      const result = isLegacyEventAPI(modernLegacy)
      expect(result).toBe(true)
    })

    it('should reject invalid objects', () => {
      expect(isLegacyEventAPI(null)).toBe(false)
      expect(isLegacyEventAPI(undefined)).toBe(false)
      expect(isLegacyEventAPI({})).toBe(false)
      expect(isLegacyEventAPI({ id: 'test' })).toBe(false)
      expect(isLegacyEventAPI({ title: 'test' })).toBe(false)
      expect(isLegacyEventAPI('string')).toBe(false)
      expect(isLegacyEventAPI(123)).toBe(false)
    })
  })
}) 