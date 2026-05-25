import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import { expectToastSuccessTitle } from '@/test-utils/sonnerAssertions';
import { SpecialPollStatus } from '@/models/specialPoll';
import { UserType } from '@/models/users';

import MittmachMittwoch from '../MittmachMittwoch';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockGetUserProfile = jest.fn();
jest.mock('@/services/userService', () => ({
  useUserService: () => ({
    getUserProfile: mockGetUserProfile,
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getUserId: () => 'test-user-id',
  }),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, onClick, className }: any) => (
    <div data-testid="card" onClick={onClick} className={className}>
      {children}
    </div>
  ),
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

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ id, checked, onCheckedChange, disabled }: any) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-testid={id ? `switch-${id}` : 'switch'}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
    >
      toggle
    </button>
  ),
}));

jest.mock('@/components/LoadingButton', () => ({
  LoadingButton: ({ children, isLoading, loadingText, ...props }: any) => (
    <button {...props} disabled={props.disabled || isLoading} type={props.type ?? 'button'}>
      {isLoading ? loadingText : children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Plus: () => <div data-testid="plus-icon">Plus</div>,
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockSpecialPollService = {
  getSpecialPolls: jest.fn(),
  createSpecialPoll: jest.fn(),
};

jest.mock('@/services/specialPollService', () => ({
  useSpecialPollService: () => mockSpecialPollService,
}));

jest.mock('date-fns', () => ({
  format: jest.fn(() => '15.01.2024'),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

describe('MittmachMittwoch Component', () => {
  const user = userEvent.setup();
  const { toast } = require('sonner');

  const response = (
    over: Partial<{
      id: string;
      userId: string;
      userName: string;
      response: string;
      createdAt: string;
      upvotedUserIds: string[];
    }>
  ) => ({
    id: 'r1',
    userId: 'u1',
    userName: 'John Doe',
    response: 'Great idea!',
    createdAt: '2024-01-15T10:00:00.000Z',
    upvotedUserIds: [] as string[],
    ...over,
  });

  const mockPolls = [
    {
      id: '1',
      title: 'Community Cleanup',
      status: SpecialPollStatus.ACTIVE,
      isHighlighted: false,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      responses: [
        response({ id: 'r1', userName: 'John Doe', response: 'Great idea!' }),
        response({ id: 'r2', userName: 'Jane Smith', response: 'I will participate' }),
      ],
    },
    {
      id: '2',
      title: 'Food Drive',
      status: SpecialPollStatus.PENDING,
      isHighlighted: false,
      createdAt: '2024-01-10T09:00:00.000Z',
      updatedAt: '2024-01-10T09:00:00.000Z',
      responses: [],
    },
    {
      id: '3',
      title: 'Highlighted Event',
      status: SpecialPollStatus.ACTIVE,
      isHighlighted: true,
      createdAt: '2024-01-05T08:00:00.000Z',
      updatedAt: '2024-01-05T08:00:00.000Z',
      responses: [response({ id: 'r3', userName: 'Bob Wilson', response: 'Was successful' })],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserProfile.mockResolvedValue({ userType: UserType.SUPER_ADMIN });
    mockSpecialPollService.getSpecialPolls.mockResolvedValue(mockPolls);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <MittmachMittwoch />
      </BrowserRouter>
    );

  async function waitForSuperAdminToolbar() {
    await waitFor(() => {
      expect(screen.getByText('Neue Aktion/Poll')).toBeInTheDocument();
    });
  }

  it('renders MittmachMittwoch page correctly', async () => {
    renderComponent();

    expect(screen.getByText('Mittmach Mittwoch')).toBeTruthy();
    expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
    expect(screen.getByText(/Hier findest du alle Aktionen/)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Food Drive')).toBeTruthy();
      expect(screen.getByText('Highlighted Event')).toBeTruthy();
      expect(screen.getByText('Neue Aktion/Poll')).toBeTruthy();
    });
  });

  it('loads polls on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockSpecialPollService.getSpecialPolls).toHaveBeenCalledWith(undefined);
    });
  });

  it('displays loading state with skeleton animations', () => {
    mockSpecialPollService.getSpecialPolls.mockImplementation(() => new Promise(() => {}));

    const { container } = renderComponent();

    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
    expect(skeletonElements.length).toBeGreaterThan(20);
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    renderComponent();

    const backButton = screen.getByText('Zurück zum Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('blendet Umfragen nach Hervorhebung in zwei Abschnitte ein', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Hervorgehobene Aktionen')).toBeTruthy();
      expect(screen.getByText('Weitere Aktionen')).toBeTruthy();
    });
  });

  it('shows highlighted badge when poll is highlighted', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Hervorgehoben')).toBeTruthy();
    });
  });

  it('calls getSpecialPolls with highlighted flag when toggle is enabled', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeInTheDocument();
    });

    mockSpecialPollService.getSpecialPolls.mockClear();

    const highlightSwitch = screen.getByTestId('switch-highlight-only');
    await user.click(highlightSwitch);

    await waitFor(() => {
      expect(mockSpecialPollService.getSpecialPolls).toHaveBeenCalledWith({ highlighted: true });
    });
  });

  it('hides create button for non-super-admin users', async () => {
    mockGetUserProfile.mockResolvedValueOnce({ userType: UserType.ADMIN });
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Neue Aktion/Poll')).not.toBeInTheDocument();
    });
  });

  it('displays poll details correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Food Drive')).toBeTruthy();
      expect(screen.getByText('Highlighted Event')).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText('2 Antworten')).toBeTruthy();
      expect(screen.getByText('0 Antworten')).toBeTruthy();
      expect(screen.getByText('1 Antwort')).toBeTruthy();
    });
  });

  it('displays poll creation dates', async () => {
    renderComponent();

    await waitFor(() => {
      const createdDates = screen.getAllByText(/Erstellt am 15\.01\.2024/);
      expect(createdDates.length).toBeGreaterThan(0);
    });
  });

  it('shows no polls message when empty', async () => {
    mockSpecialPollService.getSpecialPolls.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Noch keine Aktionen vorhanden.')).toBeTruthy();
    });
  });

  it('opens create poll dialog when button is clicked', async () => {
    renderComponent();
    await waitForSuperAdminToolbar();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    expect(screen.getByText('Neue Aktion/Poll erstellen')).toBeTruthy();
    expect(screen.getByPlaceholderText('Titel der Aktion/Poll')).toBeTruthy();
  });

  it('creates new poll successfully', async () => {
    mockSpecialPollService.createSpecialPoll.mockResolvedValue({});
    renderComponent();
    await waitForSuperAdminToolbar();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'New Test Poll');

    const submitButton = screen.getByText('Erstellen');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSpecialPollService.createSpecialPoll).toHaveBeenCalledWith({
        title: 'New Test Poll',
      });
      expectToastSuccessTitle(toast.success as jest.Mock, 'Aktion/Poll wurde erfolgreich erstellt');
    });
  });

  it('handles poll creation error', async () => {
    mockSpecialPollService.createSpecialPoll.mockRejectedValue(new Error('Creation failed'));
    renderComponent();
    await waitForSuperAdminToolbar();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'Failed Poll');

    const submitButton = screen.getByText('Erstellen');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: expect.any(String) })
      );
    });
  });

  it('prevents creating poll with empty title', async () => {
    renderComponent();
    await waitForSuperAdminToolbar();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const submitButton = screen.getByText('Erstellen') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('allows creating poll with Enter key', async () => {
    mockSpecialPollService.createSpecialPoll.mockResolvedValue({});
    renderComponent();
    await waitForSuperAdminToolbar();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'Enter Key Poll');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockSpecialPollService.createSpecialPoll).toHaveBeenCalledWith({
        title: 'Enter Key Poll',
      });
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    renderComponent();
    await waitForSuperAdminToolbar();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const cancelButton = screen.getByText('Abbrechen');
    await user.click(cancelButton);

    expect(screen.getByText('Neue Aktion/Poll erstellen')).toBeTruthy();
  });

  it('navigates to poll detail when poll card is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
    });

    const pollCards = screen.getAllByTestId('card');
    expect(pollCards.length).toBeGreaterThan(0);

    const highlightedCard = pollCards.find(card => card.textContent?.includes('Highlighted Event'));
    expect(highlightedCard).toBeDefined();
    fireEvent.click(highlightedCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/mittmach-mittwoch/3');
  });

  it('displays correct status badges', async () => {
    renderComponent();

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.some(badge => badge.textContent === 'ACTIVE')).toBeTruthy();
      expect(badges.some(badge => badge.textContent === 'PENDING')).toBeFalsy();
    });
  });

  it('displays plus icon in create button', async () => {
    renderComponent();
    await waitForSuperAdminToolbar();

    expect(screen.getByTestId('plus-icon')).toBeTruthy();
  });

  it('shows proper response count formatting', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('2 Antworten')).toBeTruthy();
      expect(screen.getByText('1 Antwort')).toBeTruthy();
      expect(screen.getByText('0 Antworten')).toBeTruthy();
    });
  });

  it('reloads polls after successful creation', async () => {
    mockSpecialPollService.createSpecialPoll.mockResolvedValue({});
    renderComponent();
    await waitForSuperAdminToolbar();

    mockSpecialPollService.getSpecialPolls.mockClear();

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'Reload Test Poll');

    const submitButton = screen.getByText('Erstellen');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSpecialPollService.getSpecialPolls).toHaveBeenCalledTimes(1);
    });
  });
});
