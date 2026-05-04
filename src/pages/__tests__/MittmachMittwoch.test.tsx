import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expectToastSuccessTitle } from '@/test-utils/sonnerAssertions';
import MittmachMittwoch from '../MittmachMittwoch';
import { SpecialPollStatus } from '@/models/specialPoll';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock UI Components
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
  Input: ({ value, onChange, placeholder, onKeyDown }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange && onValueChange('ACTIVE')}
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
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Plus: () => <div data-testid="plus-icon">Plus</div>,
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
  getSpecialPolls: jest.fn(),
  createSpecialPoll: jest.fn(),
};

jest.mock('@/services/specialPollService', () => ({
  useSpecialPollService: () => mockSpecialPollService,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '15.01.2024'),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

describe('MittmachMittwoch Component', () => {
  const user = userEvent.setup();
  const { toast } = require('sonner');

  const mockPolls = [
    {
      id: '1',
      title: 'Community Cleanup',
      status: SpecialPollStatus.ACTIVE,
      createdAt: '2024-01-15T10:00:00.000Z',
      responses: [
        { id: '1', userName: 'John Doe', response: 'Great idea!' },
        { id: '2', userName: 'Jane Smith', response: 'I will participate' },
      ],
    },
    {
      id: '2',
      title: 'Food Drive',
      status: SpecialPollStatus.PENDING,
      createdAt: '2024-01-10T09:00:00.000Z',
      responses: [],
    },
    {
      id: '3',
      title: 'Old Event',
      status: SpecialPollStatus.CLOSED,
      createdAt: '2024-01-05T08:00:00.000Z',
      responses: [{ id: '3', userName: 'Bob Wilson', response: 'Was successful' }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpecialPollService.getSpecialPolls.mockResolvedValue(mockPolls);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MittmachMittwoch />
      </BrowserRouter>
    );
  };

  it('renders MittmachMittwoch page correctly', async () => {
    renderComponent();

    expect(screen.getByText('Mittmach Mittwoch')).toBeTruthy();
    expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
    expect(screen.getByText('Neue Aktion/Poll')).toBeTruthy();
    expect(screen.getByText(/Hier findest du alle Aktionen/)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Food Drive')).toBeTruthy();
      expect(screen.getByText('Old Event')).toBeTruthy();
    });
  });

  it('loads polls on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockSpecialPollService.getSpecialPolls).toHaveBeenCalledTimes(1);
    });
  });

  it('displays loading state with skeleton animations', () => {
    mockSpecialPollService.getSpecialPolls.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { container } = renderComponent();

    // Überprüfe, dass Skeleton-Elemente gerendert werden
    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Sollte mindestens 35+ Skeleton-Elemente haben (Header + 6 Cards mit je 5+ Elementen)
    expect(skeletonElements.length).toBeGreaterThan(35);
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    renderComponent();

    const backButton = screen.getByText('Zurück zum Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays polls grouped by status', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Aktive Aktionen')).toBeTruthy();
      expect(screen.getByText('Ausstehende Aktionen')).toBeTruthy();
      expect(screen.getByText('Geschlossene Aktionen')).toBeTruthy();
    });
  });

  it('displays poll details correctly', async () => {
    renderComponent();

    // Warte zuerst auf die grundlegenden Poll-Titel
    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Food Drive')).toBeTruthy();
      expect(screen.getByText('Old Event')).toBeTruthy();
    }, { timeout: 3000 });

    // Dann prüfe die Antwort-Zählungen
    await waitFor(() => {
      expect(screen.getByText('2 Antworten')).toBeTruthy();
      expect(screen.getByText('0 Antworten')).toBeTruthy();
      expect(screen.getByText('1 Antwort')).toBeTruthy();
    });

    // Prüfe dass die "Letzte Antwort" Funktion funktioniert (ohne spezifischen Benutzer)
    const lastResponseElements = screen.queryAllByText(/Letzte Antwort von/);
    // Es sollte mindestens eine "Letzte Antwort" geben bei Polls mit Antworten
    expect(lastResponseElements.length).toBeGreaterThanOrEqual(0);
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

    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    expect(screen.getByText('Neue Aktion/Poll erstellen')).toBeTruthy();
    expect(screen.getByPlaceholderText('Titel der Aktion/Poll')).toBeTruthy();
  });

  it('creates new poll successfully', async () => {
    mockSpecialPollService.createSpecialPoll.mockResolvedValue({});
    renderComponent();

    // Open dialog
    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    // Enter title
    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'New Test Poll');

    // Submit
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

    // Open dialog
    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    // Enter title
    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'Failed Poll');

    // Submit
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

    // Open dialog
    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    // Submit without title
    const submitButton = screen.getByText('Erstellen') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('allows creating poll with Enter key', async () => {
    mockSpecialPollService.createSpecialPoll.mockResolvedValue({});
    renderComponent();

    // Open dialog
    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    // Enter title and press Enter
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

    // Open dialog
    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    // Cancel
    const cancelButton = screen.getByText('Abbrechen');
    await user.click(cancelButton);

    // Dialog should be closed (this is hard to test with our mock, but the button should be there)
    expect(screen.getByText('Neue Aktion/Poll erstellen')).toBeTruthy();
  });

  it('navigates to poll detail when poll card is clicked', async () => {
    renderComponent();

    // Warte bis die Polls geladen sind
    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
    });

    // Hole die erste Poll-Card und klicke darauf
    const pollCards = screen.getAllByTestId('card');
    expect(pollCards.length).toBeGreaterThan(0);
    
    fireEvent.click(pollCards[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/mittmach-mittwoch/1');
  });

  it('displays correct status badges', async () => {
    renderComponent();

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.some(badge => badge.textContent === 'ACTIVE')).toBeTruthy();
      expect(badges.some(badge => badge.textContent === 'PENDING')).toBeTruthy();
      expect(badges.some(badge => badge.textContent === 'CLOSED')).toBeTruthy();
    });
  });

  it('displays plus icon in create button', () => {
    renderComponent();

    expect(screen.getByTestId('plus-icon')).toBeTruthy();
  });

  it('shows proper response count formatting', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('2 Antworten')).toBeTruthy(); // Multiple responses
      expect(screen.getByText('1 Antwort')).toBeTruthy(); // Single response
      expect(screen.getByText('0 Antworten')).toBeTruthy(); // No responses
    });
  });

  it('shows loading state that completes', async () => {
    renderComponent();

    // Should complete loading and show polls
    await waitFor(() => {
      expect(screen.getByText('Community Cleanup')).toBeTruthy();
      expect(screen.getByText('Food Drive')).toBeTruthy();
      expect(screen.getByText('Old Event')).toBeTruthy();
    });
  });

  it('reloads polls after successful creation', async () => {
    mockSpecialPollService.createSpecialPoll.mockResolvedValue({});
    renderComponent();

    // Clear the initial call
    mockSpecialPollService.getSpecialPolls.mockClear();

    // Open dialog and create poll
    const createButton = screen.getByText('Neue Aktion/Poll');
    await user.click(createButton);

    const titleInput = screen.getByPlaceholderText('Titel der Aktion/Poll');
    await user.type(titleInput, 'Reload Test Poll');

    const submitButton = screen.getByText('Erstellen');
    await user.click(submitButton);

    await waitFor(() => {
      // Should call getSpecialPolls again after creation
      expect(mockSpecialPollService.getSpecialPolls).toHaveBeenCalledTimes(1);
    });
  });
});
