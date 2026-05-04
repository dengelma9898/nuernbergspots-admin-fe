import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expectToastSuccessTitle } from '@/test-utils/sonnerAssertions';
import { AppVersionManagement } from '../AppVersionManagement';

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
  Button: ({ children, onClick, disabled, variant, className, type }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      data-testid="button"
      type={type}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, disabled, placeholder, id, className, pattern }: any) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      pattern={pattern}
      data-testid="version-input"
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
}));

// Mock Toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock error utils
jest.mock('@/utils/errorUtils', () => ({
  showUserFriendlyError: jest.fn((error, toast, retry, key) => {
    toast.error(`Fehler beim ${key}`);
  }),
  showSuccessMessage: jest.fn((toast, options) => {
    toast.success(options.title, {
      description: options.description,
    });
  }),
}));

// Mock AppVersion Service
const mockAppVersionService = {
  getMinimumVersion: jest.fn(),
  setMinimumVersion: jest.fn(),
  getAllChangelogs: jest.fn().mockResolvedValue([]),
  getChangelogByVersion: jest.fn().mockResolvedValue(null),
};

jest.mock('@/services/appVersionService', () => ({
  useAppVersionService: () => mockAppVersionService,
}));

describe('AppVersionManagement Component', () => {
  const user = userEvent.setup();
  const { toast } = require('sonner');

  beforeEach(() => {
    jest.clearAllMocks();
    mockAppVersionService.getMinimumVersion.mockResolvedValue({
      id: 'current',
      minimumVersion: '1.2.3',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    });
    mockAppVersionService.getAllChangelogs.mockResolvedValue([]);
    mockAppVersionService.getChangelogByVersion.mockResolvedValue(null);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AppVersionManagement />
      </BrowserRouter>
    );
  };

  it('renders app version management page correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('App-Version-Verwaltung')).toBeTruthy();
      expect(screen.getByText('Aktuelle Mindestversion')).toBeTruthy();
      expect(screen.getByText('Mindestversion setzen')).toBeTruthy();
    });
  });

  it('loads minimum version on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockAppVersionService.getMinimumVersion).toHaveBeenCalledTimes(1);
    });
  });

  it('displays skeleton loading state initially', () => {
    const { container } = renderComponent();

    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays current version correctly when version exists', async () => {
    mockAppVersionService.getMinimumVersion.mockResolvedValue({
      id: 'current',
      minimumVersion: '1.2.3',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('1.2.3')).toBeTruthy();
      expect(screen.getByText('Aktiv')).toBeTruthy();
    });
  });

  it('displays no version message when version does not exist', async () => {
    mockAppVersionService.getMinimumVersion.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Keine Version konfiguriert')).toBeTruthy();
      expect(screen.getByText('Nicht gesetzt')).toBeTruthy();
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

  it('allows entering version in input field', async () => {
    renderComponent();

    await waitFor(() => {
      const input = screen.getByTestId('version-input');
      expect(input).toBeTruthy();
    });

    const input = screen.getByTestId('version-input') as HTMLInputElement;
    await user.type(input, '2.0.0');

    expect(input.value).toBe('1.2.32.0.0'); // Existing value + new input
  });

  it('validates version format and shows error for invalid format', async () => {
    renderComponent();

    await waitFor(() => {
      const input = screen.getByTestId('version-input');
      expect(input).toBeTruthy();
    });

    const input = screen.getByTestId('version-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'invalid-version' } });

    // Find form and submit it directly since button might be disabled
    const form = input.closest('form');
    expect(form).toBeTruthy();
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Ungültiges Versionsformat')
      );
    });
  });

  it('validates version format and shows error for empty input', async () => {
    mockAppVersionService.getMinimumVersion.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      const input = screen.getByTestId('version-input');
      expect(input).toBeTruthy();
    });

    const input = screen.getByTestId('version-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });

    // Find form and submit it directly since button is disabled when empty
    const form = input.closest('form');
    expect(form).toBeTruthy();
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Bitte geben Sie eine Version ein');
    });
  });

  it('saves version successfully with valid format', async () => {
    mockAppVersionService.setMinimumVersion.mockResolvedValue({
      id: 'current',
      minimumVersion: '2.0.0',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    });

    renderComponent();

    await waitFor(() => {
      const input = screen.getByTestId('version-input');
      expect(input).toBeTruthy();
    });

    const input = screen.getByTestId('version-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2.0.0' } });

    const submitButton = screen.getByText('Version speichern');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAppVersionService.setMinimumVersion).toHaveBeenCalledWith({
        minimumVersion: '2.0.0',
      });
      expectToastSuccessTitle(toast.success as jest.Mock, 'Mindestversion aktualisiert');
    });
  });

  it('uses current version button when version exists', async () => {
    renderComponent();

    await waitFor(() => {
      const useCurrentButton = screen.getByText('Aktuelle Version verwenden');
      expect(useCurrentButton).toBeTruthy();
    });

    const useCurrentButton = screen.getByText('Aktuelle Version verwenden');
    await user.click(useCurrentButton);

    await waitFor(() => {
      const input = screen.getByTestId('version-input') as HTMLInputElement;
      expect(input.value).toBe('1.2.3');
    });
  });

  it('does not show use current version button when no version exists', async () => {
    mockAppVersionService.getMinimumVersion.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Aktuelle Version verwenden')).not.toBeTruthy();
    });
  });

  it('handles service error when loading version', async () => {
    mockAppVersionService.getMinimumVersion.mockRejectedValue(new Error('Service error'));

    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('handles service error when saving version', async () => {
    mockAppVersionService.setMinimumVersion.mockRejectedValue(new Error('Save error'));

    renderComponent();

    await waitFor(() => {
      const input = screen.getByTestId('version-input');
      expect(input).toBeTruthy();
    });

    const input = screen.getByTestId('version-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2.0.0' } });

    const submitButton = screen.getByText('Version speichern');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('disables input and button during loading', () => {
    renderComponent();

    // During loading, the input is not rendered (only skeleton is shown)
    expect(screen.queryByTestId('version-input')).not.toBeTruthy();
    const skeletonElements = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('disables submit button when input is empty', async () => {
    mockAppVersionService.getMinimumVersion.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      const submitButton = screen.getByText('Version speichern').closest('button');
      expect(submitButton).toBeTruthy();
      expect(submitButton).toBeDisabled();
    });
  });

  it('displays info card with version format information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Information')).toBeTruthy();
      expect(screen.getByText(/Die Mindestversion bestimmt/)).toBeTruthy();
      expect(screen.getByText(/Versionsformat:/)).toBeTruthy();
    });
  });

  it('displays icons correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('arrow-left-icon')).toBeTruthy();
      expect(screen.getByTestId('info-icon')).toBeTruthy();
      expect(screen.getByTestId('save-icon')).toBeTruthy();
    });
  });

  it('trims whitespace from version input before saving', async () => {
    mockAppVersionService.setMinimumVersion.mockResolvedValue({
      id: 'current',
      minimumVersion: '2.0.0',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    });

    renderComponent();

    await waitFor(() => {
      const input = screen.getByTestId('version-input');
      expect(input).toBeTruthy();
    });

    const input = screen.getByTestId('version-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '  2.0.0  ' } });

    // Submit form directly to ensure handler is called
    const form = input.closest('form');
    expect(form).toBeTruthy();
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockAppVersionService.setMinimumVersion).toHaveBeenCalledWith({
        minimumVersion: '2.0.0',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});

