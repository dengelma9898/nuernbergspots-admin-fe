import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../dialog';

// Mock für lucide-react
jest.mock('lucide-react', () => ({
  XIcon: () => <svg data-testid="x-icon">X</svg>,
}));

// Dialog Testkomponente für bessere Testbarkeit
const TestDialog = ({ 
  open = false, 
  onOpenChange = jest.fn(),
  children,
  ...props 
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange} {...props}>
    <DialogTrigger data-testid="dialog-trigger">
      Open Dialog
    </DialogTrigger>
    <DialogContent data-testid="dialog-content">
      <DialogHeader>
        <DialogTitle data-testid="dialog-title">Test Dialog Title</DialogTitle>
        <DialogDescription data-testid="dialog-description">
          This is a test dialog description
        </DialogDescription>
      </DialogHeader>
      <div data-testid="dialog-body">Dialog content goes here</div>
      <DialogFooter>
        <DialogClose data-testid="dialog-close">Close</DialogClose>
      </DialogFooter>
      {children}
    </DialogContent>
  </Dialog>
);

describe('Dialog Components', () => {
  const user = userEvent.setup();

  describe('Dialog', () => {
    it('sollte korrekt als React-Komponente gerendert werden', () => {
      const { container } = render(
        <Dialog data-testid="dialog">
          <div data-testid="test-content">Test content</div>
        </Dialog>
      );
      
      // Dialog Root ist ein unsichtbarer Wrapper, prüfen wir ob der Inhalt gerendert wird
      const testContent = screen.getByTestId('test-content');
      expect(testContent).toBeInTheDocument();
      expect(testContent).toHaveTextContent('Test content');
    });

    it('sollte Dialog mit Triggern und Content korrekt funktionieren', () => {
      render(
        <Dialog>
          <DialogTrigger data-testid="trigger">Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            <div data-testid="content">Dialog content</div>
          </DialogContent>
        </Dialog>
      );
      
      // Trigger sollte vorhanden sein
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open Dialog');
      
      // Content sollte nicht sichtbar sein (da Dialog geschlossen)
      const content = screen.queryByTestId('content');
      expect(content).not.toBeInTheDocument();
    });
  });

  describe('DialogTrigger', () => {
    it('sollte korrekt mit data-slot="dialog-trigger" gerendert werden', () => {
      render(
        <Dialog>
          <DialogTrigger data-testid="trigger">Open</DialogTrigger>
        </Dialog>
      );
      
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');
      expect(trigger).toHaveTextContent('Open');
    });

    it('sollte Dialog öffnen wenn geklickt', async () => {
      const onOpenChange = jest.fn();
      
      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger data-testid="trigger">Open</DialogTrigger>
          <DialogContent data-testid="content">Dialog Content</DialogContent>
        </Dialog>
      );
      
      await user.click(screen.getByTestId('trigger'));
      
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('DialogPortal', () => {
    it('sollte korrekt mit data-slot="dialog-portal" gerendert werden', () => {
      render(
        <Dialog open>
          <DialogPortal data-testid="portal">
            <div data-testid="portal-content">Portal Content</div>
          </DialogPortal>
        </Dialog>
      );
      
      // Portal Inhalt sollte gerendert werden
      const portalContent = screen.getByTestId('portal-content');
      expect(portalContent).toHaveTextContent('Portal Content');
    });
  });

  describe('DialogClose', () => {
    it('sollte korrekt mit data-slot="dialog-close" gerendert werden', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            <DialogClose data-testid="close">Close</DialogClose>
          </DialogContent>
        </Dialog>
      );
      
      const closeButton = screen.getByTestId('close');
      expect(closeButton).toHaveAttribute('data-slot', 'dialog-close');
      expect(closeButton).toHaveTextContent('Close');
    });

    it('sollte Dialog schließen wenn geklickt', async () => {
      const onOpenChange = jest.fn();
      
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            <DialogClose data-testid="close">Close</DialogClose>
          </DialogContent>
        </Dialog>
      );
      
      await user.click(screen.getByTestId('close'));
      
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('DialogOverlay', () => {
    it('sollte korrekt mit Standard-Styles gerendert werden', () => {
      render(
        <Dialog open>
          <DialogOverlay data-testid="overlay" />
        </Dialog>
      );
      
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveAttribute('data-slot', 'dialog-overlay');
      expect(overlay).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'fixed',
        'inset-0',
        'z-50',
        'bg-black/50'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Dialog open>
          <DialogOverlay data-testid="overlay" className="custom-overlay" />
        </Dialog>
      );
      
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveClass('custom-overlay');
    });
  });

  describe('DialogContent', () => {
    it('sollte korrekt mit Standard-Styles gerendert werden', () => {
      render(
        <Dialog open>
          <DialogContent data-testid="content">
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            Content
          </DialogContent>
        </Dialog>
      );
      
      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-slot', 'dialog-content');
      expect(content).toHaveClass(
        'bg-background',
        'fixed',
        'top-[50%]',
        'left-[50%]',
        'z-50',
        'grid',
        'rounded-lg',
        'border',
        'p-6',
        'shadow-lg'
      );
    });

    it('sollte Close-Button mit X-Icon rendern', () => {
      render(
        <Dialog open>
          <DialogContent data-testid="content">
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            Content
          </DialogContent>
        </Dialog>
      );
      
      const xIcon = screen.getByTestId('x-icon');
      expect(xIcon).toBeInTheDocument();
      
      const srOnlyText = screen.getByText('Close');
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('sollte Dialog schließen wenn X-Button geklickt wird', async () => {
      const onOpenChange = jest.fn();
      
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            Content
          </DialogContent>
        </Dialog>
      );
      
      const xIcon = screen.getByTestId('x-icon').closest('button');
      expect(xIcon).toBeInTheDocument();
      
      if (xIcon) {
        await user.click(xIcon);
        expect(onOpenChange).toHaveBeenCalledWith(false);
      }
    });

    it('sollte children rendern', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
            <div data-testid="child">Child Content</div>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
    });
  });

  describe('DialogHeader', () => {
    it('sollte korrekt mit Standard-Styles gerendert werden', () => {
      render(
        <DialogHeader data-testid="header">
          <h2>Header Content</h2>
        </DialogHeader>
      );
      
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('data-slot', 'dialog-header');
      expect(header).toHaveClass(
        'flex',
        'flex-col',
        'gap-2',
        'text-center',
        'sm:text-left'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <DialogHeader data-testid="header" className="custom-header">
          Header
        </DialogHeader>
      );
      
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('DialogFooter', () => {
    it('sollte korrekt mit Standard-Styles gerendert werden', () => {
      render(
        <DialogFooter data-testid="footer">
          <button>Footer Button</button>
        </DialogFooter>
      );
      
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('data-slot', 'dialog-footer');
      expect(footer).toHaveClass(
        'flex',
        'flex-col-reverse',
        'gap-2',
        'sm:flex-row',
        'sm:justify-end'
      );
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <DialogFooter data-testid="footer" className="custom-footer">
          Footer
        </DialogFooter>
      );
      
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('DialogTitle', () => {
    it('sollte korrekt mit Standard-Styles gerendert werden', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title">Dialog Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('data-slot', 'dialog-title');
      expect(title).toHaveClass('text-lg', 'leading-none', 'font-semibold');
      expect(title).toHaveTextContent('Dialog Title');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title" className="custom-title">
              Title
            </DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('DialogDescription', () => {
    it('sollte korrekt mit Standard-Styles gerendert werden', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription data-testid="description">
              Dialog Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('data-slot', 'dialog-description');
      expect(description).toHaveClass('text-muted-foreground', 'text-sm');
      expect(description).toHaveTextContent('Dialog Description');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription data-testid="description" className="custom-description">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('Vollständiger Dialog Test', () => {
    it('sollte kompletten Dialog-Workflow testen', async () => {
      const onOpenChange = jest.fn();
      
      render(<TestDialog onOpenChange={onOpenChange} />);
      
      // Dialog sollte initial geschlossen sein
      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
      
      // Dialog öffnen
      await user.click(screen.getByTestId('dialog-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      
      // Rerender mit open=true um geöffneten Zustand zu simulieren
      render(<TestDialog open={true} onOpenChange={onOpenChange} />);
      
      // Dialog-Inhalte sollten sichtbar sein
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Test Dialog Title');
      expect(screen.getByTestId('dialog-description')).toHaveTextContent('This is a test dialog description');
      expect(screen.getByTestId('dialog-body')).toHaveTextContent('Dialog content goes here');
      
      // Dialog schließen über Close-Button
      await user.click(screen.getByTestId('dialog-close'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('sollte Escape-Taste zum Schließen unterstützen', async () => {
      const onOpenChange = jest.fn();
      
      render(<TestDialog open={true} onOpenChange={onOpenChange} />);
      
      // ESC-Taste drücken
      fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('sollte Accessibility-Attribute korrekt setzen', () => {
      render(<TestDialog open={true} />);
      
      const title = screen.getByTestId('dialog-title');
      const description = screen.getByTestId('dialog-description');
      
      // Title sollte als heading erkannt werden
      expect(title.tagName).toBe('H2');
      
      // Description sollte korrekte Rolle haben
      expect(description).toBeInTheDocument();
    });
  });
}); 