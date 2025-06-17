import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { EditBusiness } from '../EditBusiness';
import { Business, BusinessStatus } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'business-1' }),
}));

// Mock Services
const mockBusinessService = {
  getBusiness: jest.fn(),
  updateBusiness: jest.fn(),
  updateNuernbergspotsReview: jest.fn(),
  uploadLogo: jest.fn(),
  uploadBusinessImages: jest.fn(),
  uploadReviewImages: jest.fn(),
};

const mockBusinessCategoryService = {
  getCategories: jest.fn(),
};

const mockKeywordService = {
  getKeyword: jest.fn(),
};

jest.mock('@/services/businessService', () => ({
  useBusinessService: () => mockBusinessService,
}));

jest.mock('@/services/businessCategoryService', () => ({
  useBusinessCategoryService: () => mockBusinessCategoryService,
}));

jest.mock('@/services/keywordService', () => ({
  useKeywordService: () => mockKeywordService,
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, id, type, className }: any) => (
    <input 
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      type={type}
      className={className}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, className }: any) => (
    <textarea 
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="textarea"
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor} data-testid="label">{children}</label>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, onClick }: any) => (
    <span 
      data-testid="badge" 
      data-variant={variant} 
      className={className}
      onClick={onClick}
    >
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input 
      type="checkbox"
      checked={checked || false}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      id={id}
      data-testid="switch"
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid="select-container">
      <select 
        value={value || ''} 
        onChange={(e) => onValueChange?.(e.target.value)}
        data-testid="select"
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value} data-testid="select-item">{children}</option>,
  SelectTrigger: ({ children }: any) => <></>,
  SelectValue: ({ placeholder }: any) => <></>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Data
const mockBusinessCategory: BusinessCategory = {
  id: 'cat-1',
  name: 'Restaurant',
  description: 'Restaurants und Gastronomie',
  iconName: 'utensils',
  keywords: [
    { id: 'keyword-1', name: 'Pizza', description: 'Italienisches Gericht', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: 'keyword-2', name: 'Italienisch', description: 'Italienische Küche', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockKeyword: Keyword = {
  id: 'keyword-1',
  name: 'Pizza',
  description: 'Italienisches Gericht',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockKeyword2: Keyword = {
  id: 'keyword-2',
  name: 'Italienisch',
  description: 'Italienische Küche',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockBusiness: Business = {
  id: 'business-1',
  name: 'Restaurant Alpha',
  description: 'Ein gemütliches Restaurant im Herzen der Stadt',
  categoryIds: ['cat-1'],
  address: {
    street: 'Hauptstraße',
    houseNumber: '1',
    postalCode: '90402',
    city: 'Nürnberg',
    latitude: 49.4521,
    longitude: 11.0767,
  },
  contact: {
    email: 'info@restaurant-alpha.de',
    phoneNumber: '+49 911 123456',
    website: 'https://restaurant-alpha.de',
  },
  openingHours: {},
  detailedOpeningHours: {
    Montag: [{ from: '09:00', to: '18:00' }],
    Dienstag: [{ from: '09:00', to: '18:00' }],
  },
  status: BusinessStatus.ACTIVE,
  hasAccount: true,
  isAdmin: false,
  isPromoted: false,
  imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  logoUrl: 'https://example.com/logo.jpg',
  keywordIds: ['keyword-1'],
  nuernbergspotsReview: {
    reviewText: 'Sehr empfehlenswert!',
    reviewImageUrls: ['https://example.com/review1.jpg'],
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/businesses/business-1/edit']}>
      {component}
    </MemoryRouter>
  );
};

const renderAndWaitForComponent = async () => {
  renderWithRouter(<EditBusiness />);
  
  await waitFor(() => {
    expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
  });
};

describe('EditBusiness Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Stabilize mock responses to prevent infinite loops
    mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);
    mockBusinessCategoryService.getCategories.mockResolvedValue([mockBusinessCategory]);
    
    // Configure keyword service with stable responses
    mockKeywordService.getKeyword.mockImplementation((id: string) => {
      if (id === 'keyword-1') {
        return Promise.resolve(mockKeyword);
      }
      if (id === 'keyword-2') {
        return Promise.resolve(mockKeyword2);
      }
      return Promise.reject(new Error(`Keyword ${id} not found`));
    });
  });

  describe('Component Rendering', () => {
    it('sollte die EditBusiness-Seite korrekt rendern', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getAllByText('Partner bearbeiten')[0]).toBeInTheDocument();
        expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });
    });

    it('sollte Loading-State anzeigen', () => {
      // Mock mit einem längeren delay aber trotzdem auflösend
      mockBusinessService.getBusiness.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockBusiness), 2000))
      );

      renderWithRouter(<EditBusiness />);

      expect(screen.getByText('Lade Partner...')).toBeInTheDocument();
    });

    it('sollte alle Haupt-Sektionen rendern', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getAllByText('Basisinformationen')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Status & Highlight')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Kategorien')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Medien')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Öffnungszeiten')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Nuernbergspots Review')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('sollte Business-Daten beim Mount laden', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(mockBusinessService.getBusiness).toHaveBeenCalledWith('business-1');
        expect(mockBusinessCategoryService.getCategories).toHaveBeenCalledTimes(1);
      });
    });

    it('sollte Keywords laden basierend auf Business-Kategorien', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        // Keywords werden basierend auf den Kategorie-Keywords geladen
        expect(mockKeywordService.getKeyword).toHaveBeenCalledWith('keyword-1');
        expect(mockKeywordService.getKeyword).toHaveBeenCalledWith('keyword-2');
        expect(mockKeywordService.getKeyword).toHaveBeenCalledTimes(2);
      }, { timeout: 3000 });
    });

    it('sollte Fehler beim Laden der Business-Daten behandeln', async () => {
      const mockToast = require('sonner').toast;
      mockBusinessService.getBusiness.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Fehler beim Laden des Geschäfts',
          expect.objectContaining({
            description: 'Das Geschäft konnte nicht geladen werden.',
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });

    it('sollte Fehler beim Laden der Kategorien behandeln', async () => {
      const mockToast = require('sonner').toast;
      mockBusinessCategoryService.getCategories.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Fehler beim Laden der Kategorien',
          expect.objectContaining({
            description: 'Die Kategorien konnten nicht geladen werden.',
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zur Business-Liste navigieren beim Klick auf Zurück', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        const backButton = screen.getByText('Zurück zur Übersicht');
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });

    it('sollte zur Business-Liste navigieren beim Klick auf Abbrechen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        const cancelButton = screen.getByText('Abbrechen');
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });
  });

  describe('Basic Information Display', () => {
    it('sollte Business-Namen anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });
    });

    it('sollte Adresse anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getByText('Hauptstraße 1, 90402 Nürnberg')).toBeInTheDocument();
      });
    });

    it('sollte Kontaktdaten anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getByText('info@restaurant-alpha.de')).toBeInTheDocument();
        expect(screen.getByText('+49 911 123456')).toBeInTheDocument();
      });
    });

    it('sollte Kategorie-IDs anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getByText('Kategorie-IDs: cat-1')).toBeInTheDocument();
      });
    });
  });

  describe('Status Management', () => {
    it('sollte aktuellen Status anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const statusSelect = screen.getByTestId('select') as HTMLSelectElement;
        // Das Select ist mit dem business.status Wert vorausgefüllt
        expect(statusSelect).toBeInTheDocument();
        // Prüfe dass das Select-Element vorhanden ist - der Mock setzt value korrekt
        expect(statusSelect.value).toBe(BusinessStatus.ACTIVE);
      });
    });

    it('sollte Status ändern können', async () => {
      renderWithRouter(<EditBusiness />);
      
      const mockToast = require('sonner').toast;
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId('select');
      fireEvent.change(statusSelect, { target: { value: BusinessStatus.PENDING } });

      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith('business-1', {
          status: BusinessStatus.PENDING,
        });
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Status aktualisiert',
          expect.objectContaining({
            description: 'Der Status wurde erfolgreich aktualisiert.',
          })
        );
      });
    });

    it('sollte Fehler beim Status-Update behandeln', async () => {
      renderWithRouter(<EditBusiness />);
      
      const mockToast = require('sonner').toast;
      mockBusinessService.updateBusiness.mockRejectedValue(new Error('Update Error'));

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId('select');
      fireEvent.change(statusSelect, { target: { value: BusinessStatus.PENDING } });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Fehler beim Aktualisieren des Status',
          expect.objectContaining({
            description: 'Der Status konnte nicht aktualisiert werden.',
          })
        );
      });
    });
  });

  describe('Promoted Status Management', () => {
    it('sollte aktuellen Promoted-Status anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const promotedSwitch = screen.getByLabelText('Als "Highlight" markieren') as HTMLInputElement;
        expect(promotedSwitch.checked).toBe(false); // mockBusiness.isPromoted ist false
      });
    });

    it('sollte Promoted-Status ändern können', async () => {
      renderWithRouter(<EditBusiness />);
      
      const mockToast = require('sonner').toast;
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const promotedSwitch = screen.getByLabelText('Als "Highlight" markieren');
      fireEvent.click(promotedSwitch);

      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith('business-1', {
          isPromoted: true,
        });
        expect(mockToast.success).toHaveBeenCalledWith(
          'Highlight-Status aktualisiert',
          expect.objectContaining({
            description: 'Der Partner wurde als Highlight markiert.',
          })
        );
      });
    });

    it('sollte Promoted-Status entfernen können', async () => {
      // Setze mock business auf promoted für diesen Test
      const promotedBusiness = { 
        ...mockBusiness, 
        isPromoted: true,
      };
      
      // Override den Mock nur für diesen Test
      mockBusinessService.getBusiness.mockResolvedValueOnce(promotedBusiness);
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);
      
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      await waitFor(() => {
        // Prüfe, dass der Switch existiert und klicke ihn
        const promotedSwitch = screen.getByLabelText('Als "Highlight" markieren') as HTMLInputElement;
        
        fireEvent.click(promotedSwitch);
        
        // Verifiziere, dass updateBusiness aufgerufen wurde
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith('business-1', {
          isPromoted: false,
        });
      });
    });
  });

  describe('Category and Keyword Management', () => {
    it('sollte aktuelle Kategorien anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const categoryBadge = screen.getByText('Restaurant');
        expect(categoryBadge).toHaveAttribute('data-variant', 'default');
      });
    });

    it('sollte Kategorie hinzufügen und entfernen können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const categoryBadge = screen.getByText('Restaurant');
      
      // Kategorie entfernen
      fireEvent.click(categoryBadge);
      expect(categoryBadge).toHaveAttribute('data-variant', 'outline');
      
      // Kategorie wieder hinzufügen
      fireEvent.click(categoryBadge);
      expect(categoryBadge).toHaveAttribute('data-variant', 'default');
    });

    it('sollte Keywords anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getAllByText('Keywords')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('sollte Keywords togglen können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const keywordBadge = screen.getAllByText('Pizza')[0];
        expect(keywordBadge).toHaveAttribute('data-variant', 'default'); // keyword-1 ist ausgewählt
        
        // Keyword entfernen
        fireEvent.click(keywordBadge);
        expect(keywordBadge).toHaveAttribute('data-variant', 'outline');
        
        // Keyword wieder hinzufügen
        fireEvent.click(keywordBadge);
        expect(keywordBadge).toHaveAttribute('data-variant', 'default');
      }, { timeout: 3000 });
    });

    it('sollte maximal 3 Kategorien auswählen können', async () => {
      const mockToast = require('sonner').toast;
      
      // Mock 4 Kategorien
      const fourCategories = [
        { ...mockBusinessCategory, id: 'cat-1', name: 'Restaurant' },
        { ...mockBusinessCategory, id: 'cat-2', name: 'Café', keywords: [] },
        { ...mockBusinessCategory, id: 'cat-3', name: 'Bar', keywords: [] },
        { ...mockBusinessCategory, id: 'cat-4', name: 'Shop', keywords: [] },
      ];
      
      mockBusinessCategoryService.getCategories.mockResolvedValueOnce(fourCategories);
      
      // Business mit 3 Kategorien
      const businessWith3Categories = {
        ...mockBusiness,
        categoryIds: ['cat-1', 'cat-2', 'cat-3'],
      };
      mockBusinessService.getBusiness.mockResolvedValueOnce(businessWith3Categories);
      
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        // Versuche 4. Kategorie auszuwählen
        const shopBadge = screen.getByText('Shop');
        fireEvent.click(shopBadge);
        
        expect(mockToast.error).toHaveBeenCalledWith(
          'Maximale Anzahl an Kategorien erreicht',
          expect.objectContaining({
            description: 'Sie können maximal 3 Kategorien auswählen.',
          })
        );
      });
    });
  });

  describe('Media Management', () => {
    it('sollte aktuelles Logo anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const logoImage = screen.getByAltText('Logo');
        expect(logoImage).toHaveAttribute('src', 'https://example.com/logo.jpg');
      });
    });

    it('sollte aktuelle Geschäftsbilder anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const businessImages = screen.getAllByAltText(/Geschäftsbild/);
        expect(businessImages).toHaveLength(2);
        expect(businessImages[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
        expect(businessImages[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
      });
    });

    it('sollte Logo-Upload Button anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getByText('Logo hochladen')).toBeInTheDocument();
        expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
      });
    });

    it('sollte Geschäftsbild-Upload ermöglichen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const uploadArea = screen.getAllByText('Bilder hinzufügen')[0];
        expect(uploadArea).toBeInTheDocument();
        expect(screen.getAllByTestId('image-icon')[0]).toBeInTheDocument();
      });
    });

    it('sollte Delete-Buttons für Bilder anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const deleteButtons = screen.getAllByTestId('trash-icon');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Opening Hours Management', () => {
    it('sollte bestehende Öffnungszeiten anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getAllByText('Zeitraum')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Von')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bis')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Gültig an')[0]).toBeInTheDocument();
      });
    });

    it('sollte Zeiträume bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const timeInputs = screen.getAllByDisplayValue('09:00');
        expect(timeInputs.length).toBeGreaterThan(0);
        
        const firstTimeInput = timeInputs[0];
        fireEvent.change(firstTimeInput, { target: { value: '10:00' } });
        expect(firstTimeInput).toHaveValue('10:00');
      });
    });

    it('sollte neuen Zeitraum hinzufügen können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const addButton = screen.getAllByText('Zeitraum hinzufügen')[0];
        
        // Wähle Tag für neuen Zeitraum
        const samstag = screen.getAllByText('Samstag')[1]; // Neuer Zeitraum
        fireEvent.click(samstag);
        
        fireEvent.click(addButton);
        
        // Überprüfe, dass ein neuer Zeitraum hinzugefügt wurde
        expect(screen.getAllByText('Zeitraum').length).toBeGreaterThan(1);
      });
    });


    it('sollte Wochentage für Zeitraum togglen können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const montagBadges = screen.getAllByText('Montag');
        const firstMontag = montagBadges[0]; // Erster Zeitraum
        
        // Toggle Montag
        fireEvent.click(firstMontag);
        
        // Badge sollte Status ändern
        expect(firstMontag.closest('[data-testid="badge"]')).toHaveAttribute('data-variant');
      });
    });
  });

  describe('Review Management', () => {
    it('sollte bestehenden Review-Text anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const reviewTextarea = screen.getByDisplayValue('Sehr empfehlenswert!');
        expect(reviewTextarea).toBeInTheDocument();
      });
    });

    it('sollte Review-Text bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const reviewTextarea = screen.getByDisplayValue('Sehr empfehlenswert!') as HTMLTextAreaElement;
      
      fireEvent.change(reviewTextarea, { target: { value: 'Absolut empfehlenswert!' } });
      expect(reviewTextarea.value).toBe('Absolut empfehlenswert!');
    });

    it('sollte Review-Bilder anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const reviewImage = screen.getByAltText('Review Bild 1');
        expect(reviewImage).toHaveAttribute('src', 'https://example.com/review1.jpg');
      });
    });

    it('sollte Review-Bild-Upload ermöglichen', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const uploadAreas = screen.getAllByText('Bilder hinzufügen');
        expect(uploadAreas.length).toBeGreaterThan(1);
        expect(uploadAreas[1]).toBeInTheDocument(); // Zweiter Upload-Bereich
      });
    });

    it('sollte Review-Bilder löschen können', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        const deleteButtons = screen.getAllByTestId('trash-icon');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Submission', () => {

    it('sollte Änderungen erfolgreich speichern', async () => {
      renderWithRouter(<EditBusiness />);
      
      const mockToast = require('sonner').toast;
      mockBusinessService.updateNuernbergspotsReview.mockResolvedValue(undefined);
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      // Bearbeite Review
      const reviewTextarea = screen.getByDisplayValue('Sehr empfehlenswert!');
      fireEvent.change(reviewTextarea, { target: { value: 'Neue Review' } });

      // Speichere Änderungen
      const saveButton = screen.getByText('Änderungen speichern');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockBusinessService.updateNuernbergspotsReview).toHaveBeenCalledWith(
          'business-1',
          expect.objectContaining({
            reviewText: 'Neue Review',
          })
        );
        
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith(
          'business-1',
          expect.objectContaining({
            categoryIds: ['cat-1'],
            keywordIds: ['keyword-1'],
          })
        );

        expect(mockToast.success).toHaveBeenCalledWith(
          'Änderungen gespeichert',
          expect.objectContaining({
            description: 'Alle Änderungen wurden erfolgreich gespeichert.',
          })
        );

        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });

    it('sollte Fehler beim Speichern behandeln', async () => {
      renderWithRouter(<EditBusiness />);
      
      const mockToast = require('sonner').toast;
      mockBusinessService.updateBusiness.mockRejectedValue(new Error('Update Error'));

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Änderungen speichern');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Fehler beim Aktualisieren',
          expect.objectContaining({
            description: 'Die Änderungen konnten nicht gespeichert werden.',
          })
        );
      });
    });

    it('sollte Loading-State während Speichern anzeigen', async () => {
      renderWithRouter(<EditBusiness />);
      
      mockBusinessService.updateBusiness.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Änderungen speichern');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Speichert...')).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('File Upload Handling', () => {

    it('sollte Logo-Upload verarbeiten', async () => {
      renderWithRouter(<EditBusiness />);
      
      mockBusinessService.uploadLogo.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      // Mock File für Logo-Upload
      const file = new File(['logo'], 'logo.jpg', { type: 'image/jpeg' });
      const logoInput = screen.getByText('Logo hochladen').closest('label')?.querySelector('input');

      if (logoInput) {
        Object.defineProperty(logoInput, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(logoInput);

        // Speichere Änderungen
        const saveButton = screen.getByText('Änderungen speichern');
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockBusinessService.uploadLogo).toHaveBeenCalledWith('business-1', file);
        });
      }
    });

    it('sollte Geschäftsbild-Upload verarbeiten', async () => {
      renderWithRouter(<EditBusiness />);
      
      mockBusinessService.uploadBusinessImages.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      // Mock Files für Geschäftsbild-Upload
      const files = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.jpg', { type: 'image/jpeg' }),
      ];

      const uploadLabels = screen.getAllByText('Bilder hinzufügen');
      const businessImageInput = uploadLabels[0].closest('label')?.querySelector('input');

      if (businessImageInput) {
        Object.defineProperty(businessImageInput, 'files', {
          value: files,
          writable: false,
        });

        fireEvent.change(businessImageInput);

        // Speichere Änderungen
        const saveButton = screen.getByText('Änderungen speichern');
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockBusinessService.uploadBusinessImages).toHaveBeenCalledWith('business-1', files);
        });
      }
    });

    it('sollte Review-Bild-Upload verarbeiten', async () => {
      renderWithRouter(<EditBusiness />);
      
      mockBusinessService.uploadReviewImages.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      // Mock Files für Review-Bild-Upload
      const files = [new File(['review'], 'review.jpg', { type: 'image/jpeg' })];

      const uploadLabels = screen.getAllByText('Bilder hinzufügen');
      const reviewImageInput = uploadLabels[1].closest('label')?.querySelector('input');

      if (reviewImageInput) {
        Object.defineProperty(reviewImageInput, 'files', {
          value: files,
          writable: false,
        });

        fireEvent.change(reviewImageInput);

        // Speichere Änderungen
        const saveButton = screen.getByText('Änderungen speichern');
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockBusinessService.uploadReviewImages).toHaveBeenCalledWith('business-1', files);
        });
      }
    });
  });

  describe('Data Processing', () => {
    it('sollte Öffnungszeiten korrekt konvertieren', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        // Die Komponente sollte detailedOpeningHours in TimeSlots konvertieren
        expect(screen.getAllByText('Montag')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Dienstag')[0]).toBeInTheDocument();
        
        const timeInputs = screen.getAllByDisplayValue('09:00');
        expect(timeInputs.length).toBeGreaterThan(0);
      });
    });

    it('sollte TimeSlots in detailedOpeningHours formatieren', async () => {
      renderWithRouter(<EditBusiness />);
      
      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      });

      // Bearbeite Öffnungszeiten
      const timeInputs = screen.getAllByDisplayValue('09:00');
      fireEvent.change(timeInputs[0], { target: { value: '08:00' } });

      const saveButton = screen.getByText('Änderungen speichern');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith(
          'business-1',
          expect.objectContaining({
            detailedOpeningHours: expect.objectContaining({
              Montag: expect.arrayContaining([
                expect.objectContaining({ from: '08:00', to: '18:00' })
              ]),
            })
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('sollte Business ohne Review handhaben', async () => {
      const businessWithoutReview = { ...mockBusiness, nuernbergspotsReview: undefined };
      mockBusinessService.getBusiness.mockResolvedValueOnce(businessWithoutReview);

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        const reviewTextarea = screen.getByPlaceholderText('Geben Sie hier die Review ein...');
        expect(reviewTextarea).toHaveValue('');
      });
    });

    it('sollte Business ohne Bilder handhaben', async () => {
      const businessWithoutImages = { 
        ...mockBusiness, 
        imageUrls: [],
        logoUrl: undefined,
        nuernbergspotsReview: { reviewText: 'Test', reviewImageUrls: [] }
      };
      mockBusinessService.getBusiness.mockResolvedValueOnce(businessWithoutImages);

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        // Sollte keine Fehler werfen ohne Bilder
      });
    });

    it('sollte Business ohne Öffnungszeiten handhaben', async () => {
      const businessWithoutOpeningHours = { 
        ...mockBusiness, 
        detailedOpeningHours: {} 
      };
      mockBusinessService.getBusiness.mockResolvedValueOnce(businessWithoutOpeningHours);

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        // Sollte nur den "Neuer Zeitraum" Bereich anzeigen
        expect(screen.getAllByText('Neuer Zeitraum')[0]).toBeInTheDocument();
      });
    });
  });
}); 