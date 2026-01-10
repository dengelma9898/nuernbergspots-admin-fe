import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { EventScraper } from '../EventScraper';
import { Event } from '@/models/events';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
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

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, onBlur, placeholder, className, disabled, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className, ...props }: any) => (
    <label htmlFor={htmlFor} className={className} {...props}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id, disabled, ...props }: any) => (
    <input
      type="checkbox"
      data-testid="switch"
      id={id}
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className, ...props }: any) => (
    <div data-testid="alert" className={className} {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div data-testid="alert-description" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/loading-overlay', () => ({
  LoadingOverlay: ({ children, isLoading }: any) => (
    <div data-testid="loading-overlay" data-loading={isLoading}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}));

jest.mock('@/components/events/ScraperEventCard', () => ({
  ScraperEventCard: ({ event, onEdit, onDelete }: any) => (
    <div data-testid="scraper-event-card" data-event-id={event.id}>
      <div>{event.title}</div>
      <button onClick={() => onEdit(event)}>Edit</button>
      <button onClick={() => onDelete(event.id)}>Delete</button>
    </div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
}));

const mockEvent: Event = {
  id: 'scraped-event-1',
  title: 'Scraped Test Event',
  description: 'Scraped Description',
  dailyTimeSlots: [
    {
      date: '2024-01-01',
      from: '10:00',
      to: '18:00',
    },
  ],
  location: {
    address: 'Scraped Address, Nürnberg',
    latitude: 49.4521,
    longitude: 11.0767,
  },
  price: 15.0,
  ticketsNeeded: false,
  isPromoted: false,
  categoryId: 'konzert', // Gültige Kategorie, die in Mock-Kategorien existiert
  contactEmail: 'scraped@example.com',
  contactPhone: '+49 911 987654',
  website: 'https://scraped-event.de',
  titleImageUrl: 'https://example.com/scraped.jpg',
  imageUrls: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockEventService = {
  scrapeEventsWithLlm: jest.fn(),
  scrapeEventsFromEventFinder: jest.fn(), // Deprecated, but kept for compatibility
};

const mockEventCategoryService = {
  getCategories: jest.fn(),
};

const mockNavigate = jest.fn();
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EventScraper Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);

    require('@/services/eventService').useEventService.mockReturnValue(mockEventService);
    require('@/services/eventCategoryService').useEventCategoryService.mockReturnValue(
      mockEventCategoryService
    );
    // Mock-Kategorien: Standard-Kategorien, die im System existieren
    mockEventCategoryService.getCategories.mockResolvedValue([
      { id: 'konzert', name: 'Konzert', description: '', colorCode: '#000000', iconName: '', createdAt: '', updatedAt: '' },
      { id: 'party', name: 'Party', description: '', colorCode: '#000000', iconName: '', createdAt: '', updatedAt: '' },
      { id: 'kultur', name: 'Kultur', description: '', colorCode: '#000000', iconName: '', createdAt: '', updatedAt: '' },
    ]);
    mockEventService.scrapeEventsWithLlm.mockResolvedValue([mockEvent]);
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Component Rendering', () => {
    it('sollte EventScraper korrekt rendern', () => {
      renderWithRouter(<EventScraper />);

      expect(screen.getByText('Event Scraper')).toBeInTheDocument();
      expect(screen.getByText('Zurück zur Event-Liste')).toBeInTheDocument();
      expect(screen.getByText('Events importieren')).toBeInTheDocument();
    });

    it('sollte URL-Input-Feld anzeigen', () => {
      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      expect(urlInput).toBeInTheDocument();
      expect(urlInput).toHaveAttribute('type', 'url');
    });


    it('sollte Info-Alert über Event-Extraktion anzeigen', () => {
      renderWithRouter(<EventScraper />);

      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText(/Das System erkennt automatisch Events/i)).toBeInTheDocument();
    });
  });

  describe('URL Input', () => {
    it('sollte URL-Eingabe akzeptieren', () => {
      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      expect(urlInput).toHaveValue('https://eventfinder.de/nuernberg');
    });

    it('sollte URL-Validierung durchführen', () => {
      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

      expect(screen.getByText(/Bitte geben Sie eine gültige URL ein/i)).toBeInTheDocument();
    });

    it('sollte Fehler bei ungültiger URL anzeigen', () => {
      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'not-a-url' } });
      fireEvent.blur(urlInput);

      expect(screen.getByText(/Bitte geben Sie eine gültige URL ein/i)).toBeInTheDocument();
    });

    it('sollte gültige URLs akzeptieren', () => {
      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      expect(screen.queryByText(/Bitte geben Sie eine gültige URL ein/i)).not.toBeInTheDocument();
    });
  });


  describe('Navigation', () => {
    it('sollte zur Event-Liste navigieren beim Zurück-Button', () => {
      renderWithRouter(<EventScraper />);

      const backButton = screen.getByText('Zurück zur Event-Liste');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/events');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('scraperFoundEvents');
    });
  });

  describe('Event Scraping', () => {
    it('sollte Events erfolgreich scrapen mit gültiger URL', async () => {
      renderWithRouter(<EventScraper />);

      // Warte auf Kategorien-Laden
      await waitFor(() => {
        expect(mockEventCategoryService.getCategories).toHaveBeenCalled();
      });

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).toHaveBeenCalledWith(
          'https://eventfinder.de/nuernberg',
          false
        );
      });
    });

    it('sollte categoryId entfernen, wenn Kategorie nicht existiert', async () => {
      // Event mit ungültiger categoryId
      const eventWithInvalidCategory: Event = {
        ...mockEvent,
        categoryId: 'ungueltige-kategorie-id',
      };
      mockEventService.scrapeEventsWithLlm.mockResolvedValue([eventWithInvalidCategory]);

      renderWithRouter(<EventScraper />);

      // Warte auf Kategorien-Laden
      await waitFor(() => {
        expect(mockEventCategoryService.getCategories).toHaveBeenCalled();
      });

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).toHaveBeenCalled();
      });

      // Prüfe, dass das Event ohne categoryId gespeichert wurde
      await waitFor(() => {
        const savedEvents = JSON.parse(mockLocalStorage.setItem.mock.calls.find(
          call => call[0] === 'scraperFoundEvents'
        )?.[1] || '[]');
        expect(savedEvents[0].categoryId).toBeUndefined();
      });
    });

    it('sollte categoryId behalten, wenn Kategorie existiert', async () => {
      // Event mit gültiger categoryId
      const eventWithValidCategory: Event = {
        ...mockEvent,
        categoryId: 'konzert', // Existiert in den Mock-Kategorien
      };
      mockEventService.scrapeEventsWithLlm.mockResolvedValue([eventWithValidCategory]);

      renderWithRouter(<EventScraper />);

      // Warte auf Kategorien-Laden
      await waitFor(() => {
        expect(mockEventCategoryService.getCategories).toHaveBeenCalled();
      });

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).toHaveBeenCalled();
      });

      // Prüfe, dass das Event mit categoryId gespeichert wurde
      await waitFor(() => {
        const savedEvents = JSON.parse(mockLocalStorage.setItem.mock.calls.find(
          call => call[0] === 'scraperFoundEvents'
        )?.[1] || '[]');
        expect(savedEvents[0].categoryId).toBe('konzert');
      });
    });


    it('sollte nicht scrapen wenn URL leer ist', async () => {
      renderWithRouter(<EventScraper />);

      const scrapeButton = screen.getByText('Events suchen');
      // Versuche zu klicken
      fireEvent.click(scrapeButton);

      // Warte kurz, um sicherzustellen, dass kein Service-Aufruf erfolgt
      await new Promise(resolve => setTimeout(resolve, 100));

      // Service sollte nicht aufgerufen werden, da URL leer ist
      expect(mockEventService.scrapeEventsWithLlm).not.toHaveBeenCalled();
    });

    it('sollte nicht scrapen wenn URL ungültig ist', async () => {
      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

      // Warte bis Fehler angezeigt wird
      await waitFor(() => {
        expect(screen.getByText(/Bitte geben Sie eine gültige URL ein/i)).toBeInTheDocument();
      });

      const scrapeButton = screen.getByText('Events suchen');
      // Versuche zu klicken (sollte nichts tun wegen Validierung)
      fireEvent.click(scrapeButton);

      // Service sollte nicht aufgerufen werden
      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).not.toHaveBeenCalled();
      });
    });

    it('sollte Fehler beim Scrapen behandeln', async () => {
      mockEventService.scrapeEventsWithLlm.mockRejectedValue(new Error('Scraping Error'));

      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).toHaveBeenCalled();
      });
    });

    it('sollte Loading State während Scraping anzeigen', async () => {
      mockEventService.scrapeEventsWithLlm.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([mockEvent]), 100))
      );

      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      // LoadingOverlay sollte aktiv sein
      const loadingOverlay = screen.getByTestId('loading-overlay');
      expect(loadingOverlay).toHaveAttribute('data-loading', 'true');

      await waitFor(() => {
        expect(loadingOverlay).toHaveAttribute('data-loading', 'false');
      });
    });

    it('sollte Bestätigungsdialog anzeigen wenn Events bereits vorhanden', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockEvent]));

      renderWithRouter(<EventScraper />);

      // Warte bis Events geladen sind
      await waitFor(() => {
        expect(screen.getByTestId('scraper-event-card')).toBeInTheDocument();
      });

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      // Dialog sollte angezeigt werden
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Local Storage', () => {
    it('sollte Events aus localStorage laden', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockEvent]));

      renderWithRouter(<EventScraper />);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('scraperFoundEvents');
    });

    it('sollte Events in localStorage speichern', async () => {
      renderWithRouter(<EventScraper />);

      // Warte auf Kategorien-Laden
      await waitFor(() => {
        expect(mockEventCategoryService.getCategories).toHaveBeenCalled();
      });

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        // mockEvent hat categoryId: 'konzert', die existiert, also wird sie behalten
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'scraperFoundEvents',
          JSON.stringify([mockEvent])
        );
      });
    });

    it('sollte mit ungültigen localStorage Daten umgehen', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      renderWithRouter(<EventScraper />);

      // Component sollte ohne Fehler rendern
      expect(screen.getByText('Event Scraper')).toBeInTheDocument();
    });
  });

  describe('Event Management', () => {
    it('sollte alle Events löschen', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockEvent]));

      renderWithRouter(<EventScraper />);

      await waitFor(() => {
        expect(screen.getByTestId('scraper-event-card')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Alle löschen');
      fireEvent.click(clearButton);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('scraperFoundEvents');
    });
  });

  describe('Error Handling', () => {
    it('sollte graceful mit Network-Fehlern umgehen', async () => {
      mockEventService.scrapeEventsWithLlm.mockRejectedValue(new Error('Network Error'));

      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).toHaveBeenCalled();
      });
    });

    it('sollte mit leeren Ergebnissen umgehen', async () => {
      mockEventService.scrapeEventsWithLlm.mockResolvedValue([]);

      renderWithRouter(<EventScraper />);

      const urlInput = screen.getByPlaceholderText('https://eventfinder.de/nuernberg');
      fireEvent.change(urlInput, { target: { value: 'https://eventfinder.de/nuernberg' } });

      const scrapeButton = screen.getByText('Events suchen');
      fireEvent.click(scrapeButton);

      await waitFor(() => {
        expect(mockEventService.scrapeEventsWithLlm).toHaveBeenCalled();
      });
    });
  });
});
