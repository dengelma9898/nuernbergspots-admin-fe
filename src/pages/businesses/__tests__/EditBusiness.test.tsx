import { toast } from 'sonner';
import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { EditBusiness } from '../EditBusiness';
import { Business, BusinessStatus } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import {
  expectToastErrorTitleContains,
  expectToastSuccessTitle,
} from '@/test-utils/sonnerAssertions';

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'business-1' }),
}));

// Mock Services
const mockBusinessService = {
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
  updateNuernbergspotsReview: vi.fn(),
  uploadLogo: vi.fn(),
  uploadBusinessImages: vi.fn(),
  uploadReviewImages: vi.fn(),
};

const mockBusinessCategoryService = {
  getCategories: vi.fn(),
};

const mockKeywordService = {
  getKeyword: vi.fn(),
};

vi.mock('@/services/businessService', async () => ({
  useBusinessService: () => mockBusinessService,
}));

vi.mock('@/services/businessCategoryService', async () => ({
  useBusinessCategoryService: () => mockBusinessCategoryService,
}));

vi.mock('@/services/keywordService', async () => ({
  useKeywordService: () => mockKeywordService,
}));

// Mock UI Components
vi.mock('@/components/ui/card', async () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
}));

vi.mock('@/components/ui/button', async () => ({
  buttonVariants: vi.fn((props: { variant?: string } = {}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium';
    const variantClasses: Record<string, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary',
    };
    const variant = props.variant || 'default';
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default}`;
  }),
  Button: ({ children, onClick, variant, disabled, className, type, ...rest }: any) => (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      {...rest}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', async () => ({
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

vi.mock('@/components/ui/textarea', async () => ({
  Textarea: ({ value, onChange, placeholder, className, id }: any) => (
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

vi.mock('@/components/ui/badge', async () => ({
  Badge: ({ children, variant, className, onClick }: any) => (
    <span data-testid="badge" data-variant={variant} className={className} onClick={onClick}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/switch', async () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      checked={checked || false}
      onChange={e => onCheckedChange?.(e.target.checked)}
      id={id}
      data-testid="switch"
    />
  ),
}));

vi.mock('@/components/ui/select', async () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid="select-container">
      <select
        value={value || ''}
        onChange={e => onValueChange?.(e.target.value)}
        data-testid="select"
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value} data-testid="select-item">
      {children}
    </option>
  ),
  SelectTrigger: ({ children }: any) => <></>,
  SelectValue: ({ placeholder }: any) => <></>,
}));

vi.mock('@/components/ui/LocationSearch', async () => ({
  LocationSearch: ({ value, onChange, placeholder }: any) => (
    <div data-testid="location-search">
      <input
        data-testid="location-search-input"
        value={value?.address?.label || ''}
        onChange={e => {
          // Mock location selection
          if (e.target.value.length > 3) {
            onChange({
              id: 'location-1',
              title: e.target.value,
              resultType: 'address',
              position: { lat: 49.4521, lng: 11.0767 },
              address: {
                label: e.target.value,
                street: 'Hauptstraße',
                houseNumber: '1',
                postalCode: '90402',
                city: 'Nürnberg',
                countryCode: 'DE',
                countryName: 'Deutschland',
                stateCode: 'BY',
                state: 'Bayern',
                county: '',
                district: '',
              },
            });
          }
        }}
        placeholder={placeholder}
      />
    </div>
  ),
  LocationResult: {},
}));

// Mock Lucide React icons
vi.mock('lucide-react', async () => ({
  ...(await vi.importActual('lucide-react')),
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
}));

// Mock Sonner toast
vi.mock('sonner', async () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Data
const mockBusinessCategory: BusinessCategory = {
  id: 'cat-1',
  name: 'Restaurant',
  description: 'Restaurants und Gastronomie',
  iconName: 'utensils',
  keywords: [
    {
      id: 'keyword-1',
      name: 'Pizza',
      description: 'Italienisches Gericht',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'keyword-2',
      name: 'Italienisch',
      description: 'Italienische Küche',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
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
  benefit: '10% Rabatt auf alle Getränke',
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
    instagram: '@restaurantalpha',
    facebook: 'restaurantalpha',
    tiktok: '@restaurantalpha',
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
    <MemoryRouter initialEntries={['/businesses/business-1/edit']}>{component}</MemoryRouter>
  );
};

const renderAndWaitForComponent = async () => {
  renderWithRouter(<EditBusiness />);

  await waitFor(() => {
    expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
  });
};

/** Entspricht der UI: erst Hinweis-Dialog, dann Bestätigung (handleSaveClick → handleConfirmSave). */
const openSaveDialogAndConfirm = async () => {
  fireEvent.click(screen.getByTestId('edit-business-open-save-dialog'));
  await waitFor(() => {
    expect(screen.getByTestId('edit-business-confirm-save')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('edit-business-confirm-save'));
};

describe('EditBusiness Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Stabilize mock responses to prevent infinite loops
    mockBusinessService.getBusiness.mockResolvedValue(mockBusiness);
    mockBusinessCategoryService.getCategories.mockResolvedValue([mockBusinessCategory]);

    // clearAllMocks entfernt keine mockImplementation — z. B. mockRejectedValue von anderen Tests
    mockBusinessService.updateBusiness.mockResolvedValue(undefined);
    mockBusinessService.updateNuernbergspotsReview.mockResolvedValue(undefined);
    mockBusinessService.uploadLogo.mockResolvedValue(undefined);
    mockBusinessService.uploadBusinessImages.mockResolvedValue(undefined);
    mockBusinessService.uploadReviewImages.mockResolvedValue(undefined);

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
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });
    });

    it('sollte Loading-State mit Skeleton-Elementen anzeigen', () => {
      // Kurzer Delay: genug für Skeleton-Frame, ohne die Suite unnötig zu verlangsamen
      mockBusinessService.getBusiness.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockBusiness), 80))
      );

      const { container } = renderWithRouter(<EditBusiness />);

      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);

      // cardPreset nutzt u. a. border-secondary (siehe src/lib/designTokens.ts)
      const skeletonCards = container.querySelectorAll(
        '[data-testid="card"].border-secondary.rounded-lg'
      );
      expect(skeletonCards.length).toBeGreaterThanOrEqual(3);
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

      await waitFor(
        () => {
          // Keywords werden basierend auf den Kategorie-Keywords geladen
          expect(mockKeywordService.getKeyword).toHaveBeenCalledWith('keyword-1');
          expect(mockKeywordService.getKeyword).toHaveBeenCalledWith('keyword-2');
          expect(mockKeywordService.getKeyword).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 }
      );
    });

    it('sollte Fehler beim Laden der Business-Daten behandeln', async () => {
      const mockToast = toast;
      mockBusinessService.getBusiness.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Laden des Geschäfts');
        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });

    it('sollte Fehler beim Laden der Kategorien behandeln', async () => {
      const mockToast = toast;
      mockBusinessCategoryService.getCategories.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Laden der Kategorien');
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zur Business-Liste navigieren beim Klick auf Zurück', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Zurück zur Übersicht'));
      expect(mockNavigate).toHaveBeenCalledWith('/businesses');
    });

    it('sollte zur Business-Liste navigieren beim Klick auf Abbrechen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Abbrechen'));
      expect(mockNavigate).toHaveBeenCalledWith('/businesses');
    });
  });

  describe('Basic Information Display', () => {
    it('sollte Business-Namen editierbar anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const nameInput = screen.getByLabelText('Name des Geschäfts') as HTMLInputElement;
        expect(nameInput).toBeInTheDocument();
        expect(nameInput.value).toBe('Restaurant Alpha');
      });
    });

    it('sollte Business-Namen bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('Name des Geschäfts')).toBeInTheDocument();
      });
      const nameInput = screen.getByLabelText('Name des Geschäfts') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Restaurant Beta' } });
      expect(nameInput.value).toBe('Restaurant Beta');
    });

    it('sollte Beschreibung editierbar anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        const descriptionTextarea = screen.getByLabelText('Beschreibung') as HTMLTextAreaElement;
        expect(descriptionTextarea).toBeInTheDocument();
        expect(descriptionTextarea.value).toBe('Ein gemütliches Restaurant im Herzen der Stadt');
      });
    });

    it('sollte Beschreibung bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('Beschreibung')).toBeInTheDocument();
      });
      const descriptionTextarea = screen.getByLabelText('Beschreibung') as HTMLTextAreaElement;
      fireEvent.change(descriptionTextarea, { target: { value: 'Neue Beschreibung' } });
      expect(descriptionTextarea.value).toBe('Neue Beschreibung');
    });

    it('sollte Benefit editierbar anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        const benefitInput = screen.getByLabelText('Benefit für Nutzer') as HTMLInputElement;
        expect(benefitInput).toBeInTheDocument();
        expect(benefitInput.value).toBe('10% Rabatt auf alle Getränke');
      });
    });

    it('sollte Benefit bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('Benefit für Nutzer')).toBeInTheDocument();
      });
      const benefitInput = screen.getByLabelText('Benefit für Nutzer') as HTMLInputElement;
      fireEvent.change(benefitInput, { target: { value: '15% Rabatt' } });
      expect(benefitInput.value).toBe('15% Rabatt');
    });

    it('sollte Benefit auf 100 Zeichen begrenzen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('Benefit für Nutzer')).toBeInTheDocument();
      });
      const benefitInput = screen.getByLabelText('Benefit für Nutzer') as HTMLInputElement;
      const longText = 'a'.repeat(150);
      fireEvent.change(benefitInput, { target: { value: longText } });
      expect(benefitInput.value.length).toBe(100);
    });

    it('sollte Adresse mit LocationSearch editierbar anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByTestId('location-search')).toBeInTheDocument();
        const locationInput = screen.getByTestId('location-search-input') as HTMLInputElement;
        expect(locationInput.value).toContain('Hauptstraße');
      });
    });

    it('sollte Adresse bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByTestId('location-search-input')).toBeInTheDocument();
      });
      const locationInput = screen.getByTestId('location-search-input') as HTMLInputElement;
      fireEvent.change(locationInput, { target: { value: 'Neue Straße 5' } });
      expect(locationInput.value).toBeTruthy();
    });

    it('sollte alle Kontaktfelder editierbar anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        const emailInput = screen.getByLabelText('E-Mail (optional)') as HTMLInputElement;
        const phoneInput = screen.getByLabelText('Telefon (optional)') as HTMLInputElement;
        const websiteInput = screen.getByLabelText('Website (optional)') as HTMLInputElement;
        const instagramInput = screen.getByLabelText('Instagram (optional)') as HTMLInputElement;
        const facebookInput = screen.getByLabelText('Facebook (optional)') as HTMLInputElement;
        const tiktokInput = screen.getByLabelText('TikTok (optional)') as HTMLInputElement;

        expect(emailInput).toBeInTheDocument();
        expect(emailInput.value).toBe('info@restaurant-alpha.de');
        expect(phoneInput).toBeInTheDocument();
        expect(phoneInput.value).toBe('+49 911 123456');
        expect(websiteInput).toBeInTheDocument();
        expect(websiteInput.value).toBe('https://restaurant-alpha.de');
        expect(instagramInput).toBeInTheDocument();
        expect(instagramInput.value).toBe('@restaurantalpha');
        expect(facebookInput).toBeInTheDocument();
        expect(facebookInput.value).toBe('restaurantalpha');
        expect(tiktokInput).toBeInTheDocument();
        expect(tiktokInput.value).toBe('@restaurantalpha');
      });
    });

    it('sollte Kontaktfelder bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('E-Mail (optional)')).toBeInTheDocument();
      });
      const emailInput = screen.getByLabelText('E-Mail (optional)') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'neu@restaurant.de' } });
      expect(emailInput.value).toBe('neu@restaurant.de');
    });
  });

  describe('Status Management', () => {
    it('sollte aktuellen Status anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const statusSelect = screen.getByTestId('select') as HTMLSelectElement;
        // Das Select ist mit dem business.status Wert vorausgefüllt
        expect(statusSelect).toBeInTheDocument();
        // Prüfe dass das Select-Element vorhanden ist - der Mock setzt value korrekt
        expect(statusSelect.value).toBe(BusinessStatus.ACTIVE);
      });
    });

    it('sollte Status ändern können', async () => {
      renderWithRouter(<EditBusiness />);

      const mockToast = toast;
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId('select');
      fireEvent.change(statusSelect, { target: { value: BusinessStatus.PENDING } });

      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith('business-1', {
          status: BusinessStatus.PENDING,
        });
      });

      await waitFor(() => {
        expectToastSuccessTitle(mockToast.success, 'Status aktualisiert');
      });
    });

    it('sollte Fehler beim Status-Update behandeln', async () => {
      renderWithRouter(<EditBusiness />);

      const mockToast = toast;
      mockBusinessService.updateBusiness.mockRejectedValue(new Error('Update Error'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      const statusSelect = screen.getByTestId('select');
      fireEvent.change(statusSelect, { target: { value: BusinessStatus.PENDING } });

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Speichern des Geschäfts');
      });
    });
  });

  describe('Promoted Status Management', () => {
    it('sollte aktuellen Promoted-Status anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const promotedSwitch = screen.getByLabelText(
          'Als "Highlight" markieren'
        ) as HTMLInputElement;
        expect(promotedSwitch.checked).toBe(false); // mockBusiness.isPromoted ist false
      });
    });

    it('sollte Promoted-Status ändern können', async () => {
      renderWithRouter(<EditBusiness />);

      const mockToast = toast;
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      const promotedSwitch = screen.getByLabelText('Als "Highlight" markieren');
      fireEvent.click(promotedSwitch);

      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith('business-1', {
          isPromoted: true,
        });
        expectToastSuccessTitle(mockToast.success, 'Highlight-Status aktualisiert');
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
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      const promotedSwitch = screen.getByLabelText('Als "Highlight" markieren') as HTMLInputElement;
      fireEvent.click(promotedSwitch);

      await waitFor(() => {
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
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const categoryBadge = screen.getByText('Restaurant');
        expect(categoryBadge).toHaveAttribute('data-variant', 'default');
      });
    });

    it('sollte Kategorie hinzufügen und entfernen können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
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

      await waitFor(
        () => {
          expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
          expect(screen.getAllByText('Keywords')[0]).toBeInTheDocument();
          expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('sollte Keywords togglen können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toHaveAttribute('data-variant', 'default');
      });

      let keywordBadge = screen.getAllByText('Pizza')[0];
      fireEvent.click(keywordBadge);
      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toHaveAttribute('data-variant', 'outline');
      });

      keywordBadge = screen.getAllByText('Pizza')[0];
      fireEvent.click(keywordBadge);
      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toHaveAttribute('data-variant', 'default');
      });
    });

    it('sollte maximal 3 Kategorien auswählen können', async () => {
      // Mock 4 Kategorien
      const fourCategories = [
        { ...mockBusinessCategory, id: 'cat-1', name: 'Restaurant' },
        { ...mockBusinessCategory, id: 'cat-2', name: 'Café', keywords: [] },
        { ...mockBusinessCategory, id: 'cat-3', name: 'Bar', keywords: [] },
        { ...mockBusinessCategory, id: 'cat-4', name: 'Shop', keywords: [] },
      ];

      mockBusinessCategoryService.getCategories.mockImplementation(() =>
        Promise.resolve(fourCategories)
      );

      // Business mit 3 Kategorien
      const businessWith3Categories = {
        ...mockBusiness,
        categoryIds: ['cat-1', 'cat-2', 'cat-3'],
      };
      mockBusinessService.getBusiness.mockImplementation(() =>
        Promise.resolve(businessWith3Categories)
      );

      renderWithRouter(<EditBusiness />);

      expect(
        await screen.findByDisplayValue('Restaurant Alpha', { timeout: 3000 })
      ).toBeInTheDocument();
      expect(await screen.findByText('Café', { timeout: 3000 })).toBeInTheDocument();
      expect(await screen.findByText('Shop', { timeout: 3000 })).toBeInTheDocument();

      fireEvent.click(screen.getByText('Shop'));
      // Dieselbe validationErrors-Liste wird an zwei Stellen gerendert (zwei Alert-Blöcke in EditBusiness).
      await waitFor(() => {
        expect(
          screen.getAllByText('Sie können maximal 3 Kategorien auswählen.').length
        ).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Media Management', () => {
    it('sollte aktuelles Logo anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const logoImage = screen.getByAltText('Logo');
        expect(logoImage).toHaveAttribute('src', 'https://example.com/logo.jpg');
      });
    });

    it('sollte aktuelle Geschäftsbilder anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const businessImages = screen.getAllByAltText(/Geschäftsbild/);
        expect(businessImages).toHaveLength(2);
        expect(businessImages[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
        expect(businessImages[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
      });
    });

    it('sollte Logo-Upload Button anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getByText('Logo hochladen')).toBeInTheDocument();
        expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
      });
    });

    it('sollte Geschäftsbild-Upload ermöglichen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const uploadArea = screen.getAllByText('Bilder hinzufügen')[0];
        expect(uploadArea).toBeInTheDocument();
        expect(screen.getAllByTestId('image-icon')[0]).toBeInTheDocument();
      });
    });

    it('sollte Delete-Buttons für Bilder anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const deleteButtons = screen.getAllByTestId('trash-icon');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Opening Hours Management', () => {
    it('sollte bestehende Öffnungszeiten anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getAllByText('Zeitraum')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Von')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bis')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Gültig an')[0]).toBeInTheDocument();
      });
    });

    it('sollte Zeiträume bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });
      const timeInputs = screen.getAllByDisplayValue('09:00');
      expect(timeInputs.length).toBeGreaterThan(0);
      const firstTimeInput = timeInputs[0];
      fireEvent.change(firstTimeInput, { target: { value: '10:00' } });
      expect(firstTimeInput).toHaveValue('10:00');
    });

    it('sollte neuen Zeitraum hinzufügen können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });
      const addButton = screen.getAllByText('Zeitraum hinzufügen')[0];
      const samstag = screen.getAllByText('Samstag')[1];
      fireEvent.click(samstag);
      fireEvent.click(addButton);
      await waitFor(() => {
        expect(screen.getAllByText('Zeitraum').length).toBeGreaterThan(1);
      });
    });

    it('sollte Wochentage für Zeitraum togglen können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });
      const montagBadges = screen.getAllByText('Montag');
      const firstMontag = montagBadges[0];
      fireEvent.click(firstMontag);
      expect(firstMontag.closest('[data-testid="badge"]')).toHaveAttribute('data-variant');
    });
  });

  describe('Review Management', () => {
    it('sollte bestehenden Review-Text anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const reviewTextarea = screen.getByDisplayValue('Sehr empfehlenswert!');
        expect(reviewTextarea).toBeInTheDocument();
      });
    });

    it('sollte Review-Text bearbeiten können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      const reviewTextarea = screen.getByDisplayValue(
        'Sehr empfehlenswert!'
      ) as HTMLTextAreaElement;

      fireEvent.change(reviewTextarea, { target: { value: 'Absolut empfehlenswert!' } });
      expect(reviewTextarea.value).toBe('Absolut empfehlenswert!');
    });

    it('sollte Review-Bilder anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const reviewImage = screen.getByAltText('Review Bild 1');
        expect(reviewImage).toHaveAttribute('src', 'https://example.com/review1.jpg');
      });
    });

    it('sollte Review-Bild-Upload ermöglichen', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const uploadAreas = screen.getAllByText('Bilder hinzufügen');
        expect(uploadAreas.length).toBeGreaterThan(1);
        expect(uploadAreas[1]).toBeInTheDocument(); // Zweiter Upload-Bereich
      });
    });

    it('sollte Review-Bilder löschen können', async () => {
      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        const deleteButtons = screen.getAllByTestId('trash-icon');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Submission', () => {
    it('sollte Änderungen erfolgreich speichern', async () => {
      renderWithRouter(<EditBusiness />);

      const mockToast = toast;
      mockBusinessService.updateNuernbergspotsReview.mockResolvedValue(undefined);
      mockBusinessService.updateBusiness.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      // Bearbeite Review
      const reviewTextarea = screen.getByDisplayValue('Sehr empfehlenswert!');
      fireEvent.change(reviewTextarea, { target: { value: 'Neue Review' } });

      await openSaveDialogAndConfirm();

      await waitFor(() => {
        expect(mockBusinessService.updateNuernbergspotsReview).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalled();
      });

      expect(mockBusinessService.updateNuernbergspotsReview).toHaveBeenCalledWith(
        'business-1',
        expect.objectContaining({
          reviewText: 'Neue Review',
        })
      );

      expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith(
        'business-1',
        expect.objectContaining({
          name: 'Restaurant Alpha',
          description: 'Ein gemütliches Restaurant im Herzen der Stadt',
          benefit: '10% Rabatt auf alle Getränke',
          address: expect.objectContaining({
            street: 'Hauptstraße',
            houseNumber: '1',
            postalCode: '90402',
            city: 'Nürnberg',
          }),
          contact: expect.objectContaining({
            email: 'info@restaurant-alpha.de',
            phoneNumber: '+49 911 123456',
            website: 'https://restaurant-alpha.de',
          }),
          categoryIds: ['cat-1'],
          keywordIds: ['keyword-1'],
        })
      );

      expectToastSuccessTitle(mockToast.success, 'Änderungen gespeichert');
      expect(mockNavigate).toHaveBeenCalledWith('/businesses');
    });

    it('sollte Fehler beim Speichern behandeln', async () => {
      renderWithRouter(<EditBusiness />);

      const mockToast = toast;
      mockBusinessService.updateBusiness.mockRejectedValue(new Error('Update Error'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      await openSaveDialogAndConfirm();

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Speichern des Geschäfts');
      });
    });

    it('sollte Loading-State während Speichern anzeigen', async () => {
      renderWithRouter(<EditBusiness />);

      mockBusinessService.updateBusiness.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 800))
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      await openSaveDialogAndConfirm();

      await waitFor(() => {
        const saveBtn = screen.getByTestId('edit-business-open-save-dialog');
        expect(saveBtn).toBeDisabled();
        expect(screen.getByText('Speichert...')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Handling', () => {
    it('sollte Logo-Upload verarbeiten', async () => {
      renderWithRouter(<EditBusiness />);

      mockBusinessService.uploadLogo.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
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

        await openSaveDialogAndConfirm();

        await waitFor(() => {
          expect(mockBusinessService.uploadLogo).toHaveBeenCalledWith('business-1', file);
        });
      }
    });

    it('sollte Geschäftsbild-Upload verarbeiten', async () => {
      renderWithRouter(<EditBusiness />);

      mockBusinessService.uploadBusinessImages.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
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

        await openSaveDialogAndConfirm();

        await waitFor(() => {
          expect(mockBusinessService.uploadBusinessImages).toHaveBeenCalledWith(
            'business-1',
            files
          );
        });
      }
    });

    it('sollte Review-Bild-Upload verarbeiten', async () => {
      renderWithRouter(<EditBusiness />);

      mockBusinessService.uploadReviewImages.mockResolvedValue(undefined);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
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

        await openSaveDialogAndConfirm();

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
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
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
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
      });

      // Bearbeite Öffnungszeiten
      const timeInputs = screen.getAllByDisplayValue('09:00');
      fireEvent.change(timeInputs[0], { target: { value: '08:00' } });

      await openSaveDialogAndConfirm();

      await waitFor(() => {
        expect(mockBusinessService.updateBusiness).toHaveBeenCalled();
      });
      expect(mockBusinessService.updateBusiness).toHaveBeenCalledWith(
        'business-1',
        expect.objectContaining({
          detailedOpeningHours: expect.objectContaining({
            Montag: expect.arrayContaining([
              expect.objectContaining({ from: '08:00', to: '18:00' }),
            ]),
          }),
        })
      );
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
        nuernbergspotsReview: { reviewText: 'Test', reviewImageUrls: [] },
      };
      mockBusinessService.getBusiness.mockResolvedValueOnce(businessWithoutImages);

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        // Sollte keine Fehler werfen ohne Bilder
      });
    });

    it('sollte Business ohne Öffnungszeiten handhaben', async () => {
      const businessWithoutOpeningHours = {
        ...mockBusiness,
        detailedOpeningHours: {},
      };
      mockBusinessService.getBusiness.mockResolvedValueOnce(businessWithoutOpeningHours);

      renderWithRouter(<EditBusiness />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Restaurant Alpha')).toBeInTheDocument();
        // Sollte nur den "Neuer Zeitraum" Bereich anzeigen
        expect(screen.getAllByText('Neuer Zeitraum')[0]).toBeInTheDocument();
      });
    });
  });
});
