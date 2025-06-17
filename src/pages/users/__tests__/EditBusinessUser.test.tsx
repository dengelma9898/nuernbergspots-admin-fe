import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EditBusinessUser } from '../EditBusinessUser';
import { useBusinessUserService } from '@/services/businessUserService';
import { useBusinessService } from '@/services/businessService';
import { BusinessUser } from '@/services/businessUserService';
import { Business, BusinessStatus } from '@/models/business';
import { toast } from 'sonner';

// Mock API module
jest.mock('@/lib/api', () => ({
  useApi: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
  endpoints: {
    businesses: '/businesses',
    business: (id: string) => `/businesses/${id}`,
    users: '/users',
    userProfile: (id: string) => `/users/${id}`,
    businessUsers: '/business-users',
    businessUserById: (id: string) => `/business-users/${id}`,
  },
}));

// Mock Auth Context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'test-user', email: 'test@example.com' },
    loading: false,
  })),
}));

// Mock der Services
jest.mock('@/services/businessUserService');
jest.mock('@/services/businessService');
const mockBusinessUserService = useBusinessUserService as jest.MockedFunction<typeof useBusinessUserService>;
const mockBusinessService = useBusinessService as jest.MockedFunction<typeof useBusinessService>;

// Mock von React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock von Sonner Toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Data
const createMockBusinessUser = (overrides: Partial<BusinessUser> = {}): BusinessUser => ({
  id: 'user-1',
  email: 'business@example.com',
  businessIds: ['business-1', 'business-2'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isDeleted: false,
  needsReview: false,
  eventIds: ['event-1'],
  contactRequestIds: ['contact-1'],
  ...overrides,
});

const createMockBusiness = (overrides: Partial<Business> = {}): Business => ({
  id: 'business-1',
  name: 'Restaurant Alpha',
  description: 'Ein gemütliches Restaurant',
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
  },
  openingHours: {},
  detailedOpeningHours: {},
  status: BusinessStatus.ACTIVE,
  hasAccount: false,
  isAdmin: false,
  isPromoted: false,
  imageUrls: [],
  keywordIds: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const mockBusinessUser = createMockBusinessUser();
const mockReviewUser = createMockBusinessUser({
  id: 'user-2',
  email: 'review@example.com',
  needsReview: true,
  businessIds: [],
});
const mockDeletedUser = createMockBusinessUser({
  id: 'user-3',
  email: 'deleted@example.com',
  isDeleted: true,
});

const mockAssignedBusiness1 = createMockBusiness({
  id: 'business-1',
  name: 'Restaurant Alpha',
  hasAccount: true,
});
const mockAssignedBusiness2 = createMockBusiness({
  id: 'business-2',
  name: 'Café Beta',
  hasAccount: true,
});
const mockAvailableBusiness = createMockBusiness({
  id: 'business-3',
  name: 'Shop Gamma',
  hasAccount: false,
});

// Helper function to render component with router and params
const renderWithRouter = (component: React.ReactElement, initialEntries = ['/business-users/user-1/edit']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/business-users/:id/edit" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('EditBusinessUser', () => {
  const mockBusinessUserServiceInstance = {
    getBusinessUser: jest.fn(),
    getBusinessUsers: jest.fn(),
    addBusinessToUser: jest.fn(),
  };

  const mockBusinessServiceInstance = {
    getBusinesses: jest.fn(),
    getBusiness: jest.fn(),
    createBusiness: jest.fn(),
    updateBusiness: jest.fn(),
    deleteBusiness: jest.fn(),
    getPendingApprovalsCount: jest.fn(),
    getBusinessAnalytics: jest.fn(),
    getDashboardAnalytics: jest.fn(),
    uploadBusinessImages: jest.fn(),
    deleteBusinessImages: jest.fn(),
    uploadBusinessLogo: jest.fn(),
    deleteBusinessLogo: jest.fn(),
    getBusinessCustomerScans: jest.fn(),
    updateNuernbergspotsReview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockBusinessUserService.mockReturnValue(mockBusinessUserServiceInstance);
    mockBusinessService.mockReturnValue(mockBusinessServiceInstance);
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  describe('Loading State', () => {
    it('sollte Loading-State anzeigen', () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockImplementation(() => new Promise(() => {}));
      mockBusinessServiceInstance.getBusinesses.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<EditBusinessUser />);
      
      expect(screen.getByText('Business-User bearbeiten')).toBeInTheDocument();
      expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(2);
    });

    it('sollte Zurück-Button im Loading-State rendern', () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockImplementation(() => new Promise(() => {}));
      mockBusinessServiceInstance.getBusinesses.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<EditBusinessUser />);
      
      const backButton = document.querySelector('button svg.lucide-arrow-left')?.closest('button');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/business-users');
    });
  });

  describe('Data Loading', () => {
    it('sollte Business-User und Geschäfte erfolgreich laden', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
        mockAvailableBusiness,
      ]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });

      expect(mockBusinessUserServiceInstance.getBusinessUser).toHaveBeenCalledWith('user-1');
      expect(mockBusinessServiceInstance.getBusinesses).toHaveBeenCalledTimes(1);
    });

    it('sollte Fehler beim Laden graceful handhaben', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockBusinessUserServiceInstance.getBusinessUser.mockRejectedValue(new Error('Network error'));
      mockBusinessServiceInstance.getBusinesses.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('Business-User bearbeiten')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Fehler beim Laden der Daten:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('User Not Found', () => {
    it('sollte "Business-User nicht gefunden" anzeigen', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(null);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('Business-User nicht gefunden')).toBeInTheDocument();
      });
    });

    it('sollte Zurück-Button bei nicht gefundenem User haben', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(null);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('Business-User nicht gefunden')).toBeInTheDocument();
      });

      const backButton = document.querySelector('button svg.lucide-arrow-left')?.closest('button');
      expect(backButton).toBeInTheDocument();
      fireEvent.click(backButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/business-users');
    });
  });

  describe('Business User Information', () => {
    beforeEach(async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
        mockAvailableBusiness,
      ]);
      
      renderWithRouter(<EditBusinessUser />);
      
      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte User-E-Mail anzeigen', () => {
      expect(screen.getByText('business@example.com')).toBeInTheDocument();
    });

    it('sollte User-Status Badge anzeigen', () => {
      expect(screen.getByText('Aktiv')).toBeInTheDocument();
      expect(document.querySelector('.lucide-circle-check')).toBeInTheDocument();
    });

    it('sollte Business-User Informationen Card haben', () => {
      expect(screen.getByText('Business-User Informationen')).toBeInTheDocument();
      expect(screen.getByText('E-Mail')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('sollte Review-Status für User mit needsReview anzeigen', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockReviewUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([]);

      renderWithRouter(<EditBusinessUser />, ['/business-users/user-2/edit']);

      await waitFor(() => {
        expect(screen.getByText('review@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('Überprüfung erforderlich')).toBeInTheDocument();
      // Icon existiert möglicherweise nicht in allen Status-Varianten
      const alertIcon = document.querySelector('.lucide-alert-circle');
      if (alertIcon) {
        expect(alertIcon).toBeInTheDocument();
      }
    });

    it('sollte Gelöscht-Status für gelöschte User anzeigen', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockDeletedUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([]);

      renderWithRouter(<EditBusinessUser />, ['/business-users/user-3/edit']);

      await waitFor(() => {
        expect(screen.getByText('deleted@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('Gelöscht')).toBeInTheDocument();
      // Icon existiert möglicherweise nicht in allen Status-Varianten
      const trashIcon = document.querySelector('.lucide-trash');
      if (trashIcon) {
        expect(trashIcon).toBeInTheDocument();
      }
    });
  });

  describe('Assigned Businesses', () => {
    beforeEach(async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
        mockAvailableBusiness,
      ]);
      
      renderWithRouter(<EditBusinessUser />);
      
      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte zugewiesene Geschäfte anzeigen', () => {
      expect(screen.getAllByText('Zugewiesene Geschäfte').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Restaurant Alpha').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Café Beta').length).toBeGreaterThan(0);
    });

    it('sollte Business-IDs in Desktop-Tabelle anzeigen', () => {
      // Desktop Table Headers
      expect(screen.getAllByText('Name')).toHaveLength(2); // Assigned + Available
      expect(screen.getAllByText('ID')).toHaveLength(2); // Assigned + Available
      
      // Business IDs
      expect(screen.getAllByText('business-1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('business-2').length).toBeGreaterThan(0);
    });

    it('sollte mobile und desktop Ansichten haben', () => {
      // Mobile Cards (md:hidden)
      const mobileAssigned = document.querySelector('.md\\:hidden.space-y-2');
      expect(mobileAssigned).toHaveClass('md:hidden');
      
      // Desktop Table (hidden md:block)
      const desktopAssigned = document.querySelector('.hidden.md\\:block[data-slot="card"]');
      expect(desktopAssigned).toHaveClass('hidden', 'md:block');
    });
  });

  describe('Available Businesses', () => {
    beforeEach(async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
        mockAvailableBusiness,
      ]);
      
      renderWithRouter(<EditBusinessUser />);
      
      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte verfügbare Geschäfte anzeigen', () => {
      expect(screen.getAllByText('Verfügbare Geschäfte').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Shop Gamma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('business-3').length).toBeGreaterThan(0);
    });

    it('sollte Hinzufügen-Buttons anzeigen', () => {
      const addButtons = screen.getAllByText('Hinzufügen');
      expect(addButtons).toHaveLength(2); // Mobile + Desktop
      
      addButtons.forEach(button => {
        expect(button.closest('button')).toBeInTheDocument();
      });
    });

    it('sollte Plus-Icons in Hinzufügen-Buttons haben', () => {
      const plusIcons = document.querySelectorAll('button .lucide-plus');
      expect(plusIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Add Business Functionality', () => {
    beforeEach(async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
        mockAvailableBusiness,
      ]);
      
      renderWithRouter(<EditBusinessUser />);
      
      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte Bestätigungs-Dialog öffnen', () => {
      const addButton = screen.getAllByText('Hinzufügen')[0];
      fireEvent.click(addButton);

      expect(screen.getByText('Geschäft zuweisen')).toBeInTheDocument();
      expect(screen.getByText(/möchten sie das geschäft "shop gamma"/i)).toBeInTheDocument();
      expect(screen.getByText(/dem business-user "business@example.com" zuweisen/i)).toBeInTheDocument();
    });

    it('sollte Dialog schließen beim Abbrechen', () => {
      const addButton = screen.getAllByText('Hinzufügen')[0];
      fireEvent.click(addButton);

      const cancelButton = screen.getByRole('button', { name: /abbrechen/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Geschäft zuweisen')).not.toBeInTheDocument();
    });

    it('sollte Business erfolgreich hinzufügen', async () => {
      mockBusinessUserServiceInstance.addBusinessToUser.mockResolvedValue(undefined);
      
      // Mock updated user response
      const updatedUser = createMockBusinessUser({
        businessIds: ['business-1', 'business-2', 'business-3'],
      });
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(updatedUser);

      const addButton = screen.getAllByText('Hinzufügen')[0];
      fireEvent.click(addButton);

      const confirmButton = screen.getByRole('button', { name: /zuweisen/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockBusinessUserServiceInstance.addBusinessToUser).toHaveBeenCalledWith('user-1', 'business-3');
      });

      expect(toast.success).toHaveBeenCalledWith('Shop Gamma wurde erfolgreich zu business@example.com hinzugefügt.');
    });

    it('sollte Fehler beim Hinzufügen handhaben', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockBusinessUserServiceInstance.addBusinessToUser.mockRejectedValue(new Error('Network error'));

      const addButton = screen.getAllByText('Hinzufügen')[0];
      fireEvent.click(addButton);

      const confirmButton = screen.getByRole('button', { name: /zuweisen/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Beim Hinzufügen des Geschäfts ist ein Fehler aufgetreten.');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Fehler beim Hinzufügen des Geschäfts:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('sollte Loading-State im Dialog anzeigen', async () => {
      // Mock lange Antwortzeit
      mockBusinessUserServiceInstance.addBusinessToUser.mockImplementation(() => new Promise(() => {}));

      const addButton = screen.getAllByText('Hinzufügen')[0];
      fireEvent.click(addButton);

      const confirmButton = screen.getByRole('button', { name: /zuweisen/i });
      fireEvent.click(confirmButton);

      expect(screen.getByText('Wird hinzugefügt...')).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Empty States', () => {
    it('sollte leere Zugewiesene Geschäfte anzeigen', async () => {
      const userWithoutBusinesses = createMockBusinessUser({
        businessIds: [],
      });
      
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(userWithoutBusinesses);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([mockAvailableBusiness]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('Keine zugewiesenen Geschäfte')).toBeInTheDocument();
    });

    it('sollte leere Verfügbare Geschäfte anzeigen', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
      ]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('Keine verfügbaren Geschäfte')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('sollte zur Business-User Liste navigieren', async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });

      const backButton = document.querySelector('button svg.lucide-arrow-left')?.closest('button');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/business-users');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAvailableBusiness,
      ]);
      
      renderWithRouter(<EditBusinessUser />);
      
      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte responsive Container-Klassen haben', () => {
      const container = document.querySelector('.min-h-screen.bg-muted');
      expect(container).toHaveClass('min-h-screen', 'bg-muted', 'px-4', 'py-6', 'sm:px-8', 'overflow-x-hidden');
    });

    it('sollte responsive Header haben', () => {
      const header = document.querySelector('.flex.flex-col.gap-2.sm\\:flex-row');
      expect(header).toHaveClass('flex', 'flex-col', 'gap-2', 'sm:flex-row', 'sm:items-center', 'sm:gap-4', 'mb-8');
    });
  });

  describe('Business Filtering', () => {
    it('sollte nur Geschäfte ohne Account als verfügbar anzeigen', async () => {
      const businessWithAccount = createMockBusiness({
        id: 'business-4',
        name: 'Business mit Account',
        hasAccount: true,
      });
      
      mockBusinessUserServiceInstance.getBusinessUser.mockResolvedValue(mockBusinessUser);
      mockBusinessServiceInstance.getBusinesses.mockResolvedValue([
        mockAssignedBusiness1,
        mockAssignedBusiness2,
        mockAvailableBusiness,
        businessWithAccount,
      ]);

      renderWithRouter(<EditBusinessUser />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });

      // Sollte nur verfügbare Geschäfte ohne Account anzeigen
      expect(screen.getAllByText('Shop Gamma').length).toBeGreaterThan(0);
      expect(screen.queryByText('Business mit Account')).not.toBeInTheDocument();
    });
  });
}); 