import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserManagement } from '../UserManagement';
import { User, UserType } from '@/models/users';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock services
const mockUserService = {
  getAllUsers: jest.fn(),
  getBusinessUsersInReviewCount: jest.fn(),
  searchUsers: jest.fn(),
};

jest.mock('@/services/userService', () => ({
  useUserService: () => mockUserService,
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast: mockToast } = require('sonner');

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    if (formatStr === 'dd.MM.yyyy HH:mm') {
      return '01.01.2024 10:30';
    }
    if (formatStr === 'MMMM') {
      return 'Januar';
    }
    return '01.01.2024';
  }),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

// Helper function to create mock users
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  userType: UserType.USER,
  createdAt: '2024-01-01T10:30:00.000Z',
  updatedAt: '2024-01-01T10:30:00.000Z',
  isBlocked: false,
  ...overrides,
});

const mockUsers: User[] = [
  createMockUser({
    id: 'user-1',
    email: 'user1@example.com',
    name: 'User One',
    userType: UserType.USER,
    createdAt: '2024-01-15T10:30:00.000Z',
  }),
  createMockUser({
    id: 'user-2',
    email: 'admin@example.com',
    name: 'Admin User',
    userType: UserType.ADMIN,
    createdAt: '2024-01-10T10:30:00.000Z',
  }),
  createMockUser({
    id: 'user-3',
    email: 'business@example.com',
    name: 'Business User',
    userType: UserType.BUSINESS,
    createdAt: '2024-01-05T10:30:00.000Z',
    isBlocked: true,
  }),
  createMockUser({
    id: 'user-4',
    email: 'premium@example.com',
    name: 'Premium Business',
    userType: UserType.PREMIUM_BUSINESS,
    createdAt: '2024-01-20T10:30:00.000Z',
  }),
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService.getAllUsers.mockResolvedValue(mockUsers);
  });

  describe('Initial Rendering', () => {
    it('sollte die Hauptkomponente korrekt rendern', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      expect(screen.getByText('User-Verwaltung')).toBeInTheDocument();
      expect(screen.getByText('Zurück zum Dashboard')).toBeInTheDocument();
    });

    it('sollte User laden und anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(mockUserService.getAllUsers).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
        expect(screen.getByText('business@example.com')).toBeInTheDocument();
        expect(screen.getByText('premium@example.com')).toBeInTheDocument();
      });
    });

    it('sollte leeren Zustand anzeigen wenn keine User vorhanden', async () => {
      mockUserService.getAllUsers.mockResolvedValue([]);

      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('Keine User gefunden')).toBeInTheDocument();
        expect(
          screen.getByText('Es gibt aktuell keine registrierten Benutzer.')
        ).toBeInTheDocument();
      });
    });

    it('sollte Fehler beim Laden handhaben', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Statistics Display', () => {
    it('sollte Statistiken korrekt anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('Gesamt User')).toBeInTheDocument();
        expect(screen.getByText('Neue User')).toBeInTheDocument();
        expect(screen.getByText('Blockierte User')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument(); // Total users
        expect(screen.getByText('1')).toBeInTheDocument(); // Blocked users
      });
    });

    it('sollte Wachstumsstatistik anzeigen', async () => {
      // Mock users mit verschiedenen Daten für Wachstumsberechnung
      const currentMonthUsers = [
        createMockUser({
          id: 'user-new-1',
          email: 'new1@example.com',
          createdAt: new Date().toISOString(),
        }),
      ];
      const lastMonthUsers = [
        createMockUser({
          id: 'user-old-1',
          email: 'old1@example.com',
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ];

      mockUserService.getAllUsers.mockResolvedValue([...currentMonthUsers, ...lastMonthUsers]);

      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('Neue User')).toBeInTheDocument();
      });
    });
  });

  describe('User Type Badges', () => {
    it('sollte korrekte Badges für verschiedene User-Typen anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Business')).toBeInTheDocument();
        expect(screen.getByText('Premium Business')).toBeInTheDocument();
      });
    });
  });

  describe('Status Badges', () => {
    it('sollte Status-Badges korrekt anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        const activeBadges = screen.getAllByText('Aktiv');
        const blockedBadges = screen.getAllByText('Blockiert');

        expect(activeBadges.length).toBeGreaterThan(0);
        expect(blockedBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Table Display', () => {
    it('sollte User-Tabelle korrekt anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('E-Mail')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Typ')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Erstellt am')).toBeInTheDocument();
      });
    });

    it('sollte User nach createdAt absteigend sortieren (neueste zuerst)', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        const emailCells = screen.getAllByText(/@example\.com/);
        // Der neueste User sollte zuerst sein (user-4 mit createdAt 2024-01-20)
        expect(emailCells[0]).toHaveTextContent('premium@example.com');
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zum Dashboard navigieren', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      const dashboardButton = screen.getByText('Zurück zum Dashboard');
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Refresh Functionality', () => {
    it('sollte Daten beim Klick auf Aktualisieren neu laden', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /aktualisieren/i });

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Date Formatting', () => {
    it('sollte Datum korrekt formatiert anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        const dateElements = screen.getAllByText('01.01.2024 10:30');
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loading States', () => {
    it('sollte initialen Loading-State mit Skeleton-Elementen anzeigen', async () => {
      mockUserService.getAllUsers.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUsers), 100))
      );

      const { container } = renderWithRouter(<UserManagement />);

      // Prüfe dass Skeleton-Elemente während des Ladens angezeigt werden
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);

      await waitFor(() => {
        // Nach dem Laden sollten die echten User angezeigt werden
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('User Statistics Calculation', () => {
    it('sollte korrekte Anzahl blockierter User berechnen', async () => {
      const usersWithBlocked = [
        createMockUser({ id: 'user-1', isBlocked: true }),
        createMockUser({ id: 'user-2', isBlocked: false }),
        createMockUser({ id: 'user-3', isBlocked: true }),
      ];

      mockUserService.getAllUsers.mockResolvedValue(usersWithBlocked);

      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 blocked users
      });
    });

  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Labels und Strukturen haben', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      // Prüfe Hauptüberschrift
      const heading = screen.getByRole('heading', { name: /user-verwaltung/i });
      expect(heading).toBeInTheDocument();

      // Prüfe Buttons
      const refreshButton = screen.getByRole('button', { name: /aktualisieren/i });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('sollte Toast-Erfolg bei manuellem Refresh anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<UserManagement />);
      });

      await waitFor(() => {
        expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /aktualisieren/i });

      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalled();
      });
    });
  });
});

