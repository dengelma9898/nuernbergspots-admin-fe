import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../Dashboard';

// Mock Services
const mockGetPendingApprovalsCount = jest.fn();
const mockGetBusinessUsersInReviewCount = jest.fn();
const mockGetOpenContactRequestsCount = jest.fn();
const mockNavigate = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../services/userService', () => ({
  useUserService: () => ({
    getBusinessUsersInReviewCount: mockGetBusinessUsersInReviewCount,
  }),
}));

jest.mock('../../services/businessService', () => ({
  useBusinessService: () => ({
    getPendingApprovalsCount: mockGetPendingApprovalsCount,
  }),
}));

jest.mock('../../services/contactService', () => ({
  useContactService: () => ({
    getOpenContactRequestsCount: mockGetOpenContactRequestsCount,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    getUserId: () => 'test-user-id',
    user: null,
    login: jest.fn(),
    loading: false,
    isAuthenticated: false,
  }),
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
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

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
}));

// Mock Lucide Icons
jest.mock('lucide-react', () => ({
  User: () => <span data-testid="user-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  Store: () => <span data-testid="store-icon" />,
  LogOut: () => <span data-testid="logout-icon" />,
  Tags: () => <span data-testid="tags-icon" />,
  Key: () => <span data-testid="key-icon" />,
  ArrowRight: () => <span data-testid="arrow-right-icon" />,
  Tag: () => <span data-testid="tag-icon" />,
  TrendingUp: () => <span data-testid="trending-up-icon" />,
  TrendingDown: () => <span data-testid="trending-down-icon" />,
  Users: () => <span data-testid="users-icon" />,
  Scan: () => <span data-testid="scan-icon" />,
  BarChart: () => <span data-testid="bar-chart-icon" />,
  Euro: () => <span data-testid="euro-icon" />,
  MessageSquare: () => <span data-testid="message-square-icon" />,
  Briefcase: () => <span data-testid="briefcase-icon" />,
  MessageCircle: () => <span data-testid="message-circle-icon" />,
  Handshake: () => <span data-testid="handshake-icon" />,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPendingApprovalsCount.mockResolvedValue(0);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(0);
    mockGetOpenContactRequestsCount.mockResolvedValue(0);
  });

  it('renders dashboard header correctly', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    expect(screen.getByText(/Hi Sarah 👋, schön dass du wieder da bist ✨/)).toBeTruthy();
  });

  it('renders navigation sections', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Management')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Partner' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Events' })).toBeTruthy();
    expect(screen.getByText('Kontaktanfragen')).toBeTruthy();
    expect(screen.getByText('Community')).toBeTruthy();
    expect(screen.getByText('Analytics und Sonstiges')).toBeTruthy();
  });

  it('renders navigation cards', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Partner verwalten')).toBeTruthy();
    expect(screen.getByText('Business User verwalten')).toBeTruthy();
    expect(screen.getByText('Events verwalten')).toBeTruthy();
    expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
  });

  it('handles logout correctly', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    
    const logoutButton = screen.getByRole('button', { name: /Abmelden/i });
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to profile when profile button is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    
    const profileButton = screen.getAllByTestId('user-icon')[0].closest('button');
    await user.click(profileButton!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('displays pending approvals when available', async () => {
    mockGetPendingApprovalsCount.mockResolvedValue(5);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Ausstehende Partner ✍️')).toBeTruthy();
      expect(screen.getByText(/5/)).toBeTruthy();
    });
  });

  it('displays users in review when available', async () => {
    mockGetBusinessUsersInReviewCount.mockResolvedValue(3);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Geschäftsinhaber prüfen 🔍')).toBeTruthy();
      expect(screen.getByText(/3/)).toBeTruthy();
    });
  });

  it('displays open contact requests', async () => {
    mockGetOpenContactRequestsCount.mockResolvedValue(7);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Offene Kontaktanfragen 📧')).toBeTruthy();
      expect(screen.getByText(/7/)).toBeTruthy();
    });
  });

  it('navigates to businesses with pending filter when pending approvals button is clicked', async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalsCount.mockResolvedValue(5);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Jetzt prüfen')).toBeTruthy();
    });
    
    const checkButton = screen.getByText('Jetzt prüfen');
    await user.click(checkButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/contacts?filter=pending');
  });

  it('handles service errors gracefully', async () => {
    mockGetPendingApprovalsCount.mockRejectedValue(new Error('Service error'));
    mockGetBusinessUsersInReviewCount.mockRejectedValue(new Error('Service error'));
    mockGetOpenContactRequestsCount.mockRejectedValue(new Error('Service error'));
    
    render(<Dashboard />);
    
    // Component should still render without crashing
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
  });

  it('shows appropriate message when no pending items', async () => {
    mockGetPendingApprovalsCount.mockResolvedValue(0);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(0);
    mockGetOpenContactRequestsCount.mockResolvedValue(0);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      // Should not show pending approval cards when count is 0
      expect(screen.queryByText('Ausstehende Partner ✍️')).toBeFalsy();
      expect(screen.queryByText('Geschäftsinhaber prüfen 🔍')).toBeFalsy();
    });
    
    // But should still show contact requests card (always visible)
    expect(screen.getByText('Offene Kontaktanfragen 📧')).toBeTruthy();
  });

  it('displays correct emoji based on pending count', async () => {
    mockGetPendingApprovalsCount.mockResolvedValue(15); // > 10 should show 🔥
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/15.*🔥/)).toBeTruthy();
    });
  });

  it('shows appropriate greeting message based on pending items', async () => {
    mockGetPendingApprovalsCount.mockResolvedValue(15);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(5);
    mockGetOpenContactRequestsCount.mockResolvedValue(3);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Da wartet eine Menge Arbeit auf dich! 💪')).toBeTruthy();
    });
  });
}); 