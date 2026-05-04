import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BusinessUserReview } from '../BusinessUserReview';
import { useUserService } from '@/services/userService';
import { BusinessUser } from '@/models/users';
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
jest.mock('@/services/userService');
const mockUserService = useUserService as jest.MockedFunction<typeof useUserService>;

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
  needsReview: true,
  eventIds: ['event-1'],
  businessNames: ['Restaurant Alpha', 'Café Beta'],
  ...overrides,
});

const mockUserNeedsReview = createMockBusinessUser();
const mockUserWithLongEmail = createMockBusinessUser({
  id: 'user-2',
  email: 'very-long-business-email-address@example-domain.com',
  businessNames: ['Geschäft mit sehr langem Namen der über mehrere Zeilen gehen könnte'],
});
const mockUserWithoutBusinesses = createMockBusinessUser({
  id: 'user-3',
  email: 'nobusiness@example.com',
  businessIds: [],
  businessNames: [],
});

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('BusinessUserReview', () => {
  const mockService = {
    getBusinessUsersInReview: jest.fn(),
    updateBusinessUserReviewStatus: jest.fn(),
    getBusinessUsersInReviewCount: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getBusinessUsers: jest.fn(),
    getBusinessUser: jest.fn(),
    updateBusinessUser: jest.fn(),
    deleteBusinessUser: jest.fn(),
    addFavoriteBusiness: jest.fn(),
    removeFavoriteBusiness: jest.fn(),
    addFavoriteEvent: jest.fn(),
    removeFavoriteEvent: jest.fn(),
    updatePreferences: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUserService.mockReturnValue(mockService);
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  describe('Loading State', () => {
    it('sollte Loading-State mit detaillierten Skeleton-Elementen anzeigen', () => {
      mockService.getBusinessUsersInReview.mockImplementation(() => new Promise(() => {}));

      const { container } = renderWithRouter(<BusinessUserReview />);

      // Prüfe dass Skeleton-Elemente während des Ladens angezeigt werden
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(10);

      // Prüfe dass User Card Skeletons vorhanden sind (3 Karten)
      const userCardSkeletons = container.querySelectorAll('.grid.grid-cols-1.gap-6 > div');
      expect(userCardSkeletons.length).toBe(3); // 3 User Card Skeletons
    });

    it('sollte nach dem Laden Inhalt anzeigen', async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);

      const { container } = renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('Geschäftsinhaber prüfen')).toBeInTheDocument();
      });

      // Prüfe dass Skeleton-Elemente nicht mehr vorhanden sind
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBe(0);

      // Prüfe dass echte Content-Elemente angezeigt werden
      expect(screen.getByText('1 Benutzer zur Überprüfung gefunden')).toBeInTheDocument();
    });
  });

  describe('Header und Navigation', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('Geschäftsinhaber prüfen')).toBeInTheDocument();
      });
    });

    it('sollte Titel anzeigen', () => {
      expect(screen.getByRole('heading', { name: /geschäftsinhaber prüfen/i })).toBeInTheDocument();
    });

    it('sollte Zurück-Button haben', () => {
      const backButtonSpan = screen.getByText('Zurück zum Dashboard');
      const backButton = backButtonSpan.closest('div').querySelector('button');
      expect(backButton).toBeInTheDocument();
      expect(backButton.querySelector('svg')).toBeInTheDocument();
    });

    it('sollte zum Dashboard navigieren', () => {
      const backButtonSpan = screen.getByText('Zurück zum Dashboard');
      const backButton = backButtonSpan.closest('div').querySelector('button');

      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('sollte Anzahl der zu prüfenden Benutzer anzeigen', () => {
      expect(screen.getByText('1 Benutzer zur Überprüfung gefunden')).toBeInTheDocument();
    });
  });

  describe('User Cards', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([
        mockUserNeedsReview,
        mockUserWithLongEmail,
      ]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('2 Benutzer zur Überprüfung gefunden')).toBeInTheDocument();
      });
    });

    it('sollte User-Informationen anzeigen', () => {
      expect(screen.getByText('business@example.com')).toBeInTheDocument();
      expect(
        screen.getByText('very-long-business-email-address@example-domain.com')
      ).toBeInTheDocument();
    });

    it('sollte User-IDs anzeigen', () => {
      expect(screen.getByText('ID: user-1')).toBeInTheDocument();
      expect(screen.getByText('ID: user-2')).toBeInTheDocument();
    });

    it('sollte Review-Badges anzeigen', () => {
      const reviewBadges = screen.getAllByText('Überprüfung erforderlich');
      expect(reviewBadges).toHaveLength(2);
    });

    it('sollte Business-Anzahl anzeigen', () => {
      // Prüfe dass Geschäfte-Informationen angezeigt werden
      const businessCounts = screen.getAllByText(
        content => content.includes('Geschäft') && content.includes('zugewiesen')
      );
      expect(businessCounts.length).toBeGreaterThan(0);
    });

    it('sollte Registrierungsdatum anzeigen', () => {
      expect(screen.getAllByText(/registriert am/i)).toHaveLength(2);
      expect(screen.getAllByText(content => content.includes('01. Januar 2024'))).toHaveLength(2);
    });

    it('sollte Status-Icons anzeigen', () => {
      // Mail-Icons bei E-Mail-Adressen - kann unterschiedlich viele wegen responsive Design geben
      const emailSections = screen.getAllByText(/@example\.com/);
      expect(emailSections.length).toBeGreaterThan(0);
      emailSections.forEach(section => {
        const mailIcon =
          section.closest('.flex')?.querySelector('.lucide-mail') ||
          section.closest('[data-slot="card"]')?.querySelector('.lucide-mail');
        expect(mailIcon).toBeInTheDocument();
      });

      // Building-Icons bei Business-Anzahl und Tag-Icons bei Status
      const cards = document.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Business Names Display', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte beanspruchte Geschäfte anzeigen', () => {
      expect(screen.getByText('Beanspruchte Geschäfte:')).toBeInTheDocument();
      expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      expect(screen.getByText('Café Beta')).toBeInTheDocument();
    });

    it('sollte Store-Icons bei Geschäften anzeigen', () => {
      // Store-Icons sind in den Business-Namen zu finden
      const businessCards = document.querySelectorAll('[data-slot="card"]');
      let totalStoreIcons = 0;

      businessCards.forEach(card => {
        const storeIcons = card.querySelectorAll('.lucide-store');
        totalStoreIcons += storeIcons.length;
      });

      expect(totalStoreIcons).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte Verifizieren und Ablehnen Buttons anzeigen', () => {
      expect(screen.getByRole('button', { name: /verifizieren/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ablehnen/i })).toBeInTheDocument();
    });

    it('sollte richtige Icons in Buttons haben', () => {
      const verifyButton = screen.getByText('Verifizieren');
      const rejectButton = screen.getByText('Ablehnen');

      expect(verifyButton.querySelector('svg')).toBeInTheDocument();
      expect(rejectButton.querySelector('svg')).toBeInTheDocument();
    });

    it('sollte richtige Button-Varianten haben', () => {
      const verifyButton = screen.getByRole('button', { name: /verifizieren/i });
      const rejectButton = screen.getByRole('button', { name: /ablehnen/i });

      expect(verifyButton).toHaveClass('bg-primary');
      expect(rejectButton).toHaveClass('text-destructive');
    });
  });

  describe('Approve Functionality', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte User verifizieren', async () => {
      mockService.updateBusinessUserReviewStatus.mockResolvedValue(undefined);
      mockService.getBusinessUsersInReview.mockResolvedValue([]);

      const verifyButton = screen.getByRole('button', { name: /verifizieren/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockService.updateBusinessUserReviewStatus).toHaveBeenCalledWith('user-1', false);
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Benutzer verifiziert',
        expect.objectContaining({ description: 'Der Benutzer wurde erfolgreich verifiziert.' })
      );
    });

    it('sollte Fehler bei Verifizierung handhaben', async () => {
      mockService.updateBusinessUserReviewStatus.mockRejectedValue(new Error('Network error'));

      const verifyButton = screen.getByRole('button', { name: /verifizieren/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ description: expect.any(String) })
        );
      });
    });
  });

  describe('Reject Functionality', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte User ablehnen', async () => {
      mockService.updateBusinessUserReviewStatus.mockResolvedValue(undefined);
      mockService.getBusinessUsersInReview.mockResolvedValue([]);

      const rejectButton = screen.getByRole('button', { name: /ablehnen/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockService.updateBusinessUserReviewStatus).toHaveBeenCalledWith('user-1', false);
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Benutzer abgelehnt',
        expect.objectContaining({ description: 'Der Benutzer wurde erfolgreich abgelehnt.' })
      );
    });

    it('sollte Fehler bei Ablehnung handhaben', async () => {
      mockService.updateBusinessUserReviewStatus.mockRejectedValue(new Error('Network error'));

      const rejectButton = screen.getByRole('button', { name: /ablehnen/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ description: expect.any(String) })
        );
      });
    });
  });

  describe('Empty State', () => {
    it('sollte leere Nachricht anzeigen wenn keine User vorhanden', async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([]);

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('Keine Benutzer zur Überprüfung gefunden.')).toBeInTheDocument();
      });

      expect(screen.getByText('0 Benutzer zur Überprüfung gefunden')).toBeInTheDocument();
    });

    it('sollte User ohne needsReview herausfiltern', async () => {
      const userNotNeedingReview = createMockBusinessUser({
        needsReview: false,
      });

      mockService.getBusinessUsersInReview.mockResolvedValue([userNotNeedingReview]);

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('Keine Benutzer zur Überprüfung gefunden.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading Error Handling', () => {
    it('sollte Fehler beim Laden handhaben', async () => {
      mockService.getBusinessUsersInReview.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ description: expect.any(String) })
        );
      });
    });
  });

  describe('User without Businesses', () => {
    it('sollte User ohne Geschäfte korrekt anzeigen', async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserWithoutBusinesses]);

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('nobusiness@example.com')).toBeInTheDocument();
      });

      // User ohne Businesses hat keine Business-Sektion
      expect(screen.queryByText('Beanspruchte Geschäfte:')).not.toBeInTheDocument();
      expect(screen.queryByText('Beanspruchte Geschäfte:')).not.toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('sollte deutsche Datumsformatierung verwenden', async () => {
      const userWithSpecificDate = createMockBusinessUser({
        createdAt: '2024-12-25T15:30:00.000Z',
      });

      mockService.getBusinessUsersInReview.mockResolvedValue([userWithSpecificDate]);

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(
          screen.getByText((content, element) => content.includes('25. Dezember 2024'))
        ).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    it('sollte Aktiv-Status für nicht gelöschte User anzeigen', async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('Aktiv')).toBeInTheDocument();
      });
    });

    it('sollte Gelöscht-Status für gelöschte User anzeigen', async () => {
      const deletedUser = createMockBusinessUser({
        isDeleted: true,
      });

      mockService.getBusinessUsersInReview.mockResolvedValue([deletedUser]);

      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('Gelöscht')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      mockService.getBusinessUsersInReview.mockResolvedValue([mockUserNeedsReview]);
      renderWithRouter(<BusinessUserReview />);

      await waitFor(() => {
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
      });
    });

    it('sollte responsive Container-Klassen haben', () => {
      const container = screen.getByText('Geschäftsinhaber prüfen').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'relative', 'overflow-hidden');
    });

    it('sollte responsive Button-Layout haben', () => {
      const verifyButton = screen.getByText('Verifizieren');
      const buttonContainer = verifyButton.closest('[data-slot="card-footer"]');
      expect(buttonContainer).toHaveClass(
        'flex',
        'flex-col',
        'sm:flex-row',
        'justify-end',
        'gap-2'
      );
    });
  });
});
