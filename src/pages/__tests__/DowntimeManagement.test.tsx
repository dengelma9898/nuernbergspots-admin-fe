import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DowntimeManagement } from '../DowntimeManagement';

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

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled }: any) => (
    <button
      data-testid="switch"
      data-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      aria-label="Toggle downtime"
    >
      {checked ? 'ON' : 'OFF'}
    </button>
  ),
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="alert-dialog" data-open={open}>
      {open && children}
    </div>
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
  AlertDialogCancel: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-testid="alert-dialog-cancel">
      {children}
    </button>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
}));

// Mock Toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Downtime Service
const mockDowntimeService = {
  getDowntimeStatus: jest.fn(),
  setDowntimeStatus: jest.fn(),
};

jest.mock('@/services/downtimeService', () => ({
  useDowntimeService: () => mockDowntimeService,
}));

describe('DowntimeManagement Component', () => {
  const user = userEvent.setup();
  const { toast } = require('sonner');

  beforeEach(() => {
    jest.clearAllMocks();
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <DowntimeManagement />
      </BrowserRouter>
    );
  };

  it('renders downtime management page correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Downtime-Verwaltung')).toBeTruthy();
      expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
      expect(screen.getByText('Downtime-Status')).toBeTruthy();
      expect(screen.getByText('Verwalten Sie den Wartungsmodus der Anwendung')).toBeTruthy();
    });
  });

  it('loads downtime status on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockDowntimeService.getDowntimeStatus).toHaveBeenCalledTimes(1);
    });
  });

  it('displays skeleton loading state initially', () => {
    const { container } = renderComponent();

    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays downtime status correctly when inactive', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Downtime aktiv')).toBeTruthy();
      expect(screen.getByText(/Die Anwendung ist derzeit verfügbar/)).toBeTruthy();
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.getAttribute('data-checked')).toBe('false');
    });
  });

  it('displays downtime status correctly when active', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Downtime aktiv')).toBeTruthy();
      expect(screen.getByText(/Die Anwendung ist derzeit im Wartungsmodus/)).toBeTruthy();
      expect(screen.getByText('Aktiv')).toBeTruthy();
      expect(screen.getByText('Wartungsmodus aktiv')).toBeTruthy();
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.getAttribute('data-checked')).toBe('true');
    });
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

  it('opens confirmation dialog when toggle is clicked to activate', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });

    renderComponent();

    await waitFor(() => {
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog-content')).toBeTruthy();
      expect(screen.getByText('Downtime aktivieren')).toBeTruthy();
      expect(
        screen.getByText(/Möchten Sie den Downtime wirklich aktivieren/)
      ).toBeTruthy();
    });
  });

  it('opens confirmation dialog when toggle is clicked to deactivate', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: true,
    });

    renderComponent();

    await waitFor(() => {
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog-content')).toBeTruthy();
      expect(screen.getByText('Downtime deaktivieren')).toBeTruthy();
      expect(
        screen.getByText(/Möchten Sie den Downtime wirklich deaktivieren/)
      ).toBeTruthy();
    });
  });

  it('confirms and activates downtime when confirmed', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });
    mockDowntimeService.setDowntimeStatus.mockResolvedValue({
      isDowntime: true,
    });

    renderComponent();

    await waitFor(() => {
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    await waitFor(() => {
      const confirmButton = screen.getByTestId('alert-dialog-action');
      expect(confirmButton).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDowntimeService.setDowntimeStatus).toHaveBeenCalledWith(true);
      expect(toast.success).toHaveBeenCalledWith('Downtime wurde aktiviert');
    });
  });

  it('confirms and deactivates downtime when confirmed', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: true,
    });
    mockDowntimeService.setDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });

    renderComponent();

    await waitFor(() => {
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    await waitFor(() => {
      const confirmButton = screen.getByTestId('alert-dialog-action');
      expect(confirmButton).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDowntimeService.setDowntimeStatus).toHaveBeenCalledWith(false);
      expect(toast.success).toHaveBeenCalledWith('Downtime wurde deaktiviert');
    });
  });

  it('cancels toggle when cancel button is clicked', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });

    renderComponent();

    await waitFor(() => {
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    await waitFor(() => {
      const cancelButton = screen.getByTestId('alert-dialog-cancel');
      expect(cancelButton).toBeTruthy();
    });

    const cancelButton = screen.getByTestId('alert-dialog-cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockDowntimeService.setDowntimeStatus).not.toHaveBeenCalled();
    });
  });

  it('handles service error when loading status', async () => {
    mockDowntimeService.getDowntimeStatus.mockRejectedValue(new Error('Service error'));

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Fehler beim Laden des Downtime-Status');
    });
  });

  it('handles service error when updating status', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: false,
    });
    mockDowntimeService.setDowntimeStatus.mockRejectedValue(new Error('Update error'));

    renderComponent();

    await waitFor(() => {
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    await waitFor(() => {
      const confirmButton = screen.getByTestId('alert-dialog-action');
      expect(confirmButton).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Fehler beim Aktualisieren des Downtime-Status');
    });
  });

  it('disables switch during loading', () => {
    renderComponent();

    // During loading, the switch is not rendered (only skeleton is shown)
    expect(screen.queryByTestId('switch')).not.toBeTruthy();
    const skeletonElements = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('shows warning message when downtime is active', async () => {
    mockDowntimeService.getDowntimeStatus.mockResolvedValue({
      isDowntime: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Wartungsmodus aktiv')).toBeTruthy();
      expect(
        screen.getByText(/Die Anwendung ist derzeit nicht verfügbar/)
      ).toBeTruthy();
      expect(screen.getByTestId('alert-triangle-icon')).toBeTruthy();
    });
  });

  it('displays icons correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('arrow-left-icon')).toBeTruthy();
    });
  });
});

