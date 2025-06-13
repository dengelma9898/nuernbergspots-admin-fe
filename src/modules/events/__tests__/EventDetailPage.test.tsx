import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { EventDetailPage } from '../pages/EventDetailPage'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token')
  })
}))

// Mock services
vi.mock('@/modules/events/services', () => ({
  useEventImageService: () => ({
    uploadEventImages: vi.fn(),
    removeEventImage: vi.fn()
  })
}))

// Mock React Router
const mockNavigate = vi.fn()
const mockParams = { id: 'test-event-id' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock useEventDetail hook
const mockUseEventDetail = vi.fn()
vi.mock('@/modules/events/hooks/useEventDetail', () => ({
  useEventDetail: () => mockUseEventDetail(),
}))

// Mock components
vi.mock('@/shared/components', () => ({
  LoadingOverlay: ({ isLoading, text }: { isLoading: boolean; text?: string }) =>
    isLoading ? <div data-testid="loading-overlay">{text}</div> : null,
}))

vi.mock('@/modules/events/components', () => ({
  EventStatus: ({ event }: { event: any }) => (
    <div data-testid="event-status">{event.title} Status</div>
  ),
  EventBasicInfo: ({ event }: { event: any }) => (
    <div data-testid="event-basic-info">{event.title} Info</div>
  ),
  EventImageGallery: ({ images, isEditing }: { images: string[]; isEditing: boolean }) => (
    <div data-testid="event-image-gallery">
      {images.length} images, editing: {isEditing.toString()}
    </div>
  ),
  EventEditForm: ({ event }: { event: any }) => (
    <div data-testid="event-edit-form">{event.title} Edit Form</div>
  ),
}))

const mockEvent = {
  id: 'test-event-id',
  title: 'Test Event',
  description: 'Test Description',
  dailyTimeSlots: [
    { date: '2024-01-15', from: '10:00', to: '12:00' }
  ],
  location: { address: 'Test Address', latitude: 49.4521, longitude: 11.0767 },
  price: 10,
  contactEmail: 'test@example.com',
  contactPhone: '+49 123 456789',
  website: 'https://test.com',
  socialMedia: {
    instagram: 'testaccount',
    facebook: 'https://facebook.com/test',
    tiktok: 'testaccount'
  },
  imageUrls: ['image1.jpg', 'image2.jpg'],
}

const defaultHookReturn = {
  event: mockEvent,
  categories: [],
  loading: false,
  isEditing: false,
  editedEvent: {},
  setIsEditing: vi.fn(),
  setEditedEvent: vi.fn(),
  handleEdit: vi.fn(),
  handleSave: vi.fn(),
  handleCancel: vi.fn(),
  handleDelete: vi.fn(),
  handleInputChange: vi.fn(),
  handleSocialMediaChange: vi.fn(),
  isEventChanged: vi.fn().mockReturnValue(false),
  refetchEvent: vi.fn(),
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('EventDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEventDetail.mockReturnValue(defaultHookReturn)
  })

  it('should render loading state', () => {
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      loading: true,
    })

    renderWithRouter(<EventDetailPage />)

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
    expect(screen.getByText('Event wird geladen...')).toBeInTheDocument()
  })

  it('should render event not found state', () => {
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      event: null,
    })

    renderWithRouter(<EventDetailPage />)

    expect(screen.getByText('Event nicht gefunden')).toBeInTheDocument()
    expect(screen.getByText('Das angeforderte Event konnte nicht gefunden werden.')).toBeInTheDocument()
  })

  it('should render event details', () => {
    renderWithRouter(<EventDetailPage />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByTestId('event-status')).toBeInTheDocument()
    expect(screen.getByTestId('event-basic-info')).toBeInTheDocument()
    expect(screen.getByTestId('event-image-gallery')).toBeInTheDocument()
  })

  it('should show edit and delete buttons when not editing', () => {
    renderWithRouter(<EventDetailPage />)

    expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
    expect(screen.getByText('Löschen')).toBeInTheDocument()
  })

  it('should show save and cancel buttons when editing', () => {
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      isEditing: true,
      editedEvent: mockEvent,
      isEventChanged: vi.fn().mockReturnValue(true),
    })

    renderWithRouter(<EventDetailPage />)

    expect(screen.getByText('Speichern')).toBeInTheDocument()
    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
    expect(screen.getByTestId('event-edit-form')).toBeInTheDocument()
  })

  it('should render contact information', () => {
    renderWithRouter(<EventDetailPage />)

    expect(screen.getByText('Kontakt')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('+49 123 456789')).toBeInTheDocument()
    expect(screen.getByText('https://test.com')).toBeInTheDocument()
  })

  it('should render social media information', () => {
    renderWithRouter(<EventDetailPage />)

    expect(screen.getByText('Social Media')).toBeInTheDocument()
    expect(screen.getAllByText('@testaccount')).toHaveLength(2) // Instagram and TikTok
    expect(screen.getByText('https://facebook.com/test')).toBeInTheDocument()
  })

  it('should handle edit button click', () => {
    const handleEdit = vi.fn()
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      handleEdit,
    })

    renderWithRouter(<EventDetailPage />)

    fireEvent.click(screen.getByText('Bearbeiten'))
    expect(handleEdit).toHaveBeenCalled()
  })

  it('should handle save button click', () => {
    const handleSave = vi.fn()
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      isEditing: true,
      isEventChanged: vi.fn().mockReturnValue(true),
      handleSave,
    })

    renderWithRouter(<EventDetailPage />)

    fireEvent.click(screen.getByText('Speichern'))
    expect(handleSave).toHaveBeenCalled()
  })

  it('should show delete confirmation dialog', async () => {
    renderWithRouter(<EventDetailPage />)

    fireEvent.click(screen.getByText('Löschen'))

    await waitFor(() => {
      expect(screen.getByText('Event löschen')).toBeInTheDocument()
      expect(screen.getByText(/Möchten Sie das Event "Test Event" wirklich löschen?/)).toBeInTheDocument()
    })
  })

  it('should handle back navigation', () => {
    renderWithRouter(<EventDetailPage />)

    fireEvent.click(screen.getByText('Zurück'))
    expect(mockNavigate).toHaveBeenCalledWith('/events')
  })

  it('should handle image upload', async () => {
    const refetchEvent = vi.fn()
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      refetchEvent,
    })

    renderWithRouter(<EventDetailPage />)

    // Image upload functionality would be tested through the EventImageGallery component
    expect(screen.getByTestId('event-image-gallery')).toBeInTheDocument()
  })

  it('should disable save button when no changes', () => {
    mockUseEventDetail.mockReturnValue({
      ...defaultHookReturn,
      isEditing: true,
      editedEvent: mockEvent,
      isEventChanged: vi.fn().mockReturnValue(false),
    })

    renderWithRouter(<EventDetailPage />)

    const saveButton = screen.getByText('Speichern')
    expect(saveButton).toBeDisabled()
  })
}) 