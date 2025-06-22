import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AccountManagement } from '../AccountManagement';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-trigger">{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="alert-dialog-title">{children}</h3>
  ),
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button onClick={onClick} data-testid="alert-dialog-action">
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
}));

// Mock Toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Account Management Service
const mockAccountManagementService = {
  getAnonymousAccountStats: jest.fn(),
  cleanupAnonymousAccounts: jest.fn(),
};

jest.mock('@/services/accountManagementService', () => ({
  useAccountManagementService: () => mockAccountManagementService,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '15.01.2024'),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

describe('AccountManagement Component', () => {
  const user = userEvent.setup();
  const { toast } = require('sonner');

  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountManagementService.getAnonymousAccountStats.mockResolvedValue({
      total: 150,
      oldAccounts: 25,
      cutoffDate: '2024-01-15T00:00:00.000Z',
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AccountManagement />
      </BrowserRouter>
    );
  };

  it('renders account management page correctly', async () => {
    renderComponent();

    // Wait for content to load after skeleton
    await waitFor(() => {
      expect(screen.getByText('Account-Management')).toBeTruthy();
      expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
      expect(screen.getByText('Anonyme Accounts')).toBeTruthy();
      expect(
        screen.getByText('Verwaltung und Bereinigung von anonymen Benutzeraccounts')
      ).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText('150')).toBeTruthy();
      expect(screen.getByText('25')).toBeTruthy();
    });
  });

  it('loads account statistics on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockAccountManagementService.getAnonymousAccountStats).toHaveBeenCalledTimes(1);
    });
  });

  it('displays skeleton loading state initially', () => {
    const { container } = renderComponent();

    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBe(14); // 2 header + 2 card header + 9 stats (3 cards * 3 elements each) + 1 button
  });

  it('displays account statistics correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('150')).toBeTruthy();
      expect(screen.getByText('25')).toBeTruthy();
      expect(screen.getByText('15.01.2024')).toBeTruthy();
    });

    expect(screen.getByText('Gesamt')).toBeTruthy();
    expect(screen.getByText('Älter als 5 Tage')).toBeTruthy();
    expect(screen.getByText('Alle Accounts älter als')).toBeTruthy();
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      const backButton = screen.getByText('Zurück zum Dashboard');
      expect(backButton).toBeTruthy();
    });

    const backButton = screen.getByText('Zurück zum Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles service error gracefully', async () => {
    mockAccountManagementService.getAnonymousAccountStats.mockRejectedValue(
      new Error('Service error')
    );

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Fehler beim Laden der Statistiken');
    });

    expect(screen.getByText('Keine Daten verfügbar')).toBeTruthy();
  });

  it('displays no data message when stats is null', async () => {
    mockAccountManagementService.getAnonymousAccountStats.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Keine Daten verfügbar')).toBeTruthy();
    });
  });

  it('enables cleanup button when old accounts exist', async () => {
    renderComponent();

    await waitFor(() => {
      const cleanupButton = screen.getByText('Alte Accounts bereinigen');
      expect(cleanupButton).toBeTruthy();
      expect(cleanupButton.closest('button')?.disabled).toBe(false);
    });
  });

  it('disables cleanup button when no old accounts exist', async () => {
    mockAccountManagementService.getAnonymousAccountStats.mockResolvedValue({
      total: 150,
      oldAccounts: 0,
      cutoffDate: '2024-01-15T00:00:00.000Z',
    });

    renderComponent();

    await waitFor(() => {
      const cleanupButton = screen.getByText('Alte Accounts bereinigen');
      expect(cleanupButton.closest('button')?.disabled).toBe(true);
    });
  });

  it('shows cleanup confirmation dialog', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog-title')).toBeTruthy();
      expect(screen.getByText('Anonyme Accounts bereinigen')).toBeTruthy();
      expect(screen.getByText(/Möchten Sie wirklich alle anonymen Accounts löschen/)).toBeTruthy();
    });
  });

  it('performs cleanup when confirmed', async () => {
    mockAccountManagementService.cleanupAnonymousAccounts.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      const confirmButton = screen.getByTestId('alert-dialog-action');
      expect(confirmButton).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockAccountManagementService.cleanupAnonymousAccounts).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('Anonyme Accounts erfolgreich bereinigt');
    });
  });

  it('handles cleanup error gracefully', async () => {
    mockAccountManagementService.cleanupAnonymousAccounts.mockRejectedValue(
      new Error('Cleanup error')
    );

    renderComponent();

    await waitFor(() => {
      const confirmButton = screen.getByTestId('alert-dialog-action');
      expect(confirmButton).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Fehler beim Bereinigen der anonymen Accounts');
    });
  });

  it('displays icons correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('arrow-left-icon')).toBeTruthy();
      expect(screen.getByTestId('users-icon')).toBeTruthy();
      expect(screen.getByTestId('clock-icon')).toBeTruthy();
      expect(screen.getByTestId('calendar-icon')).toBeTruthy();
      expect(screen.getByTestId('trash2-icon')).toBeTruthy();
    });
  });

  it('handles missing cutoff date', async () => {
    mockAccountManagementService.getAnonymousAccountStats.mockResolvedValue({
      total: 150,
      oldAccounts: 25,
      cutoffDate: undefined,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nie')).toBeTruthy();
    });
  });

  it('shows loading state during cleanup', async () => {
    mockAccountManagementService.cleanupAnonymousAccounts.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderComponent();

    await waitFor(() => {
      const confirmButton = screen.getByTestId('alert-dialog-action');
      expect(confirmButton).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    // Should show loading state briefly
    expect(screen.getByText('Bereinigung läuft...')).toBeTruthy();
  });
});
