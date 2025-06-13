import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEventTimeInfo, getEventStatus, hasValidTimeSlots, convertLegacyToTimeSlots } from '../utils/eventDateUtils'
import { Event, DailyTimeSlot } from '../models/events'

import { format, parseISO, isPast, isFuture, isWithinInterval } from 'date-fns'

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr, options) => {
    const dateObj = new Date(date)
    if (formatStr === 'yyyy-MM-dd') {
      return dateObj.toISOString().split('T')[0]
    }
    if (formatStr === 'dd.MM.yyyy') {
      return '25.12.2024'
    }
    return '2024-12-25'
  }),
  parseISO: vi.fn((dateStr) => new Date(dateStr)),
  isPast: vi.fn(),
  isFuture: vi.fn(),
  isWithinInterval: vi.fn()
}))

const mockFormat = vi.mocked(format)
const mockParseISO = vi.mocked(parseISO)
const mockIsPast = vi.mocked(isPast)
const mockIsFuture = vi.mocked(isFuture)
const mockIsWithinInterval = vi.mocked(isWithinInterval)

const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  dailyTimeSlots: [
    {
      date: '2024-12-25',
      from: '18:00',
      to: '22:00'
    }
  ],
  location: {
    address: 'Test Address',
    latitude: 49.4521,
    longitude: 11.0767
  },
  titleImageUrl: '',
  imageUrls: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  socialMedia: {},
  ...overrides
})

describe('eventDateUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasValidTimeSlots', () => {
    it('returns true when event has dailyTimeSlots', () => {
      const event = createMockEvent()
      expect(hasValidTimeSlots(event)).toBe(true)
    })

    it('returns false when event has empty dailyTimeSlots', () => {
      const event = createMockEvent({ dailyTimeSlots: [] })
      expect(hasValidTimeSlots(event)).toBe(false)
    })

    it('returns false when event has no dailyTimeSlots', () => {
      const event = createMockEvent({ dailyTimeSlots: undefined as any })
      expect(hasValidTimeSlots(event)).toBe(false)
    })
  })

  describe('getEventTimeInfo', () => {
    it('returns time info for valid dailyTimeSlots', () => {
      const event = createMockEvent()
      const timeInfo = getEventTimeInfo(event)
      
      expect(timeInfo).toBeDefined()
      expect(timeInfo?.isMultiDay).toBe(false)
      expect(timeInfo?.duration).toBe('18:00 - 22:00 Uhr')
    })

    it('handles multi-day events', () => {
      const event = createMockEvent({
        dailyTimeSlots: [
          { date: '2024-12-25', from: '18:00', to: '22:00' },
          { date: '2024-12-26', from: '10:00', to: '14:00' }
        ]
      })
      const timeInfo = getEventTimeInfo(event)
      
      expect(timeInfo?.isMultiDay).toBe(true)
      expect(timeInfo?.duration).toBe('2 Termin(e)')
    })

    it('falls back to legacy properties when no dailyTimeSlots', () => {
      const event = createMockEvent({
        dailyTimeSlots: [],
        startDate: '2024-12-25',
        endDate: '2024-12-25',
        timeStart: '18:00',
        timeEnd: '22:00'
      })
      const timeInfo = getEventTimeInfo(event)
      
      expect(timeInfo).toBeDefined()
      expect(timeInfo?.formattedTimeRange).toContain('25.12.2024')
    })

    it('returns null when no time information available', () => {
      const event = createMockEvent({
        dailyTimeSlots: [],
        startDate: undefined,
        endDate: undefined
      })
      const timeInfo = getEventTimeInfo(event)
      
      expect(timeInfo).toBeNull()
    })
  })

  describe('getEventStatus', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      mockParseISO.mockImplementation((dateStr) => new Date(dateStr))
      mockIsPast.mockReturnValue(false)
      mockIsFuture.mockReturnValue(false)
      mockIsWithinInterval.mockReturnValue(false)
    })

    it('returns "past" for events that have ended', () => {
      // Mock für vergangene Events - isFuture soll false sein für alle Slots
      mockIsFuture.mockReturnValue(false)
      
      const event = createMockEvent({
        dailyTimeSlots: [
          { date: '2023-12-25', from: '18:00', to: '22:00' }
        ]
      })
      
      const status = getEventStatus(event)
      expect(status).toBe('past')
    })

    it('returns "upcoming" for future events', () => {
      // Mock für zukünftige Events - isFuture soll true sein
      mockIsFuture.mockReturnValue(true)
      
      const event = createMockEvent({
        dailyTimeSlots: [
          { date: '2025-12-25', from: '18:00', to: '22:00' }
        ]
      })
      
      const status = getEventStatus(event)
      expect(status).toBe('upcoming')
    })

    it('returns "ongoing" for current events', () => {
      // Mock für laufende Events - isWithinInterval soll true sein
      mockIsWithinInterval.mockReturnValue(true)
      
      const event = createMockEvent({
        dailyTimeSlots: [
          { date: '2024-12-25', from: '18:00', to: '22:00' }
        ]
      })
      
      const status = getEventStatus(event)
      expect(status).toBe('ongoing')
    })

    it('returns "unknown" for events without time info', () => {
      const event = createMockEvent({
        dailyTimeSlots: [],
        startDate: undefined
      })
      
      const status = getEventStatus(event)
      expect(status).toBe('unknown')
    })
  })

  describe('convertLegacyToTimeSlots', () => {
    it('returns existing dailyTimeSlots when available', () => {
      const event = createMockEvent()
      const slots = convertLegacyToTimeSlots(event)
      
      expect(slots).toEqual(event.dailyTimeSlots)
    })

    it('converts single day legacy event', () => {
      const event = createMockEvent({
        dailyTimeSlots: [],
        startDate: '2024-12-25',
        timeStart: '18:00',
        timeEnd: '22:00'
      })
      const slots = convertLegacyToTimeSlots(event)
      
      expect(slots).toHaveLength(1)
      expect(slots[0]).toEqual({
        date: '2024-12-25',
        from: '18:00',
        to: '22:00'
      })
    })

    it('converts multi-day legacy event', () => {
      const event = createMockEvent({
        dailyTimeSlots: [],
        startDate: '2024-12-25',
        endDate: '2024-12-26',
        timeStart: '18:00',
        timeEnd: '22:00'
      })
      const slots = convertLegacyToTimeSlots(event)
      
      expect(slots.length).toBeGreaterThan(1)
      expect(slots[0].from).toBe('18:00')
      expect(slots[slots.length - 1].to).toBe('22:00')
    })

    it('returns empty array when no time information', () => {
      const event = createMockEvent({
        dailyTimeSlots: [],
        startDate: undefined
      })
      const slots = convertLegacyToTimeSlots(event)
      
      expect(slots).toEqual([])
    })
  })
}) 