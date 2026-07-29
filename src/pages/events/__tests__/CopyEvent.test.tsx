import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CopyEvent } from '../CopyEvent';
import { EventCategory } from '@/models/event-category';
import { Event } from '@/models/events';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'event-1' }),
}));

const mockEventService = {
  getEvent: jest.fn(),
  createEvent: jest.fn(),
  uploadEventTitleImage: jest.fn(),
  uploadEventImages: jest.fn(),
  setEventTitleImage: jest.fn(),
  updateEventImages: jest.fn(),
};

const mockEventCategoryService = {
  getCategories: jest.fn(),
};

jest.mock('@/services/eventService', () => ({
  useEventService: () => mockEventService,
}));

jest.mock('@/services/eventCategoryService', () => ({
  useEventCategoryService: () => mockEventCategoryService,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@/components/ui/LocationSearch', () => ({
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
    jest.clearAllMocks();
    mockEventService.getEvent.mockResolvedValue(mockEvent);
    mockEventCategoryService.getCategories.mockResolvedValue(mockCategories);
    global.fetch = jest.fn().mockRejectedValue(new Error('CORS'));
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
