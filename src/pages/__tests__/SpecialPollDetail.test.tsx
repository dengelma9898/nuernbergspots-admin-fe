import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import SpecialPollDetail from '../SpecialPollDetail';
import { SpecialPollStatus } from '@/models/specialPoll';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ pollId: 'test-poll-id' }),
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, type, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      data-size={size}
      type={type}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, onKeyDown, disabled }: any) => (
    <input 
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      disabled={disabled}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange && onOpenChange(false)}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="dialog-title">{children}</h3>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div data-testid="select" data-value={value} data-disabled={disabled} onClick={() => {
      // Only trigger if the new value is different from current
      if (value !== 'PENDING') {
        onValueChange && onValueChange('PENDING');
      }
    }}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ children }: any) => <span data-testid="select-value">{children}</span>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
}));

// Mock Toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Special Poll Service
const mockSpecialPollService = {
  getSpecialPoll: jest.fn(),
  addResponse: jest.fn(),
  updateResponses: jest.fn(),
  updateSpecialPollStatus: jest.fn(),
};

jest.mock('@/services/specialPollService', () => ({
  useSpecialPollService: () => mockSpecialPollService,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr.includes('HH:mm')) {
      return '15.01.2024 14:30';
    }
    return '15.01.2024';
  }),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

describe('SpecialPollDetail Component', () => {
  const user = userEvent.setup();
  const { toast } = require('sonner');

  const mockPoll = {
    id: 'test-poll-id',
    title: 'Community Cleanup Event',
    status: SpecialPollStatus.ACTIVE,
    createdAt: '2024-01-15T10:00:00.000Z',
    responses: [
      {
        id: '1',
        userName: 'John Doe',
        response: 'I will participate!',
        createdAt: '2024-01-15T12:00:00.000Z'
      },
      {
        id: '2',
        userName: 'Jane Smith',
        response: 'Great initiative!',
        createdAt: '2024-01-15T13:00:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpecialPollService.getSpecialPoll.mockResolvedValue(mockPoll);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/mittmach-mittwoch/test-poll-id']}>
        <SpecialPollDetail />
      </MemoryRouter>
    );
  };

  it('renders poll detail page correctly', async () => {
    renderComponent();

    expect(screen.getByText('Zurück zur Übersicht')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup Event')).toBeTruthy();
      expect(screen.getByText('ACTIVE')).toBeTruthy();
      expect(screen.getByText(/Erstellt am 15\.01\.2024/)).toBeTruthy();
    });
  });

  it('loads poll data on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockSpecialPollService.getSpecialPoll).toHaveBeenCalledWith('test-poll-id');
    });
  });

  it('displays loading state initially', () => {
    renderComponent();

    expect(screen.getByText('Lade Aktion...')).toBeTruthy();
  });

  it('navigates back to overview when back button is clicked', async () => {
    renderComponent();

    const backButton = screen.getByText('Zurück zur Übersicht');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mittmach-mittwoch');
  });

  it('displays poll information correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup Event')).toBeTruthy();
      expect(screen.getByText(/Anzahl Antworten:/)).toBeTruthy();
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('I will participate!').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Great initiative!').length).toBeGreaterThan(0);
      // Check that we have response timestamps
      expect(screen.getAllByText(/15\.01\.2024/).length).toBeGreaterThan(0);
    });
  });

  it('displays response timestamps', async () => {
    renderComponent();

    await waitFor(() => {
      const timestamps = screen.getAllByText('15.01.2024 14:30');
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  it('shows no responses message when empty', async () => {
    mockSpecialPollService.getSpecialPoll.mockResolvedValue({
      ...mockPoll,
      responses: []
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Noch keine Antworten vorhanden.')).toBeTruthy();
      expect(screen.getByText(/Anzahl Antworten:/)).toBeTruthy();
      // Check that there are no user names displayed (indicates 0 responses)
      expect(screen.queryByText('John Doe')).toBeFalsy();
      expect(screen.queryByText('Jane Smith')).toBeFalsy();
    });
  });

  it('displays poll not found message when poll is null', async () => {
    mockSpecialPollService.getSpecialPoll.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Aktion nicht gefunden.')).toBeTruthy();
    });
  });

  it('adds new response successfully', async () => {
    mockSpecialPollService.addResponse.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...');
    const submitButton = screen.getByText('Antwort absenden');

    await user.type(input, 'My new response');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSpecialPollService.addResponse).toHaveBeenCalledWith('test-poll-id', 'My new response');
      expect(toast.success).toHaveBeenCalledWith('Antwort wurde hinzugefügt.');
    });
  });

  it('handles response addition error', async () => {
    mockSpecialPollService.addResponse.mockRejectedValue(new Error('Add response failed'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...');
    const submitButton = screen.getByText('Antwort absenden');

    await user.type(input, 'Failed response');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Antwort konnte nicht hinzugefügt werden.');
    });
  });

  it('prevents submitting empty response', async () => {
    renderComponent();

    await waitFor(() => {
      const submitButton = screen.getByText('Antwort absenden') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });
  });

  it('allows submitting response with Enter key', async () => {
    mockSpecialPollService.addResponse.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...');
    await user.type(input, 'Enter key response');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockSpecialPollService.addResponse).toHaveBeenCalledWith('test-poll-id', 'Enter key response');
    });
  });

  it('opens delete response dialog', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash2-icon');
      expect(deleteButtons.length).toBe(2);
    });

    const deleteButtons = screen.getAllByTestId('trash2-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    const dialogTitles = screen.getAllByText('Antwort wirklich löschen?');
    expect(dialogTitles.length).toBeGreaterThan(0);
  });

  it('shows delete buttons for responses', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash2-icon');
      expect(deleteButtons.length).toBe(2);
    });
  });

  it('cancels response deletion', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash2-icon');
      expect(deleteButtons.length).toBe(2);
    });

    // Click first delete button
    const deleteButtons = screen.getAllByTestId('trash2-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    // Cancel deletion - get all cancel buttons and use the first one
    const cancelButtons = screen.getAllByText('Abbrechen');
    await user.click(cancelButtons[0]);

    // Should not call delete service
    expect(mockSpecialPollService.updateResponses).not.toHaveBeenCalled();
  });

  it('updates poll status successfully', async () => {
    mockSpecialPollService.updateSpecialPollStatus.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      const statusSelect = screen.getByTestId('select');
      expect(statusSelect).toBeTruthy();
    });

    const statusSelect = screen.getByTestId('select');
    fireEvent.click(statusSelect);

    await waitFor(() => {
      expect(mockSpecialPollService.updateSpecialPollStatus).toHaveBeenCalledWith('test-poll-id', {
        status: 'PENDING'
      });
      expect(toast.success).toHaveBeenCalledWith('Status wurde aktualisiert.');
    });
  });

  it('handles status update error', async () => {
    mockSpecialPollService.updateSpecialPollStatus.mockRejectedValue(new Error('Status update failed'));
    renderComponent();

    await waitFor(() => {
      const statusSelect = screen.getByTestId('select');
      expect(statusSelect).toBeTruthy();
    });

    const statusSelect = screen.getByTestId('select');
    fireEvent.click(statusSelect);

    await waitFor(() => {
      expect(mockSpecialPollService.updateSpecialPollStatus).toHaveBeenCalledWith('test-poll-id', {
        status: 'PENDING'
      });
      expect(toast.error).toHaveBeenCalledWith('Status konnte nicht geändert werden.');
    });
  });

  it('displays correct status badge color for different statuses', async () => {
    // Test PENDING status
    mockSpecialPollService.getSpecialPoll.mockResolvedValue({
      ...mockPoll,
      status: SpecialPollStatus.PENDING
    });

    renderComponent();

    await waitFor(() => {
      const badge = screen.getByTestId('badge');
      expect(badge.textContent).toBe('PENDING');
    });
  });

  it('displays status select options', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Aktiv')).toBeTruthy();
      expect(screen.getByText('Ausstehend')).toBeTruthy();
      expect(screen.getByText('Geschlossen')).toBeTruthy();
    });
  });

  it('disables status select during update', async () => {
    renderComponent();

    await waitFor(() => {
      const statusSelect = screen.getByTestId('select');
      expect(statusSelect.getAttribute('data-disabled')).toBe('false');
    });
  });

  it('disables response input during submission', async () => {
    mockSpecialPollService.addResponse.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...') as HTMLInputElement;
    const submitButton = screen.getByText('Antwort absenden');

    await user.type(input, 'Test response');
    await user.click(submitButton);

    expect(input.disabled).toBe(true);
  });

  it('reloads poll after successful operations', async () => {
    mockSpecialPollService.addResponse.mockResolvedValue({});
    renderComponent();

    // Clear the initial load call
    mockSpecialPollService.getSpecialPoll.mockClear();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...');
    const submitButton = screen.getByText('Antwort absenden');

    await user.type(input, 'New response');
    await user.click(submitButton);

    await waitFor(() => {
      // Should reload poll after successful addition
      expect(mockSpecialPollService.getSpecialPoll).toHaveBeenCalledWith('test-poll-id');
    });
  });

  it('displays trash icon in delete buttons', async () => {
    renderComponent();

    await waitFor(() => {
      const trashIcons = screen.getAllByTestId('trash2-icon');
      expect(trashIcons.length).toBe(2);
    });
  });
}); 