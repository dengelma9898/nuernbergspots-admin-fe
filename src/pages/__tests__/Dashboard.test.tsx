import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../Dashboard';

// Mock Services with Promise control for testing loading states
let pendingApprovalsPromiseResolve: (value: number) => void;
let usersInReviewPromiseResolve: (value: number) => void;
let contactRequestsPromiseResolve: (value: number) => void;

const mockGetPendingApprovalsCount = jest.fn();
const mockGetBusinessUsersInReviewCount = jest.fn();
const mockGetOpenContactRequestsCount = jest.fn();
const mockGetAllUsers = jest.fn();
const mockNavigate = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../services/userService', () => ({
  useUserService: () => ({
    getBusinessUsersInReviewCount: mockGetBusinessUsersInReviewCount,
    getAllUsers: mockGetAllUsers,
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
  ...jest.requireActual('lucide-react'),
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
  Power: () => <span data-testid="power-icon" />,
  Shield: () => <span data-testid="shield-icon" />,
  FileText: () => <span data-testid="file-text-icon" />,
  Package: () => <span data-testid="package-icon" />,
  Car: () => <span data-testid="car-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  Sparkles: () => <span data-testid="sparkles-icon" />,
  Star: () => <span data-testid="star-icon" />,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAllUsers.mockResolvedValue([]);
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: true,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Set up controlled promises for testing loading states
    mockGetPendingApprovalsCount.mockImplementation(() => {
      return new Promise(resolve => {
        pendingApprovalsPromiseResolve = resolve;
      });
    });

    mockGetBusinessUsersInReviewCount.mockImplementation(() => {
      return new Promise(resolve => {
        usersInReviewPromiseResolve = resolve;
      });
    });

    mockGetOpenContactRequestsCount.mockImplementation(() => {
      return new Promise(resolve => {
        contactRequestsPromiseResolve = resolve;
      });
    });
  });

  it('renders dashboard header correctly', () => {
    render(<Dashboard />);

    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    expect(screen.getByText(/Hi Sarah 👋, schön dass du wieder da bist ✨/)).toBeTruthy();
  });

  it('renders navigation sections', () => {
    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: 'Partner' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Events' })).toBeTruthy();
    expect(screen.getByText('Kontaktanfragen')).toBeTruthy();
    expect(screen.getByText('Community')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Kuratierte Inhalte' })).toBeTruthy();
    expect(screen.getByText('Analytics und Sonstiges')).toBeTruthy();
  });

  it('renders navigation cards', () => {
    render(<Dashboard />);

    expect(screen.getByText('Partner verwalten')).toBeTruthy();
    expect(screen.getByText('Business User verwalten')).toBeTruthy();
    expect(screen.getByText('Events verwalten')).toBeTruthy();
    expect(screen.getByText('Kuratierte Spots')).toBeTruthy();
    expect(screen.getByText('Spot-Keywords')).toBeTruthy();
    expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
  });

  describe('Skeleton Loading States', () => {
    it('shows skeleton for pending approvals while loading', () => {
      render(<Dashboard />);

      // Should show skeleton with title but no actual count
      expect(screen.getByText('Ausstehende Partner ✍️')).toBeTruthy();

      // Should have skeleton elements (animate-pulse classes)
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('shows skeleton for users in review while loading', () => {
      render(<Dashboard />);

      // Should show skeleton with title
      expect(screen.getByText('Geschäftsinhaber prüfen 🔍')).toBeTruthy();

      // Should have skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('shows skeleton for contact requests while loading', () => {
      render(<Dashboard />);

      // Should show skeleton with title
      expect(screen.getByText('Offene Kontaktanfragen 📧')).toBeTruthy();

      // Should have skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('replaces skeleton with real data when pending approvals loads', async () => {
      render(<Dashboard />);

      // Initially should show skeleton
      expect(screen.getByText('Ausstehende Partner ✍️')).toBeTruthy();
      const initialSkeletons = document.querySelectorAll('.animate-pulse');
      expect(initialSkeletons.length).toBeGreaterThan(0);

      // Resolve pending approvals with count > 0
      pendingApprovalsPromiseResolve(5);

      await waitFor(() => {
        expect(screen.getByText('5 neue Geschäfte warten auf Genehmigung')).toBeTruthy();
      });
    });

    it('replaces skeleton with real data when users in review loads', async () => {
      render(<Dashboard />);

      // Initially should show skeleton
      expect(screen.getByText('Geschäftsinhaber prüfen 🔍')).toBeTruthy();

      // Resolve users in review with count > 0
      usersInReviewPromiseResolve(3);

      await waitFor(() => {
        expect(screen.getByText('3 Geschäftsinhaber warten auf Verifizierung')).toBeTruthy();
      });
    });

    it('replaces skeleton with real data when contact requests loads', async () => {
      render(<Dashboard />);

      // Initially should show skeleton
      expect(screen.getByText('Offene Kontaktanfragen 📧')).toBeTruthy();

      // Resolve contact requests
      contactRequestsPromiseResolve(7);

      await waitFor(() => {
        expect(screen.getByText('7 neue Kontaktanfragen warten auf Bearbeitung')).toBeTruthy();
      });
    });

    it('hides pending approvals card when count is 0 after loading', async () => {
      render(<Dashboard />);

      // Initially should show skeleton
      expect(screen.getByText('Ausstehende Partner ✍️')).toBeTruthy();

      // Resolve with 0 count
      pendingApprovalsPromiseResolve(0);

      await waitFor(() => {
        // Card should be hidden when count is 0
        expect(screen.queryByText('0 neue Geschäfte warten auf Genehmigung')).toBeFalsy();
        expect(screen.queryByText('Neues Geschäft wartet auf Genehmigung')).toBeFalsy();
      });
    });

    it('hides users in review card when count is 0 after loading', async () => {
      render(<Dashboard />);

      // Initially should show skeleton
      expect(screen.getByText('Geschäftsinhaber prüfen 🔍')).toBeTruthy();

      // Resolve with 0 count
      usersInReviewPromiseResolve(0);

      await waitFor(() => {
        // Card should be hidden when count is 0
        expect(screen.queryByText('0 Geschäftsinhaber warten auf Verifizierung')).toBeFalsy();
        expect(screen.queryByText('Geschäftsinhaber wartet auf Verifizierung')).toBeFalsy();
      });
    });

    it('always shows contact requests card even when count is 0', async () => {
      render(<Dashboard />);

      // Initially should show skeleton
      expect(screen.getByText('Offene Kontaktanfragen 📧')).toBeTruthy();

      // Resolve with 0 count
      contactRequestsPromiseResolve(0);

      await waitFor(() => {
        // Card should still be visible with 0 count
        expect(screen.getByText('0 neue Kontaktanfragen warten auf Bearbeitung')).toBeTruthy();
      });
    });
  });

  // Legacy tests updated to use simple resolved promises
  it('displays pending approvals when available', async () => {
    // Mock to resolve immediately for this test
    mockGetPendingApprovalsCount.mockResolvedValue(5);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(0);
    mockGetOpenContactRequestsCount.mockResolvedValue(0);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ausstehende Partner ✍️')).toBeTruthy();
      expect(screen.getByText('5 neue Geschäfte warten auf Genehmigung')).toBeTruthy();
    });
  });

  it('displays users in review when available', async () => {
    // Mock to resolve immediately for this test
    mockGetPendingApprovalsCount.mockResolvedValue(0);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(3);
    mockGetOpenContactRequestsCount.mockResolvedValue(0);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Geschäftsinhaber prüfen 🔍')).toBeTruthy();
      expect(screen.getByText('3 Geschäftsinhaber warten auf Verifizierung')).toBeTruthy();
    });
  });

  it('displays open contact requests', async () => {
    // Mock to resolve immediately for this test
    mockGetPendingApprovalsCount.mockResolvedValue(0);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(0);
    mockGetOpenContactRequestsCount.mockResolvedValue(7);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Offene Kontaktanfragen 📧')).toBeTruthy();
      expect(screen.getByText('7 neue Kontaktanfragen warten auf Bearbeitung')).toBeTruthy();
    });
  });

  it('navigates to businesses with pending filter when pending approvals button is clicked', async () => {
    const user = userEvent.setup();
    // Mock to resolve immediately for this test
    mockGetPendingApprovalsCount.mockResolvedValue(5);
    mockGetBusinessUsersInReviewCount.mockResolvedValue(0);
    mockGetOpenContactRequestsCount.mockResolvedValue(0);

    render(<Dashboard />);

    // Wait for the data to load and the real card content to appear (not skeleton)
    await waitFor(() => {
      expect(screen.getByText('5 neue Geschäfte warten auf Genehmigung')).toBeTruthy();
    });

    // Find the button specifically in the pending approvals card by looking for the button near the "Ausstehende Partner" text
    const pendingApprovalsSection = screen
      .getByText('Ausstehende Partner ✍️')
      .closest('[data-testid="card"]');
    const checkButton = within(pendingApprovalsSection!).getByText('Jetzt prüfen');
    await user.click(checkButton);

    expect(mockNavigate).toHaveBeenCalledWith('/businesses?filter=pending');
  });

  it('handles service errors gracefully', async () => {
    mockGetPendingApprovalsCount.mockRejectedValue(new Error('Service error'));
    mockGetBusinessUsersInReviewCount.mockRejectedValue(new Error('Service error'));
    mockGetOpenContactRequestsCount.mockRejectedValue(new Error('Service error'));

    render(<Dashboard />);

    // Component should still render without crashing
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();

    // After errors, skeletons should disappear
    await waitFor(() => {
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      // Should have fewer skeleton elements after loading completes (even with errors)
      expect(skeletonElements.length).toBeLessThan(10);
    });
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
    mockGetBusinessUsersInReviewCount.mockResolvedValue(0);
    mockGetOpenContactRequestsCount.mockResolvedValue(0);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('🔥')).toBeTruthy();
      expect(screen.getByText('15 neue Geschäfte warten auf Genehmigung')).toBeTruthy();
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
