import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { JobCategories } from '../JobCategories';
import { JobCategory } from '@/models/job-category';
import {
  expectToastErrorTitleContains,
  expectToastSuccessTitle,
} from '@/test-utils/sonnerAssertions';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, asChild }: any) => {
    const Component = asChild ? 'div' : 'button';
    return (
      <Component
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        className={className}
        data-testid="button"
      >
        {children}
      </Component>
    );
  },
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, className }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={className}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children, className }: any) => (
    <table data-testid="table" className={className}>
      {children}
    </table>
  ),
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableCell: ({ children, colSpan, className }: any) => (
    <td data-testid="table-cell" colSpan={colSpan} className={className}>
      {children}
    </td>
  ),
  TableHead: ({ children, className }: any) => (
    <th data-testid="table-head" className={className}>
      {children}
    </th>
  ),
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableRow: ({ children }: any) => <tr data-testid="table-row">{children}</tr>,
}));

jest.mock('@/components/ui/dialog', () => ({
  // Kein onClick auf dem Wrapper: sonst schließt jeder Klick im Dialog (z. B. „Hinzufügen“) den Dialog und bricht Tests.
  Dialog: ({ children, open }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children, asChild }: any) => {
    const Component = asChild ? 'div' : 'button';
    return <Component data-testid="dialog-trigger">{children}</Component>;
  },
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-menu-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div data-testid="dropdown-menu-item" onClick={onClick} className={className}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => {
    const Component = asChild ? 'div' : 'button';
    return <Component data-testid="dropdown-menu-trigger">{children}</Component>;
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon">MoreHorizontal</div>,
  Pencil: () => <div data-testid="pencil-icon">Pencil</div>,
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  X: () => <div data-testid="x-icon">X</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  ImagePlus: () => <div data-testid="image-plus-icon">ImagePlus</div>,
}));

// Mock Toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Services
const mockJobCategoryService = {
  getCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  getCategory: jest.fn(),
  updateFallbackImages: jest.fn(),
  deleteFallbackImage: jest.fn(),
};

jest.mock('@/services/jobCategoryService', () => ({
  useJobCategoryService: () => mockJobCategoryService,
}));

// Mock icon utils
jest.mock('@/utils/iconUtils', () => ({
  getIconComponent: jest.fn(() => <div data-testid="icon-component">Icon</div>),
}));

// Mock IconPicker
jest.mock('@/components/ui/icon-picker', () => ({
  IconPicker: ({ value, onChange }: any) => (
    <div data-testid="icon-picker" onClick={() => onChange('test-icon')} data-value={value}>
      IconPicker: {value}
    </div>
  ),
}));

// Mock skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock color utils
jest.mock('@/utils/colorUtils', () => ({
  convertFFToHex: jest.fn(color => color || '#000000'),
  convertHexToFF: jest.fn(color => color || '#000000'),
}));

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('JobCategories Component', () => {
  const user = userEvent.setup();

  const mockCategory: JobCategory = {
    id: 'cat-1',
    name: 'IT & Software',
    description: 'Information Technology and Software Development',
    iconName: 'laptop',
    colorCode: '#3B82F6',
    fallbackImages: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockCategoryWithoutOptionalFields: JobCategory = {
    id: 'cat-2',
    name: 'Marketing',
    description: '',
    iconName: 'megaphone',
    colorCode: '#EF4444',
    fallbackImages: [],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockJobCategoryService.getCategories.mockResolvedValue([
      mockCategory,
      mockCategoryWithoutOptionalFields,
    ]);
    mockJobCategoryService.createCategory.mockResolvedValue(mockCategory);
    mockJobCategoryService.updateCategory.mockResolvedValue(mockCategory);
    mockJobCategoryService.getCategory.mockResolvedValue(mockCategory);
    mockJobCategoryService.updateFallbackImages.mockResolvedValue(mockCategory);
    mockJobCategoryService.deleteCategory.mockResolvedValue(undefined);
    mockJobCategoryService.deleteFallbackImage.mockResolvedValue(undefined);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <JobCategories />
      </BrowserRouter>
    );
  };

  it('renders job categories page correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Job-Kategorien verwalten')).toBeTruthy();
      expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
      expect(screen.getAllByText('Neue Kategorie').length).toBeGreaterThan(0);
    });
  });

  it('displays skeleton loading state initially', () => {
    mockJobCategoryService.getCategories.mockImplementation(() => new Promise(() => {}));
    const { container } = renderComponent();

    // Sollte sowohl mobile als auch desktop Skeleton-Elemente anzeigen
    const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(25); // Mobile Cards + Table Skeletons
  });

  it('loads categories on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockJobCategoryService.getCategories).toHaveBeenCalled();
    });
  });

  it('displays categories after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('IT & Software').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Marketing').length).toBeGreaterThan(0);
    });
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Zurück zum Dashboard')).toBeTruthy();
    });

    const backButton = screen.getByText('Zurück zum Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('opens dialog when new category button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getAllByText('Neue Kategorie').length).toBeGreaterThan(1);
    });
  });

  it('displays category details in table view', async () => {
    renderComponent();

    await waitFor(() => {
      // Check table headers (using getAllByText since these also appear as form labels)
      expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Icon').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Beschreibung').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Farbe').length).toBeGreaterThan(0);

      // Check category data
      expect(screen.getAllByText('IT & Software').length).toBeGreaterThan(0);
      expect(
        screen.getAllByText('Information Technology and Software Development').length
      ).toBeGreaterThan(0);
      expect(screen.getAllByText('Marketing').length).toBeGreaterThan(0);
    });
  });

  it('displays category details in mobile card view', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IT & Software').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Marketing').length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no categories exist', async () => {
    mockJobCategoryService.getCategories.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Keine Kategorien vorhanden').length).toBeGreaterThan(0);
    });
  });

  it('creates new category successfully', async () => {
    const { toast } = require('sonner');
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    // Open dialog
    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kategoriename')).toBeTruthy();
    });

    // Fill form
    const nameInput = screen.getByPlaceholderText('Kategoriename');
    await user.type(nameInput, 'Test Category');

    const descriptionInput = screen.getByPlaceholderText('Beschreibung der Kategorie');
    await user.type(descriptionInput, 'Test Description');

    // Submit
    const submitButton = screen.getByText('Hinzufügen');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockJobCategoryService.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Category',
          description: 'Test Description',
        })
      );
      expectToastSuccessTitle(toast.success, 'Kategorie hinzugefügt');
    });
  });

  it('shows error when creating category without name', async () => {
    const { toast } = require('sonner');
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    // Open dialog
    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getByText('Hinzufügen')).toBeTruthy();
    });

    // Submit without name
    const submitButton = screen.getByText('Hinzufügen');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Bitte geben Sie einen Namen ein')).toBeInTheDocument();
    });
  });

  it('opens edit dialog with category data', async () => {
    renderComponent();

    await waitFor(() => {
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByText('Bearbeiten');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Kategorie bearbeiten')).toBeTruthy();
      expect(screen.getByDisplayValue('IT & Software')).toBeTruthy();
      expect(
        screen.getByDisplayValue('Information Technology and Software Development')
      ).toBeTruthy();
    });
  });

  it('updates category successfully', async () => {
    const { toast } = require('sonner');
    renderComponent();

    await waitFor(() => {
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    // Open edit dialog
    const editButtons = screen.getAllByText('Bearbeiten');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Kategorie bearbeiten')).toBeTruthy();
      expect(screen.getByDisplayValue('IT & Software')).toBeTruthy();
    });

    // Update name
    const nameInput = screen.getByDisplayValue('IT & Software');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Category');

    // Submit - the button might show "Hinzufügen" or "Aktualisieren" depending on dialog state
    let submitButton;
    try {
      submitButton = screen.getByText('Aktualisieren');
    } catch {
      // Fallback to "Hinzufügen" if "Aktualisieren" is not found
      submitButton = screen.getByText('Hinzufügen');
    }
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockJobCategoryService.updateCategory).toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({
          name: 'Updated Category',
        })
      );
      expectToastSuccessTitle(toast.success, 'Kategorie aktualisiert');
    });
  });

  it('deletes category successfully', async () => {
    const { toast } = require('sonner');
    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Löschen');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Löschen');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockJobCategoryService.deleteCategory).toHaveBeenCalledWith('cat-1');
      expectToastSuccessTitle(toast.success, 'Kategorie gelöscht');
    });
  });

  it('handles creation error gracefully', async () => {
    const { toast } = require('sonner');
    mockJobCategoryService.createCategory.mockRejectedValue(new Error('Creation failed'));

    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    // Open dialog and fill form
    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kategoriename')).toBeTruthy();
    });

    const nameInput = screen.getByPlaceholderText('Kategoriename');
    await user.type(nameInput, 'Test Category');

    const submitButton = screen.getByText('Hinzufügen');
    await user.click(submitButton);

    await waitFor(() => {
      expectToastErrorTitleContains(toast.error, 'Fehler beim Speichern der Kategorie');
    });
  });

  it('handles update error gracefully', async () => {
    const { toast } = require('sonner');
    mockJobCategoryService.updateCategory.mockRejectedValue(new Error('Update failed'));

    renderComponent();

    await waitFor(() => {
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByText('Bearbeiten');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Aktualisieren')).toBeTruthy();
    });

    const updateButton = screen.getByText('Aktualisieren');
    await user.click(updateButton);

    await waitFor(() => {
      expectToastErrorTitleContains(toast.error, 'Fehler beim Speichern der Kategorie');
    });
  });

  it('handles delete error gracefully', async () => {
    const { toast } = require('sonner');
    mockJobCategoryService.deleteCategory.mockRejectedValue(new Error('Delete failed'));

    renderComponent();

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Löschen');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Löschen');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expectToastErrorTitleContains(toast.error, 'Fehler beim Löschen der Kategorie');
    });
  });

  it('handles loading error gracefully', async () => {
    const { toast } = require('sonner');
    mockJobCategoryService.getCategories.mockRejectedValue(new Error('Loading failed'));

    renderComponent();

    await waitFor(() => {
      expectToastErrorTitleContains(toast.error, 'Fehler beim Laden der Kategorien');
    });
  });

  it('cancels dialog and resets form', async () => {
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    // Open dialog
    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kategoriename')).toBeTruthy();
    });

    // Fill some data
    const nameInput = screen.getByPlaceholderText('Kategoriename');
    await user.type(nameInput, 'Test');

    // Cancel
    const cancelButton = screen.getByText('Abbrechen');
    await user.click(cancelButton);

    // Reopen dialog to check if form is reset
    await user.click(newCategoryButton!);

    await waitFor(() => {
      const nameInputAfterCancel = screen.getByPlaceholderText('Kategoriename');
      expect((nameInputAfterCancel as HTMLInputElement).value).toBe('');
    });
  });

  it('displays color picker correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getAllByText('Farbe').length).toBeGreaterThan(0);
      const colorInput = screen.getByDisplayValue('#000000');
      expect(colorInput).toBeTruthy();
      expect(colorInput.getAttribute('type')).toBe('color');
    });
  });

  it('displays icon picker correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getAllByText('Icon').length).toBeGreaterThan(0);
      expect(screen.getByTestId('icon-picker')).toBeTruthy();
    });
  });

  it('displays fallback images section', async () => {
    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getByText('Fallback-Bilder (max. 5)')).toBeTruthy();
      expect(screen.getByTestId('image-plus-icon')).toBeTruthy();
    });
  });

  it('shows saving state during operations', async () => {
    let resolvePromise: (value: any) => void;
    const createPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockJobCategoryService.createCategory.mockReturnValue(createPromise);

    renderComponent();

    await waitFor(() => {
      const newCategoryButtons = screen.getAllByText('Neue Kategorie');
      expect(newCategoryButtons.length).toBeGreaterThan(0);
    });

    // Open dialog
    const newCategoryButtons = screen.getAllByText('Neue Kategorie');
    const newCategoryButton = newCategoryButtons.find(btn => btn.tagName === 'BUTTON');
    await user.click(newCategoryButton!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kategoriename')).toBeTruthy();
    });

    // Fill form
    const nameInput = screen.getByPlaceholderText('Kategoriename');
    await user.type(nameInput, 'Test Category');

    // Submit
    const submitButton = screen.getByText('Hinzufügen');
    await user.click(submitButton);

    // Check saving state
    await waitFor(() => {
      expect(screen.getByText('Wird erstellt...')).toBeTruthy();
    });

    // Resolve promise
    resolvePromise!(mockCategory);

    await waitFor(() => {
      expect(screen.queryByText('Wird erstellt...')).toBeFalsy();
    });
  });

  it('displays dates correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Check if creation dates are displayed (formatted dates)
      // Datum kann je nach Locale unterschiedlich formatiert sein (z.B. "1.1.2024", "01.01.2024" oder "1/1/2024")
      const dateElements = screen.queryAllByText((content, element) => {
        const text = content || '';
        return /^\d{1,2}[./]\d{1,2}[./]\d{4}$/.test(text) || /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(text);
      });
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('displays color codes correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Check if color codes are displayed
      expect(screen.getAllByText('#3B82F6').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#EF4444').length).toBeGreaterThan(0);
    });
  });

  it('handles category with no description', async () => {
    renderComponent();

    await waitFor(() => {
      // Should display dash for empty description
      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });
  });

  it('displays icons for each category', async () => {
    renderComponent();

    await waitFor(() => {
      // Check if icon components are rendered
      expect(screen.getAllByTestId('icon-component').length).toBeGreaterThan(0);
    });
  });

  it('handles dropdown menu interactions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('dropdown-menu-trigger').length).toBeGreaterThan(0);
    });

    const dropdownTriggers = screen.getAllByTestId('dropdown-menu-trigger');
    expect(dropdownTriggers[0]).toBeTruthy();
  });

  it('displays creation and update timestamps', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Erstellt am').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Aktualisiert am').length).toBeGreaterThan(0);
    });
  });

  it('renders table headers correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Use getAllByText to handle duplicate elements (form labels and table headers)
      expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Icon').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Beschreibung').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Farbe').length).toBeGreaterThan(0);
      expect(screen.getByText('Erstellt am')).toBeTruthy();
      expect(screen.getByText('Aktualisiert am')).toBeTruthy();
      expect(screen.getByText('Fallback-Bilder')).toBeTruthy();
      expect(screen.getByText('Aktionen')).toBeTruthy();
    });
  });

  it('displays all required icons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('arrow-left-icon')).toBeTruthy();
      expect(screen.getByTestId('plus-icon')).toBeTruthy();
    });
  });

  it('displays mobile and desktop views correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Both mobile cards and desktop table should be present
      expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
      expect(screen.getByTestId('table')).toBeTruthy();
    });
  });

  it('handles image preview functionality', async () => {
    renderComponent();

    await waitFor(() => {
      // Check if fallback images are displayed
      const categoryWithImages = screen.getAllByAltText(/Fallback \d+/);
      expect(categoryWithImages.length).toBeGreaterThan(0);
    });
  });
});
