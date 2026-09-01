import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventList, EventCard } from '../EventList';
import * as eventFilterUtils from '@/utils/eventFilterUtils';
import { useEventService } from '../../../services/eventService';
import { useEventCategoryService } from '../../../services/eventCategoryService';
import { useUserService } from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';
import { Event } from '../../../models/events';
import { EventCategory } from '../../../models/event-category';
import '@testing-library/jest-dom';

// Mock alle externen Dependencies
jest.mock('../../../lib/api', () => ({
  apiRequest: jest.fn(),
}));
jest.mock('../../../services/eventService');
jest.mock('../../../services/eventCategoryService');
jest.mock('../../../services/userService');
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div className={className} data-testid="card-description">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div className={className} data-testid="card-title">
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className} data-testid="card-footer">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange?.('test-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="select-trigger" {...props}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

jest.mock('@/components/ui/calendar-week-select', () => ({
  CalendarWeekSelect: ({ value, onChange }: any) => (
    <div data-testid="calendar-week-select" data-value={value} onClick={() => onChange?.('1')}>
      Week Select
    </div>
  ),
}));

jest.mock('@tanstack/react-virtual', () => ({
  useWindowVirtualizer: ({ count }: { count: number }) => ({
    getTotalSize: () => count * 400,
    measureElement: jest.fn(),
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: `virtual-${index}`,
        start: index * 400,
        size: 400,
      })),
  }),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  Ticket: () => <div data-testid="ticket-icon">Ticket</div>,
  Euro: () => <div data-testid="euro-icon">Euro</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  CheckCircle2: () => <div data-testid="check-circle-icon">CheckCircle2</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Tag: () => <div data-testid="tag-icon">Tag</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  StarOff: () => <div data-testid="star-off-icon">StarOff</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  MoreVertical: () => <div data-testid="more-vertical-icon">MoreVertical</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash: () => <div data-testid="trash-icon">Trash</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  CheckSquare: () => <div data-testid="check-square-icon">CheckSquare</div>,
  Square: () => <div data-testid="square-icon">Square</div>,
  X: () => <div data-testid="x-icon">X</div>,
  BadgeCheck: () => <div data-testid="badge-check-icon">BadgeCheck</div>,
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock date-fns functions
jest.mock('date-fns', () => {
  const actual = jest.requireActual<typeof import('date-fns')>('date-fns');
  return {
    ...actual,
    format: (date: Date, formatString: string, options?: any) => {
      if (formatString === 'dd. MMMM yyyy') {
        return '15. Januar 2024';
      }
      if (formatString === 'dd. MMMM yyyy HH:mm') {
        return '15. Januar 2024 14:00';
      }
      if (formatString === 'w') {
        return '3';
      }
      if (formatString === 'yyyy-MM') {
        return '2024-01';
      }
      if (formatString === 'MMMM yyyy') {
        return 'Januar 2024';
      }
      return '15. Januar 2024';
    },
    isPast: jest.fn(),
    isFuture: jest.fn(),
    isWithinInterval: jest.fn(),
    startOfMonth: jest.fn((date: Date) => {
      const d = new Date(date);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }),
  };
});

// Mock color utils
// Mock icon utils
jest.mock('@/utils/iconUtils', () => ({
  getIconComponent: jest.fn(() => <div data-testid="icon-component">Icon</div>),
}));

const mockNavigate = jest.fn();

function createEventsListResponse(events: Event[]) {
  return {
    data: events,
    meta: {
      page: 1,
      limit: 50,
      total: events.length,
      totalPages: events.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    facets: {
      pendingCount: 0,
      monthOptions: [{ key: '2024-06', label: 'Juni 2024' }],
    },
  };
}

const mockEventService = {
  getEvents: jest.fn(),
  getEventsList: jest.fn(),
  exportEventsList: jest.fn(),
  getPendingEvents: jest.fn(),
  approveEvent: jest.fn(),
  deleteEvent: jest.fn(),
};
const mockEventCategoryService = {
  getCategories: jest.fn(),
};
const mockUserService = {
  getUserProfile: jest.fn(),
};

// Mock-Daten
const mockEventCategory: EventCategory = {
  id: 'cat-1',
  name: 'Kultur',
  description: 'Kulturelle Veranstaltungen',
  colorCode: '#3B82F6',
  iconName: 'art',
  fallbackImages: ['https://example.com/image1.jpg'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockEvent: Event = {
  id: 'event-1',
  title: 'Konzert im Park',
  description: 'Ein wunderschönes Konzert unter freiem Himmel',
  location: {
    address: 'Stadtpark, Nürnberg',
    latitude: 49.4521,
    longitude: 11.0767,
  },
  titleImageUrl: 'https://example.com/concert.jpg',
  imageUrls: ['https://example.com/concert1.jpg', 'https://example.com/concert2.jpg'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  favoriteCount: 25,
  ticketsNeeded: true,
  price: 15.5,
  categoryId: 'cat-1',
  isPromoted: true,
  dailyTimeSlots: [
    {
      date: '2024-06-15',
      from: '14:00',
      to: '18:00',
    },
    {
      date: '2024-06-16',
      from: '14:00',
      to: '18:00',
    },
  ],
  contactEmail: 'info@konzert.de',
  contactPhone: '+49 911 123456',
  website: 'https://konzert.de',
  socialMedia: {
    instagram: '@konzert',
    facebook: 'konzert',
  },
};

const mockPastEvent: Event = {
  ...mockEvent,
  id: 'event-past',
  title: 'Vergangenes Event',
  dailyTimeSlots: [
    {
      date: '2023-12-15',
      from: '14:00',
      to: '18:00',
    },
  ],
};

const mockFutureEvent: Event = {
  ...mockEvent,
  id: 'event-future',
  title: 'Zukünftiges Event',
  dailyTimeSlots: [
    {
      date: '2025-06-15',
      from: '14:00',
      to: '18:00',
    },
  ],
};

const mockRunningEvent: Event = {
  ...mockEvent,
  id: 'event-running',
  title: 'Laufendes Event',
  dailyTimeSlots: [
    {
      date: '2024-01-10',
      from: '14:00',
      to: '18:00',
    },
    {
      date: '2024-01-20',
      from: '14:00',
      to: '18:00',
    },
  ],
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EventList Component', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventService.getEventsList.mockReset();
    mockEventService.exportEventsList.mockReset();
    window.history.pushState({}, '', '/events');
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useEventService as jest.Mock).mockReturnValue(mockEventService);
    (useEventCategoryService as jest.Mock).mockReturnValue(mockEventCategoryService);
    (useUserService as jest.Mock).mockReturnValue(mockUserService);
    (useAuth as jest.Mock).mockReturnValue({ getUserId: () => 'user-1' });
    mockUserService.getUserProfile.mockResolvedValue({ userType: 'user' });

    // Standard mock setup
    mockEventService.getEventsList.mockResolvedValue(
      createEventsListResponse([mockEvent, mockPastEvent, mockFutureEvent, mockRunningEvent])
    );
    mockEventService.exportEventsList.mockResolvedValue('id,title\n');
    mockEventService.getPendingEvents.mockResolvedValue([]);
    mockEventCategoryService.getCategories.mockResolvedValue([mockEventCategory]);

    // Mock date-fns return values
    const mockIsPast = require('date-fns').isPast as jest.Mock;
    const mockIsFuture = require('date-fns').isFuture as jest.Mock;
    const mockIsWithinInterval = require('date-fns').isWithinInterval as jest.Mock;

    mockIsPast.mockImplementation((date: Date) => {
      const eventDate = new Date(date);
      const now = new Date('2024-01-15');
      return eventDate.getTime() < now.getTime();
    });

    mockIsFuture.mockImplementation((date: Date) => {
      const eventDate = new Date(date);
      const now = new Date('2024-01-15');
      return eventDate.getTime() > now.getTime();
    });

    mockIsWithinInterval.mockImplementation((date: Date, interval: any) => {
      const checkDate = new Date(date);
      const start = new Date(interval.start);
      const end = new Date(interval.end);
      return checkDate >= start && checkDate <= end;
    });
  });

  describe('Component Rendering', () => {
    it('sollte die EventList korrekt rendern', async () => {
      renderWithRouter(<EventList />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getAllByText('Events')[0]).toBeInTheDocument();
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      });
    });

    it('sollte Loading-State mit Skeleton-Animationen anzeigen', () => {
      mockEventService.getEventsList.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = renderWithRouter(<EventList />);

      // Überprüfe, dass Skeleton-Elemente gerendert werden
      const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);

      // Sollte mindestens 30+ Skeleton-Elemente haben (Header + Filter + Event Cards)
      expect(skeletonElements.length).toBeGreaterThan(30);
    });

    it('sollte alle Header-Buttons rendern', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(screen.getAllByText('Mehrfachauswahl')[0]).toBeInTheDocument();
        expect(screen.getAllByText('CSV Import')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Event hinzufügen')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('sollte Events-Liste und Kategorien beim Mount laden', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(mockEventService.getEventsList).toHaveBeenCalledTimes(1);
        expect(mockEventCategoryService.getCategories).toHaveBeenCalledTimes(1);
      });
    });

    it('sollte Fehler beim Laden der Daten behandeln', async () => {
      const mockToast = require('sonner').toast;
      mockEventService.getEventsList.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('Fehler beim Laden des Events'),
          expect.objectContaining({
            description: expect.stringContaining('API Error'),
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zum Event Hinzufügen navigieren', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        const addButton = screen.getAllByText('Event hinzufügen')[0];
        fireEvent.click(addButton);
        expect(mockNavigate).toHaveBeenCalledWith('/create-event');
      });
    });

    it('sollte Auswahlmodus aktivieren beim Klick auf Mehrfachauswahl', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      });

      const selectionButton = screen.getByText('Mehrfachauswahl');
      fireEvent.click(selectionButton);

      // Nach dem Klick sollte der Auswahlmodus aktiv sein
      await waitFor(() => {
        expect(
          screen.getByText('Auswahlmodus aktiv – Nur aktuelle und zukünftige Events auswählbar')
        ).toBeInTheDocument();
        expect(screen.getByText('Alle auswählen')).toBeInTheDocument();
        expect(screen.getByText('Auswahl aufheben')).toBeInTheDocument();
        expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      });
    });

    it('sollte Kategorie-setzen-Button für Admins im Auswahlmodus anzeigen', async () => {
      mockUserService.getUserProfile.mockResolvedValue({ userType: 'admin' });
      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Mehrfachauswahl'));

      await waitFor(() => {
        expect(screen.getByText(/Kategorie setzen/)).toBeInTheDocument();
      });
    });

    it('sollte vergangene Events im Auswahlmodus ausblenden', async () => {
      const isEventPastSpy = jest
        .spyOn(eventFilterUtils, 'isEventPast')
        .mockImplementation(event => event.id === 'event-past');

      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
        expect(screen.getByText('Vergangenes Event')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Mehrfachauswahl'));

      await waitFor(() => {
        expect(screen.queryByText('Vergangenes Event')).not.toBeInTheDocument();
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
        expect(screen.getByText('Zukünftiges Event')).toBeInTheDocument();
        expect(screen.getByText('Laufendes Event')).toBeInTheDocument();
      });

      isEventPastSpy.mockRestore();
    });

    it('sollte Auswahlmodus beenden beim Klick auf Abbrechen', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      });

      // Auswahlmodus aktivieren
      const selectionButton = screen.getByText('Mehrfachauswahl');
      fireEvent.click(selectionButton);

      await waitFor(() => {
        expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      });

      // Auswahlmodus beenden
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Auswahlmodus aktiv – Nur aktuelle und zukünftige Events auswählbar')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(async () => {
      renderWithRouter(<EventList />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      });
    });

    it('sollte Such-Input rendern', () => {
      const searchInput = screen.getByPlaceholderText('Nach Event-Namen suchen...');
      expect(searchInput).toBeInTheDocument();
    });

    it('sollte Suche durchführen beim Eingeben', async () => {
      const searchInput = screen.getByPlaceholderText('Nach Event-Namen suchen...');

      fireEvent.change(searchInput, { target: { value: 'Konzert' } });

      expect(searchInput).toHaveValue('Konzert');
    });

    it('sollte alle Filter-Selects rendern', () => {
      expect(screen.getByLabelText('Event-Status filtern')).toBeInTheDocument();
      expect(screen.getByLabelText('Moderation filtern')).toBeInTheDocument();
      expect(screen.getByLabelText('Kategorie filtern')).toBeInTheDocument();
      expect(screen.getByLabelText('Zeitraum eingrenzen')).toBeInTheDocument();
      expect(screen.getByLabelText('Datumsangabe filtern')).toBeInTheDocument();
    });

    it('sollte Kategorie-Filter mit Kategorien befüllen', async () => {
      await waitFor(() => {
        // Der Kategorie-Filter sollte die Kategorie "Kultur" enthalten
        expect(screen.getAllByText('Kultur')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Event Grouping', () => {
    beforeEach(async () => {
      renderWithRouter(<EventList />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      });
    });

    it('sollte Event-Gruppen-Header anzeigen', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('Läuft')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Kommend')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Beendet')[0]).toBeInTheDocument();
      });
    });

    it('sollte Events in richtigen Gruppen anzeigen', async () => {
      await waitFor(() => {
        // Prüfe dass mindestens ein Event angezeigt wird
        expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
        // Überprüfe dass Event-Gruppen-Header vorhanden sind
        expect(screen.getAllByText('Läuft')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Kommend')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Beendet')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      mockEventService.getEventsList.mockResolvedValue(createEventsListResponse([]));
      mockEventCategoryService.getCategories.mockResolvedValue([]);
      mockEventService.getPendingEvents.mockResolvedValue([]);
    });

    it('sollte Empty-State anzeigen wenn keine Events vorhanden', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        expect(screen.getByText('Keine Events vorhanden.')).toBeInTheDocument();
      });
      expect(screen.getAllByRole('button', { name: 'Event hinzufügen' }).length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Klassen für Header haben', async () => {
      renderWithRouter(<EventList />);

      await waitFor(() => {
        const header = screen.getAllByText('Events')[0];
        expect(header).toHaveClass('text-xl', 'sm:text-2xl');
      });
    });
  });
});

describe('EventCard Component', () => {
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const renderEventCard = (props: any = {}) => {
    const defaultProps = {
      event: mockEvent,
      category: mockEventCategory,
      onDelete: mockOnDelete,
      ...props,
    };

    return renderWithRouter(<EventCard {...defaultProps} />);
  };

  describe('Event Card Rendering', () => {
    it('sollte Event-Karte korrekt rendern', () => {
      renderEventCard();

      expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      expect(screen.getByText('Ein wunderschönes Konzert unter freiem Himmel')).toBeInTheDocument();
      expect(screen.getByText('Stadtpark, Nürnberg')).toBeInTheDocument();
    });

    it('sollte Event-Preis anzeigen wenn vorhanden', () => {
      renderEventCard();

      expect(screen.getAllByText('15,50 €')[0]).toBeInTheDocument();
    });

    it('sollte Favorite Count anzeigen', () => {
      renderEventCard();

      expect(screen.getByText('25', { exact: false })).toBeInTheDocument();
    });

    it('sollte Tickets Required Icon anzeigen', () => {
      renderEventCard();

      expect(screen.getByTestId('ticket-icon')).toBeInTheDocument();
    });

    it('sollte Event ohne Kategorie handhaben', () => {
      renderEventCard({ category: undefined });

      expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
    });
  });

  describe('Event Status', () => {
    it('sollte korrekten Status für vergangene Events anzeigen', () => {
      const mockIsPast = require('date-fns').isPast as jest.Mock;
      const mockIsFuture = require('date-fns').isFuture as jest.Mock;
      const mockIsWithinInterval = require('date-fns').isWithinInterval as jest.Mock;

      mockIsPast.mockReturnValue(true);
      mockIsFuture.mockReturnValue(false);
      mockIsWithinInterval.mockReturnValue(false);

      renderEventCard({ event: mockPastEvent });

      expect(screen.getAllByText('Beendet')[0]).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('sollte korrekten Status für zukünftige Events anzeigen', () => {
      const mockIsPast = require('date-fns').isPast as jest.Mock;
      const mockIsFuture = require('date-fns').isFuture as jest.Mock;
      const mockIsWithinInterval = require('date-fns').isWithinInterval as jest.Mock;

      mockIsPast.mockReturnValue(false);
      mockIsFuture.mockReturnValue(true);
      mockIsWithinInterval.mockReturnValue(false);

      renderEventCard({ event: mockFutureEvent });

      expect(screen.getAllByText('Kommend')[0]).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('sollte korrekten Status für laufende Events anzeigen', () => {
      const mockIsPast = require('date-fns').isPast as jest.Mock;
      const mockIsFuture = require('date-fns').isFuture as jest.Mock;
      const mockIsWithinInterval = require('date-fns').isWithinInterval as jest.Mock;

      mockIsPast.mockReturnValue(false);
      mockIsFuture.mockReturnValue(false);
      mockIsWithinInterval.mockReturnValue(true);

      renderEventCard({ event: mockRunningEvent });

      expect(screen.getAllByText('Läuft jetzt')[0]).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });
  });

  describe('Event Date Formatting', () => {
    it('sollte Event-Datum korrekt formatieren', () => {
      renderEventCard();

      expect(screen.getAllByText('15. Januar 2024', { exact: false })[0]).toBeInTheDocument();
    });
  });

  describe('Event Navigation', () => {
    it('sollte zu Event-Detail navigieren beim Klick auf Bearbeiten', () => {
      renderEventCard();

      const editButton = screen.getAllByText('Bearbeiten')[0];
      fireEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining(`/events/${mockEvent.id}`),
        expect.objectContaining({ state: { startInEditMode: true } })
      );
    });
  });

  describe('Preview Mode', () => {
    it('sollte Preview Mode korrekt handhaben', () => {
      renderEventCard({ isPreview: true });

      expect(screen.getByText('Konzert im Park')).toBeInTheDocument();
      // Im Preview-Modus sollten keine Action-Buttons angezeigt werden
    });
  });
});
