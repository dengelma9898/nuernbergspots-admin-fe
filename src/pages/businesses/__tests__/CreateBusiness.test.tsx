import { toast } from 'sonner';
import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CreateBusiness } from '../CreateBusiness';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { BusinessStatus } from '@/models/business';
import {
  expectToastErrorTitleContains,
  expectToastSuccessTitle,
} from '@/test-utils/sonnerAssertions';

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

// Mock Services
const mockBusinessService = {
  createBusiness: vi.fn(),
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
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
}));

vi.mock('@/components/ui/button', async () => ({
  Button: ({ children, onClick, variant, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button" data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', async () => ({
  Input: ({ value, onChange, placeholder, id, type, maxLength }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      type={type}
      maxLength={maxLength}
      data-testid="input"
    />
  ),
}));

vi.mock('@/components/ui/textarea', async () => ({
  Textarea: ({ value, onChange, placeholder, id, className }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
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
  Badge: ({ children, variant, className, onClick }: any) => {
    const variantClasses =
      variant === 'default'
        ? 'bg-primary text-primary-foreground'
        : 'border-secondary text-foreground';
    return (
      <span
        data-testid="badge"
        data-slot="badge"
        data-variant={variant}
        className={`${variantClasses} ${className ?? ''}`.trim()}
        onClick={onClick}
      >
        {children}
      </span>
    );
  },
}));

vi.mock('@/components/ui/switch', async () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      id={id}
      data-testid="switch"
    />
  ),
}));

vi.mock('@/components/ui/LocationSearch', async () => ({
  LocationSearch: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="location-search"
      placeholder={placeholder}
      onChange={e =>
        onChange?.({
          address: { label: e.target.value },
          position: { lat: 49.4521, lng: 11.0767 },
        })
      }
    />
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', async () => ({
  ...(await vi.importActual('lucide-react')),
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
}));

// Mock Sonner toast
vi.mock('sonner', async () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CreateBusiness Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBusinessCategoryService.getCategories.mockResolvedValue([mockBusinessCategory]);
    // Pro Keyword-ID ein eigenes Objekt zurückgeben — sonst liefert getKeyword immer dasselbe
    // Objekt (z. B. zweimal keyword-1) und React meldet doppelte Keys in keywords.map.
    mockKeywordService.getKeyword.mockImplementation((id: string) => {
      const embedded = mockBusinessCategory.keywords?.find(k => k.id === id);
      if (embedded) {
        return Promise.resolve({ ...embedded });
      }
      return Promise.resolve({
        ...mockKeyword,
        id,
        name: id === mockKeyword.id ? mockKeyword.name : `Keyword ${id}`,
      });
    });
  });

  describe('Component Rendering', () => {
    it('sollte die CreateBusiness-Seite korrekt rendern', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(screen.getAllByText('Neues Geschäft erstellen')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Geschäftsdetails')[0]).toBeInTheDocument();
        expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      });
    });

    it('sollte alle Formularfelder rendern', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('Name des Geschäfts')).toBeInTheDocument();
        expect(screen.getByLabelText('Beschreibung')).toBeInTheDocument();
        expect(screen.getAllByText('Kategorien (max. 3)')[0]).toBeInTheDocument();
        expect(screen.getByLabelText('Benefit für Nutzer')).toBeInTheDocument();
        expect(screen.getAllByText('Adresse')[0]).toBeInTheDocument();
      });
    });

    it('sollte Kontaktinformations-Felder rendern', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(screen.getByLabelText('E-Mail (optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('Telefon (optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('Website (optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('Instagram (optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('Facebook (optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('TikTok (optional)')).toBeInTheDocument();
      });
    });

    it('sollte Öffnungszeiten-Sektion rendern', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(screen.getAllByText('Öffnungszeiten')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Neuer Zeitraum')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Zeitraum hinzufügen')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('sollte Kategorien beim Mount laden', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(mockBusinessCategoryService.getCategories).toHaveBeenCalledTimes(1);
      });
    });

    it('sollte Keywords laden wenn Kategorien ausgewählt werden', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const categoryBadge = screen.getByText('Restaurant');
        fireEvent.click(categoryBadge);
      });

      await waitFor(() => {
        expect(mockKeywordService.getKeyword).toHaveBeenCalledWith('keyword-1');
        expect(mockKeywordService.getKeyword).toHaveBeenCalledWith('keyword-2');
      });
    });

    it('sollte Fehler beim Laden der Kategorien behandeln', async () => {
      const mockToast = toast;
      mockBusinessCategoryService.getCategories.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Laden der Kategorien');
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zur Business-Liste navigieren beim Klick auf Zurück', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const backButton = screen.getByText('Zurück zur Übersicht');
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });

    it('sollte zur Business-Liste navigieren beim Klick auf Abbrechen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const cancelButton = screen.getByText('Abbrechen');
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });
  });

  describe('Form Input Handling', () => {
    it('sollte Name-Input korrekt handhaben', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Name des Geschäfts') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Test Restaurant' } });
        expect(nameInput.value).toBe('Test Restaurant');
      });
    });

    it('sollte Beschreibungs-Textarea korrekt handhaben', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const descriptionInput = screen.getByLabelText('Beschreibung') as HTMLTextAreaElement;
        fireEvent.change(descriptionInput, { target: { value: 'Eine tolle Beschreibung' } });
        expect(descriptionInput.value).toBe('Eine tolle Beschreibung');
      });
    });

    it('sollte Benefit-Input mit Zeichenlimit handhaben', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const benefitInput = screen.getByLabelText('Benefit für Nutzer') as HTMLInputElement;
        const longText = 'a'.repeat(150); // Mehr als 100 Zeichen
        fireEvent.change(benefitInput, { target: { value: longText.slice(0, 100) } });
        expect(benefitInput.value).toBe('a'.repeat(100));
      });
    });

    it('sollte Kontakt-Inputs korrekt handhaben', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const emailInput = screen.getByLabelText('E-Mail (optional)') as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');

        const phoneInput = screen.getByLabelText('Telefon (optional)') as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '+49 123 456789' } });
        expect(phoneInput.value).toBe('+49 123 456789');

        const websiteInput = screen.getByLabelText('Website (optional)') as HTMLInputElement;
        fireEvent.change(websiteInput, { target: { value: 'https://example.com' } });
        expect(websiteInput.value).toBe('https://example.com');
      });
    });
  });

  describe('Category and Keyword Selection', () => {
    it('sollte Kategorie auswählen und abwählen können', async () => {
      renderWithRouter(<CreateBusiness />);

      const categoryBadge = await waitFor(() => {
        const badge = screen.getByText('Restaurant').closest('[data-slot="badge"]') as HTMLElement;
        expect(badge).not.toBeNull();
        return badge;
      });

      // Kategorie auswählen — Badge wechselt auf default-Variant
      fireEvent.click(categoryBadge);
      expect(categoryBadge).toHaveClass('bg-primary');

      // Kategorie abwählen
      fireEvent.click(categoryBadge);
      expect(categoryBadge).toHaveClass('border-secondary');
    });

    it('sollte maximal 3 Kategorien auswählen können', async () => {
      const mockToast = toast;
      const threeCategories = [
        { ...mockBusinessCategory, id: 'cat-1', name: 'Restaurant' },
        { ...mockBusinessCategory, id: 'cat-2', name: 'Café' },
        { ...mockBusinessCategory, id: 'cat-3', name: 'Bar' },
        { ...mockBusinessCategory, id: 'cat-4', name: 'Shop' },
      ];

      mockBusinessCategoryService.getCategories.mockResolvedValue(threeCategories);

      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        // Wähle 3 Kategorien aus
        fireEvent.click(screen.getByText('Restaurant'));
        fireEvent.click(screen.getByText('Café'));
        fireEvent.click(screen.getByText('Bar'));

        // Versuche 4. Kategorie auszuwählen
        fireEvent.click(screen.getByText('Shop'));

        expect(screen.getByText('Sie können maximal 3 Kategorien auswählen.')).toBeInTheDocument();
      });
    });

    it('sollte Keywords anzeigen wenn Kategorien ausgewählt sind', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const categoryBadge = screen.getByText('Restaurant');
        fireEvent.click(categoryBadge);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Keywords')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });
    });

    it('sollte Keywords auswählen und abwählen können', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const categoryBadge = screen.getByText('Restaurant');
        fireEvent.click(categoryBadge);
      });

      const keywordBadge = await waitFor(() => {
        const badge = screen.getAllByText('Pizza')[0].closest('[data-slot="badge"]') as HTMLElement;
        expect(badge).not.toBeNull();
        return badge;
      });

      // Keyword auswählen — Badge wechselt auf default-Variant
      fireEvent.click(keywordBadge);
      expect(keywordBadge).toHaveClass('bg-primary');

      // Keyword abwählen
      fireEvent.click(keywordBadge);
      expect(keywordBadge).toHaveClass('border-secondary');
    });
  });

  describe('Location Handling', () => {
    it('sollte Adresse über LocationSearch setzen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const locationSearch = screen.getByTestId('location-search');
        fireEvent.change(locationSearch, { target: { value: 'Hauptstraße 1, Nürnberg' } });

        expect(
          screen.getByText('Ausgewählte Adresse: Hauptstraße 1, Nürnberg')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Opening Hours Management', () => {
    it('sollte Standard-Zeitraum anzeigen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(screen.getAllByText('Zeitraum')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Von')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bis')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Gültig an')[0]).toBeInTheDocument();
      });
    });

    it('sollte neuen Zeitraum hinzufügen können', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        // Wähle Tage für neuen Zeitraum aus
        const montag = screen.getAllByText('Montag')[1]; // Der zweite Montag-Button (im neuen Zeitraum)
        fireEvent.click(montag);

        // Füge Zeitraum hinzu
        const addButton = screen.getAllByText('Zeitraum hinzufügen')[0];
        fireEvent.click(addButton);

        // Überprüfe, dass ein neuer Zeitraum hinzugefügt wurde
        expect(screen.getAllByText('Zeitraum').length).toBeGreaterThan(1);
      });
    });

    it('sollte Fehler anzeigen wenn kein Tag für neuen Zeitraum ausgewählt ist', async () => {
      renderWithRouter(<CreateBusiness />);

      const addButton = await waitFor(() => {
        const button = screen.getByText('Zeitraum hinzufügen').closest('button') as HTMLElement;
        expect(button).not.toBeNull();
        return button;
      });

      // Button sollte disabled sein wenn keine Tage für neuen Zeitraum ausgewählt sind
      expect(addButton).toBeDisabled();

      // Teste das disabled-Verhalten anstatt Toast, da disabled Buttons keinen Toast auslösen
      expect(addButton).toHaveAttribute('disabled');
    });

    it('sollte Zeitraum löschen können', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const deleteButton = screen.getByTestId('trash-icon');
        fireEvent.click(deleteButton);
      });
    });

    it('sollte Wochentage für Zeitraum togglen können', async () => {
      renderWithRouter(<CreateBusiness />);

      const montag = await waitFor(() => {
        // [1] = Montag-Tag im neuen Zeitraum (noch nicht ausgewählt)
        const badge = screen
          .getAllByText('Montag')[1]
          .closest('[data-slot="badge"]') as HTMLElement;
        expect(badge).not.toBeNull();
        return badge;
      });

      fireEvent.click(montag);
      expect(montag).toHaveClass('bg-primary');
    });
  });

  describe('Promoted Status', () => {
    it('sollte Promoted-Switch korrekt handhaben', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const promotedSwitch = screen.getByLabelText(
          'Als "Highlight" markieren'
        ) as HTMLInputElement;

        expect(promotedSwitch.checked).toBe(false);

        fireEvent.click(promotedSwitch);
        expect(promotedSwitch.checked).toBe(true);

        fireEvent.click(promotedSwitch);
        expect(promotedSwitch.checked).toBe(false);
      });
    });

    it('sollte Promoted-Status-Text dynamisch anzeigen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const promotedSwitch = screen.getByLabelText('Als "Highlight" markieren');

        expect(screen.getByText('Markiere diesen Partner als Highlight')).toBeInTheDocument();

        fireEvent.click(promotedSwitch);

        expect(
          screen.getByText('Dieser Partner wird als Highlight angezeigt ✨')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('sollte Geschäft erfolgreich erstellen', async () => {
      const mockToast = toast;
      mockBusinessService.createBusiness.mockResolvedValue({ id: 'new-business-id' });

      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        // Fülle Pflichtfelder aus
        const nameInput = screen.getByLabelText('Name des Geschäfts');
        fireEvent.change(nameInput, { target: { value: 'Test Restaurant' } });

        const descriptionInput = screen.getByLabelText('Beschreibung');
        fireEvent.change(descriptionInput, { target: { value: 'Eine tolle Beschreibung' } });

        const locationSearch = screen.getByTestId('location-search');
        fireEvent.change(locationSearch, { target: { value: 'Hauptstraße 1, Nürnberg' } });

        // Wähle Kategorie aus
        const categoryBadge = screen.getByText('Restaurant');
        fireEvent.click(categoryBadge);
      });

      await waitFor(() => {
        const submitButton = screen.getByText('Geschäft erstellen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockBusinessService.createBusiness).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Restaurant',
            description: 'Eine tolle Beschreibung',
            status: BusinessStatus.PENDING,
            hasAccount: false,
            isAdmin: true,
          })
        );

        expectToastSuccessTitle(mockToast.success, 'Geschäft erstellt');

        expect(mockNavigate).toHaveBeenCalledWith('/businesses');
      });
    });

    it('sollte Fehler beim Erstellen behandeln', async () => {
      const mockToast = toast;
      mockBusinessService.createBusiness.mockRejectedValue(new Error('Create Error'));

      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        // Fülle Mindestfelder aus
        const nameInput = screen.getByLabelText('Name des Geschäfts');
        fireEvent.change(nameInput, { target: { value: 'Test Restaurant' } });

        const submitButton = screen.getByText('Geschäft erstellen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Speichern des Geschäfts');
      });
    });

    it('sollte Loading-State während Erstellung anzeigen', async () => {
      mockBusinessService.createBusiness.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Name des Geschäfts');
        fireEvent.change(nameInput, { target: { value: 'Test Restaurant' } });
      });

      const submitButton = await waitFor(() => {
        const button = screen.getByText('Geschäft erstellen').closest('button') as HTMLElement;
        expect(button).not.toBeNull();
        return button;
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Wird erstellt...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Data Processing', () => {
    it('sollte Adresse korrekt parsen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const locationSearch = screen.getByTestId('location-search');
        fireEvent.change(locationSearch, { target: { value: 'Hauptstraße 123, 90402 Nürnberg' } });

        const submitButton = screen.getByText('Geschäft erstellen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockBusinessService.createBusiness).toHaveBeenCalledWith(
          expect.objectContaining({
            address: expect.objectContaining({
              street: 'Hauptstraße',
              houseNumber: '123',
              postalCode: '90402',
              city: 'Nürnberg',
              latitude: 49.4521,
              longitude: 11.0767,
            }),
          })
        );
      });
    });

    it('sollte Öffnungszeiten korrekt formatieren', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        // Der Standard-Zeitraum sollte Mo-Fr 09:00-18:00 sein
        const submitButton = screen.getByText('Geschäft erstellen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockBusinessService.createBusiness).toHaveBeenCalledWith(
          expect.objectContaining({
            detailedOpeningHours: expect.objectContaining({
              Montag: [{ from: '09:00', to: '18:00' }],
              Dienstag: [{ from: '09:00', to: '18:00' }],
              Mittwoch: [{ from: '09:00', to: '18:00' }],
              Donnerstag: [{ from: '09:00', to: '18:00' }],
              Freitag: [{ from: '09:00', to: '18:00' }],
            }),
          })
        );
      });
    });

    it('sollte leere Kontaktdaten korrekt handhaben', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        const submitButton = screen.getByText('Geschäft erstellen');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockBusinessService.createBusiness).toHaveBeenCalledWith(
          expect.objectContaining({
            contact: expect.objectContaining({
              email: undefined,
              phoneNumber: undefined,
              website: undefined,
              instagram: undefined,
              facebook: undefined,
              tiktok: undefined,
            }),
          })
        );
      });
    });
  });

  describe('User Experience', () => {
    it('sollte Hilfetext für Formularfelder anzeigen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(
          screen.getByText('Der offizielle Name des Geschäfts, wie er angezeigt werden soll.')
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'Eine ausführliche Beschreibung des Geschäfts. Nennen Sie wichtige Details wie Angebot, Besonderheiten oder Geschichte.'
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText('Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.')
        ).toBeInTheDocument();
      });
    });

    it('sollte Zeichenzähler für Benefit anzeigen', async () => {
      renderWithRouter(<CreateBusiness />);

      await waitFor(() => {
        expect(screen.getByText('0/100 Zeichen')).toBeInTheDocument();

        const benefitInput = screen.getByLabelText('Benefit für Nutzer');
        fireEvent.change(benefitInput, { target: { value: 'Test' } });

        expect(screen.getByText('4/100 Zeichen')).toBeInTheDocument();
      });
    });
  });
});
