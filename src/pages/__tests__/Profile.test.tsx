import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from '../Profile';
import { toast } from 'sonner';

// Mock Services
const mockGetCurrentUser = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../services/userService', () => ({
  useUserService: () => ({
    getUserProfile: mockGetCurrentUser,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
    logout: jest.fn(),
    getUserId: () => 'test-user-id',
    login: jest.fn(),
    loading: false,
    isAuthenticated: true,
  }),
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => (
    <div className={className} data-testid="avatar">
      {children}
    </div>
  ),
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
  AvatarImage: ({ src }: any) => <img src={src} data-testid="avatar-image" />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock Lucide Icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon" />,
  User: () => <span data-testid="user-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  MapPin: () => <span data-testid="mappin-icon" />,
  Store: () => <span data-testid="store-icon" />,
  Heart: () => <span data-testid="heart-icon" />,
  History: () => <span data-testid="history-icon" />,
  Settings: () => <span data-testid="settings-icon" />,
}));

// Mock Sonner Toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'John Doe',
      userType: 'admin',
      managementId: 'MGT123',
      currentCityId: 'Nürnberg',
      businessHistory: [
        {
          businessName: 'Test Business',
          benefit: 'Test Benefit',
          visitedAt: '2023-01-01',
        }
      ],
      favoriteEventIds: ['event1', 'event2'],
      favoriteBusinessIds: ['business1'],
      memberSince: '2023-01-01',
      preferences: ['pref1'],
      language: 'de',
    });
  });

  it('renders profile page correctly', async () => {
    render(<Profile />);
    
    expect(screen.getByText('Mein Profil')).toBeTruthy();
    expect(screen.getByText('Zurück')).toBeTruthy();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('test@example.com')).toBeTruthy();
      expect(screen.getByText('admin')).toBeTruthy();
    });
  });

  it('displays user statistics', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('E-Mail')).toBeTruthy();
      expect(screen.getByText('Management ID')).toBeTruthy();
      expect(screen.getByText('Stadt')).toBeTruthy();
      expect(screen.getByText('Besuchte Geschäfte')).toBeTruthy();
    });
  });

  it('loads user data on mount', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalledWith('test-user-id');
    });
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<Profile />);
    
    const backButton = screen.getByTestId('arrow-left-icon').closest('button');
    await user.click(backButton!);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('handles loading user data error', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Failed to load user'));
    
    render(<Profile />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Die Benutzerdaten konnten nicht geladen werden.');
    });
  });

  it('displays user statistics with correct values', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('MGT123')).toBeTruthy();
      expect(screen.getByText('Nürnberg')).toBeTruthy();
      expect(screen.getAllByText('1')).toHaveLength(2); // businessHistory and favoriteBusinessIds length
      expect(screen.getByText('2')).toBeTruthy(); // favoriteEventIds length
    });
  });

  it('displays recent activity', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('Letzte Aktivitäten')).toBeTruthy();
      expect(screen.getByText('Test Business')).toBeTruthy();
      expect(screen.getByText('Benefit: Test Benefit')).toBeTruthy();
    });
  });

  it('displays preferences section', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('Präferenzen')).toBeTruthy();
      expect(screen.getByText('Sprache')).toBeTruthy();
      expect(screen.getByText('de')).toBeTruthy();
    });
  });

  it('handles user data with missing fields', async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      // Missing other fields
    });
    
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeTruthy();
      expect(screen.getByText('Benutzer')).toBeTruthy(); // fallback name
    });
  });

  it('shows no activities message when no business history', async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'John Doe',
      businessHistory: [],
    });
    
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('Keine Aktivitäten vorhanden')).toBeTruthy();
    });
  });

  it('displays avatar with fallback', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByTestId('avatar-fallback')).toBeTruthy();
      expect(screen.getByText('J')).toBeTruthy(); // First letter of name
         });
   });
 }); 