import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EventBasicInfo } from '../components/EventBasicInfo'
import { Event } from '../models/events'

import { getEventTimeInfo } from '../utils/eventDateUtils'

// Mock eventDateUtils
vi.mock('../utils/eventDateUtils', () => ({
  getEventTimeInfo: vi.fn(() => ({
    startDate: new Date('2024-12-25'),
    endDate: new Date('2024-12-25'),
    isMultiDay: false,
    duration: '18:00 - 22:00 Uhr',
    formattedTimeRange: '25.12.2024 von 18:00 bis 22:00 Uhr'
  }))
}))

const mockGetEventTimeInfo = vi.mocked(getEventTimeInfo)

// Mock EventStatus component
vi.mock('../components/EventStatus', () => ({
  EventStatus: ({ event }: { event: Event }) => <div data-testid="event-status">Status: {event.title}</div>
}))

const mockEvent: Event = {
  id: '1',
  title: 'Weihnachtsmarkt',
  description: 'Schöner Weihnachtsmarkt in der Innenstadt',
  dailyTimeSlots: [
    {
      date: '2024-12-25',
      from: '18:00',
      to: '22:00'
    }
  ],
  location: {
    address: 'Hauptplatz 1, Nürnberg',
    latitude: 49.4521,
    longitude: 11.0767
  },
  price: 0,
  categoryId: '1',
  titleImageUrl: '',
  imageUrls: [],
  socialMedia: {},
  likeCount: 42,
  interestedCount: 128,
  maxParticipants: 500,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  // Legacy properties for backwards compatibility
  startDate: '2024-12-25',
  endDate: '2024-12-25',
  timeStart: '18:00',
  timeEnd: '22:00'
}

describe('EventBasicInfo', () => {
  it('renders event details correctly', () => {
    render(<EventBasicInfo event={mockEvent} />)
    
    expect(screen.getByText('Event Details')).toBeInTheDocument()
    expect(screen.getByText('Datum & Uhrzeit')).toBeInTheDocument()
    expect(screen.getByText('Veranstaltungsort')).toBeInTheDocument()
    expect(screen.getByText('Preis')).toBeInTheDocument()
  })

  it('displays location information', () => {
    render(<EventBasicInfo event={mockEvent} />)
    
    expect(screen.getByText('Hauptplatz 1, Nürnberg')).toBeInTheDocument()
  })

  it('shows "Kostenlos" for zero price', () => {
    render(<EventBasicInfo event={mockEvent} />)
    
    expect(screen.getByText('Kostenlos')).toBeInTheDocument()
  })

  it('shows formatted price for non-zero price', () => {
    const paidEvent = { ...mockEvent, price: 15.50 }
    render(<EventBasicInfo event={paidEvent} />)
    
    expect(screen.getByText('15.50 €')).toBeInTheDocument()
  })

  it('displays statistics correctly', () => {
    render(<EventBasicInfo event={mockEvent} />)
    
    expect(screen.getByText('Statistiken')).toBeInTheDocument()
    expect(screen.getByText('Likes')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Interessiert')).toBeInTheDocument()
    expect(screen.getByText('128')).toBeInTheDocument()
    expect(screen.getByText('Teilnehmerplätze')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('handles missing location gracefully', () => {
    const eventWithoutLocation = { 
      ...mockEvent, 
      location: {
        address: '',
        latitude: 0,
        longitude: 0
      }
    }
    render(<EventBasicInfo event={eventWithoutLocation} />)
    
    // Should still render location section but with empty address
    expect(screen.getByText('Veranstaltungsort')).toBeInTheDocument()
  })

  it('handles missing maxParticipants gracefully', () => {
    const eventWithoutMaxParticipants = { ...mockEvent, maxParticipants: undefined }
    render(<EventBasicInfo event={eventWithoutMaxParticipants} />)
    
    expect(screen.queryByText('Teilnehmerplätze')).not.toBeInTheDocument()
  })

  it('displays default values for missing counts', () => {
    const eventWithoutCounts = { 
      ...mockEvent, 
      likeCount: undefined, 
      interestedCount: undefined 
    }
    render(<EventBasicInfo event={eventWithoutCounts} />)
    
    expect(screen.getAllByText('0')).toHaveLength(2)
  })

  it('renders EventStatus component', () => {
    render(<EventBasicInfo event={mockEvent} />)
    
    expect(screen.getByTestId('event-status')).toBeInTheDocument()
  })

  it('returns null when isEditing is true', () => {
    const { container } = render(<EventBasicInfo event={mockEvent} isEditing={true} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('displays correct icons for different sections', () => {
    const { container } = render(<EventBasicInfo event={mockEvent} />)
    
    // Check that SVG icons are rendered
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('formats single day event correctly', () => {
    render(<EventBasicInfo event={mockEvent} />)
    
    // Should show same date with time range
    expect(screen.getByText(/25\.12\.2024 von 18:00 bis 22:00 Uhr/)).toBeInTheDocument()
  })

  it('formats multi-day event correctly', () => {
    // Mock für Multi-Day Event
    mockGetEventTimeInfo.mockReturnValueOnce({
      startDate: new Date('2024-12-25'),
      endDate: new Date('2024-12-26'),
      isMultiDay: true,
      duration: '2 Termin(e)',
      formattedTimeRange: '25.12.2024 bis 26.12.2024'
    })

    const multiDayEvent = {
      ...mockEvent,
      dailyTimeSlots: [
        { date: '2024-12-25', from: '18:00', to: '22:00' },
        { date: '2024-12-26', from: '18:00', to: '22:00' }
      ]
    }
    render(<EventBasicInfo event={multiDayEvent} />)
    
    // Should show the multi-day formatted time range
    expect(screen.getByText('25.12.2024 bis 26.12.2024')).toBeInTheDocument()
  })
}) 