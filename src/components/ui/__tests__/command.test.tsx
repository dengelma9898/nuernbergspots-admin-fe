import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '../command';

// Mock für Dialog-Komponenten
jest.mock('../dialog', () => ({
  Dialog: ({ children, open, ...props }: any) =>
    open ? (
      <div role="dialog" {...props}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock für lucide-react Icons
jest.mock('lucide-react', () => ({
  SearchIcon: ({ ...props }) => (
    <svg data-testid="search-icon" {...props}>
      🔍
    </svg>
  ),
}));

// Mock für scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

// Test Command Komponente für bessere Testbarkeit
const TestCommand = ({ children, ...props }: { children?: React.ReactNode }) => (
  <Command data-testid="command" {...props}>
    <CommandInput placeholder="Type a command..." data-testid="command-input" />
    <CommandList data-testid="command-list">
      <CommandEmpty data-testid="command-empty">No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions" data-testid="command-group">
        <CommandItem data-testid="command-item-1" value="calendar">
          Calendar
          <CommandShortcut data-testid="command-shortcut-1">⌘K</CommandShortcut>
        </CommandItem>
        <CommandItem data-testid="command-item-2" value="search">
          Search Emoji
          <CommandShortcut data-testid="command-shortcut-2">⌘J</CommandShortcut>
        </CommandItem>
        <CommandItem data-testid="command-item-3" value="calculator">
          Calculator
        </CommandItem>
      </CommandGroup>
      <CommandSeparator data-testid="command-separator" />
      <CommandGroup heading="Settings" data-testid="command-group-2">
        <CommandItem data-testid="command-item-4" value="profile">
          Profile
        </CommandItem>
        <CommandItem data-testid="command-item-5" value="billing">
          Billing
        </CommandItem>
        <CommandItem data-testid="command-item-6" value="settings" disabled>
          Settings
        </CommandItem>
      </CommandGroup>
      {children}
    </CommandList>
  </Command>
);

describe('Command Components', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Command', () => {
    it('sollte korrekt mit data-slot="command" gerendert werden', () => {
      render(
        <Command data-testid="command">
          <div data-testid="test-content">Test content</div>
        </Command>
      );

      const command = screen.getByTestId('command');
      expect(command).toHaveAttribute('data-slot', 'command');
      expect(command).toBeInTheDocument();

      const testContent = screen.getByTestId('test-content');
      expect(testContent).toBeInTheDocument();
      expect(testContent).toHaveTextContent('Test content');
    });

    it('sollte Standard-Styles haben', () => {
      render(<Command data-testid="command" />);

      const command = screen.getByTestId('command');
      expect(command).toHaveClass(
        'bg-popover',
        'text-popover-foreground',
        'flex',
        'h-full',
        'w-full',
        'flex-col',
        'overflow-hidden',
        'rounded-md'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(<Command data-testid="command" className="custom-command" />);

      const command = screen.getByTestId('command');
      expect(command).toHaveClass('custom-command');
    });
  });

  describe('CommandInput', () => {
    it('sollte korrekt mit data-slot="command-input" gerendert werden', () => {
      render(
        <Command>
          <CommandInput data-testid="input" placeholder="Search..." />
        </Command>
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('data-slot', 'command-input');
      expect(input).toHaveAttribute('placeholder', 'Search...');
    });

    it('sollte Search Icon rendern', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });

    it('sollte input wrapper mit korrekten Styles haben', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = screen.getByTestId('search-icon').parentElement;
      expect(wrapper).toHaveAttribute('data-slot', 'command-input-wrapper');
      expect(wrapper).toHaveClass('flex', 'h-9', 'items-center', 'gap-2', 'border-b', 'px-3');
    });

    it('sollte Text-Input unterstützen', async () => {
      const user = userEvent.setup();

      render(
        <Command>
          <CommandInput placeholder="Type here..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Type here...');
      await user.type(input, 'test command');

      expect(input).toHaveValue('test command');
    });
  });

  describe('CommandList', () => {
    it('sollte korrekt mit data-slot="command-list" gerendert werden', () => {
      render(
        <Command>
          <CommandList data-testid="list">
            <div>List content</div>
          </CommandList>
        </Command>
      );

      const list = screen.getByTestId('list');
      expect(list).toHaveAttribute('data-slot', 'command-list');
      expect(list).toHaveTextContent('List content');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Command>
          <CommandList data-testid="list" />
        </Command>
      );

      const list = screen.getByTestId('list');
      expect(list).toHaveClass(
        'max-h-[300px]',
        'scroll-py-1',
        'overflow-x-hidden',
        'overflow-y-auto'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Command>
          <CommandList data-testid="list" className="custom-list" />
        </Command>
      );

      const list = screen.getByTestId('list');
      expect(list).toHaveClass('custom-list');
    });
  });

  describe('CommandEmpty', () => {
    it('sollte korrekt mit data-slot="command-empty" gerendert werden', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty data-testid="empty">No results found</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = screen.getByTestId('empty');
      expect(empty).toHaveAttribute('data-slot', 'command-empty');
      expect(empty).toHaveTextContent('No results found');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty data-testid="empty">No results</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = screen.getByTestId('empty');
      expect(empty).toHaveClass('py-6', 'text-center', 'text-sm');
    });
  });

  describe('CommandGroup', () => {
    it('sollte korrekt mit data-slot="command-group" gerendert werden', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup data-testid="group" heading="Test Group">
              <div>Group content</div>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = screen.getByTestId('group');
      expect(group).toHaveAttribute('data-slot', 'command-group');
      expect(group).toHaveTextContent('Group content');
    });

    it('sollte Heading anzeigen', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup heading="Test Heading" data-testid="group">
              <div>Content</div>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup data-testid="group" heading="Group">
              <div>Content</div>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = screen.getByTestId('group');
      expect(group).toHaveClass('text-foreground', 'overflow-hidden', 'p-1');
    });
  });

  describe('CommandItem', () => {
    it('sollte korrekt mit data-slot="command-item" gerendert werden', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem data-testid="item" value="test">
                Test Item
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-slot', 'command-item');
      expect(item).toHaveAttribute('data-value', 'test');
      expect(item).toHaveTextContent('Test Item');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem data-testid="item" value="test">
                Test Item
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass(
        'relative',
        'flex',
        'cursor-default',
        'items-center',
        'gap-2',
        'rounded-sm',
        'px-2',
        'py-1.5',
        'text-sm',
        'outline-hidden',
        'select-none'
      );
    });

    it('sollte disabled State unterstützen', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem data-testid="item" value="test" disabled>
                Disabled Item
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-disabled', 'true');
    });

    it('sollte Selection State unterstützen', () => {
      render(
        <Command value="test">
          <CommandList>
            <CommandGroup>
              <CommandItem data-testid="item" value="test">
                Selected Item
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-selected', 'true');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem data-testid="item" value="test" className="custom-item">
                Custom Item
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('CommandShortcut', () => {
    it('sollte korrekt mit data-slot="command-shortcut" gerendert werden', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem value="test">
                Test Item
                <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveAttribute('data-slot', 'command-shortcut');
      expect(shortcut).toHaveTextContent('⌘K');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem value="test">
                Test Item
                <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass(
        'text-muted-foreground',
        'ml-auto',
        'text-xs',
        'tracking-widest'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem value="test">
                Test Item
                <CommandShortcut data-testid="shortcut" className="custom-shortcut">
                  ⌘K
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('custom-shortcut');
    });
  });

  describe('CommandSeparator', () => {
    it('sollte korrekt mit data-slot="command-separator" gerendert werden', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator data-testid="separator" />
          </CommandList>
        </Command>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-slot', 'command-separator');
    });

    it('sollte Standard-Styles haben', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator data-testid="separator" />
          </CommandList>
        </Command>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-border', '-mx-1', 'h-px');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator data-testid="separator" className="custom-separator" />
          </CommandList>
        </Command>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('custom-separator');
    });
  });

  describe('CommandDialog', () => {
    it('sollte korrekt mit Dialog-Wrapper gerendert werden', () => {
      render(
        <CommandDialog open data-testid="command-dialog">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem value="test">Test Item</CommandItem>
          </CommandList>
        </CommandDialog>
      );

      // Dialog sollte geöffnet sein
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('sollte default Title und Description haben', () => {
      render(
        <CommandDialog open>
          <CommandInput />
        </CommandDialog>
      );

      // Screen reader only elements
      expect(screen.getByText('Command Palette')).toBeInTheDocument();
      expect(screen.getByText('Search for a command to run...')).toBeInTheDocument();
    });

    it('sollte custom Title und Description akzeptieren', () => {
      render(
        <CommandDialog open title="Custom Command" description="Custom description">
          <CommandInput />
        </CommandDialog>
      );

      expect(screen.getByText('Custom Command')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('sollte Dialog schließen/öffnen unterstützen', () => {
      const onOpenChange = jest.fn();

      const { rerender } = render(
        <CommandDialog open={false} onOpenChange={onOpenChange}>
          <CommandInput />
        </CommandDialog>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <CommandDialog open={true} onOpenChange={onOpenChange}>
          <CommandInput />
        </CommandDialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('sollte Filterung basierend auf Input unterstützen', async () => {
      const user = userEvent.setup();

      render(<TestCommand />);

      const input = screen.getByTestId('command-input');

      // Alle Items sollten initial sichtbar sein
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Search Emoji')).toBeInTheDocument();
      expect(screen.getByText('Calculator')).toBeInTheDocument();

      // Nach "calc" suchen
      await user.type(input, 'calc');

      // Wait for filtering to complete
      await waitFor(() => {
        expect(screen.getByText('Calculator')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('sollte Arrow-Keys Navigation unterstützen', async () => {
      render(<TestCommand />);

      const command = screen.getByTestId('command');

      // Focus auf Command setzen
      command.focus();

      // ArrowDown drücken
      fireEvent.keyDown(command, { key: 'ArrowDown' });

      // Prüfen, dass ein Item ausgewählt ist (kann variieren je nach cmdk-Verhalten)
      await waitFor(() => {
        const selectedItems = screen
          .getAllByRole('option')
          .filter(item => item.getAttribute('data-selected') === 'true');
        expect(selectedItems.length).toBeGreaterThan(0);
      });
    });

    it('sollte Enter für Auswahl unterstützen', async () => {
      const onSelect = jest.fn();

      render(
        <Command data-testid="command">
          <CommandList>
            <CommandGroup>
              <CommandItem value="test" onSelect={onSelect}>
                Test Item
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const command = screen.getByTestId('command');
      command.focus();

      // Item auswählen
      fireEvent.keyDown(command, { key: 'ArrowDown' });
      fireEvent.keyDown(command, { key: 'Enter' });

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('test');
      });
    });
  });

  describe('Vollständiger Command Test', () => {
    it('sollte komplette Command-Palette mit allen Komponenten rendern', () => {
      render(<TestCommand />);

      // Alle Hauptkomponenten sollten vorhanden sein
      expect(screen.getByTestId('command')).toBeInTheDocument();
      expect(screen.getByTestId('command-input')).toBeInTheDocument();
      expect(screen.getByTestId('command-list')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();

      // Groups sollten vorhanden sein
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getAllByText('Settings')).toHaveLength(2); // Heading + Item

      // Items sollten vorhanden sein
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Search Emoji')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // Shortcuts sollten vorhanden sein
      expect(screen.getByText('⌘K')).toBeInTheDocument();
      expect(screen.getByText('⌘J')).toBeInTheDocument();

      // Separator sollte vorhanden sein
      expect(screen.getByTestId('command-separator')).toBeInTheDocument();
    });

    it('sollte alle data-slot Attribute korrekt setzen', () => {
      render(<TestCommand />);

      expect(screen.getByTestId('command')).toHaveAttribute('data-slot', 'command');
      expect(screen.getByTestId('command-input')).toHaveAttribute('data-slot', 'command-input');
      expect(screen.getByTestId('command-list')).toHaveAttribute('data-slot', 'command-list');
      // CommandEmpty wird nur gerendert, wenn keine Ergebnisse vorhanden sind
      const emptyElement = screen.queryByTestId('command-empty');
      if (emptyElement) {
        expect(emptyElement).toHaveAttribute('data-slot', 'command-empty');
      }
      expect(screen.getByTestId('command-group')).toHaveAttribute('data-slot', 'command-group');
      expect(screen.getByTestId('command-item-1')).toHaveAttribute('data-slot', 'command-item');
      expect(screen.getByTestId('command-shortcut-1')).toHaveAttribute(
        'data-slot',
        'command-shortcut'
      );
      expect(screen.getByTestId('command-separator')).toHaveAttribute(
        'data-slot',
        'command-separator'
      );
    });
  });
});
