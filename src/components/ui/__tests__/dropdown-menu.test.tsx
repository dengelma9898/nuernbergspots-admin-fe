import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../dropdown-menu';

// Mock für lucide-react Icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  CheckIcon: ({ ...props }) => (
    <svg data-testid="check-icon" {...props}>
      ✓
    </svg>
  ),
  ChevronRightIcon: ({ ...props }) => (
    <svg data-testid="chevron-right-icon" {...props}>
      →
    </svg>
  ),
  CircleIcon: ({ ...props }) => (
    <svg data-testid="circle-icon" {...props}>
      ●
    </svg>
  ),
}));

// Test DropdownMenu Komponente
const TestDropdownMenu = ({
  open = false,
  onOpenChange = jest.fn(),
  ...props
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (
  <DropdownMenu open={open} onOpenChange={onOpenChange} {...props}>
    <DropdownMenuTrigger asChild>
      <button data-testid="dropdown-trigger">Open Menu</button>
    </DropdownMenuTrigger>
    <DropdownMenuContent data-testid="dropdown-content">
      <DropdownMenuLabel data-testid="menu-label">Actions</DropdownMenuLabel>
      <DropdownMenuGroup data-testid="main-group">
        <DropdownMenuItem data-testid="edit-item">
          Edit
          <DropdownMenuShortcut data-testid="edit-shortcut">⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="copy-item">Copy</DropdownMenuItem>
        <DropdownMenuItem data-testid="delete-item" variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator data-testid="separator" />
      <DropdownMenuGroup data-testid="checkbox-group">
        <DropdownMenuCheckboxItem data-testid="notifications-checkbox" checked={false}>
          Notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem data-testid="analytics-checkbox" checked={true}>
          Analytics
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup data-testid="theme-radio-group" value="dark">
        <DropdownMenuRadioItem data-testid="light-radio" value="light">
          Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem data-testid="dark-radio" value="dark">
          Dark
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem data-testid="system-radio" value="system">
          System
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

describe('DropdownMenu Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DropdownMenu', () => {
    it('sollte korrekt mit data-slot="dropdown-menu" gerendert werden', () => {
      render(
        <div data-testid="dropdown-container">
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      );

      // DropdownMenu root ist ein unsichtbarer Wrapper - wir testen das data-slot über den Trigger
      const trigger = screen.getByText('Trigger');
      expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
    });

    it('sollte controlled state unterstützen', () => {
      render(<TestDropdownMenu open={true} />);

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuTrigger', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-trigger" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
    });
  });

  describe('DropdownMenuContent', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-content" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content');
    });

    it('sollte Standard-Styles haben', () => {
      render(<TestDropdownMenu open />);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass('bg-popover');
      expect(content).toHaveClass('text-popover-foreground');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('border');
    });
  });

  describe('DropdownMenuGroup', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-group" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const group = screen.getByTestId('main-group');
      expect(group).toHaveAttribute('data-slot', 'dropdown-menu-group');
    });
  });

  describe('DropdownMenuLabel', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-label" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const label = screen.getByTestId('menu-label');
      expect(label).toHaveAttribute('data-slot', 'dropdown-menu-label');
      expect(label).toHaveTextContent('Actions');
    });

    it('sollte Standard-Styles haben', () => {
      render(<TestDropdownMenu open />);

      const label = screen.getByTestId('menu-label');
      expect(label).toHaveClass('px-2');
      expect(label).toHaveClass('py-1.5');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
    });
  });

  describe('DropdownMenuItem', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-item" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const item = screen.getByTestId('edit-item');
      expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item');
      expect(item).toHaveTextContent('Edit');
    });

    it('sollte Standard-Styles haben', () => {
      render(<TestDropdownMenu open />);

      const item = screen.getByTestId('edit-item');
      expect(item).toHaveClass('relative');
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('cursor-default');
      expect(item).toHaveClass('items-center');
      expect(item).toHaveClass('rounded-sm');
      expect(item).toHaveClass('px-2');
      expect(item).toHaveClass('py-1.5');
      expect(item).toHaveClass('text-sm');
    });

    it('sollte variant="destructive" unterstützen', () => {
      render(<TestDropdownMenu open />);

      const deleteItem = screen.getByTestId('delete-item');
      expect(deleteItem).toHaveAttribute('data-variant', 'destructive');
      expect(deleteItem).toHaveClass('data-[variant=destructive]:text-destructive');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-checkbox-item" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const checkbox = screen.getByTestId('notifications-checkbox');
      expect(checkbox).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item');
      expect(checkbox).toHaveTextContent('Notifications');
    });

    it('sollte checked state anzeigen', () => {
      render(<TestDropdownMenu open />);

      const checkedItem = screen.getByTestId('analytics-checkbox');
      expect(checkedItem).toHaveAttribute('data-state', 'checked');
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('sollte unchecked state anzeigen', () => {
      render(<TestDropdownMenu open />);

      const uncheckedItem = screen.getByTestId('notifications-checkbox');
      expect(uncheckedItem).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('DropdownMenuRadioGroup & DropdownMenuRadioItem', () => {
    it('sollte RadioGroup korrekt mit data-slot rendern', () => {
      render(<TestDropdownMenu open />);

      const radioGroup = screen.getByTestId('theme-radio-group');
      expect(radioGroup).toHaveAttribute('data-slot', 'dropdown-menu-radio-group');
    });

    it('sollte RadioItem korrekt mit data-slot rendern', () => {
      render(<TestDropdownMenu open />);

      const radioItem = screen.getByTestId('dark-radio');
      expect(radioItem).toHaveAttribute('data-slot', 'dropdown-menu-radio-item');
      expect(radioItem).toHaveTextContent('Dark');
    });

    it('sollte selected state anzeigen', () => {
      render(<TestDropdownMenu open />);

      const selectedItem = screen.getByTestId('dark-radio');
      expect(selectedItem).toHaveAttribute('data-state', 'checked');
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-separator" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-slot', 'dropdown-menu-separator');
    });

    it('sollte Standard-Styles haben', () => {
      render(<TestDropdownMenu open />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-border');
      expect(separator).toHaveClass('-mx-1');
      expect(separator).toHaveClass('my-1');
      expect(separator).toHaveClass('h-px');
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('sollte korrekt mit data-slot="dropdown-menu-shortcut" gerendert werden', () => {
      render(<TestDropdownMenu open />);

      const shortcut = screen.getByTestId('edit-shortcut');
      expect(shortcut).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
      expect(shortcut).toHaveTextContent('⌘E');
    });

    it('sollte Standard-Styles haben', () => {
      render(<TestDropdownMenu open />);

      const shortcut = screen.getByTestId('edit-shortcut');
      expect(shortcut).toHaveClass('text-muted-foreground');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-xs');
      expect(shortcut).toHaveClass('tracking-widest');
    });
  });

  describe('Vollständiger DropdownMenu Test', () => {
    it('sollte komplettes DropdownMenu mit allen Komponenten rendern', () => {
      render(<TestDropdownMenu open />);

      // Hauptkomponenten
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('menu-label')).toBeInTheDocument();

      // Groups
      expect(screen.getByTestId('main-group')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
      expect(screen.getByTestId('theme-radio-group')).toBeInTheDocument();

      // Items
      expect(screen.getByTestId('edit-item')).toBeInTheDocument();
      expect(screen.getByTestId('copy-item')).toBeInTheDocument();
      expect(screen.getByTestId('delete-item')).toBeInTheDocument();

      // Checkbox Items
      expect(screen.getByTestId('notifications-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-checkbox')).toBeInTheDocument();

      // Radio Items
      expect(screen.getByTestId('light-radio')).toBeInTheDocument();
      expect(screen.getByTestId('dark-radio')).toBeInTheDocument();
      expect(screen.getByTestId('system-radio')).toBeInTheDocument();

      // Shortcuts
      expect(screen.getByTestId('edit-shortcut')).toBeInTheDocument();

      // Separators
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('sollte alle data-slot Attribute korrekt setzen', () => {
      render(<TestDropdownMenu open />);

      expect(screen.getByTestId('dropdown-content')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-content'
      );
      expect(screen.getByTestId('menu-label')).toHaveAttribute('data-slot', 'dropdown-menu-label');
      expect(screen.getByTestId('main-group')).toHaveAttribute('data-slot', 'dropdown-menu-group');
      expect(screen.getByTestId('edit-item')).toHaveAttribute('data-slot', 'dropdown-menu-item');
      expect(screen.getByTestId('notifications-checkbox')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-checkbox-item'
      );
      expect(screen.getByTestId('theme-radio-group')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-radio-group'
      );
      expect(screen.getByTestId('dark-radio')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-radio-item'
      );
      expect(screen.getByTestId('separator')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-separator'
      );
      expect(screen.getByTestId('edit-shortcut')).toHaveAttribute(
        'data-slot',
        'dropdown-menu-shortcut'
      );
    });
  });
});
