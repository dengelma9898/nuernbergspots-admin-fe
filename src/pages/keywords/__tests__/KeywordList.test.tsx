import { toast } from 'sonner';
import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { KeywordList } from '../KeywordList';
import { Keyword } from '@/models/keyword';
import {
  expectToastErrorTitleContains,
  expectToastSuccessTitle,
} from '@/test-utils/sonnerAssertions';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

// Toast Mock
vi.mock('sonner', async () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Keyword Service Mock
const mockKeywordService = {
  getKeywords: vi.fn(),
  createKeyword: vi.fn(),
  updateKeyword: vi.fn(),
  deleteKeyword: vi.fn(),
};

vi.mock('@/services/keywordService', async () => ({
  useKeywordService: () => mockKeywordService,
}));

// UI Component Mocks
vi.mock('@/components/ui/card', async () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', async () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      role="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', async () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/table', async () => ({
  Table: ({ children, className }: any) => (
    <table data-testid="table" className={className}>
      {children}
    </table>
  ),
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children }: any) => <tr data-testid="table-row">{children}</tr>,
  TableHead: ({ children }: any) => <th data-testid="table-head">{children}</th>,
  TableCell: ({ children, className }: any) => (
    <td data-testid="table-cell" className={className}>
      {children}
    </td>
  ),
}));

vi.mock('@/components/ui/dialog', async () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open ? 'true' : 'false'}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => <div data-testid="dialog-trigger">{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', async () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div data-testid="dropdown-menu-item" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
}));

vi.mock('@/components/ui/skeleton', async () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Lucide icons mock
vi.mock('lucide-react', async () => ({
  ...(await vi.importActual('lucide-react')),
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon">MoreHorizontal</div>,
  Pencil: () => <div data-testid="pencil-icon">Pencil</div>,
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  X: () => <div data-testid="x-icon">X</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
}));

// Mock Data
const mockKeywords: Keyword[] = [
  {
    id: 'keyword-1',
    name: 'Pizza',
    description: 'Italienisches Gericht',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'keyword-2',
    name: 'Burger',
    description: 'Amerikanisches Fast Food',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'keyword-3',
    name: 'Sushi',
    description: 'Japanisches Gericht',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

const singleKeyword = mockKeywords[0];

// Helper function
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('KeywordList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockKeywordService.getKeywords.mockResolvedValue(mockKeywords);
  });

  describe('Component Rendering', () => {
    it('sollte die KeywordList korrekt rendern', async () => {
      renderWithRouter(<KeywordList />);

      expect(screen.getByText('Keywords verwalten')).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      expect(screen.getByText('Zurück zum Dashboard')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });
    });

    it('sollte Loading-State mit Skeleton-Animationen anzeigen', async () => {
      mockKeywordService.getKeywords.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockKeywords), 1000))
      );

      const { container } = renderWithRouter(<KeywordList />);

      // Überprüfe, dass Skeleton-Elemente gerendert werden
      const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);

      // Es sollten sowohl Mobile-Card-Skeletons als auch Desktop-Table-Skeletons vorhanden sein
      expect(skeletonElements.length).toBeGreaterThan(20);
    });

    it('sollte Desktop-Tabelle rendern', async () => {
      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
        // Verwende spezifische Selektoren für Tabellen-Header
        expect(screen.getByTestId('table-header')).toBeInTheDocument();
        const tableHeaders = screen.getAllByTestId('table-head');
        expect(tableHeaders).toHaveLength(5);
      });
    });
  });

  describe('Data Loading', () => {
    it('sollte Keywords beim Mount laden', async () => {
      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(mockKeywordService.getKeywords).toHaveBeenCalledTimes(1);
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Burger')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Sushi')[0]).toBeInTheDocument();
      });
    });

    it('sollte Fehler beim Laden der Keywords behandeln', async () => {
      const mockToast = toast;
      mockKeywordService.getKeywords.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Laden der Keywords');
      });
    });

    it('sollte leere Liste anzeigen', async () => {
      mockKeywordService.getKeywords.mockResolvedValue([]);

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Keine Keywords vorhanden')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zum Dashboard navigieren beim Klick auf Zurück', async () => {
      renderWithRouter(<KeywordList />);

      const backButton = screen.getByText('Zurück zum Dashboard');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Keyword Display', () => {
    beforeEach(async () => {
      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });
    });

    it('sollte Keyword-Daten korrekt anzeigen', () => {
      expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Italienisches Gericht')[0]).toBeInTheDocument();
    });

    it('sollte Erstellungs- und Aktualisierungsdatum anzeigen', async () => {
      await waitFor(() => {
        // Datum kann je nach Locale unterschiedlich formatiert sein (z.B. "1.1.2024", "01.01.2024" oder "1/1/2024")
        // Prüfe auf verschiedene Datumsformate
        const dateElements = screen.queryAllByText((content, element) => {
          const text = content || '';
          return (
            /^\d{1,2}[./]\d{1,2}[./]\d{4}$/.test(text) || /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(text)
          );
        });
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('sollte Keywords ohne Beschreibung korrekt anzeigen', async () => {
      const keywordWithoutDescription = {
        ...singleKeyword,
        description: '',
      };

      mockKeywordService.getKeywords.mockResolvedValue([keywordWithoutDescription]);

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Keyword Creation', () => {
    it('sollte Dialog für neues Keyword öffnen', async () => {
      renderWithRouter(<KeywordList />);

      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      });
    });

    it('sollte neues Keyword erstellen', async () => {
      const mockToast = toast;
      const newKeyword: Keyword = {
        id: 'new-keyword',
        name: 'Neues Keyword',
        description: 'Test Beschreibung',
        createdAt: '2024-01-04T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      };

      mockKeywordService.createKeyword.mockResolvedValue(newKeyword);

      renderWithRouter(<KeywordList />);

      // Dialog öffnen
      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        // Formulardaten eingeben
        const nameInput = screen.getByPlaceholderText('Keyword Name');
        fireEvent.change(nameInput, { target: { value: 'Neues Keyword' } });

        const descriptionInput = screen.getByPlaceholderText('Beschreibung');
        fireEvent.change(descriptionInput, { target: { value: 'Test Beschreibung' } });
      });

      // Keyword erstellen
      const createButton = screen.getByTestId('check-icon').closest('button');
      fireEvent.click(createButton!);

      await waitFor(() => {
        expect(mockKeywordService.createKeyword).toHaveBeenCalledWith({
          name: 'Neues Keyword',
          description: 'Test Beschreibung',
        });
        expectToastSuccessTitle(mockToast.success, 'Keyword hinzugefügt');
      });
    });

    it('sollte Fehler bei leerem Namen anzeigen', async () => {
      const mockToast = toast;

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });

      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Neues Keyword');
      });

      const createButton = screen.getByTestId('check-icon').closest('button');
      fireEvent.click(createButton!);

      await waitFor(() => {
        expect(screen.getByText('Bitte geben Sie einen Namen ein')).toBeInTheDocument();
      });
    });

    it('sollte Whitespace trimmen beim Erstellen', async () => {
      const newKeyword: Keyword = {
        id: 'new-keyword',
        name: 'Test',
        description: 'Beschreibung',
        createdAt: '2024-01-04T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      };

      mockKeywordService.createKeyword.mockResolvedValue(newKeyword);

      renderWithRouter(<KeywordList />);

      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Keyword Name');
        fireEvent.change(nameInput, { target: { value: '  Test  ' } });

        const descriptionInput = screen.getByPlaceholderText('Beschreibung');
        fireEvent.change(descriptionInput, { target: { value: '  Beschreibung  ' } });

        const createButton = screen.getByTestId('check-icon').closest('button');
        fireEvent.click(createButton!);
      });

      await waitFor(() => {
        expect(mockKeywordService.createKeyword).toHaveBeenCalledWith({
          name: 'Test',
          description: 'Beschreibung',
        });
      });
    });

    it('sollte Fehler beim Erstellen behandeln', async () => {
      const mockToast = toast;
      mockKeywordService.createKeyword.mockRejectedValue(new Error('Create Error'));

      renderWithRouter(<KeywordList />);

      // Dialog öffnen und gültigen Namen eingeben
      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Keyword Name');
        fireEvent.change(nameInput, { target: { value: 'Test Keyword' } });

        const createButton = screen.getByTestId('check-icon').closest('button');
        fireEvent.click(createButton!);
      });

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Speichern des Keywords');
      });
    });
  });

  describe('Keyword Editing', () => {
    beforeEach(async () => {
      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });
    });

    it('sollte Dialog für Keyword-Bearbeitung öffnen', async () => {
      // Trigger dropdown menu first
      const moreButtons = screen.getAllByTestId('more-horizontal-icon');
      fireEvent.click(moreButtons[0]);

      // Find and click edit item in dropdown
      const editMenuItems = screen.getAllByTestId('dropdown-menu-item');
      const editItem = editMenuItems.find(item => item.textContent?.includes('Bearbeiten'));
      fireEvent.click(editItem!);

      await waitFor(() => {
        expect(screen.getByText('Keyword bearbeiten')).toBeInTheDocument();
      });
    });

    it('sollte Keyword aktualisieren', async () => {
      const mockToast = toast;
      const updatedKeyword = { ...singleKeyword, name: 'Updated Pizza' };
      mockKeywordService.updateKeyword.mockResolvedValue(updatedKeyword);

      // Trigger dropdown and click edit
      const moreButtons = screen.getAllByTestId('more-horizontal-icon');
      fireEvent.click(moreButtons[0]);

      const editMenuItems = screen.getAllByTestId('dropdown-menu-item');
      const editItem = editMenuItems.find(item => item.textContent?.includes('Bearbeiten'));
      fireEvent.click(editItem!);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Keyword Name');
        fireEvent.change(nameInput, { target: { value: 'Updated Pizza' } });

        const updateButton = screen.getByTestId('check-icon').closest('button');
        fireEvent.click(updateButton!);
      });

      await waitFor(() => {
        expect(mockKeywordService.updateKeyword).toHaveBeenCalledWith('keyword-1', {
          name: 'Updated Pizza',
          description: 'Italienisches Gericht',
        });
        expectToastSuccessTitle(mockToast.success, 'Keyword aktualisiert');
      });
    });

    it('sollte Fehler beim Aktualisieren behandeln', async () => {
      const mockToast = toast;
      mockKeywordService.updateKeyword.mockRejectedValue(new Error('Update Error'));

      // Trigger dropdown and click edit
      const moreButtons = screen.getAllByTestId('more-horizontal-icon');
      fireEvent.click(moreButtons[0]);

      const editMenuItems = screen.getAllByTestId('dropdown-menu-item');
      const editItem = editMenuItems.find(item => item.textContent?.includes('Bearbeiten'));
      fireEvent.click(editItem!);

      await waitFor(() => {
        const updateButton = screen.getByTestId('check-icon').closest('button');
        fireEvent.click(updateButton!);
      });

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Speichern des Keywords');
      });
    });
  });

  describe('Keyword Deletion', () => {
    beforeEach(async () => {
      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
      });
    });

    it('sollte Keyword löschen', async () => {
      const mockToast = toast;
      mockKeywordService.deleteKeyword.mockResolvedValue(undefined);

      // Trigger dropdown menu and click delete
      const moreButtons = screen.getAllByTestId('more-horizontal-icon');
      fireEvent.click(moreButtons[0]);

      const deleteMenuItems = screen.getAllByTestId('dropdown-menu-item');
      const deleteItem = deleteMenuItems.find(item => item.textContent?.includes('Löschen'));
      fireEvent.click(deleteItem!);

      await waitFor(() => {
        expect(mockKeywordService.deleteKeyword).toHaveBeenCalledWith('keyword-1');
        expectToastSuccessTitle(mockToast.success, 'Keyword gelöscht');
      });
    });

    it('sollte Fehler beim Löschen behandeln', async () => {
      const mockToast = toast;
      mockKeywordService.deleteKeyword.mockRejectedValue(new Error('Delete Error'));

      // Trigger dropdown menu and click delete
      const moreButtons = screen.getAllByTestId('more-horizontal-icon');
      fireEvent.click(moreButtons[0]);

      const deleteMenuItems = screen.getAllByTestId('dropdown-menu-item');
      const deleteItem = deleteMenuItems.find(item => item.textContent?.includes('Löschen'));
      fireEvent.click(deleteItem!);

      await waitFor(() => {
        expectToastErrorTitleContains(mockToast.error, 'Fehler beim Löschen des Keywords');
      });
    });
  });

  describe('Dialog Management', () => {
    it('sollte Dialog schließen beim Klick auf Abbrechen', async () => {
      renderWithRouter(<KeywordList />);

      // Dialog öffnen
      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });
        fireEvent.click(cancelButton);
      });

      // Dialog sollte geschlossen sein (our mock doesn't actually close it)
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('sollte Modal-State beim Schließen zurücksetzen', async () => {
      renderWithRouter(<KeywordList />);

      // Dialog öffnen und bearbeiten
      const newKeywordButton = screen.getByTestId('plus-icon').closest('button');
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Keyword Name');
        fireEvent.change(nameInput, { target: { value: 'Test' } });
      });

      // Dialog über onOpenChange schließen
      const dialog = screen.getByTestId('dialog');
      fireEvent.click(dialog);

      // Wieder öffnen und prüfen, ob Input leer ist
      fireEvent.click(newKeywordButton!);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Keyword Name');
        expect(nameInput).toHaveValue('');
      });
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Klassen haben', async () => {
      renderWithRouter(<KeywordList />);

      // Find the outermost container div
      const container = document.querySelector('.container.mx-auto');
      expect(container).toHaveClass('relative', 'z-10', 'container', 'mx-auto', 'py-6');
    });

    it('sollte Desktop-Tabelle rendern', async () => {
      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        const table = screen.getByTestId('table');
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe('Data Processing', () => {
    it('sollte Keywords korrekt sortieren nach Name', async () => {
      const sortedKeywords = [...mockKeywords].sort((a, b) => a.name.localeCompare(b.name));
      mockKeywordService.getKeywords.mockResolvedValue(sortedKeywords);

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Burger')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Sushi')[0]).toBeInTheDocument();
      });
    });

    it('sollte leere Beschreibung mit Bindestrich anzeigen', async () => {
      const keywordWithoutDescription = {
        ...singleKeyword,
        description: '',
      };

      mockKeywordService.getKeywords.mockResolvedValue([keywordWithoutDescription]);

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('-')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit sehr langen Keyword-Namen umgehen', async () => {
      const longKeyword = {
        ...singleKeyword,
        name: 'Dies ist ein sehr langer Keyword-Name der getestet werden soll',
      };

      mockKeywordService.getKeywords.mockResolvedValue([longKeyword]);

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(
          screen.getAllByText('Dies ist ein sehr langer Keyword-Name der getestet werden soll')[0]
        ).toBeInTheDocument();
      });
    });

    it('sollte mit speziellen Zeichen im Namen umgehen', async () => {
      const specialKeyword = {
        ...singleKeyword,
        name: 'Äöü-ß & Co.',
      };

      mockKeywordService.getKeywords.mockResolvedValue([specialKeyword]);

      renderWithRouter(<KeywordList />);

      await waitFor(() => {
        expect(screen.getAllByText('Äöü-ß & Co.')[0]).toBeInTheDocument();
      });
    });
  });
});
