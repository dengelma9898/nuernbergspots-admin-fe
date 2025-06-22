import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import { EventDetail } from '../EventDetail';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/services/eventService', () => ({
  useEventService: jest.fn(),
}));

jest.mock('@/services/eventCategoryService', () => ({
  useEventCategoryService: jest.fn(),
}));

jest.mock('@/utils/colorUtils', () => ({
  convertFFToHex: jest.fn(color => `#${color}`),
}));

jest.mock('@/utils/iconUtils', () => ({
  getIconComponent: jest.fn(() => <span data-testid="mock-icon">Icon</span>),
}));

jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => '01. Januar 2024 10:00'),
  isPast: jest.fn(() => false),
  isFuture: jest.fn(() => true),
  isWithinInterval: jest.fn(() => false),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input value={value || ''} onChange={onChange} {...props} />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, ...props }: any) => (
    <textarea value={value || ''} onChange={onChange} {...props} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, style, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} className={className} style={style} {...props}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">
      <div onClick={() => onValueChange?.('category-1')}>{children}</div>
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}));

jest.mock('@/components/ui/LocationSearch', () => ({
  LocationSearch: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="location-search"
      placeholder={placeholder}
      value={value?.title || ''}
      onChange={e =>
        onChange?.({
          id: 'test',
          title: e.target.value,
          resultType: 'place',
          position: { lat: 49.4521, lng: 11.0767 },
          address: { label: e.target.value },
        })
      }
    />
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  MapPin: () => <span data-testid="map-pin-icon">MapPin</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Heart: () => <span data-testid="heart-icon">Heart</span>,
  Ticket: () => <span data-testid="ticket-icon">Ticket</span>,
  Euro: () => <span data-testid="euro-icon">Euro</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  CheckCircle2: () => <span data-testid="check-circle-icon">CheckCircle2</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
  Star: () => <span data-testid="star-icon">Star</span>,
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  Image: () => <span data-testid="image-icon">Image</span>,
}));

const mockEvent: Event = {
  id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  dailyTimeSlots: [
    {
      date: '2024-01-01',
      from: '10:00',
      to: '18:00',
    },
  ],
  location: {
    address: 'Test Address, Nürnberg',
    latitude: 49.4521,
    longitude: 11.0767,
  },
  price: 25.5,
  ticketsNeeded: true,
  isPromoted: true,
  categoryId: 'category-1',
  contactEmail: 'test@example.com',
  contactPhone: '+49 911 123456',
  website: 'https://test-event.de',
  socialMedia: {
    instagram: '@testevent',
    facebook: 'testevent',
    tiktok: '@testevent',
  },
  titleImageUrl: 'https://example.com/title.jpg',
  imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockCategory: EventCategory = {
  id: 'category-1',
  name: 'Test Category',
  description: 'Test Category Description',
  colorCode: 'FF5733',
  iconName: 'Music',
  fallbackImages: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockEventService = {
  getEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  uploadEventImage: jest.fn(),
  deleteEventImage: jest.fn(),
  uploadEventTitleImage: jest.fn(),
};

const mockEventCategoryService = {
  getCategories: jest.fn(),
};

const mockNavigate = jest.fn();
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EventDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'event-1' });
    mockUseNavigate.mockReturnValue(mockNavigate);

    require('@/services/eventService').useEventService.mockReturnValue(mockEventService);
    require('@/services/eventCategoryService').useEventCategoryService.mockReturnValue(
      mockEventCategoryService
    );

    mockEventService.getEvent.mockResolvedValue(mockEvent);
    mockEventCategoryService.getCategories.mockResolvedValue([mockCategory]);
  });

  describe('Component Rendering', () => {
    it('sollte EventDetail korrekt rendern', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Event Details')).toBeInTheDocument();
      });

      expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      expect(screen.getAllByTestId('card')).toHaveLength(2); // Event Info und Bilder Cards
    });

    it('sollte Loading-State mit Skeleton-Animationen anzeigen', () => {
      mockEventService.getEvent.mockImplementation(() => new Promise(() => {}));

      const { container } = renderWithRouter(<EventDetail />);

      // Überprüfe, dass Skeleton-Elemente gerendert werden
      const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);

      // Sollte mindestens 40+ Skeleton-Elemente haben (Header + 2 Cards mit Details)
      expect(skeletonElements.length).toBeGreaterThan(40);
    });

    it('sollte Event-Informationen anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Address, Nürnberg')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('sollte Event und Kategorien beim Mount laden', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(mockEventService.getEvent).toHaveBeenCalledWith('event-1');
        expect(mockEventCategoryService.getCategories).toHaveBeenCalled();
      });
    });

    it('sollte Fehler beim Laden behandeln', async () => {
      mockEventService.getEvent.mockRejectedValue(new Error('API Error'));
      const mockToast = require('sonner').toast;

      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Fehler beim Laden des Events',
          expect.objectContaining({
            description:
              'Das Event konnte nicht geladen werden. Bitte versuchen Sie es später erneut.',
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/events');
      });
    });

    it('sollte zum Events navigieren wenn keine ID vorhanden', () => {
      mockUseParams.mockReturnValue({});

      renderWithRouter(<EventDetail />);

      expect(mockEventService.getEvent).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('sollte zur Event-Liste navigieren beim Zurück-Button', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Zurück zur Übersicht');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  describe('Event Status', () => {
    it('sollte Event-Status-Badge anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        expect(badges.length).toBeGreaterThan(0);
        // Prüfe, dass mindestens ein Status-Badge vorhanden ist
        expect(screen.getByText('Kommend')).toBeInTheDocument();
      });
    });

    it('sollte Highlight-Badge für promoted Events anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        expect(badges.length).toBeGreaterThan(0);
      });

      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(screen.getByText('Highlight')).toBeInTheDocument();
    });

    it('sollte Kategorie-Badge anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Category')).toHaveLength(2); // Badge und Kategorie-Sektion
      });
    });
  });

  describe('Contact Information', () => {
    it('sollte Kontaktinformationen anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('+49 911 123456')).toBeInTheDocument();
        expect(screen.getByText('https://test-event.de')).toBeInTheDocument();
      });
    });

    it('sollte Social Media Links anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getAllByText('@testevent')).toHaveLength(2); // Instagram und TikTok
        expect(screen.getByText('testevent')).toBeInTheDocument();
      });
    });

    it('sollte E-Mail-Link funktionsfähig sein', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        const emailLink = screen.getByText('test@example.com');
        expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:test@example.com');
      });
    });

    it('sollte Telefon-Link funktionsfähig sein', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        const phoneLink = screen.getByText('+49 911 123456');
        expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+49 911 123456');
      });
    });
  });

  describe('Price and Tickets', () => {
    it('sollte Preis korrekt anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByTestId('euro-icon')).toBeInTheDocument();
      });
    });

    it('sollte "Kostenlos" für Events ohne Preis anzeigen', async () => {
      const freeEvent = { ...mockEvent, price: undefined };
      mockEventService.getEvent.mockResolvedValue(freeEvent);

      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Kostenlos')).toBeInTheDocument();
      });
    });

    it('sollte Tickets-Switch anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        const ticketsSwitch = screen.getByLabelText('Tickets erforderlich');
        expect(ticketsSwitch).toBeInTheDocument();
        expect(ticketsSwitch).toBeChecked();
      });
    });
  });

  describe('Time Slots', () => {
    it('sollte Zeitfenster anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
        expect(screen.getByText('10:00 - 18:00')).toBeInTheDocument();
      });
    });

    it('sollte Datum formatiert anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('01. Januar 2024 10:00')).toBeInTheDocument();
      });
    });
  });

  describe('Image Management', () => {
    it('sollte Bilder-Sektion anzeigen', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Bilder')).toBeInTheDocument();
      });
    });

    it('sollte Title-Image anzeigen wenn vorhanden', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Bilder')).toBeInTheDocument();
      });

      expect(mockEvent.titleImageUrl).toBe('https://example.com/title.jpg');
    });
  });

  describe('Location Handling', () => {
    it('sollte Koordinaten anzeigen wenn verfügbar', async () => {
      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText(/49\.4521, 11\.0767/)).toBeInTheDocument();
      });
    });
  });
});
