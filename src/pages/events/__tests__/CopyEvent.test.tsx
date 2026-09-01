import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CopyEvent } from '../CopyEvent';
import { EventCategory } from '@/models/event-category';
import { Event } from '@/models/events';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'event-1' }),
}));

const mockEventService = {
  getEvent: vi.fn(),
  createEvent: vi.fn(),
  uploadEventTitleImage: vi.fn(),
  uploadEventImages: vi.fn(),
  setEventTitleImage: vi.fn(),
  updateEventImages: vi.fn(),
};

const mockEventCategoryService = {
  getCategories: vi.fn(),
};

vi.mock('@/services/eventService', async () => ({
  useEventService: () => mockEventService,
}));

vi.mock('@/services/eventCategoryService', async () => ({
  useEventCategoryService: () => mockEventCategoryService,
}));

vi.mock('sonner', async () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/components/ui/LocationSearch', async () => ({
  LocationSearch: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="location-search">{placeholder}</div>
  ),
}));

const mockEvent: Event = {
  id: 'event-1',
  title: 'Sommerfest',
  description: 'Ein tolles Fest',
  dailyTimeSlots: [{ date: '2026-08-01', from: '18:00', to: '22:00' }],
  location: {
    address: 'Hauptmarkt, Nürnberg',
    latitude: 49.4521,
    longitude: 11.0767,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  priceString: '15€',
  ticketsNeeded: false,
  isPromoted: true,
  categoryId: 'cat-1',
  contactEmail: null,
  contactPhone: null,
  website: null,
  socialMedia: { instagram: null, facebook: null, tiktok: null },
  imageUrls: [],
  favoriteCount: 0,
  monthYear: null,
};

const mockCategories: EventCategory[] = [
  {
    id: 'cat-1',
    name: 'Konzert',
    description: 'Musik',
    colorCode: '#000000',
    iconName: 'music_note',
    createdAt: '',
    updatedAt: '',
  },
];

describe('CopyEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEventService.getEvent.mockResolvedValue(mockEvent);
    mockEventCategoryService.getCategories.mockResolvedValue(mockCategories);
    global.fetch = vi.fn().mockRejectedValue(new Error('CORS'));
  });

  const renderCopyEvent = () =>
    render(
      <BrowserRouter>
        <CopyEvent />
      </BrowserRouter>
    );

  it('lädt Quell-Event und rendert Kopier-Formular', async () => {
    renderCopyEvent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Event kopieren' })).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Sommerfest (Kopie)')).toBeInTheDocument();
  });

  it('zeigt Skeleton während des Ladens', () => {
    mockEventService.getEvent.mockImplementation(() => new Promise(() => undefined));

    renderCopyEvent();

    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });
});
