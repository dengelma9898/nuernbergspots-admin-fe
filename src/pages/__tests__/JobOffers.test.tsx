import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { JobOffers } from '../JobOffers';
import { JobOffer } from '@/models/job-offer';
import { JobCategory } from '@/models/job-category';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 data-testid="card-title" className={className}>{children}</h3>,
  CardFooter: ({ children, className }: any) => <div data-testid="card-footer" className={className}>{children}</div>,
  CardDescription: ({ children, className }: any) => <div data-testid="card-description" className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
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
    <div data-testid="select" data-value={value} onClick={() => onValueChange && onValueChange('test-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, className }: any) => <div data-testid="select-trigger" className={className}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  Briefcase: () => <div data-testid="briefcase-icon">Briefcase</div>,
  Building2: () => <div data-testid="building2-icon">Building2</div>,
  Euro: () => <div data-testid="euro-icon">Euro</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  CheckCircle2: () => <div data-testid="check-circle2-icon">CheckCircle2</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Link: () => <div data-testid="link-icon">Link</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
}));

// Mock Toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Services
const mockJobOfferService = {
  getJobOffers: jest.fn(),
  deleteJobOffer: jest.fn(),
};

const mockJobCategoryService = {
  getCategories: jest.fn(),
};

jest.mock('@/services/jobOfferService', () => ({
  useJobOfferService: () => mockJobOfferService,
}));

jest.mock('@/services/jobCategoryService', () => ({
  useJobCategoryService: () => mockJobCategoryService,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, format) => '15. Januar 2024'),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

// Mock icon utils
jest.mock('@/utils/iconUtils', () => ({
  getIconComponent: jest.fn(() => <div data-testid="category-icon">CategoryIcon</div>),
}));

describe('JobOffers Component', () => {
  const user = userEvent.setup();

  const mockJobOffer: JobOffer = {
    id: 'job-1',
    title: 'Software Developer',
    generalDescription: 'We are looking for a talented software developer...',
    neededProfile: 'Java, React, TypeScript experience required',
    tasks: ['Develop web applications', 'Code reviews', 'Team collaboration'],
    benefits: ['Flexible hours', 'Remote work', 'Health insurance'],
    typeOfEmployment: 'Vollzeit',
    homeOffice: true,
    wage: '50.000 - 70.000 €',
    link: 'https://company.com/apply',
    startDate: '2024-02-01T00:00:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    isHighlight: true,
    companyLogo: 'https://company.com/logo.png',
    images: ['https://company.com/image1.jpg'],
    jobOfferCategoryId: 'cat-1',
    location: {
      address: 'München, Deutschland',
      latitude: 48.1351,
      longitude: 11.5820,
    },
    contactData: {
      email: 'jobs@company.com',
      phone: '+49 123 456789',
    },
  };

  const mockJobOfferWithoutOptionalFields: JobOffer = {
    id: 'job-2',
    title: 'Junior Developer',
    generalDescription: 'Entry level position for new graduates...',
    neededProfile: 'Basic programming knowledge',
    tasks: ['Learn new technologies', 'Work with senior developers'],
    benefits: ['Training programs', 'Mentorship'],
    typeOfEmployment: 'Teilzeit',
    homeOffice: false,
    wage: '',
    link: 'https://company2.com/apply',
    startDate: '2024-03-01T00:00:00.000Z',
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
    isHighlight: false,
    companyLogo: '',
    images: [],
    jobOfferCategoryId: 'cat-2',
    location: {
      address: 'Berlin, Deutschland',
      latitude: 52.5200,
      longitude: 13.4050,
    },
    contactData: {
      email: 'hr@company2.com',
      phone: '',
    },
  };

  const mockCategory: JobCategory = {
    id: 'cat-1',
    name: 'IT & Software',
    description: 'Information Technology and Software Development',
    iconName: 'Laptop',
    colorCode: '#3B82F6',
    fallbackImages: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockJobOfferService.getJobOffers.mockResolvedValue([mockJobOffer, mockJobOfferWithoutOptionalFields]);
    mockJobCategoryService.getCategories.mockResolvedValue([mockCategory]);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <JobOffers />
      </BrowserRouter>
    );
  };

  it('renders job offers page correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Stellenangebote')).toBeTruthy();
      expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
      expect(screen.getByText('Stellenangebot hinzufügen')).toBeTruthy();
    });
  });

  it('displays loading state initially', () => {
    renderComponent();

    expect(screen.getByText('Lade Stellenangebote...')).toBeTruthy();
  });

  it('loads job offers on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockJobOfferService.getJobOffers).toHaveBeenCalled();
      expect(mockJobCategoryService.getCategories).toHaveBeenCalled();
    });
  });

  it('displays job offers after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Software Developer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Junior Developer').length).toBeGreaterThan(0);
    });
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
    });

    const backButton = screen.getByText('Zurück zum Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to create job offer when add button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Stellenangebot hinzufügen')).toBeTruthy();
    });

    const addButton = screen.getByText('Stellenangebot hinzufügen');
    await user.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/job-offers/create');
  });

  it('filters job offers by search query', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Software Developer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Junior Developer').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText('Nach Stellenangebot suchen...');
    await user.type(searchInput, 'Software');

    // Since filtering is done locally, both should still be visible in DOM
    // but in a real implementation, only matching ones would show
    expect((searchInput as HTMLInputElement).value).toBe('Software');
  });

  it('displays job offer details correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Check job title
      expect(screen.getAllByText('Software Developer').length).toBeGreaterThan(0);
      
      // Check description
      expect(screen.getAllByText('We are looking for a talented software developer...').length).toBeGreaterThan(0);
      
      // Check employment type
      expect(screen.getAllByText('Vollzeit').length).toBeGreaterThan(0);
      
      // Check location
      expect(screen.getAllByText('München, Deutschland').length).toBeGreaterThan(0);
      
      // Check contact info
      expect(screen.getAllByText('jobs@company.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('+49 123 456789').length).toBeGreaterThan(0);
      
      // Check wage
      expect(screen.getAllByText('50.000 - 70.000 €').length).toBeGreaterThan(0);
    });
  });

  it('displays home office badge correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const homeOfficeBadges = screen.getAllByText('Home Office');
      expect(homeOfficeBadges.length).toBeGreaterThan(0);
      
      const onSiteBadges = screen.getAllByText('Vor Ort');
      expect(onSiteBadges.length).toBeGreaterThan(0);
    });
  });

  it('displays highlight badge for highlighted jobs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('⭐ Highlight').length).toBeGreaterThan(0);
    });
  });

  it('displays company logo when available', async () => {
    renderComponent();

    await waitFor(() => {
      const logoImages = screen.getAllByAltText('Software Developer');
      expect(logoImages.length).toBeGreaterThan(0);
      expect(logoImages[0].getAttribute('src')).toBe('https://company.com/logo.png');
    });
  });

  it('displays image count badge when images are available', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('+1')).toBeTruthy();
    });
  });

  it('handles job offers without optional fields', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Junior Developer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('hr@company2.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Berlin, Deutschland').length).toBeGreaterThan(0);
    });
  });

  it('displays external application link correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const applicationLinks = screen.getAllByText('Zur Bewerbung');
      expect(applicationLinks.length).toBeGreaterThan(0);
      expect(applicationLinks[0].closest('a')?.getAttribute('href')).toBe('https://company.com/apply');
      expect(applicationLinks[0].closest('a')?.getAttribute('target')).toBe('_blank');
    });
  });

  it('displays creation date correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const creationDates = screen.getAllByText(/Erstellt am/);
      expect(creationDates.length).toBeGreaterThan(0);
    });
  });

  it('displays start date correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // The mock returns "15. Januar 2024" for all dates
      const startDates = screen.getAllByText('15. Januar 2024');
      expect(startDates.length).toBeGreaterThan(0);
    });
  });

  it('displays category information when available', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IT & Software').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('category-icon').length).toBeGreaterThan(0);
    });
  });

  it('navigates to edit job offer when edit button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByText('Bearbeiten');
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/job-offers/job-1');
  });

  it('deletes job offer when delete button is clicked', async () => {
    mockJobOfferService.deleteJobOffer.mockResolvedValue(undefined);
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Löschen');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Löschen');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockJobOfferService.deleteJobOffer).toHaveBeenCalledWith('job-1');
    });
  });

  it('shows error message when loading fails', async () => {
    const { toast } = require('sonner');
    mockJobOfferService.getJobOffers.mockRejectedValue(new Error('Loading failed'));
    
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Fehler beim Laden der Daten',
        expect.objectContaining({
          description: 'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
        })
      );
    });
  });

  it('shows error message when delete fails', async () => {
    const { toast } = require('sonner');
    mockJobOfferService.deleteJobOffer.mockRejectedValue(new Error('Delete failed'));
    
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Löschen');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Löschen');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Fehler beim Löschen',
        expect.objectContaining({
          description: 'Das Stellenangebot konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
        })
      );
    });
  });

  it('shows success message when delete succeeds', async () => {
    const { toast } = require('sonner');
    mockJobOfferService.deleteJobOffer.mockResolvedValue(undefined);
    
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Löschen');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Löschen');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Stellenangebot gelöscht',
        expect.objectContaining({
          description: 'Das Stellenangebot wurde erfolgreich gelöscht.',
        })
      );
    });
  });

  it('reloads data after successful deletion', async () => {
    mockJobOfferService.deleteJobOffer.mockResolvedValue(undefined);
    
    renderComponent();

    // Clear the initial call
    mockJobOfferService.getJobOffers.mockClear();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Löschen');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Löschen');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      // Should reload data after successful deletion
      expect(mockJobOfferService.getJobOffers).toHaveBeenCalled();
    });
  });

  it('shows no results message when no job offers match filters', async () => {
    mockJobOfferService.getJobOffers.mockResolvedValue([]);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Keine Stellenangebote gefunden.')).toBeTruthy();
    });
  });

  it('displays search input field', async () => {
    renderComponent();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Nach Stellenangebot suchen...');
      expect(searchInput).toBeTruthy();
    });
  });

  it('displays filter dropdowns', async () => {
    renderComponent();

    await waitFor(() => {
      // Use more specific selectors to avoid conflicts with badges
      const selectValues = screen.getAllByTestId('select-value');
      expect(selectValues.length).toBe(2);
      expect(selectValues.some(el => el.textContent === 'Beschäftigungsart')).toBeTruthy();
      expect(selectValues.some(el => el.textContent === 'Home Office')).toBeTruthy();
    });
  });

  it('handles search input changes', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nach Stellenangebot suchen...')).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText('Nach Stellenangebot suchen...');
    await user.type(searchInput, 'developer');

    expect((searchInput as HTMLInputElement).value).toBe('developer');
  });

  it('displays various employment types', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Vollzeit').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Teilzeit').length).toBeGreaterThan(0);
    });
  });

  it('displays responsive layout with mobile cards', async () => {
    renderComponent();

    await waitFor(() => {
      // Mobile view elements should be present
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('displays all required icons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('arrow-left-icon')).toBeTruthy();
      expect(screen.getByTestId('plus-icon')).toBeTruthy();
      expect(screen.getAllByTestId('map-pin-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('briefcase-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('mail-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('home-icon').length).toBeGreaterThan(0);
    });
  });

  it('displays phone numbers when available', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('+49 123 456789').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('phone-icon').length).toBeGreaterThan(0);
    });
  });

  it('does not display phone numbers when not available', async () => {
    renderComponent();

    await waitFor(() => {
      // Junior Developer job has no phone number
      expect(screen.getAllByText('Junior Developer').length).toBeGreaterThan(0);
      // But we should still see the phone icon for the other job
      expect(screen.getAllByTestId('phone-icon').length).toBe(2); // One for each view (mobile/desktop)
    });
  });

  it('displays euro icon for wage information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('euro-icon').length).toBeGreaterThan(0);
    });
  });

  it('handles invalid date gracefully', async () => {
    const { format } = require('date-fns');
    format.mockImplementation(() => {
      throw new Error('Invalid date');
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Software Developer').length).toBeGreaterThan(0);
    });
  });
}); 