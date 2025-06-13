import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventStatus } from '../components/EventStatus'
import { Event } from '../models/events'

import { getEventStatus } from '../utils/eventDateUtils'

// Mock the eventDateUtils module
vi.mock('../utils/eventDateUtils', () => ({
  getEventStatus: vi.fn(),
}))

const mockGetEventStatus = vi.mocked(getEventStatus)

const mockEvent: Event = {
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
  price: 0,
  categoryId: '1',
  titleImageUrl: '',
  imageUrls: [],
  socialMedia: {},
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  // Legacy properties (deprecated)
  startDate: '2024-12-25',
  endDate: '2024-12-25',
  timeStart: '18:00',
  timeEnd: '22:00'
}

describe('EventStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Beendet" status for past events', () => {
    mockGetEventStatus.mockReturnValue('past')

    render(<EventStatus event={mockEvent} />)
    
    expect(screen.getByText('Beendet')).toBeInTheDocument()
    expect(mockGetEventStatus).toHaveBeenCalledWith(mockEvent)
  })

  it('renders "Läuft" status for ongoing events', () => {
    mockGetEventStatus.mockReturnValue('ongoing')

    render(<EventStatus event={mockEvent} />)
    
    expect(screen.getByText('Läuft')).toBeInTheDocument()
  })

  it('renders "Geplant" status for future events', () => {
    mockGetEventStatus.mockReturnValue('upcoming')

    render(<EventStatus event={mockEvent} />)
    
    expect(screen.getByText('Geplant')).toBeInTheDocument()
  })

  it('renders "Unbekannt" status when event time cannot be determined', () => {
    mockGetEventStatus.mockReturnValue('unknown')

    render(<EventStatus event={mockEvent} />)
    
    expect(screen.getByText('Unbekannt')).toBeInTheDocument()
  })

  it('applies correct CSS classes for different statuses', () => {
    mockGetEventStatus.mockReturnValue('past')
    
    render(<EventStatus event={mockEvent} />)
    
    const badge = screen.getByText('Beendet').closest('span')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-600')
  })

  it('displays icon for each status', () => {
    mockGetEventStatus.mockReturnValue('upcoming')

    render(<EventStatus event={mockEvent} />)
    
    // Check that an icon is rendered (Lucide icons render as SVG)
    const svg = screen.getByText('Geplant').parentElement?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
}) 