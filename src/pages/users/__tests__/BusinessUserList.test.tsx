import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BusinessUserList } from '../BusinessUserList';
import { useBusinessUserService } from '@/services/businessUserService';
import { BusinessUser } from '@/services/businessUserService';

// Mock API module
jest.mock('@/lib/api', () => ({
  useApi: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
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
const mockBusinessUserService = useBusinessUserService as jest.MockedFunction<typeof useBusinessUserService>;

// Mock von React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

const mockActiveUser = createMockBusinessUser();
const mockReviewUser = createMockBusinessUser({
  id: 'user-2',
  email: 'review@example.com',
  needsReview: true,
  isDeleted: false,
});
const mockDeletedUser = createMockBusinessUser({
  id: 'user-3',
  email: 'deleted@example.com',
  isDeleted: true,
  needsReview: false,
});

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('BusinessUserList', () => {
  const mockService = {
    getBusinessUsers: jest.fn(),
    getBusinessUser: jest.fn(),
    addBusinessToUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockBusinessUserService.mockReturnValue(mockService);
  });

  describe('Loading State', () => {
    it('sollte Loading-State anzeigen', () => {
      mockService.getBusinessUsers.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<BusinessUserList />);
      
      expect(screen.getByText('Business-User verwalten')).toBeInTheDocument();
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(10); // 5 mobile + 5 desktop skeletons
    });

    it('sollte Zurück-Button im Loading-State rendern', () => {
      mockService.getBusinessUsers.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<BusinessUserList />);
      
      const backButtonSpan = screen.getByText('Zurück');
      const backButton = backButtonSpan.closest('div').querySelector('button');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Data Loading', () => {
    it('sollte Business-User erfolgreich laden und anzeigen', async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser, mockReviewUser, mockDeletedUser]);

      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2);
        expect(screen.getAllByText('review@example.com')).toHaveLength(2);
        expect(screen.getAllByText('deleted@example.com')).toHaveLength(2);
      });

      expect(mockService.getBusinessUsers).toHaveBeenCalledTimes(1);
    });

    it('sollte Fehler beim Laden graceful handhaben', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockService.getBusinessUsers.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getByText('Business-User verwalten')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Fehler beim Laden der Business-User:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('sollte leere Liste korrekt anzeigen', async () => {
      mockService.getBusinessUsers.mockResolvedValue([]);

      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getByText('Keine Business-User vorhanden')).toBeInTheDocument();
      });
    });
  });

  describe('Status Badges', () => {
    beforeEach(async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser, mockReviewUser, mockDeletedUser]);
      renderWithRouter(<BusinessUserList />);
      
      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2);
      });
    });

    it('sollte Aktiv-Badge für aktive User anzeigen', () => {
      const activeBadges = screen.getAllByText('Aktiv');
      expect(activeBadges).toHaveLength(2); // Mobile + Desktop
      
      activeBadges.forEach(badge => {
        expect(badge.closest('.bg-primary')).toBeInTheDocument();
      });
    });

    it('sollte Review-Badge für User mit needsReview anzeigen', () => {
      const reviewBadges = screen.getAllByText('Überprüfung erforderlich');
      expect(reviewBadges).toHaveLength(2); // Mobile + Desktop
      
      reviewBadges.forEach(badge => {
        expect(badge.closest('.bg-secondary')).toBeInTheDocument();
      });
    });

    it('sollte Gelöscht-Badge für gelöschte User anzeigen', () => {
      const deletedBadges = screen.getAllByText('Gelöscht');
      expect(deletedBadges).toHaveLength(2); // Mobile + Desktop
      
      deletedBadges.forEach(badge => {
        expect(badge.closest('.bg-destructive')).toBeInTheDocument();
      });
    });

    it('sollte entsprechende Icons in Badges anzeigen', () => {
      // CheckCircle2 für aktive User (in Aktiv-Badge)
      const activeBadges = screen.getAllByText('Aktiv');
      expect(activeBadges).toHaveLength(2);
      activeBadges.forEach(badge => {
        expect(badge.querySelector('svg')).toBeInTheDocument();
      });
      
      // AlertCircle für Review User
      const reviewBadges = screen.getAllByText('Überprüfung erforderlich');
      expect(reviewBadges).toHaveLength(2);
      reviewBadges.forEach(badge => {
        expect(badge.querySelector('svg')).toBeInTheDocument();
      });
      
      // Trash2 für gelöschte User
      const deletedBadges = screen.getAllByText('Gelöscht');
      expect(deletedBadges).toHaveLength(2);
      deletedBadges.forEach(badge => {
        expect(badge.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile vs Desktop Layout', () => {
    beforeEach(async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser]);
      renderWithRouter(<BusinessUserList />);
      
      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2);
      });
    });

    it('sollte mobile Card-Ansicht haben', () => {
      // Mobile View (block md:hidden)
      const mobileCards = screen.getAllByText('business@example.com')[0].closest('.block.md\\:hidden');
      expect(mobileCards).toHaveClass('block', 'md:hidden');
    });

    it('sollte desktop Table-Ansicht haben', () => {
      // Desktop View (hidden md:block)
      const desktopTable = screen.getByText('Business-User Übersicht').closest('.hidden.md\\:block');
      expect(desktopTable).toHaveClass('hidden', 'md:block');
    });

    it('sollte Table-Header korrekt anzeigen', () => {
      expect(screen.getByText('E-Mail')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Aktionen')).toBeInTheDocument();
    });

    it('sollte Business-User Übersicht Title haben', () => {
      expect(screen.getByText('Business-User Übersicht')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser]);
      renderWithRouter(<BusinessUserList />);
      
      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2);
      });
    });

    it('sollte Bearbeiten-Buttons anzeigen', () => {
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons).toHaveLength(2); // Mobile + Desktop
      
      editButtons.forEach(button => {
        expect(button.closest('button')).toBeInTheDocument();
      });
    });

    it('sollte zu Edit-Seite navigieren beim Klick', () => {
      const editButtons = screen.getAllByText('Bearbeiten');
      
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/business-users/user-1/edit');
    });

    it('sollte Pencil-Icons in Edit-Buttons haben', () => {
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons).toHaveLength(2);
      editButtons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser]);
      renderWithRouter(<BusinessUserList />);
      
      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2);
      });
    });

    it('sollte Zurück-Button haben', () => {
      const backButtonSpan = screen.getByText('Zurück');
      expect(backButtonSpan).toBeInTheDocument();
      const backButton = backButtonSpan.closest('div').querySelector('button');
      expect(backButton).toBeInTheDocument();
      expect(backButton.querySelector('svg')).toBeInTheDocument();
    });

    it('sollte zur Startseite navigieren', () => {
      const backButtonSpan = screen.getByText('Zurück');
      const backButton = backButtonSpan.closest('div').querySelector('button');
      
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Email Display', () => {
    it('sollte lange E-Mail-Adressen korrekt handhaben', async () => {
      const longEmailUser = createMockBusinessUser({
        email: 'very-long-business-email-address@example-domain.com'
      });
      
      mockService.getBusinessUsers.mockResolvedValue([longEmailUser]);
      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getAllByText('very-long-business-email-address@example-domain.com')).toHaveLength(2);
      });
    });

    it('sollte E-Mail in beiden Ansichten anzeigen', async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser]);
      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        const emailElements = screen.getAllByText('business@example.com');
        expect(emailElements).toHaveLength(2); // Mobile + Desktop
      });
    });
  });

  describe('Edge Cases', () => {
    it('sollte User ohne Business-IDs handhaben', async () => {
      const userWithoutBusinesses = createMockBusinessUser({
        businessIds: [],
      });
      
      mockService.getBusinessUsers.mockResolvedValue([userWithoutBusinesses]);
      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2); // Mobile + Desktop
      });
    });

    it('sollte User mit vielen Business-IDs handhaben', async () => {
      const userWithManyBusinesses = createMockBusinessUser({
        businessIds: Array.from({ length: 10 }, (_, i) => `business-${i + 1}`),
      });
      
      mockService.getBusinessUsers.mockResolvedValue([userWithManyBusinesses]);
      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2); // Mobile + Desktop
      });
    });

    it('sollte User mit undefined optionalen Feldern handhaben', async () => {
      const userWithUndefinedFields = createMockBusinessUser({
        eventIds: undefined,
        contactRequestIds: undefined,
      });
      
      mockService.getBusinessUsers.mockResolvedValue([userWithUndefinedFields]);
      renderWithRouter(<BusinessUserList />);

      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2); // Mobile + Desktop
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      mockService.getBusinessUsers.mockResolvedValue([mockActiveUser]);
      renderWithRouter(<BusinessUserList />);
      
      await waitFor(() => {
        expect(screen.getAllByText('business@example.com')).toHaveLength(2);
      });
    });

    it('sollte responsive Klassen haben', () => {
      const containers = screen.getAllByText('business@example.com');
      expect(containers).toHaveLength(2); // Mobile + Desktop
      const container = containers[0].closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'bg-muted', 'px-4', 'py-6', 'sm:px-8', 'overflow-x-hidden');
    });

    it('sollte responsive Header haben', () => {
      const header = screen.getByText('Business-User verwalten').closest('.flex');
      expect(header).toHaveClass('flex', 'flex-col', 'gap-2', 'sm:flex-row', 'sm:items-center', 'sm:gap-4', 'mb-8');
    });

    it('sollte responsive Title haben', () => {
      const title = screen.getByRole('heading', { name: /business-user verwalten/i });
      expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'font-bold', 'leading-tight', 'break-words');
    });
  });
}); 