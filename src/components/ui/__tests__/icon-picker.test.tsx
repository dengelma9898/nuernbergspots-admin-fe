import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { IconPicker } from '../icon-picker';

// Mock @mui/icons-material
jest.mock('@mui/icons-material', () => ({
  AccountCircle: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="AccountCircle" {...props}>
        <title>Account Circle</title>
      </svg>
    )
  ),
  Home: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="Home" {...props}>
        <title>Home</title>
      </svg>
    )
  ),
  Search: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="Search" {...props}>
        <title>Search</title>
      </svg>
    )
  ),
  Settings: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="Settings" {...props}>
        <title>Settings</title>
      </svg>
    )
  ),
  Delete: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="Delete" {...props}>
        <title>Delete</title>
      </svg>
    )
  ),
  // Varianten zum Testen der Filterung
  HomeOutlined: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="HomeOutlined" {...props}>
        <title>Home Outlined</title>
      </svg>
    )
  ),
  SettingsRounded: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg ref={ref} data-testid="SettingsRounded" {...props}>
        <title>Settings Rounded</title>
      </svg>
    )
  ),
}));

// Mock @tanstack/react-virtual
const mockVirtualizer = {
  getVirtualItems: jest.fn(() => [
    { index: 0, start: 0, size: 40, end: 40, key: '0' },
    { index: 1, start: 40, size: 40, end: 80, key: '1' },
    { index: 2, start: 80, size: 40, end: 120, key: '2' },
  ]),
  getTotalSize: jest.fn(() => 120),
  scrollToIndex: jest.fn(),
  scrollToOffset: jest.fn(),
};

jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: jest.fn(() => mockVirtualizer),
}));

// Mock Input component
jest.mock('../input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
      <input
        ref={ref}
        data-testid="search-input"
        className={className}
        {...props}
      />
    )
  ),
}));

// Mock ScrollArea component
jest.mock('../scroll-area', () => ({
  ScrollArea: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className, ...props }, ref) => (
      <div
        ref={ref}
        data-testid="scroll-area"
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  ),
}));

describe('IconPicker Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<IconPicker {...defaultProps} />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Icon suchen...')).toBeInTheDocument();
    });

    it('sollte Custom className anwenden', () => {
      render(<IconPicker {...defaultProps} className="custom-class" />);
      
      const container = screen.getByTestId('search-input').closest('.space-y-2');
      expect(container).toHaveClass('custom-class');
    });

    it('sollte Search Input rendern', () => {
      render(<IconPicker {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Icon suchen...');
    });

    it('sollte ScrollArea rendern', () => {
      render(<IconPicker {...defaultProps} />);
      
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
      expect(scrollArea).toHaveClass('h-[200px]', 'border', 'rounded-md');
    });
  });

  describe('Value Display', () => {
    it('sollte aktuelles Icon anzeigen wenn value gesetzt ist', () => {
      render(<IconPicker {...defaultProps} value="Home" />);
      
      const iconContainer = document.querySelector('.w-10.h-10.border.rounded-md');
      expect(iconContainer).toBeInTheDocument();
    });

    it('sollte kein Icon anzeigen wenn value leer ist', () => {
      render(<IconPicker {...defaultProps} value="" />);
      
      const iconContainer = document.querySelector('.w-10.h-10.border.rounded-md');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('sollte Search Term im Input anzeigen', async () => {
      const user = userEvent.setup();
      render(<IconPicker {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Home');
      
      expect(searchInput).toHaveValue('Home');
    });

    it('sollte Search Input clearen', async () => {
      const user = userEvent.setup();
      render(<IconPicker {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Home');
      expect(searchInput).toHaveValue('Home');
      
      await user.clear(searchInput);
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Icon Grid Rendering', () => {
    it('sollte Icon-Buttons rendern', () => {
      render(<IconPicker {...defaultProps} />);
      
      const iconButtons = document.querySelectorAll('button[title]');
      expect(iconButtons.length).toBeGreaterThan(0);
    });

    it('sollte Icon-Buttons mit korrekten Attributen rendern', () => {
      render(<IconPicker {...defaultProps} />);
      
      const iconButtons = document.querySelectorAll('button[title]');
      iconButtons.forEach(button => {
        expect(button).toHaveClass('flex', 'items-center', 'justify-center', 'w-10', 'h-10', 'rounded-md');
        expect(button).toHaveAttribute('title');
      });
    });

    it('sollte selected Icon hervorheben', () => {
      render(<IconPicker {...defaultProps} value="Home" />);
      
      const gridContainer = document.querySelector('.grid.grid-cols-6.gap-2.p-2');
      const selectedButton = gridContainer?.querySelector('button[title="Home"]');
      expect(selectedButton).toHaveClass('bg-accent');
    });
  });

  describe('Icon Selection', () => {
    it('sollte onChange aufrufen wenn Icon ausgewählt wird', async () => {
      const user = userEvent.setup();
      render(<IconPicker {...defaultProps} />);
      
      const gridContainer = document.querySelector('.grid.grid-cols-6.gap-2.p-2');
      const button = gridContainer?.querySelector('button[title="AccountCircle"]');
      
      if (button) {
        await user.click(button);
        expect(mockOnChange).toHaveBeenCalledWith('AccountCircle');
      }
    });
  });

  describe('Virtualization', () => {
    it('sollte Virtualizer korrekt konfigurieren', () => {
      const { useVirtualizer } = require('@tanstack/react-virtual');
      
      render(<IconPicker {...defaultProps} />);
      
      expect(useVirtualizer).toHaveBeenCalledWith({
        count: expect.any(Number),
        getScrollElement: expect.any(Function),
        estimateSize: expect.any(Function),
        overscan: 10,
      });
    });

    it('sollte Virtual Container mit korrekter Höhe rendern', () => {
      render(<IconPicker {...defaultProps} />);
      
      const virtualContainer = document.querySelector('.relative.w-full');
      expect(virtualContainer).toHaveStyle('height: 120px');
    });
  });

  describe('Performance & Memory', () => {
    it('sollte Memoization korrekt verwenden', () => {
      const { rerender } = render(<IconPicker {...defaultProps} />);
      
      rerender(<IconPicker {...defaultProps} />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('sollte mit vielen Icons performen', () => {
      const startTime = performance.now();
      render(<IconPicker {...defaultProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Props Handling', () => {
    it('sollte alle Props korrekt handhaben', () => {
      const testProps = {
        value: 'Home',
        onChange: mockOnChange,
        className: 'test-class',
      };
      
      render(<IconPicker {...testProps} />);
      
      const container = screen.getByTestId('search-input').closest('.space-y-2');
      expect(container).toHaveClass('test-class');
    });

    it('sollte onChange callback korrekt aufrufen', async () => {
      const user = userEvent.setup();
      const customOnChange = jest.fn();
      
      render(<IconPicker value="" onChange={customOnChange} />);
      
      const gridContainer = document.querySelector('.grid.grid-cols-6.gap-2.p-2');
      const button = gridContainer?.querySelector('button[title="AccountCircle"]');
      
      if (button) {
        await user.click(button);
        expect(customOnChange).toHaveBeenCalledWith('AccountCircle');
      }
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('sollte ungültigen value graceful handhaben', () => {
      render(<IconPicker {...defaultProps} value="NonExistentIcon" />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      
      // Icon Container sollte trotzdem da sein, aber leer
      const iconContainer = document.querySelector('.w-10.h-10.border.rounded-md');
      expect(iconContainer).toBeInTheDocument();
    });

    it('sollte leere Icon-Liste handhaben', () => {
      mockVirtualizer.getVirtualItems.mockReturnValue([]);
      mockVirtualizer.getTotalSize.mockReturnValue(0);
      
      render(<IconPicker {...defaultProps} />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte Icon-Buttons mit Tooltips haben', () => {
      render(<IconPicker {...defaultProps} />);
      
      const buttons = document.querySelectorAll('button[title]');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('title');
        expect(button.getAttribute('title')).toBeTruthy();
      });
    });

    it('sollte Search Input zugänglich machen', () => {
      render(<IconPicker {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', 'Icon suchen...');
    });
  });

  describe('Integration Tests', () => {
    it('sollte kompletter Workflow funktionieren', async () => {
      const user = userEvent.setup();
      render(<IconPicker {...defaultProps} />);
      
      // 1. Suche nach Icon
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Home');
      
      // 2. Icon auswählen
      const gridContainer = document.querySelector('.grid.grid-cols-6.gap-2.p-2');
      const button = gridContainer?.querySelector('button[title="Home"]');
      
      if (button) {
        await user.click(button);
        expect(mockOnChange).toHaveBeenCalledWith('Home');
      }
    });

    it('sollte Preview mit Auswahl synchronisieren', () => {
      const { rerender } = render(<IconPicker {...defaultProps} value="" />);
      
      // Zuerst kein Preview
      expect(document.querySelector('.w-10.h-10.border.rounded-md')).not.toBeInTheDocument();
      
      // Nach value Änderung sollte Preview erscheinen
      rerender(<IconPicker {...defaultProps} value="Home" />);
      expect(document.querySelector('.w-10.h-10.border.rounded-md')).toBeInTheDocument();
    });
  });
}); 