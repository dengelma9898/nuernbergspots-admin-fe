import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserBlockManagement } from '../UserBlockManagement';
import { useUserService } from '@/services/userService';
import { User, UserType } from '@/models/users';

// Mock API module
jest.mock('@/lib/api', () => ({
  useApi: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  })),
  endpoints: {
    users: '/users',
    userProfile: (id: string) => `/users/${id}/profile`,
    businessUsers: '/users/business',
    businessUserById: (id: string) => `/users/business/${id}`,
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

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Data
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  userType: UserType.USER,
  customerId: 'NSP-user-1',
  isBlocked: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const mockActiveUser = createMockUser({
  customerId: 'NSP-user-1',
});
const mockBlockedUser = createMockUser({
  id: 'user-2',
  email: 'blocked@example.com',
  name: 'Blocked User',
  customerId: 'NSP-user-2',
  isBlocked: true,
  blockReason: 'Verstoß gegen Nutzungsbedingungen',
});

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('UserBlockManagement', () => {
  const mockService = {
    getAllUsers: jest.fn(),
    blockUser: jest.fn(),
    searchUsers: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUserService.mockReturnValue(mockService as any);
  });

  describe('Loading State', () => {
    it('sollte Loading-State mit Skeleton-Elementen anzeigen', () => {
      mockService.getAllUsers.mockImplementation(() => new Promise(() => {}));

      const { container } = renderWithRouter(<UserBlockManagement />);

      expect(screen.getByText('User Blockierung verwalten')).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    });
  });

  describe('User List Display', () => {
    it('sollte alle User anzeigen', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser, mockBlockedUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
        expect(screen.getAllByText('blocked@example.com').length).toBeGreaterThan(0);
      });
    });

    it('sollte Block-Status korrekt anzeigen', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser, mockBlockedUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('Aktiv').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Blockiert').length).toBeGreaterThan(0);
      });
    });

    it('sollte Block-Grund anzeigen wenn vorhanden', async () => {
      mockService.getAllUsers.mockResolvedValue([mockBlockedUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('Verstoß gegen Nutzungsbedingungen').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('sollte User nach E-Mail filtern', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser, mockBlockedUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText('User suchen (E-Mail, Name, ID)...');
      fireEvent.change(searchInput, { target: { value: 'blocked' } });

      await waitFor(() => {
        expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
        expect(screen.getAllByText('blocked@example.com').length).toBeGreaterThan(0);
      });
    });

    it('sollte User nach Name filtern', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser, mockBlockedUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText('User suchen (E-Mail, Name, ID)...');
      fireEvent.change(searchInput, { target: { value: 'Blocked' } });

      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.getAllByText('Blocked User').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Block Dialog', () => {
    it('sollte Block-Dialog öffnen wenn Blockieren-Button geklickt wird', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
      });

      const blockButtons = screen.getAllByText('Blockieren');
      fireEvent.click(blockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('User blockieren')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('z.B. Verstoß gegen Nutzungsbedingungen')).toBeInTheDocument();
      });
    });

    it('sollte Entsperren-Dialog öffnen wenn Entsperren-Button geklickt wird', async () => {
      mockService.getAllUsers.mockResolvedValue([mockBlockedUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('blocked@example.com').length).toBeGreaterThan(0);
      });

      const unblockButtons = screen.getAllByText('Entsperren');
      fireEvent.click(unblockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('User entsperren')).toBeInTheDocument();
      });
    });

    it('sollte User blockieren können', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser]);
      mockService.blockUser.mockResolvedValue({
        ...mockActiveUser,
        isBlocked: true,
        blockReason: 'Test Grund',
      });

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
      });

      const blockButtons = screen.getAllByText('Blockieren');
      fireEvent.click(blockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('User blockieren')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('z.B. Verstoß gegen Nutzungsbedingungen');
      fireEvent.change(reasonInput, { target: { value: 'Test Grund' } });

      // Finde den Button im Dialog (nicht in der Liste)
      const dialogButtons = screen.getAllByText('Blockieren');
      const confirmButton = dialogButtons.find(btn => btn.closest('[data-slot="dialog-content"]'));
      if (confirmButton) {
        fireEvent.click(confirmButton);
      } else {
        // Fallback: nimm den letzten Button (sollte der Dialog-Button sein)
        fireEvent.click(dialogButtons[dialogButtons.length - 1]);
      }

      await waitFor(() => {
        expect(mockService.blockUser).toHaveBeenCalledWith({
          customerId: 'NSP-user-1',
          isBlocked: true,
          blockReason: 'Test Grund',
        });
      });
    });

    it('sollte User entsperren können', async () => {
      mockService.getAllUsers.mockResolvedValue([mockBlockedUser]);
      mockService.blockUser.mockResolvedValue({
        ...mockBlockedUser,
        isBlocked: false,
        blockReason: undefined,
      });

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('blocked@example.com').length).toBeGreaterThan(0);
      });

      const unblockButtons = screen.getAllByText('Entsperren');
      fireEvent.click(unblockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('User entsperren')).toBeInTheDocument();
      });

      // Finde den Button im Dialog
      const dialogButtons = screen.getAllByText('Entsperren');
      const confirmButton = dialogButtons.find(btn => btn.closest('[data-slot="dialog-content"]'));
      if (confirmButton) {
        fireEvent.click(confirmButton);
      } else {
        fireEvent.click(dialogButtons[dialogButtons.length - 1]);
      }

      await waitFor(() => {
        expect(mockService.blockUser).toHaveBeenCalledWith({
          customerId: 'NSP-user-2',
          isBlocked: false,
          blockReason: undefined,
        });
      });
    });

    it('sollte Blockieren-Button deaktivieren wenn kein Grund angegeben', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
      });

      const blockButtons = screen.getAllByText('Blockieren');
      fireEvent.click(blockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('User blockieren')).toBeInTheDocument();
      });

      // Finde den Button im Dialog - sollte disabled sein wenn kein Grund angegeben
      const dialogButtons = screen.getAllByText('Blockieren');
      // Der Dialog-Button sollte der letzte sein (nach dem Öffnen des Dialogs)
      const confirmButton = dialogButtons[dialogButtons.length - 1];
      
      // Prüfe ob der Button disabled ist (kann als disabled-Attribut oder aria-disabled sein)
      // Oder prüfe ob der Button nicht klickbar ist
      const isDisabled = confirmButton.hasAttribute('disabled') || 
                        confirmButton.getAttribute('aria-disabled') === 'true' ||
                        confirmButton.closest('button')?.hasAttribute('disabled');
      
      expect(isDisabled || confirmButton.closest('button[disabled]')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('sollte Fehler beim Laden der User behandeln', async () => {
      mockService.getAllUsers.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getByText('User Blockierung verwalten')).toBeInTheDocument();
      });
    });

    it('sollte Fehler beim Blockieren behandeln', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser]);
      mockService.blockUser.mockRejectedValue(new Error('Block failed'));

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
      });

      const blockButtons = screen.getAllByText('Blockieren');
      fireEvent.click(blockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('User blockieren')).toBeInTheDocument();
      });

      const reasonInput = screen.getByPlaceholderText('z.B. Verstoß gegen Nutzungsbedingungen');
      fireEvent.change(reasonInput, { target: { value: 'Test Grund' } });

      // Finde den Button im Dialog
      const dialogButtons = screen.getAllByText('Blockieren');
      const confirmButton = dialogButtons.find(btn => btn.closest('[data-slot="dialog-content"]'));
      if (confirmButton) {
        fireEvent.click(confirmButton);
      } else {
        fireEvent.click(dialogButtons[dialogButtons.length - 1]);
      }

      await waitFor(() => {
        expect(mockService.blockUser).toHaveBeenCalled();
      });
    });
  });

  describe('Empty State', () => {
    it('sollte leeren Zustand anzeigen wenn keine User vorhanden', async () => {
      mockService.getAllUsers.mockResolvedValue([]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getByText('Keine User vorhanden')).toBeInTheDocument();
      });
    });

    it('sollte "Keine User gefunden" anzeigen wenn Suche keine Ergebnisse liefert', async () => {
      mockService.getAllUsers.mockResolvedValue([mockActiveUser]);

      renderWithRouter(<UserBlockManagement />);

      await waitFor(() => {
        expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText('User suchen (E-Mail, Name, ID)...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('Keine User gefunden')).toBeInTheDocument();
      });
    });
  });
});

