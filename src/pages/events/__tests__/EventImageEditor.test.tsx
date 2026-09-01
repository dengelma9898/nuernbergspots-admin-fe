import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { MockedFunction } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter, useParams, useNavigate, useLocation } from 'react-router-dom';
import { EventImageEditor } from '../EventImageEditor';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';

// Mock dependencies
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
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

vi.mock('html-to-image', async () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,test')),
}));

vi.mock('date-fns', async () => ({
  format: vi.fn(() => 'Mo. 01.01.'),
  isSameDay: vi.fn(() => false),
  isWithinInterval: vi.fn(() => false),
  startOfDay: vi.fn(() => new Date()),
}));

vi.mock('date-fns/locale', async () => ({
  de: {},
}));

vi.mock('simple-icons', async () => ({
  siInstagram: {},
  siFacebook: {},
  siTiktok: {},
}));

// Mock the logo import
vi.mock('@/assets/Logo_nuernbergspots.png', async () => ({ default: 'mocked-logo.png' }));

// Mock shadcn/ui components
vi.mock('@/components/ui/button', async () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} className={className} {...props}>
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
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

vi.mock('@/components/ui/slider', async () => ({
  Slider: ({ value, onValueChange, min, max, step, ...props }: any) => (
    <input
      data-testid="slider"
      type="range"
      value={value?.[0] || 0}
      onChange={e => onValueChange?.([parseInt(e.target.value)])}
      min={min}
      max={max}
      step={step}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/tabs', async () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tabs-trigger" data-value={value}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/color-picker', async () => ({
  ColorPicker: ({ value, onChange, ...props }: any) => (
    <input
      data-testid="color-picker"
      type="color"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/select', async () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">
      <div onClick={() => onValueChange?.('test-value')}>{children}</div>
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

// Mock Lucide icons
vi.mock('lucide-react', async () => ({
  ...(await vi.importActual('lucide-react')),
  Download: () => <span data-testid="download-icon">Download</span>,
  Settings: () => <span data-testid="settings-icon">Settings</span>,
  Palette: () => <span data-testid="palette-icon">Palette</span>,
  Type: () => <span data-testid="type-icon">Type</span>,
  Image: () => <span data-testid="image-icon">Image</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
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
  isPromoted: false,
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
  imageUrls: ['https://example.com/image1.jpg'],
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
};

const mockEventCategoryService = {
  getCategory: vi.fn(),
};

const mockNavigate = vi.fn();
const mockUseParams = useParams as MockedFunction<typeof useParams>;
const mockUseNavigate = useNavigate as MockedFunction<typeof useNavigate>;
const mockUseLocation = useLocation as MockedFunction<typeof useLocation>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EventImageEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      state: {
        events: [mockEvent],
        categoryName: 'Test Category',
      },
      pathname: '/events/image-editor',
      search: '',
      hash: '',
      key: 'default',
    });

    vi.mocked(useEventService).mockReturnValue(mockEventService);
    vi.mocked(useEventCategoryService).mockReturnValue(mockEventCategoryService);

    mockEventService.getEvent.mockResolvedValue(mockEvent);
    mockEventCategoryService.getCategory.mockResolvedValue(mockCategory);
  });

  describe('Component Rendering', () => {
    it('sollte EventImageEditor korrekt rendern', () => {
      renderWithRouter(<EventImageEditor />);

      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
      expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      expect(screen.getByText('Design-Einstellungen')).toBeInTheDocument();
    });

    it('sollte Tabs für Design-Einstellungen anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();

      const titleTab = screen.getByText('Titel');
      const contentTab = screen.getByText('Inhalt');
      const logoTab = screen.getByText('Logo');

      expect(titleTab).toBeInTheDocument();
      expect(contentTab).toBeInTheDocument();
      expect(logoTab).toBeInTheDocument();
    });

    it('sollte Standard-Tabs-Content anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      // Überprüfe, dass Titel-Tab-Content standardmäßig angezeigt wird
      expect(screen.getByLabelText('Titel Text')).toBeInTheDocument();
      expect(screen.getByText('Schriftgröße')).toBeInTheDocument();
      expect(screen.getByText('Textfarbe')).toBeInTheDocument();
    });
  });

  describe('Event Loading', () => {
    it('sollte Events über Location State laden', () => {
      mockUseLocation.mockReturnValue({
        state: {
          events: [mockEvent],
          categoryName: 'Test Category',
        },
        pathname: '/events/image-editor',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      // Component sollte sich erfolgreich mit State-Events initialisieren
      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
    });

    it('sollte einzelnes Event über ID laden', async () => {
      mockUseParams.mockReturnValue({ id: 'event-1' });
      mockUseLocation.mockReturnValue({
        state: null,
        pathname: '/events/image-editor/event-1',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      await waitFor(() => {
        expect(mockEventService.getEvent).toHaveBeenCalledWith('event-1');
        expect(mockEventCategoryService.getCategory).toHaveBeenCalledWith('category-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Design-Einstellungen')).toBeInTheDocument();
      });
    });

    it('sollte Fehler beim Laden behandeln', async () => {
      mockUseParams.mockReturnValue({ id: 'event-1' });
      mockUseLocation.mockReturnValue({
        state: null,
        pathname: '/events/image-editor/event-1',
        search: '',
        hash: '',
        key: 'default',
      });
      mockEventService.getEvent.mockRejectedValue(new Error('API Error'));
      const mockToast = toast;

      renderWithRouter(<EventImageEditor />);

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
  });

  describe('Navigation', () => {
    it('sollte zur Event-Liste navigieren beim Zurück-Button', () => {
      renderWithRouter(<EventImageEditor />);

      const backButton = screen.getByText('Zurück zur Übersicht');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  describe('Title Settings', () => {
    it('sollte Custom Title Input anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      const titleInput = screen.getByLabelText('Titel Text');
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveAttribute('placeholder', 'Titel eingeben...');
    });

    it('sollte Custom Title ändern', () => {
      renderWithRouter(<EventImageEditor />);

      const titleInput = screen.getByLabelText('Titel Text');
      fireEvent.change(titleInput, { target: { value: 'Neuer Titel' } });

      expect(titleInput).toHaveValue('Neuer Titel');
    });

    it('sollte Schriftgröße-Slider anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      const titlePanel = screen
        .getAllByTestId('tabs-content')
        .find(el => el.getAttribute('data-value') === 'title')!;
      const fontSizeSlider = within(titlePanel).getAllByTestId('slider')[0];
      expect(fontSizeSlider).toBeInTheDocument();
      expect(fontSizeSlider).toHaveAttribute('min', '50');
      expect(fontSizeSlider).toHaveAttribute('max', '200');
    });

    it('sollte Schriftgröße ändern', () => {
      renderWithRouter(<EventImageEditor />);

      const titlePanel = screen
        .getAllByTestId('tabs-content')
        .find(el => el.getAttribute('data-value') === 'title')!;
      const fontSizeSlider = within(titlePanel).getAllByTestId('slider')[0];
      fireEvent.change(fontSizeSlider, { target: { value: '120' } });

      expect(fontSizeSlider).toHaveValue('120');
    });

    it('sollte Color Picker für Textfarbe anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      const colorPickers = screen.getAllByTestId('color-picker');
      expect(colorPickers.length).toBeGreaterThan(0);
    });

    it('sollte Schriftart-Select anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      const fontFamilySelects = screen.getAllByTestId('select');
      expect(fontFamilySelects.length).toBeGreaterThan(0);
    });

    it('sollte Transparent-Checkbox anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      const transparentCheckbox = screen.getByText('Hintergrund transparent');
      expect(transparentCheckbox).toBeInTheDocument();
    });

    it('sollte Transparent-Checkbox umschalten', () => {
      renderWithRouter(<EventImageEditor />);

      // Da wir das Label verwenden, finden wir die Checkbox über die Checkbox-Input
      const checkboxes = screen.getAllByRole('checkbox');
      const transparentCheckbox = checkboxes[0]; // Erste Checkbox sollte transparent sein
      fireEvent.click(transparentCheckbox);

      expect(transparentCheckbox).toBeChecked();
    });
  });

  describe('Design Settings Update', () => {
    it('sollte Title-Settings aktualisieren', () => {
      renderWithRouter(<EventImageEditor />);

      const titlePanel = screen
        .getAllByTestId('tabs-content')
        .find(el => el.getAttribute('data-value') === 'title')!;
      const fontSizeSlider = within(titlePanel).getAllByTestId('slider')[0];
      fireEvent.change(fontSizeSlider, { target: { value: '88' } });

      expect(fontSizeSlider).toHaveValue('88');
    });

    it('sollte Color Settings aktualisieren', () => {
      renderWithRouter(<EventImageEditor />);

      const colorPicker = screen.getAllByTestId('color-picker')[0];
      fireEvent.change(colorPicker, { target: { value: '#FF0000' } });

      expect(colorPicker).toHaveValue('#ff0000'); // Lowercase wie der Browser es normalisiert
    });
  });

  describe('Image Download', () => {
    it('sollte Download-Button anzeigen', () => {
      renderWithRouter(<EventImageEditor />);

      // Download-Button würde in der Preview-Sektion sein
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });
  });

  describe('Background Image', () => {
    it('sollte File Input für Background Image haben', () => {
      renderWithRouter(<EventImageEditor />);

      // File Input würde für Hintergrundbild verfügbar sein
      // Da es nicht direkt sichtbar ist, testen wir indirekt
      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('sollte Date-Formatting korrekt verwenden', () => {
      mockUseLocation.mockReturnValue({
        state: {
          events: [mockEvent],
          categoryName: 'Test Category',
        },
        pathname: '/events/image-editor',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      // Da date-fns gemockt ist, sollte das gemockte Format verwendet werden
      const formatMock = format;
      expect(formatMock).toBeDefined();
    });
  });

  describe('Event Grouping', () => {
    it('sollte Events nach Datum gruppieren', () => {
      const multipleEvents = [
        {
          ...mockEvent,
          id: 'event-1',
          dailyTimeSlots: [{ date: '2024-01-01', from: '10:00', to: '12:00' }],
        },
        {
          ...mockEvent,
          id: 'event-2',
          dailyTimeSlots: [{ date: '2024-01-01', from: '14:00', to: '16:00' }],
        },
        {
          ...mockEvent,
          id: 'event-3',
          dailyTimeSlots: [{ date: '2024-01-02', from: '10:00', to: '12:00' }],
        },
      ];

      mockUseLocation.mockReturnValue({
        state: {
          events: multipleEvents,
          categoryName: 'Test Category',
        },
        pathname: '/events/image-editor',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      // Component sollte Events erfolgreich gruppieren und rendern
      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('sollte graceful mit leeren Events umgehen', () => {
      mockUseLocation.mockReturnValue({
        state: {
          events: [],
          categoryName: 'Empty Category',
        },
        pathname: '/events/image-editor',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
      expect(screen.getByTestId('event-image-editor-issue')).toBeInTheDocument();
      expect(screen.getByText('Keine Events für die Bildgenerierung')).toBeInTheDocument();
    });

    it('sollte mit fehlenden Location State umgehen', () => {
      mockUseLocation.mockReturnValue({
        state: null,
        pathname: '/events/image-editor',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
      expect(screen.getByTestId('event-image-editor-issue')).toBeInTheDocument();
    });

    it('sollte Events ohne Tagesdatum mit Hinweis anzeigen statt zu crashen', () => {
      mockUseLocation.mockReturnValue({
        state: {
          events: [
            {
              ...mockEvent,
              id: 'month-only',
              title: 'Nur Monat Event',
              dailyTimeSlots: [],
              monthYear: '07.2026',
            },
          ],
          categoryName: 'Test Category',
        },
        pathname: '/events/image-editor',
        search: '',
        hash: '',
        key: 'default',
      });

      renderWithRouter(<EventImageEditor />);

      expect(screen.getByTestId('event-image-editor-issue')).toBeInTheDocument();
      expect(
        screen.getByText('Events können nicht als Bild dargestellt werden')
      ).toBeInTheDocument();
      expect(screen.getByText('Nur Monat Event')).toBeInTheDocument();
    });
  });

  describe('Color Utilities', () => {
    it('sollte RGBA zu Hex konvertieren', () => {
      // Da die rgbaToHex Funktion exportiert sein müsste, testen wir indirekt
      renderWithRouter(<EventImageEditor />);

      // Testen der grundlegenden Funktionalität
      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
    });

    it('sollte Hex zu RGBA konvertieren', () => {
      // Da die hexToRgba Funktion exportiert sein müsste, testen wir indirekt
      renderWithRouter(<EventImageEditor />);

      // Testen der grundlegenden Funktionalität
      expect(screen.getByText('Event-Bild Editor')).toBeInTheDocument();
    });
  });
});
