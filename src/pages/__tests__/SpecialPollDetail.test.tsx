import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { expectToastSuccessTitle } from '@/test-utils/sonnerAssertions';
import { SpecialPollStatus } from '@/models/specialPoll';
import { UserType } from '@/models/users';

import SpecialPollDetail from '../SpecialPollDetail';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getUserId: () => 'moderator-own-id',
  }),
}));

const mockGetUserProfile = jest.fn();
jest.mock('@/services/userService', () => ({
  useUserService: () => ({
    getUserProfile: mockGetUserProfile,
  }),
}));

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

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, type = 'button', className, ...props }: any) => (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="button"
      {...props}
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
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="dialog-title">{children}</h3>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div
      data-testid="select"
      data-value={value}
      data-disabled={disabled}
      onClick={() => {
        if (value !== 'PENDING' && onValueChange) {
          onValueChange('PENDING');
        }
      }}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ children }: any) => <span data-testid="select-value">{children}</span>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <div data-slot="skeleton" {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, id }: any) => (
    <button
      type="button"
      role="switch"
      data-testid={`switch-${id ?? 'anon'}`}
      disabled={disabled}
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
    >
      sw
    </button>
  ),
}));

jest.mock('@/components/LoadingButton', () => ({
  LoadingButton: ({
    children,
    isLoading,
    loadingText,
    onClick,
    type,
    ...props
  }: any) => (
    <button
      {...props}
      type={type ?? 'button'}
      onClick={onClick}
      disabled={props.disabled || isLoading}
    >
      {isLoading ? loadingText : children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockSpecialPollService = {
  getSpecialPoll: jest.fn(),
  addResponse: jest.fn(),
  updateResponses: jest.fn(),
  updateSpecialPollStatus: jest.fn(),
  updateSpecialPollHighlight: jest.fn(),
  removeResponse: jest.fn(),
  removeSpecialPoll: jest.fn(),
  upvoteResponse: jest.fn(),
};

jest.mock('@/services/specialPollService', () => ({
  useSpecialPollService: () => mockSpecialPollService,
}));

jest.mock('date-fns', () => ({
  format: jest.fn((date: unknown, formatStr: string) => {
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
    isHighlighted: false,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    responses: [
      {
        id: '1',
        userId: 'u1',
        userName: 'John Doe',
        response: 'I will participate!',
        createdAt: '2024-01-15T12:00:00.000Z',
        upvotedUserIds: [] as string[],
      },
      {
        id: '2',
        userId: 'moderator-own-id',
        userName: 'Jane Smith',
        response: 'Great initiative!',
        createdAt: '2024-01-15T13:00:00.000Z',
        upvotedUserIds: ['u9', 'moderator-own-id'],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserProfile.mockResolvedValue({ userType: UserType.SUPER_ADMIN });
    mockSpecialPollService.getSpecialPoll.mockResolvedValue(mockPoll);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/mittmach-mittwoch/test-poll-id']}>
        <Routes>
          <Route path="/mittmach-mittwoch/:pollId" element={<SpecialPollDetail />} />
        </Routes>
      </MemoryRouter>
    );

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

  it('displays skeleton while loading', async () => {
    mockSpecialPollService.getSpecialPoll.mockImplementationOnce(() => new Promise(() => {}));

    renderComponent();

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
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
      responses: [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Noch keine Antworten vorhanden.')).toBeTruthy();
      expect(screen.getByText(/Anzahl Antworten:/)).toBeTruthy();
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

  it('handles response addition error', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    mockSpecialPollService.addResponse.mockRejectedValue(new Error('Add response failed'));

    const input = screen.getByPlaceholderText('Deine Antwort...');
    const submitButton = screen.getByText('Antwort absenden');

    await user.type(input, 'Failed response');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: expect.any(String) })
      );
    });
  });

  it('prevents submitting empty response', async () => {
    renderComponent();

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /antwort absenden/i });
      expect(submitButton).toBeDisabled();
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
      expect(mockSpecialPollService.addResponse).toHaveBeenCalledWith(
        'test-poll-id',
        'Enter key response'
      );
    });
  });

  it('submits new poll response successfully', async () => {
    mockSpecialPollService.addResponse.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...');
    const submitButton = screen.getByRole('button', { name: /antwort absenden/i });
    fireEvent.change(input, { target: { value: 'My new response' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSpecialPollService.addResponse).toHaveBeenCalledWith(
        'test-poll-id',
        'My new response'
      );
      expectToastSuccessTitle(toast.success as jest.Mock, 'Antwort wurde hinzugefügt');
    });
  });

  it('opens delete response dialog for super-admin moderation', async () => {
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

  it('shows moderation delete buttons for super-admin only', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('trash2-icon').length).toBe(2);
    });
  });

  it('cancels response deletion', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('trash2-icon').length).toBe(2);
    });

    const deleteButtons = screen.getAllByTestId('trash2-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    const cancelButtons = screen.getAllByText('Abbrechen');
    await user.click(cancelButtons[0]);

    expect(mockSpecialPollService.updateResponses).not.toHaveBeenCalled();
  });

  it('upvotes response', async () => {
    mockSpecialPollService.upvoteResponse.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByLabelText('Zustimmen')).toHaveLength(2);
    });

    const buttons = screen.getAllByLabelText('Zustimmen');
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(mockSpecialPollService.upvoteResponse).toHaveBeenCalledWith('test-poll-id', '1');
    });
  });

  it('shows own-response delete action for matching user id', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Meine Antwort löschen')).toHaveLength(1);
    });
  });

  it('calls removeResponse for own answer', async () => {
    mockSpecialPollService.removeResponse.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Meine Antwort löschen')).toBeTruthy();
    });

    await user.click(screen.getByText('Meine Antwort löschen'));

    await waitFor(() => {
      expect(mockSpecialPollService.removeResponse).toHaveBeenCalledWith('test-poll-id');
    });
  });

  it('updates poll status successfully', async () => {
    mockSpecialPollService.updateSpecialPollStatus.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeTruthy();
    });

    const statusSelect = screen.getByTestId('select');
    fireEvent.click(statusSelect);

    await waitFor(() => {
      expect(mockSpecialPollService.updateSpecialPollStatus).toHaveBeenCalledWith('test-poll-id', {
        status: 'PENDING',
      });
      expectToastSuccessTitle(toast.success as jest.Mock, 'Status wurde aktualisiert');
    });
  });

  it('handles status update error', async () => {
    mockSpecialPollService.updateSpecialPollStatus.mockRejectedValue(
      new Error('Status update failed')
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('select'));

    await waitFor(() => {
      expect(mockSpecialPollService.updateSpecialPollStatus).toHaveBeenCalledWith('test-poll-id', {
        status: 'PENDING',
      });
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: expect.any(String) })
      );
    });
  });

  it('toggles highlight for super-admin', async () => {
    mockSpecialPollService.updateSpecialPollHighlight.mockResolvedValue({});
    renderComponent();

    await waitFor(() => expect(screen.getByTestId('switch-poll-highlight')).toBeTruthy());

    fireEvent.click(screen.getByTestId('switch-poll-highlight'));

    await waitFor(() => {
      expect(mockSpecialPollService.updateSpecialPollHighlight).toHaveBeenCalledWith(
        'test-poll-id',
        { isHighlighted: true }
      );
    });
  });

  it('zeigt API-PENDING in der Oberfläche als ACTIVE', async () => {
    mockSpecialPollService.getSpecialPoll.mockResolvedValue({
      ...mockPoll,
      status: SpecialPollStatus.PENDING,
    });

    renderComponent();

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.some(b => b.textContent === 'ACTIVE')).toBeTruthy();
      expect(badges.some(b => b.textContent === 'PENDING')).toBeFalsy();
    });
  });

  it('displays status select options ohne Geschlossen', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Aktiv')).toBeTruthy();
      expect(screen.getByText('Ausstehend')).toBeTruthy();
      expect(screen.queryByText('Geschlossen')).not.toBeInTheDocument();
    });
  });

  it('disables status select during update', async () => {
    mockSpecialPollService.updateSpecialPollStatus.mockImplementationOnce(
      () => new Promise(() => {})
    );
    renderComponent();

    await waitFor(() => expect(screen.getByTestId('select')).toBeTruthy());

    fireEvent.click(screen.getByTestId('select'));

    await waitFor(() => expect(screen.getByTestId('select').getAttribute('data-disabled')).toBe('true'));
  });

  it('disables response input during submission', async () => {
    mockSpecialPollService.addResponse.mockImplementation(
      () => new Promise(() => {})
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Deine Antwort...') as HTMLInputElement;
    const submitButton = screen.getByText('Antwort absenden');

    await user.type(input, 'Test response');
    await user.click(submitButton);

    await waitFor(() => {
      expect(input.disabled).toBe(true);
    });
  });

  it('reloads poll after successful operations', async () => {
    mockSpecialPollService.addResponse.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Deine Antwort...')).toBeTruthy();
    });

    mockSpecialPollService.getSpecialPoll.mockClear();

    await user.type(screen.getByPlaceholderText('Deine Antwort...'), 'New response');
    await user.click(screen.getByRole('button', { name: /antwort absenden/i }));

    await waitFor(() => {
      expect(mockSpecialPollService.getSpecialPoll).toHaveBeenCalledWith('test-poll-id');
    });
  });

  it('hides moderation controls without super-admin role', async () => {
    mockGetUserProfile.mockResolvedValueOnce({ userType: UserType.ADMIN });
    renderComponent();

    await waitFor(() => expect(screen.getByText('Community Cleanup Event')).toBeTruthy());

    expect(screen.queryByTestId('trash2-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('switch-poll-highlight')).not.toBeInTheDocument();
  });
});
