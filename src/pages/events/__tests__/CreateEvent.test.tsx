import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CreateEvent } from '../CreateEvent';
import { useEventService } from '../../../services/eventService';
import { useEventCategoryService } from '../../../services/eventCategoryService';
import { EventCategory } from '../../../models/event-category';
import '@testing-library/jest-dom/vitest';
import { expectToastErrorTitleContains } from '@/test-utils/sonnerAssertions';

// Mock alle externen Dependencies
vi.mock('../../../lib/api', async () => ({
  apiRequest: vi.fn(),
}));
vi.mock('../../../services/eventService');
vi.mock('../../../services/eventCategoryService');
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
}));

// Mock shadcn/ui components
vi.mock('@/components/ui/card', async () => ({
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
}));

vi.mock('@/components/ui/button', async () => ({
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

vi.mock('@/components/ui/input', async () => ({
  Input: ({ value, onChange, placeholder, type, id, className }: any) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="input"
    />
  ),
}));

vi.mock('@/components/ui/textarea', async () => ({
  Textarea: ({ value, onChange, placeholder, id, className }: any) => (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="textarea"
    />
  ),
}));

vi.mock('@/components/ui/label', async () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/switch', async () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      data-testid="switch"
    />
  ),
}));

vi.mock('@/components/ui/select', async () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange?.('test-category-id')}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <div className={className} data-testid="select-trigger">
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

vi.mock('@/components/ui/LocationSearch', async () => ({
  LocationSearch: ({ value, onChange, placeholder }: any) => (
    <div
      data-testid="location-search"
      onClick={() =>
        onChange?.({
          id: 'test-location',
          title: 'Test Location',
          resultType: 'place',
          position: { lat: 49.4521, lng: 11.0767 },
          address: { label: 'Teststraße 1, 90402 Nürnberg' },
        })
      }
    >
      {placeholder}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', async () => ({
  ...(await vi.importActual('lucide-react')),
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
}));

// Mock Sonner toast
vi.mock('sonner', async () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock date-fns functions
vi.mock('date-fns', async () => ({
  format: (date: Date, formatString: string, options?: any) => {
    if (formatString === 'EEEE, dd.MM.yyyy') {
      return 'Montag, 15.01.2024';
    }
    if (formatString === 'yyyy-MM-dd') {
      return '2024-01-15';
    }
    return '15. Januar 2024';
  },
  eachDayOfInterval: vi.fn(() => [new Date('2024-01-15'), new Date('2024-01-16')]),
  parseISO: vi.fn(date => new Date(date)),
}));

// Mock icon utils
vi.mock('@/utils/iconUtils', async () => ({
  getIconComponent: vi.fn(() => <div data-testid="icon-component">Icon</div>),
}));

const mockNavigate = vi.fn();
const mockEventService = {
  createEvent: vi.fn(),
};
const mockEventCategoryService = {
  getCategories: vi.fn(),
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CreateEvent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(useNavigate) as Mock).mockReturnValue(mockNavigate);
    (useEventService as Mock).mockReturnValue(mockEventService);
    (useEventCategoryService as Mock).mockReturnValue(mockEventCategoryService);

    mockEventCategoryService.getCategories.mockResolvedValue([mockEventCategory]);
    mockEventService.createEvent.mockResolvedValue({ id: 'new-event-id' });
  });

  describe('Component Rendering', () => {
    it('sollte die CreateEvent Komponente korrekt rendern', async () => {
      renderWithRouter(<CreateEvent />);

      expect(screen.getByText('Neues Event erstellen')).toBeInTheDocument();
      expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      expect(screen.getByText('Event Details')).toBeInTheDocument();
    });

    it('sollte alle erforderlichen Formularfelder rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Titel')).toBeInTheDocument();
        expect(screen.getByText('Beschreibung')).toBeInTheDocument();
        expect(screen.getByText('Startdatum')).toBeInTheDocument();
        expect(screen.getByText('Enddatum')).toBeInTheDocument();
        expect(screen.getByText('Adresse')).toBeInTheDocument();
        expect(screen.getByText('Preis')).toBeInTheDocument();
        expect(screen.getByText('Kategorie')).toBeInTheDocument();
      });
    });

    it('sollte Switches für Tickets und Promoted rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Tickets erforderlich')).toBeInTheDocument();
        expect(screen.getByText('Als "Highlight" markieren')).toBeInTheDocument();
      });
    });

    it('sollte Kontaktinformations-Felder rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Kontaktinformationen')).toBeInTheDocument();
        expect(screen.getByText('E-Mail')).toBeInTheDocument();
        expect(screen.getByText('Telefon')).toBeInTheDocument();
        expect(screen.getByText('Website')).toBeInTheDocument();
        expect(screen.getByText('Social Media')).toBeInTheDocument();
      });
    });

    it('sollte Action-Buttons rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Abbrechen')).toBeInTheDocument();
        expect(screen.getByText('Event erstellen')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('sollte Kategorien beim Mount laden', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(mockEventCategoryService.getCategories).toHaveBeenCalledTimes(1);
      });
      await waitFor(() => {
        expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'cat-1');
      });
    });

    it('sollte erste Kategorie als Standard setzen', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'cat-1');
      });
    });

    it('sollte Fehler beim Laden der Kategorien behandeln', async () => {
      const mockToast = toast;
      mockEventCategoryService.getCategories.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Laden der Kategorien');
      });
    });
  });

  describe('Form Input Handling', () => {
    it('sollte Titel-Input korrekt verwalten', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(document.getElementById('title')).toBeTruthy();
      });
      const titleInput = document.getElementById('title') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Mein neues Event' } });
      expect(titleInput).toHaveValue('Mein neues Event');
    });

    it('sollte Beschreibung korrekt verwalten', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(document.getElementById('description')).toBeTruthy();
      });
      const descriptionTextarea = document.getElementById('description') as HTMLTextAreaElement;
      fireEvent.change(descriptionTextarea, { target: { value: 'Event Beschreibung' } });
      expect(descriptionTextarea).toHaveValue('Event Beschreibung');
    });

    it('sollte Preis-Input korrekt verwalten', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(document.getElementById('priceString')).toBeTruthy();
      });
      const priceInput = document.getElementById('priceString') as HTMLInputElement;
      fireEvent.change(priceInput, { target: { value: '25.50' } });
      expect(priceInput).toHaveValue('25.50');
    });

    it('sollte Tickets Switch korrekt verwalten', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(document.getElementById('ticketsNeeded')).toBeTruthy();
      });
      const ticketsSwitch = document.getElementById('ticketsNeeded') as HTMLInputElement;
      fireEvent.change(ticketsSwitch, { target: { checked: true } });
      expect(ticketsSwitch).toBeChecked();
    });
  });

  describe('Location Handling', () => {
    it('sollte Location Search Component rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByTestId('location-search')).toBeInTheDocument();
      });
    });

    it('sollte Location-Auswahl korrekt verarbeiten', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByTestId('location-search')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId('location-search'));
    });
  });

  describe('Navigation', () => {
    it('sollte zur Event-Übersicht navigieren beim Zurück-Button', async () => {
      renderWithRouter(<CreateEvent />);

      const backButton = screen.getByText('Zurück zur Übersicht');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });

    it('sollte zur Event-Übersicht navigieren beim Abbrechen', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Abbrechen'));
      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  describe('Form Submission', () => {
    it('sollte Event erfolgreich erstellen', async () => {
      const mockToast = toast;
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Event erstellen')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Event erstellen'));

      await waitFor(() => {
        expect(mockEventService.createEvent).toHaveBeenCalled();
        expect(mockToast.success).toHaveBeenCalledWith(
          'Event erstellt',
          expect.objectContaining({
            description: expect.stringContaining('erstellt'),
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/events');
      });
    });

    it('sollte Fehler beim Erstellen behandeln', async () => {
      const mockToast = toast;
      mockEventService.createEvent.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Event erstellen')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Event erstellen'));

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Speichern des Events');
      });
    });

    it('sollte Loading-State während Erstellung anzeigen', async () => {
      let resolveCreate: any;
      mockEventService.createEvent.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveCreate = resolve;
          })
      );

      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Event erstellen')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Event erstellen'));

      await waitFor(() => {
        expect(screen.getByText('Wird erstellt...')).toBeInTheDocument();
      });

      resolveCreate({ id: 'new-event' });
      await waitFor(() => {
        expect(screen.queryByText('Wird erstellt...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Time Slots Generation', () => {
    it('sollte Zeitfenster generieren bei Datums-Änderung', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(document.getElementById('startDate')).toBeTruthy();
        expect(document.getElementById('endDate')).toBeTruthy();
      });
      const startDateInput = document.getElementById('startDate') as HTMLInputElement;
      fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
      const endDateInput = document.getElementById('endDate') as HTMLInputElement;
      fireEvent.change(endDateInput, { target: { value: '2024-01-16' } });

      await waitFor(() => {
        expect(screen.getByText('Tägliche Zeitangaben (optional)')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Information', () => {
    it('sollte Kontakt-E-Mail Input rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('kontakt@beispiel.de')).toBeInTheDocument();
      });
    });

    it('sollte Telefon Input rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('+49 123 4567890')).toBeInTheDocument();
      });
    });

    it('sollte Website Input rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('https://www.beispiel.de')).toBeInTheDocument();
      });
    });

    it('sollte Social Media Inputs rendern', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(screen.getByText('Instagram')).toBeInTheDocument();
        expect(screen.getByText('Facebook')).toBeInTheDocument();
        expect(screen.getByText('TikTok')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('sollte alle Formularfelder mit Standardwerten initialisieren', async () => {
      renderWithRouter(<CreateEvent />);

      await waitFor(() => {
        expect(document.getElementById('title')).toBeTruthy();
      });
      const titleInput = document.getElementById('title') as HTMLInputElement;
      expect(titleInput).toHaveValue('');
    });
  });
});
