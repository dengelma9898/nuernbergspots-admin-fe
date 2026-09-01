import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import type { MockedFunction } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import { EventDetail } from '../EventDetail';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';

// Mock dependencies
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('sonner', async () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/eventService', async () => ({
  useEventService: vi.fn(),
}));

vi.mock('@/services/eventCategoryService', async () => ({
  useEventCategoryService: vi.fn(),
}));

vi.mock('@/utils/iconUtils', async () => ({
  getIconComponent: vi.fn(() => <span data-testid="mock-icon">Icon</span>),
}));

vi.mock('date-fns', async () => ({
  format: vi.fn((date, formatStr) => '01. Januar 2024 10:00'),
  isPast: vi.fn(() => false),
  isFuture: vi.fn(() => true),
  isWithinInterval: vi.fn(() => false),
}));

vi.mock('date-fns/locale', async () => ({
  de: {},
}));

// Mock shadcn/ui components
vi.mock('@/components/ui/button', async () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', async () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input value={value || ''} onChange={onChange} {...props} />
  ),
}));

vi.mock('@/components/ui/textarea', async () => ({
  Textarea: ({ onChange, value, ...props }: any) => (
    <textarea value={value || ''} onChange={onChange} {...props} />
  ),
}));

vi.mock('@/components/ui/label', async () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/card', async () => ({
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

vi.mock('@/components/ui/switch', async () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/badge', async () => ({
  Badge: ({ children, variant, className, style, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} className={className} style={style} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/select', async () => ({
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

vi.mock('@/components/ui/dialog', async () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}));

vi.mock('@/components/ui/LocationSearch', async () => ({
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

vi.mock('@/components/ui/skeleton', async () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', async () => ({
  ...(await vi.importActual('lucide-react')),
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
  BadgeCheck: () => <span data-testid="badge-check-icon">BadgeCheck</span>,
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
  getEvent: vi.fn(),
  approveEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  uploadEventImage: vi.fn(),
  deleteEventImage: vi.fn(),
  uploadEventTitleImage: vi.fn(),
};

const mockEventCategoryService = {
  getCategories: vi.fn(),
};

const mockNavigate = vi.fn();
const mockUseParams = useParams as MockedFunction<typeof useParams>;
const mockUseNavigate = useNavigate as MockedFunction<typeof useNavigate>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EventDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'event-1' });
    mockUseNavigate.mockReturnValue(mockNavigate);

    vi.mocked(useEventService).mockReturnValue(mockEventService);
    vi.mocked(useEventCategoryService).mockReturnValue(mockEventCategoryService);

    mockEventService.getEvent.mockResolvedValue(mockEvent);
    mockEventService.approveEvent.mockResolvedValue({ ...mockEvent, status: 'ACTIVE' });
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

    it('sollte Freigabe-Banner für ausstehende Events anzeigen', async () => {
      mockEventService.getEvent.mockResolvedValue({ ...mockEvent, status: 'PENDING' });

      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(screen.getByText('Ausstehende Freigabe')).toBeInTheDocument();
      });

      const approveBtn = screen.getByRole('button', { name: /Freigeben/i });
      expect(approveBtn).toBeInTheDocument();
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(mockEventService.approveEvent).toHaveBeenCalledWith('event-1');
      });
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
      const mockToast = toast;

      renderWithRouter(<EventDetail />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('Fehler beim Laden des Events'),
          expect.objectContaining({
            description: expect.stringContaining('API Error'),
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
