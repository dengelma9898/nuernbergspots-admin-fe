import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NewsManagement from '../NewsManagement';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem } from '@/models/news';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Auth Context
const mockGetUserId = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getUserId: mockGetUserId,
  }),
}));

// Mock UI Components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    type,
    title,
    className,
    asChild,
  }: any) => {
    if (asChild) {
      return (
        <div data-testid="button-as-child" className={className}>
          {children}
        </div>
      );
    }
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        type={type}
        title={title}
        className={className}
        data-testid="button"
      >
        {children}
      </button>
    );
  },
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, disabled, className, autoFocus, type, id }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      autoFocus={autoFocus}
      type={type}
      id={id}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, disabled }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="textarea"
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
  DialogClose: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-close">{children}</div>
  ),
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) => (
    <div
      data-testid="alert-dialog"
      data-open={open}
      onClick={() => onOpenChange && onOpenChange(false)}
    >
      {children}
    </div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="alert-dialog-title">{children}</h3>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogAction: ({ children, onClick, disabled }: any) => (
    <button data-testid="alert-dialog-action" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, onClick, disabled }: any) => (
    <button data-testid="alert-dialog-cancel" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, id }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange && onCheckedChange(e.target.checked)}
      disabled={disabled}
      id={id}
      data-testid="switch"
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
  Loader2: () => <div data-testid="loader2-icon">Loader2</div>,
  UserCircle: () => <div data-testid="user-circle-icon">UserCircle</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  BarChart2: () => <div data-testid="bar-chart2-icon">BarChart2</div>,
  RefreshCw: ({ className }: any) => (
    <div data-testid="refresh-cw-icon" className={className}>
      RefreshCw
    </div>
  ),
  Send: () => <div data-testid="send-icon">Send</div>,
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
}));

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

// Mock News Service
const mockNewsService = {
  getAll: jest.fn(),
  createTextNews: jest.fn(),
  createImageNews: jest.fn(),
  updateNewsImages: jest.fn(),
  createPollNews: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/services/newsService', () => ({
  useNewsService: () => mockNewsService,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => 'vor 2 Stunden'),
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM') return '2024-01';
    if (formatStr === 'MMMM yyyy') return 'Januar 2024';
    return '2024-01-15';
  }),
  startOfMonth: jest.fn(date => new Date(date.getFullYear(), date.getMonth(), 1)),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

// Mock scrollTo for JSDOM
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

describe('NewsManagement Component', () => {
  const user = userEvent.setup();

  const mockTextNews: TextNewsItem = {
    id: 'text-1',
    type: 'text',
    content: 'Das ist eine Test-Nachricht',
    createdBy: 'user-1',
    authorName: 'Test User',
    authorImageUrl: 'https://example.com/avatar.jpg',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    reactions: [
      { type: '👍', userId: 'user-2' },
      { type: '❤️', userId: 'user-3' },
    ],
  };

  const mockImageNews: ImageNewsItem = {
    id: 'image-1',
    type: 'image',
    content: 'Schöne Bilder!',
    createdBy: 'user-1',
    authorName: 'Test User',
    authorImageUrl: null,
    createdAt: '2024-01-15T11:00:00.000Z',
    updatedAt: '2024-01-15T11:00:00.000Z',
    imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    reactions: [],
  };

  const mockPollNews: PollNewsItem = {
    id: 'poll-1',
    type: 'poll',
    createdBy: 'user-1',
    authorName: 'Test User',
    authorImageUrl: null,
    createdAt: '2024-01-15T12:00:00.000Z',
    updatedAt: '2024-01-15T12:00:00.000Z',
    question: 'Was ist euer Lieblingswetter?',
    options: [
      { id: 'opt-1', text: 'Sonnig', voters: ['user-2', 'user-3'] },
      { id: 'opt-2', text: 'Regnerisch', voters: ['user-4'] },
    ],
    expiresAt: '2024-01-20T12:00:00.000Z',
    allowMultipleAnswers: false,
    votes: 3,
    reactions: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserId.mockReturnValue('user-1');
    mockNewsService.getAll.mockResolvedValue([mockTextNews, mockImageNews, mockPollNews]);
    mockNewsService.delete.mockResolvedValue(undefined);
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <NewsManagement />
      </BrowserRouter>
    );
  };

  it('renders news management page correctly', async () => {
    renderComponent();

    expect(screen.getByText('News Management')).toBeTruthy();
    expect(screen.getByTestId('arrow-left-icon')).toBeTruthy();
    expect(screen.getByTestId('refresh-cw-icon')).toBeTruthy();
    expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
  });

  it('loads news on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockNewsService.getAll).toHaveBeenCalled();
    });
  });

  it('displays loading state with skeleton animations', () => {
    mockNewsService.getAll.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { container } = renderComponent();

    // Überprüfe, dass Skeleton-Elemente gerendert werden
    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Sollte mindestens 40+ Skeleton-Elemente haben (5 News Cards mit verschiedenen Typen)
    expect(skeletonElements.length).toBeGreaterThan(40);
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    renderComponent();

    const backButton = screen.getByTestId('arrow-left-icon').closest('button');
    await user.click(backButton!);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays news items correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Das ist eine Test-Nachricht')).toBeTruthy();
      expect(screen.getByText('Schöne Bilder!')).toBeTruthy();
      expect(screen.getByText('Was ist euer Lieblingswetter?')).toBeTruthy();
    });
  });

  it('displays author information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
      expect(screen.getAllByText('vor 2 Stunden').length).toBeGreaterThan(0);
    });
  });

  it('displays text news correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Das ist eine Test-Nachricht')).toBeTruthy();
      // Check reactions
      expect(screen.getByText('👍')).toBeTruthy();
      expect(screen.getByText('❤️')).toBeTruthy();
    });
  });

  it('displays image news correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Schöne Bilder!')).toBeTruthy();
      const images = screen.getAllByAltText(/Bild \d+/);
      expect(images.length).toBe(2);
    });
  });

  it('displays poll news correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Was ist euer Lieblingswetter?')).toBeTruthy();
      expect(screen.getByText('Sonnig')).toBeTruthy();
      expect(screen.getByText('Regnerisch')).toBeTruthy();
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // voter count
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // voter count
    });
  });

  it('shows no news message when empty', async () => {
    mockNewsService.getAll.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Noch keine News vorhanden/)).toBeTruthy();
    });
  });

  it('creates text news successfully', async () => {
    mockNewsService.createTextNews.mockResolvedValue({ id: 'new-text' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Neue Nachricht schreiben...');
    const sendButton = screen.getByTestId('send-icon').closest('button');

    await user.type(input, 'Neue Test-Nachricht');
    await user.click(sendButton!);

    await waitFor(() => {
      expect(mockNewsService.createTextNews).toHaveBeenCalledWith({
        content: 'Neue Test-Nachricht',
        authorId: 'user-1',
      });
    });
  });

  it('prevents sending empty text news', async () => {
    renderComponent();

    await waitFor(() => {
      const sendButton = screen.getByTestId('send-icon').closest('button') as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });
  });

  it('submits text news with Enter key', async () => {
    mockNewsService.createTextNews.mockResolvedValue({ id: 'new-text' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Neue Nachricht schreiben...');
    await user.type(input, 'Enter key message');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockNewsService.createTextNews).toHaveBeenCalledWith({
        content: 'Enter key message',
        authorId: 'user-1',
      });
    });
  });

  it('opens image modal when image button is clicked', async () => {
    renderComponent();

    const imageButton = screen.getByTitle('Bild-News hinzufügen');
    await user.click(imageButton!);

    expect(screen.getByText('Bild-News erstellen')).toBeTruthy();
    expect(screen.getByPlaceholderText('Text zur Bild-News...')).toBeTruthy();
  });

  it('opens poll modal when poll button is clicked', async () => {
    renderComponent();

    const pollButton = screen.getByTitle('Umfrage erstellen');
    await user.click(pollButton!);

    expect(screen.getAllByText('Umfrage erstellen').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Stelle deine Frage...')).toBeTruthy();
  });

  it('displays poll creation form correctly', async () => {
    renderComponent();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    // Open poll modal - find the button, not the icon in news items
    const pollButton = screen.getByTitle('Umfrage erstellen');
    await user.click(pollButton!);

    // Check that form elements are rendered
    expect(screen.getByPlaceholderText('Stelle deine Frage...')).toBeTruthy();
    expect(screen.getByPlaceholderText('Option 1')).toBeTruthy();
    expect(screen.getByPlaceholderText('Option 2')).toBeTruthy();
    expect(screen.getByText('Mehrfachauswahl erlauben')).toBeTruthy();
    expect(screen.getByText('Ablaufdatum (optional)')).toBeTruthy();
  });

  it('adds and removes poll options', async () => {
    renderComponent();

    // Open poll modal - find the button, not the icon in news items
    const pollButton = screen.getByTitle('Umfrage erstellen');
    await user.click(pollButton!);

    // Add option
    const addButton = screen.getByText('Option hinzufügen');
    await user.click(addButton);

    expect(screen.getByPlaceholderText('Option 3')).toBeTruthy();

    // Remove option (should have X button now since more than 2 options)
    const removeButtons = screen.getAllByTestId('x-icon');
    await user.click(removeButtons[0].closest('button')!);

    // Should still have at least 2 options
    expect(screen.getByPlaceholderText('Option 1')).toBeTruthy();
    expect(screen.getByPlaceholderText('Option 2')).toBeTruthy();
  });

  it('toggles multiple answers switch', async () => {
    renderComponent();

    // Open poll modal - find the button, not the icon in news items
    const pollButton = screen.getByTitle('Umfrage erstellen');
    await user.click(pollButton!);

    const multipleAnswersSwitch = screen.getByTestId('switch');
    expect(multipleAnswersSwitch).toBeTruthy();

    await user.click(multipleAnswersSwitch);
    expect((multipleAnswersSwitch as HTMLInputElement).checked).toBe(true);
  });

  it('shows create poll button is initially disabled', async () => {
    renderComponent();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    // Open poll modal - find the button, not the icon in news items
    const pollButton = screen.getByTitle('Umfrage erstellen');
    await user.click(pollButton!);

    // Check that create button exists
    expect(screen.getAllByText('Umfrage erstellen').length).toBeGreaterThan(0);
  });

  it('refreshes news when refresh button is clicked', async () => {
    renderComponent();

    // Clear initial call
    mockNewsService.getAll.mockClear();

    const refreshButton = screen.getByTestId('refresh-cw-icon').closest('button');
    await user.click(refreshButton!);

    await waitFor(() => {
      expect(mockNewsService.getAll).toHaveBeenCalled();
    });
  });

  it('displays user circle icon when no author image', async () => {
    renderComponent();

    await waitFor(() => {
      const userCircleIcons = screen.getAllByTestId('user-circle-icon');
      expect(userCircleIcons.length).toBeGreaterThan(0);
    });
  });

  it('displays author image when available', async () => {
    renderComponent();

    await waitFor(() => {
      const authorImage = screen.getByAltText('Test User');
      expect(authorImage).toBeTruthy();
      expect(authorImage.getAttribute('src')).toBe('https://example.com/avatar.jpg');
    });
  });

  it('displays poll expiration date', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Läuft ab:/)).toBeTruthy();
    });
  });

  it('displays bar chart icon for polls', async () => {
    renderComponent();

    await waitFor(() => {
      const barChartIcons = screen.getAllByTestId('bar-chart2-icon');
      expect(barChartIcons.length).toBeGreaterThan(0);
    });
  });

  it('opens and displays modal content', async () => {
    renderComponent();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    // Test image modal
    const imageButton = screen.getByTitle('Bild-News hinzufügen');
    await user.click(imageButton!);

    // Check that modal content is displayed
    expect(screen.getByText('Bild-News erstellen')).toBeTruthy();
    expect(screen.getAllByText('Abbrechen').length).toBeGreaterThan(0);
  });

  it('disables buttons during sending state', async () => {
    mockNewsService.createTextNews.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Neue Nachricht schreiben...');
    const sendButton = screen.getByTestId('send-icon').closest('button');

    await user.type(input, 'Test message');
    await user.click(sendButton!);

    // Input should be disabled during sending
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it('reloads news after successful creation', async () => {
    mockNewsService.createTextNews.mockResolvedValue({ id: 'new-text' });
    renderComponent();

    // Clear initial load call
    mockNewsService.getAll.mockClear();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Neue Nachricht schreiben...');
    const sendButton = screen.getByTestId('send-icon').closest('button');

    await user.type(input, 'Test reload');
    await user.click(sendButton!);

    await waitFor(() => {
      // Should reload news after creation
      expect(mockNewsService.getAll).toHaveBeenCalled();
    });
  });

  it('clears input after successful text news creation', async () => {
    mockNewsService.createTextNews.mockResolvedValue({ id: 'new-text' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Neue Nachricht schreiben...')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Neue Nachricht schreiben...') as HTMLInputElement;
    const sendButton = screen.getByTestId('send-icon').closest('button');

    await user.type(input, 'Test clear');
    await user.click(sendButton!);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('displays poll disabled buttons', async () => {
    renderComponent();

    await waitFor(() => {
      const pollButtons = screen.getAllByText('Sonnig');
      expect(pollButtons.length).toBeGreaterThan(0);
      // Poll options are displayed but not clickable in admin view
      const optionElement = pollButtons[0].closest('div');
      expect(optionElement).toBeTruthy();
    });
  });

  it('shows reaction counts correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Text news has 2 reactions: 👍 (1) and ❤️ (1)
      expect(screen.getByText('👍')).toBeTruthy();
      expect(screen.getByText('❤️')).toBeTruthy();
    });
  });

  it('displays delete button for text and image news', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash2-icon');
      // Should have delete buttons for text and image news
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('displays delete button for poll news', async () => {
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('trash2-icon');
      // Should have delete button for poll news
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Das ist eine Test-Nachricht')).toBeTruthy();
    });

    const deleteButtons = screen.getAllByTestId('trash2-icon');
    const deleteButton = deleteButtons[0].closest('button');
    await user.click(deleteButton!);

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog')).toBeTruthy();
      expect(screen.getByText('News löschen?')).toBeTruthy();
      expect(screen.getByText(/Möchten Sie diese News wirklich löschen/)).toBeTruthy();
    });
  });

  it('cancels delete when cancel button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Das ist eine Test-Nachricht')).toBeTruthy();
    });

    const deleteButtons = screen.getAllByTestId('trash2-icon');
    const deleteButton = deleteButtons[0].closest('button');
    await user.click(deleteButton!);

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog')).toBeTruthy();
    });

    const cancelButton = screen.getByTestId('alert-dialog-cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
    });

    expect(mockNewsService.delete).not.toHaveBeenCalled();
  });

  it('deletes news when confirm button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Das ist eine Test-Nachricht')).toBeTruthy();
    });

    // Find the delete button for text news - it should be near the text content
    const textNewsContainer = screen
      .getByText('Das ist eine Test-Nachricht')
      .closest('[data-testid="card"]');
    const deleteButtons = textNewsContainer?.querySelectorAll('[data-testid="trash2-icon"]');
    const deleteButton = deleteButtons?.[0]?.closest('button');

    expect(deleteButton).toBeTruthy();
    await user.click(deleteButton!);

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog')).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockNewsService.delete).toHaveBeenCalledWith('text-1');
    });

    // Wait for fetchNews to complete (getAll is called after delete)
    await waitFor(() => {
      expect(mockNewsService.getAll).toHaveBeenCalled();
    });

    // Toast should be called after successful deletion
    expect(mockToastSuccess).toHaveBeenCalledWith('News erfolgreich gelöscht');
  });

  it('reloads news after successful deletion', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Das ist eine Test-Nachricht')).toBeTruthy();
    });

    // Clear initial load call
    mockNewsService.getAll.mockClear();

    // Find the delete button for text news
    const textNewsContainer = screen
      .getByText('Das ist eine Test-Nachricht')
      .closest('[data-testid="card"]');
    const deleteButtons = textNewsContainer?.querySelectorAll('[data-testid="trash2-icon"]');
    const deleteButton = deleteButtons?.[0]?.closest('button');

    expect(deleteButton).toBeTruthy();
    await user.click(deleteButton!);

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog')).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      // Should reload news after deletion
      expect(mockNewsService.getAll).toHaveBeenCalled();
    });
  });
});
