import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobOfferForm } from '../JobOfferForm';
import { JobOffer } from '@/models/job-offer';
import { JobCategory } from '@/models/job-category';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

// Mock services
const mockJobOfferService = {
  getJobOffers: jest.fn(),
  getJobOffer: jest.fn(),
  createJobOffer: jest.fn(),
  updateJobOffer: jest.fn(),
  deleteJobOffer: jest.fn(),
  updateImages: jest.fn(),
  updateCompanyLogo: jest.fn(),
};

const mockJobCategoryService = {
  getCategories: jest.fn(),
  getCategory: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  updateFallbackImages: jest.fn(),
  deleteFallbackImage: jest.fn(),
};

jest.mock('@/services/jobOfferService', () => ({
  useJobOfferService: () => mockJobOfferService,
}));

jest.mock('@/services/jobCategoryService', () => ({
  useJobCategoryService: () => mockJobCategoryService,
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from 'sonner';

// Mock LocationSearch component
jest.mock('@/components/ui/LocationSearch', () => ({
  LocationSearch: ({ onChange, value, placeholder }: any) => (
    <div data-testid="location-search">
      <input
        placeholder={placeholder}
        value={value?.title || ''}
        onChange={(e) => {
          if (e.target.value) {
            onChange({
              id: 'test-location',
              title: e.target.value,
              resultType: 'place',
              position: { lat: 49.4521, lng: 11.0767 },
              address: {
                label: e.target.value,
                countryCode: 'DE',
                countryName: 'Deutschland',
                stateCode: 'BY',
                state: 'Bayern',
                county: 'Nürnberg',
                city: 'Nürnberg',
                district: '',
                street: '',
                postalCode: '',
                houseNumber: ''
              }
            });
          }
        }}
      />
    </div>
  ),
}));

// Mock icon utils
jest.mock('@/utils/iconUtils', () => ({
  getIconComponent: jest.fn((iconName: string) => <span data-testid={`icon-${iconName}`}>{iconName}</span>),
}));

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Create mock data
const createMockJobCategory = (overrides: Partial<JobCategory> = {}): JobCategory => ({
  id: 'category-1',
  name: 'Software Development',
  description: 'Software development jobs',
  colorCode: '#3B82F6',
  iconName: 'code',
  fallbackImages: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const createMockJobOffer = (overrides: Partial<JobOffer> = {}): JobOffer => ({
  id: 'job-1',
  title: 'Frontend Developer',
  companyLogo: 'https://example.com/logo.png',
  generalDescription: 'Great opportunity for a frontend developer',
  neededProfile: 'React experience required',
  tasks: ['Develop UI components', 'Write tests'],
  benefits: ['Health insurance', 'Flexible hours'],
  images: ['https://example.com/image1.jpg'],
  location: {
    address: 'Nürnberg, Deutschland',
    latitude: 49.4521,
    longitude: 11.0767,
  },
  typeOfEmployment: 'Vollzeit',
  additionalNotesForTypeOfEmployment: null,
  homeOffice: true,
  additionalNotesHomeOffice: 'Remote work possible',
  wage: '50000-60000 EUR',
  startDate: '2024-02-01',
  contactData: {
    person: 'John Doe',
    email: 'john@example.com',
    phone: '+49123456789',
  },
  link: 'https://example.com/apply',
  socialMedia: {
    linkedin: 'https://linkedin.com/company/test',
    xing: null,
    instagram: null,
    facebook: null,
  },
  isHighlight: false,
  businessIds: ['business-1'],
  jobOfferCategoryId: 'category-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const mockCategories: JobCategory[] = [
  createMockJobCategory(),
  createMockJobCategory({
    id: 'category-2',
    name: 'Marketing',
    iconName: 'megaphone',
  }),
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('JobOfferForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    mockJobCategoryService.getCategories.mockResolvedValue(mockCategories);
    // Default: Create mode
    mockUseParams.mockReturnValue({ id: undefined });
  });

  describe('Create Mode', () => {
    it('sollte Formular im Erstellungsmodus rendern', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Neues Stellenangebot')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /erstellen/i })).toBeInTheDocument();
    });

    it('sollte alle Haupt-Formularfelder anzeigen', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Titel')).toBeInTheDocument();
      });

      // Grundlegende Felder prüfen
      expect(screen.getByLabelText('Titel')).toBeInTheDocument();
      expect(screen.getByLabelText('Als Highlight markieren')).toBeInTheDocument();
      expect(screen.getByLabelText('Allgemeine Beschreibung')).toBeInTheDocument();
      expect(screen.getByLabelText('Benötigtes Profil')).toBeInTheDocument();
      expect(screen.getByLabelText('Startdatum')).toBeInTheDocument();
      expect(screen.getByLabelText('E-Mail')).toBeInTheDocument();
      expect(screen.getByLabelText('Bewerbungslink')).toBeInTheDocument();
    });

    it('sollte Kategorien laden', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(mockJobCategoryService.getCategories).toHaveBeenCalled();
      });
    });

    it('sollte Tasks und Benefits dynamisch verwalten', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Aufgaben')).toBeInTheDocument();
      });

      // Task hinzufügen
      const addTaskButton = screen.getByRole('button', { name: /aufgabe hinzufügen/i });
      fireEvent.click(addTaskButton);

      // Benefits hinzufügen
      const addBenefitButton = screen.getByRole('button', { name: /vorteil hinzufügen/i });
      fireEvent.click(addBenefitButton);
    });

    it('sollte erfolgreiche Stellenangebot-Erstellung handhaben', async () => {
      const mockJobOffer = createMockJobOffer();
      mockJobOfferService.createJobOffer.mockResolvedValue(mockJobOffer);
      
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Titel')).toBeInTheDocument();
      });

      // Minimal erforderliche Felder ausfüllen
      fireEvent.change(screen.getByLabelText('Titel'), {
        target: { value: 'Test Job' }
      });
      fireEvent.change(screen.getByLabelText('Allgemeine Beschreibung'), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByLabelText('Benötigtes Profil'), {
        target: { value: 'Test profile' }
      });
      fireEvent.change(screen.getByLabelText('E-Mail'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Bewerbungslink'), {
        target: { value: 'https://example.com/apply' }
      });
      fireEvent.change(screen.getByLabelText('Startdatum'), {
        target: { value: '2024-02-01' }
      });

      // Submit Form
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockJobOfferService.createJobOffer).toHaveBeenCalled();
      });

      expect(toast.success).toHaveBeenCalledWith('Stellenangebot erstellt');
      expect(mockNavigate).toHaveBeenCalledWith('/job-offers');
    });

    it('sollte Fehler bei der Erstellung handhaben', async () => {
      mockJobOfferService.createJobOffer.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Titel')).toBeInTheDocument();
      });

      // Erforderliche Felder ausfüllen
      fireEvent.change(screen.getByLabelText('Titel'), {
        target: { value: 'Test Job' }
      });
      fireEvent.change(screen.getByLabelText('Allgemeine Beschreibung'), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByLabelText('Benötigtes Profil'), {
        target: { value: 'Test profile' }
      });
      fireEvent.change(screen.getByLabelText('E-Mail'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Bewerbungslink'), {
        target: { value: 'https://example.com/apply' }
      });
      fireEvent.change(screen.getByLabelText('Startdatum'), {
        target: { value: '2024-02-01' }
      });

      // Submit Form
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Fehler beim Erstellen des Stellenangebots');
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'job-1' });
    });

    it('sollte Lademodus anzeigen', () => {
      mockJobOfferService.getJobOffer.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<JobOfferForm />);
      
      expect(screen.getByText('Lade Stellenangebot...')).toBeInTheDocument();
    });

    it('sollte Fehler beim Laden handhaben', async () => {
      mockJobOfferService.getJobOffer.mockRejectedValue(new Error('Not found'));
      
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Fehler beim Laden des Stellenangebots');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/job-offers');
    });

    it('sollte Stellenangebot laden und bearbeiten', async () => {
      const mockJobOffer = createMockJobOffer();
      mockJobOfferService.getJobOffer.mockResolvedValue(mockJobOffer);
      mockJobOfferService.updateJobOffer.mockResolvedValue(mockJobOffer);
      
      renderWithRouter(<JobOfferForm />);
      
      // Warten bis das JobOffer geladen ist
      await waitFor(() => {
        expect(mockJobOfferService.getJobOffer).toHaveBeenCalledWith('job-1');
      });

      // Sollte Edit-Mode Header zeigen
      await waitFor(() => {
        expect(screen.getByText('Stellenangebot bearbeiten')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /speichern/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockJobOfferService.updateJobOffer).toHaveBeenCalled();
      });

      expect(toast.success).toHaveBeenCalledWith('Stellenangebot aktualisiert');
      expect(mockNavigate).toHaveBeenCalledWith('/job-offers');
    });
  });

  describe('Navigation', () => {
    it('sollte zur Übersicht navigieren bei Zurück-Button', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Zurück zur Übersicht')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /zurück zur übersicht/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/job-offers');
    });

    it('sollte bei Abbrechen zur Übersicht navigieren', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /abbrechen/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /abbrechen/i });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/job-offers');
    });
  });

  describe('Location Handling', () => {
    it('sollte LocationSearch Komponente rendern', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('location-search')).toBeInTheDocument();
      });
    });

    it('sollte Adresseingabe ermöglichen', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('location-search')).toBeInTheDocument();
      });

      const locationInput = screen.getByTestId('location-search').querySelector('input');
      if (locationInput) {
        fireEvent.change(locationInput, { target: { value: 'Nürnberg' } });
      }
    });
  });

  describe('Home Office Conditional Fields', () => {
    it('sollte Home Office Notizen zeigen wenn aktiviert', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Home Office möglich')).toBeInTheDocument();
      });

      const homeOfficeSwitch = screen.getByLabelText('Home Office möglich');
      fireEvent.click(homeOfficeSwitch);

      await waitFor(() => {
        expect(screen.getByLabelText('Zusätzliche Notizen zum Home Office')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('sollte E-Mail-Input als E-Mail-Typ haben', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('E-Mail')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('E-Mail');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('sollte URL-Input für Bewerbungslink haben', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Bewerbungslink')).toBeInTheDocument();
      });

      const linkInput = screen.getByLabelText('Bewerbungslink');
      expect(linkInput).toHaveAttribute('type', 'url');
    });

    it('sollte Date-Input für Startdatum haben', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Startdatum')).toBeInTheDocument();
      });

      const dateInput = screen.getByLabelText('Startdatum');
      expect(dateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Container-Klassen haben', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Neues Stellenangebot')).toBeInTheDocument();
      });

      // Test für glassmorphism Layout-Container
      const mainContainer = document.querySelector('.min-h-screen.relative.overflow-hidden');
      expect(mainContainer).toBeInTheDocument();
      
      const contentContainer = document.querySelector('.relative.z-10');
      expect(contentContainer).toBeInTheDocument();
    });

    it('sollte responsive Grid-Layout haben', async () => {
      renderWithRouter(<JobOfferForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Neues Stellenangebot')).toBeInTheDocument();
      });

      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });
  });
}); 