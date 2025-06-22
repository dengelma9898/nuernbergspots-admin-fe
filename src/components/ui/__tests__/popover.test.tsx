import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '../popover';

// Test Popover Komponente für bessere Testbarkeit
const TestPopover = ({
  open,
  onOpenChange = jest.fn(),
  children,
  ...props
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange} {...props}>
    <PopoverTrigger data-testid="popover-trigger" asChild>
      <button>Open Popover</button>
    </PopoverTrigger>
    <PopoverContent data-testid="popover-content">
      <div data-testid="popover-body">
        <h4>Popover Title</h4>
        <p>This is the popover content with some useful information.</p>
        {children}
      </div>
    </PopoverContent>
  </Popover>
);

describe('Popover Components', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Popover', () => {
    it('sollte korrekt mit data-slot="popover" gerendert werden', () => {
      render(
        <Popover data-testid="popover">
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
        </Popover>
      );

      // Der Popover Root ist ein unsichtbarer Wrapper
      const trigger = screen.getByRole('button', { name: 'Trigger' });
      expect(trigger).toBeInTheDocument();
    });

    it('sollte controlled open state unterstützen', () => {
      const onOpenChange = jest.fn();

      const { rerender } = render(<TestPopover open={false} onOpenChange={onOpenChange} />);

      // Popover sollte geschlossen sein
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();

      // Popover öffnen
      rerender(<TestPopover open={true} onOpenChange={onOpenChange} />);

      // Popover sollte geöffnet sein
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('sollte uncontrolled state unterstützen', async () => {
      const user = userEvent.setup();

      render(<TestPopover />);

      // Initial geschlossen
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();

      // Trigger klicken um zu öffnen
      await user.click(screen.getByTestId('popover-trigger'));

      // Popover sollte geöffnet sein
      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });
    });
  });

  describe('PopoverTrigger', () => {
    it('sollte korrekt mit data-slot="popover-trigger" gerendert werden', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="trigger" asChild>
            <button>Open</button>
          </PopoverTrigger>
        </Popover>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('data-slot', 'popover-trigger');
      expect(trigger).toHaveTextContent('Open');
    });

    it('sollte als Button funktionieren', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="trigger">Trigger Button</PopoverTrigger>
        </Popover>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveTextContent('Trigger Button');
    });

    it('sollte mit asChild custom Element verwenden', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <div data-testid="custom-trigger">Custom Trigger</div>
          </PopoverTrigger>
        </Popover>
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger.tagName).toBe('DIV');
      expect(trigger).toHaveTextContent('Custom Trigger');
    });

    it('sollte onClick Handler unterstützen', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Popover>
          <PopoverTrigger data-testid="trigger" onClick={onClick}>
            Click Me
          </PopoverTrigger>
        </Popover>
      );

      await user.click(screen.getByTestId('trigger'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('PopoverContent', () => {
    it('sollte korrekt mit data-slot="popover-content" gerendert werden', () => {
      render(<TestPopover open />);

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-slot', 'popover-content');
      expect(content).toBeInTheDocument();
    });

    it('sollte Standard-Styles haben', () => {
      render(<TestPopover open />);

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass(
        'bg-popover',
        'text-popover-foreground',
        'z-50',
        'w-72',
        'rounded-md',
        'border',
        'p-4',
        'shadow-md',
        'outline-hidden'
      );
    });

    it('sollte Animation-Klassen haben', () => {
      render(<TestPopover open />);

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0',
        'data-[state=closed]:fade-out-0'
      );
    });

    it('sollte default align und sideOffset verwenden', () => {
      render(<TestPopover open />);

      const content = screen.getByTestId('popover-content');
      expect(content).toHaveAttribute('data-align', 'center');
      expect(content).toHaveAttribute('data-side');
    });

    it('sollte custom align akzeptieren', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent align="start" data-testid="content">
            Custom align content
          </PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-align', 'start');
    });

    it('sollte custom sideOffset akzeptieren', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent sideOffset={10} data-testid="content">
            Custom offset content
          </PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent className="custom-popover" data-testid="content">
            Custom styled content
          </PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-popover');
    });

    it('sollte verschiedene Inhaltstypen unterstützen', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent data-testid="content">
            <h3>Title</h3>
            <p>Description</p>
            <button>Action</button>
          </PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toContainHTML('<h3>Title</h3>');
      expect(content).toContainHTML('<p>Description</p>');
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('PopoverAnchor', () => {
    it('sollte korrekt mit data-slot="popover-anchor" gerendert werden', () => {
      render(
        <Popover>
          <PopoverAnchor data-testid="anchor" asChild>
            <div>Anchor Element</div>
          </PopoverAnchor>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
        </Popover>
      );

      const anchor = screen.getByTestId('anchor');
      expect(anchor).toHaveAttribute('data-slot', 'popover-anchor');
      expect(anchor).toHaveTextContent('Anchor Element');
    });

    it('sollte als Positionierungsreferenz funktionieren', () => {
      render(
        <Popover open>
          <PopoverAnchor data-testid="anchor" asChild>
            <span>Anchor Point</span>
          </PopoverAnchor>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent data-testid="content">Anchored content</PopoverContent>
        </Popover>
      );

      const anchor = screen.getByTestId('anchor');
      const content = screen.getByTestId('content');

      expect(anchor).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });

  describe('Interaktionen', () => {
    it('sollte Popover durch Trigger-Klick öffnen und schließen', async () => {
      const user = userEvent.setup();

      render(<TestPopover />);

      const trigger = screen.getByTestId('popover-trigger');

      // Popover öffnen
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });

      // Popover schließen
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('sollte Popover durch Escape-Taste schließen', async () => {
      const user = userEvent.setup();

      render(<TestPopover />);

      const trigger = screen.getByTestId('popover-trigger');

      // Popover öffnen
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });

      // ESC-Taste drücken
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('sollte Popover durch Außenklick schließen', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <TestPopover />
          <div data-testid="outside">Outside content</div>
        </div>
      );

      const trigger = screen.getByTestId('popover-trigger');

      // Popover öffnen
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });

      // Außerhalb klicken
      await user.click(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('sollte onOpenChange callback aufrufen', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();

      render(<TestPopover onOpenChange={onOpenChange} />);

      // Popover öffnen
      await user.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute setzen', () => {
      render(<TestPopover open />);

      const trigger = screen.getByTestId('popover-trigger');
      const content = screen.getByTestId('popover-content');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(content).toHaveAttribute('role');
    });

    it('sollte ARIA-Attribute beim Schließen aktualisieren', () => {
      render(<TestPopover open={false} />);

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('sollte Fokus-Management unterstützen', async () => {
      const user = userEvent.setup();

      render(<TestPopover />);

      const trigger = screen.getByTestId('popover-trigger');

      // Trigger fokussieren und öffnen
      trigger.focus();
      await user.keyboard(' '); // Space-Taste

      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });
    });
  });

  describe('Positionierung', () => {
    it('sollte verschiedene Seiten unterstützen', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent side="top" data-testid="content">
            Top positioned content
          </PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'top');
    });

    it('sollte verschiedene Ausrichtungen unterstützen', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent align="end" data-testid="content">
            End aligned content
          </PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-align', 'end');
    });
  });

  describe('Vollständiger Popover Test', () => {
    it('sollte komplettes Popover mit allen Komponenten rendern', () => {
      render(
        <Popover open>
          <PopoverAnchor asChild>
            <span data-testid="anchor">Anchor</span>
          </PopoverAnchor>
          <PopoverTrigger data-testid="trigger" asChild>
            <button>Open Menu</button>
          </PopoverTrigger>
          <PopoverContent data-testid="content">
            <div>
              <h3>Menu Title</h3>
              <ul>
                <li>Option 1</li>
                <li>Option 2</li>
                <li>Option 3</li>
              </ul>
              <button>Close</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      // Alle Komponenten sollten vorhanden sein
      expect(screen.getByTestId('anchor')).toHaveAttribute('data-slot', 'popover-anchor');
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'popover-trigger');
      expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'popover-content');

      // Inhalt sollte korrekt gerendert werden
      expect(screen.getByText('Menu Title')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('sollte alle data-slot Attribute korrekt setzen', () => {
      render(
        <Popover open>
          <PopoverAnchor data-testid="anchor" asChild>
            <div>Anchor</div>
          </PopoverAnchor>
          <PopoverTrigger data-testid="trigger" asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent data-testid="content">Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('anchor')).toHaveAttribute('data-slot', 'popover-anchor');
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'popover-trigger');
      expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'popover-content');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leerem Content umgehen', () => {
      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent data-testid="content"></PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toBeEmptyDOMElement();
    });

    it('sollte mit sehr großem Content umgehen', () => {
      const largeContent = 'Lorem ipsum '.repeat(200);

      render(
        <Popover open>
          <PopoverTrigger asChild>
            <button>Trigger</button>
          </PopoverTrigger>
          <PopoverContent data-testid="content">{largeContent}</PopoverContent>
        </Popover>
      );

      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content.textContent).toContain('Lorem ipsum');
      expect(content.textContent?.length).toBeGreaterThan(1000);
    });

    it('sollte mit mehreren Triggern umgehen', () => {
      render(
        <div>
          <Popover>
            <PopoverTrigger data-testid="trigger1">Trigger 1</PopoverTrigger>
            <PopoverContent>Content 1</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger data-testid="trigger2">Trigger 2</PopoverTrigger>
            <PopoverContent>Content 2</PopoverContent>
          </Popover>
        </div>
      );

      expect(screen.getByTestId('trigger1')).toBeInTheDocument();
      expect(screen.getByTestId('trigger2')).toBeInTheDocument();
    });
  });
});
