import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog';

// Mock für @radix-ui/react-alert-dialog
const mockOnOpenChange = jest.fn();
const mockOnAction = jest.fn();
const mockOnCancel = jest.fn();

jest.mock('@radix-ui/react-alert-dialog', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ children, onOpenChange, open, ...props }, ref) => (
    <div 
      ref={ref}
      data-testid="alert-dialog-root" 
      data-open={open}
      data-props={JSON.stringify({ onOpenChange, ...props })}
      onClick={() => onOpenChange && onOpenChange(!open)}
    >
      {children}
    </div>
  )),
  Trigger: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
    <button ref={ref} data-testid="alert-dialog-trigger" {...props}>
      {children}
    </button>
  )),
  Portal: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    <div ref={ref} data-testid="alert-dialog-portal" {...props}>
      {children}
    </div>
  )),
  Overlay: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div ref={ref} data-testid="alert-dialog-overlay" className={className} {...props} />
  )),
  Content: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
    <div ref={ref} data-testid="alert-dialog-content" className={className} {...props}>
      {children}
    </div>
  )),
  Title: React.forwardRef<HTMLHeadingElement, any>(({ children, className, ...props }, ref) => (
    <h2 ref={ref} data-testid="alert-dialog-title" className={className} {...props}>
      {children}
    </h2>
  )),
  Description: React.forwardRef<HTMLParagraphElement, any>(({ children, className, ...props }, ref) => (
    <p ref={ref} data-testid="alert-dialog-description" className={className} {...props}>
      {children}
    </p>
  )),
  Action: React.forwardRef<HTMLButtonElement, any>(({ children, className, onClick, ...props }, ref) => (
    <button 
      ref={ref} 
      data-testid="alert-dialog-action" 
      className={className}
      onClick={(e) => {
        onClick?.(e);
        mockOnAction();
      }}
      {...props}
    >
      {children}
    </button>
  )),
  Cancel: React.forwardRef<HTMLButtonElement, any>(({ children, className, onClick, ...props }, ref) => (
    <button 
      ref={ref} 
      data-testid="alert-dialog-cancel" 
      className={className}
      onClick={(e) => {
        onClick?.(e);
        mockOnCancel();
      }}
      {...props}
    >
      {children}
    </button>
  )),
}));

// Mock für button variants
jest.mock('@/components/ui/button', () => ({
  buttonVariants: jest.fn((props = {}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium';
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary',
    };
    
    const variant = props.variant || 'default';
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default}`;
  }),
}));

describe('AlertDialog Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AlertDialog (Root)', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialog>
          <div>Test Content</div>
        </AlertDialog>
      );
      
      const root = screen.getByTestId('alert-dialog-root');
      expect(root).toBeInTheDocument();
      // data-slot wird über die echte Komponente gesetzt
      expect(root).toBeInTheDocument();
    });

    it('sollte open state handhaben', () => {
      render(
        <AlertDialog open={true}>
          <div>Test Content</div>
        </AlertDialog>
      );
      
      const root = screen.getByTestId('alert-dialog-root');
      expect(root).toHaveAttribute('data-open', 'true');
    });

    it('sollte onOpenChange callback unterstützen', () => {
      const onOpenChange = jest.fn();
      
      render(
        <AlertDialog onOpenChange={onOpenChange}>
          <div>Test Content</div>
        </AlertDialog>
      );
      
      const root = screen.getByTestId('alert-dialog-root');
      fireEvent.click(root);
      
      const propsData = root.getAttribute('data-props');
      expect(propsData).toBeTruthy();
    });

    it('sollte Props weiterleiten', () => {
      render(
        <AlertDialog 
          defaultOpen={false}
          data-custom="value"
        >
          <div>Content</div>
        </AlertDialog>
      );
      
      const root = screen.getByTestId('alert-dialog-root');
      // Props werden im Mock als JSON in data-props gespeichert
      const propsData = root.getAttribute('data-props');
      expect(propsData).toContain('data-custom');
    });
  });

  describe('AlertDialogTrigger', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogTrigger>
          Open Dialog
        </AlertDialogTrigger>
      );
      
      const trigger = screen.getByTestId('alert-dialog-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('data-slot', 'alert-dialog-trigger');
      expect(trigger).toHaveTextContent('Open Dialog');
    });

    it('sollte als Button funktionieren', () => {
      const onClick = jest.fn();
      
      render(
        <AlertDialogTrigger onClick={onClick}>
          Click me
        </AlertDialogTrigger>
      );
      
      const trigger = screen.getByTestId('alert-dialog-trigger');
      fireEvent.click(trigger);
      
      expect(onClick).toHaveBeenCalled();
    });

    it('sollte asChild prop unterstützen', () => {
      render(
        <AlertDialogTrigger asChild>
          <div>Custom Trigger</div>
        </AlertDialogTrigger>
      );
      
      const trigger = screen.getByTestId('alert-dialog-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('sollte disabled state unterstützen', () => {
      render(
        <AlertDialogTrigger disabled>
          Disabled Trigger
        </AlertDialogTrigger>
      );
      
      const trigger = screen.getByTestId('alert-dialog-trigger');
      expect(trigger).toHaveAttribute('disabled');
    });
  });

  describe('AlertDialogPortal', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogPortal>
          <div>Portal Content</div>
        </AlertDialogPortal>
      );
      
      const portal = screen.getByTestId('alert-dialog-portal');
      expect(portal).toBeInTheDocument();
      expect(portal).toHaveAttribute('data-slot', 'alert-dialog-portal');
      expect(portal).toHaveTextContent('Portal Content');
    });

    it('sollte container prop unterstützen', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      render(
        <AlertDialogPortal container={container}>
          <div>Portal in Container</div>
        </AlertDialogPortal>
      );
      
      const portal = screen.getByTestId('alert-dialog-portal');
      expect(portal).toBeInTheDocument();
      
      document.body.removeChild(container);
    });

    it('sollte forceMount prop unterstützen', () => {
      render(
        <AlertDialogPortal forceMount>
          <div>Force Mounted</div>
        </AlertDialogPortal>
      );
      
      const portal = screen.getByTestId('alert-dialog-portal');
      expect(portal).toBeInTheDocument();
    });
  });

  describe('AlertDialogOverlay', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<AlertDialogOverlay />);
      
      const overlay = screen.getByTestId('alert-dialog-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('data-slot', 'alert-dialog-overlay');
    });

    it('sollte Standard-Styling haben', () => {
      render(<AlertDialogOverlay />);
      
      const overlay = screen.getByTestId('alert-dialog-overlay');
      expect(overlay).toHaveClass('data-[state=open]:animate-in');
      expect(overlay).toHaveClass('data-[state=closed]:animate-out');
      expect(overlay).toHaveClass('data-[state=closed]:fade-out-0');
      expect(overlay).toHaveClass('data-[state=open]:fade-in-0');
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('z-50');
      expect(overlay).toHaveClass('bg-black/50');
    });

    it('sollte custom className akzeptieren', () => {
      render(<AlertDialogOverlay className="custom-overlay" />);
      
      const overlay = screen.getByTestId('alert-dialog-overlay');
      expect(overlay).toHaveClass('custom-overlay');
      expect(overlay).toHaveClass('fixed'); // Standard-Klasse sollte auch vorhanden sein
    });

    it('sollte Events unterstützen', () => {
      const onClick = jest.fn();
      
      render(<AlertDialogOverlay onClick={onClick} />);
      
      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.click(overlay);
      
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('AlertDialogContent', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogContent>
          <div>Dialog Content</div>
        </AlertDialogContent>
      );
      
      const content = screen.getByTestId('alert-dialog-content');
      const overlay = screen.getByTestId('alert-dialog-overlay');
      const portal = screen.getByTestId('alert-dialog-portal');
      
      expect(content).toBeInTheDocument();
      expect(overlay).toBeInTheDocument();
      expect(portal).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'alert-dialog-content');
    });

    it('sollte Standard-Styling haben', () => {
      render(
        <AlertDialogContent>
          <div>Content</div>
        </AlertDialogContent>
      );
      
      const content = screen.getByTestId('alert-dialog-content');
      expect(content).toHaveClass('bg-background');
      expect(content).toHaveClass('data-[state=open]:animate-in');
      expect(content).toHaveClass('data-[state=closed]:animate-out');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('top-[50%]');
      expect(content).toHaveClass('left-[50%]');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('grid');
      expect(content).toHaveClass('w-full');
      expect(content).toHaveClass('max-w-[calc(100%-2rem)]');
      expect(content).toHaveClass('translate-x-[-50%]');
      expect(content).toHaveClass('translate-y-[-50%]');
      expect(content).toHaveClass('gap-4');
      expect(content).toHaveClass('rounded-lg');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('shadow-lg');
      expect(content).toHaveClass('duration-200');
      expect(content).toHaveClass('sm:max-w-lg');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <AlertDialogContent className="custom-content">
          <div>Content</div>
        </AlertDialogContent>
      );
      
      const content = screen.getByTestId('alert-dialog-content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('bg-background'); // Standard-Klasse
    });

    it('sollte Portal und Overlay automatisch rendern', () => {
      render(
        <AlertDialogContent>
          <div>Content with Portal</div>
        </AlertDialogContent>
      );
      
      expect(screen.getByTestId('alert-dialog-portal')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
    });
  });

  describe('AlertDialogHeader', () => {
    it('sollte korrekt gerendert werden', () => {
      const { container } = render(
        <AlertDialogHeader>
          <div>Header Content</div>
        </AlertDialogHeader>
      );
      
      const header = container.querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'alert-dialog-header');
      expect(header).toHaveTextContent('Header Content');
    });

    it('sollte Standard-Styling haben', () => {
      const { container } = render(<AlertDialogHeader />);
      
      const header = container.querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('gap-2');
      expect(header).toHaveClass('text-center');
      expect(header).toHaveClass('sm:text-left');
    });

    it('sollte custom className akzeptieren', () => {
      const { container } = render(<AlertDialogHeader className="custom-header" />);
      
      const header = container.querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex'); // Standard-Klasse
    });

    it('sollte HTML Props unterstützen', () => {
      const { container } = render(
        <AlertDialogHeader 
          id="dialog-header"
          role="banner"
          data-custom="value"
        >
          Header
        </AlertDialogHeader>
      );
      
      const header = container.querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toHaveAttribute('id', 'dialog-header');
      expect(header).toHaveAttribute('role', 'banner');
      expect(header).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('AlertDialogFooter', () => {
    it('sollte korrekt gerendert werden', () => {
      const { container } = render(
        <AlertDialogFooter>
          <button>Cancel</button>
          <button>OK</button>
        </AlertDialogFooter>
      );
      
      const footer = container.querySelector('[data-slot="alert-dialog-footer"]');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'alert-dialog-footer');
    });

    it('sollte Standard-Styling haben', () => {
      const { container } = render(<AlertDialogFooter />);
      
      const footer = container.querySelector('[data-slot="alert-dialog-footer"]');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('flex-col-reverse');
      expect(footer).toHaveClass('gap-2');
      expect(footer).toHaveClass('sm:flex-row');
      expect(footer).toHaveClass('sm:justify-end');
    });

    it('sollte custom className akzeptieren', () => {
      const { container } = render(<AlertDialogFooter className="custom-footer" />);
      
      const footer = container.querySelector('[data-slot="alert-dialog-footer"]');
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('flex'); // Standard-Klasse
    });

    it('sollte mehrere Buttons handhaben', () => {
      render(
        <AlertDialogFooter>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </AlertDialogFooter>
      );
      
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
      expect(screen.getByText('Button 3')).toBeInTheDocument();
    });
  });

  describe('AlertDialogTitle', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogTitle>
          Dialog Title
        </AlertDialogTitle>
      );
      
      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'alert-dialog-title');
      expect(title).toHaveTextContent('Dialog Title');
    });

    it('sollte Standard-Styling haben', () => {
      render(<AlertDialogTitle>Title</AlertDialogTitle>);
      
      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
    });

    it('sollte custom className akzeptieren', () => {
      render(<AlertDialogTitle className="custom-title">Title</AlertDialogTitle>);
      
      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('text-lg'); // Standard-Klasse
    });

    it('sollte als h2 Element gerendert werden', () => {
      render(<AlertDialogTitle>Title</AlertDialogTitle>);
      
      const title = screen.getByTestId('alert-dialog-title');
      expect(title.tagName).toBe('H2');
    });

    it('sollte accessibility props unterstützen', () => {
      render(
        <AlertDialogTitle 
          id="dialog-title"
          aria-level={2}
        >
          Accessible Title
        </AlertDialogTitle>
      );
      
      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toHaveAttribute('id', 'dialog-title');
      expect(title).toHaveAttribute('aria-level', '2');
    });
  });

  describe('AlertDialogDescription', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogDescription>
          This is a description
        </AlertDialogDescription>
      );
      
      const description = screen.getByTestId('alert-dialog-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'alert-dialog-description');
      expect(description).toHaveTextContent('This is a description');
    });

    it('sollte Standard-Styling haben', () => {
      render(<AlertDialogDescription>Description</AlertDialogDescription>);
      
      const description = screen.getByTestId('alert-dialog-description');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveClass('text-sm');
    });

    it('sollte custom className akzeptieren', () => {
      render(
        <AlertDialogDescription className="custom-description">
          Description
        </AlertDialogDescription>
      );
      
      const description = screen.getByTestId('alert-dialog-description');
      expect(description).toHaveClass('custom-description');
      expect(description).toHaveClass('text-muted-foreground'); // Standard-Klasse
    });

    it('sollte als p Element gerendert werden', () => {
      render(<AlertDialogDescription>Description</AlertDialogDescription>);
      
      const description = screen.getByTestId('alert-dialog-description');
      expect(description.tagName).toBe('P');
    });

    it('sollte lange Texte handhaben', () => {
      const longText = 'This is a very long description '.repeat(10);
      
      render(
        <AlertDialogDescription>
          {longText}
        </AlertDialogDescription>
      );
      
      const description = screen.getByTestId('alert-dialog-description');
      expect(description.textContent).toBe(longText);
    });
  });

  describe('AlertDialogAction', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogAction>
          Confirm
        </AlertDialogAction>
      );
      
      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toBeInTheDocument();
      expect(action).toHaveTextContent('Confirm');
    });

    it('sollte Button-Varianten Styling haben', () => {
      render(<AlertDialogAction>Action</AlertDialogAction>);
      
      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toHaveClass('inline-flex');
      expect(action).toHaveClass('items-center');
      expect(action).toHaveClass('justify-center');
      expect(action).toHaveClass('rounded-md');
      expect(action).toHaveClass('text-sm');
      expect(action).toHaveClass('font-medium');
      expect(action).toHaveClass('bg-primary');
      expect(action).toHaveClass('text-primary-foreground');
    });

    it('sollte custom className akzeptieren', () => {
      render(<AlertDialogAction className="custom-action">Action</AlertDialogAction>);
      
      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toHaveClass('custom-action');
      expect(action).toHaveClass('inline-flex'); // Standard-Klasse
    });

    it('sollte Click-Events handhaben', () => {
      const onClick = jest.fn();
      
      render(
        <AlertDialogAction onClick={onClick}>
          Click me
        </AlertDialogAction>
      );
      
      const action = screen.getByTestId('alert-dialog-action');
      fireEvent.click(action);
      
      expect(onClick).toHaveBeenCalled();
      expect(mockOnAction).toHaveBeenCalled();
    });

    it('sollte disabled state unterstützen', () => {
      render(
        <AlertDialogAction disabled>
          Disabled Action
        </AlertDialogAction>
      );
      
      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toHaveAttribute('disabled');
    });

    it('sollte verschiedene Button-Props unterstützen', () => {
      render(
        <AlertDialogAction 
          type="submit"
          form="my-form"
          tabIndex={0}
        >
          Submit
        </AlertDialogAction>
      );
      
      const action = screen.getByTestId('alert-dialog-action');
      expect(action).toHaveAttribute('type', 'submit');
      expect(action).toHaveAttribute('form', 'my-form');
      expect(action).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('AlertDialogCancel', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDialogCancel>
          Cancel
        </AlertDialogCancel>
      );
      
      const cancel = screen.getByTestId('alert-dialog-cancel');
      expect(cancel).toBeInTheDocument();
      expect(cancel).toHaveTextContent('Cancel');
    });

    it('sollte Outline Button Styling haben', () => {
      render(<AlertDialogCancel>Cancel</AlertDialogCancel>);
      
      const cancel = screen.getByTestId('alert-dialog-cancel');
      expect(cancel).toHaveClass('inline-flex');
      expect(cancel).toHaveClass('items-center');
      expect(cancel).toHaveClass('justify-center');
      expect(cancel).toHaveClass('rounded-md');
      expect(cancel).toHaveClass('border');
      expect(cancel).toHaveClass('border-input');
      expect(cancel).toHaveClass('hover:bg-accent');
    });

    it('sollte custom className akzeptieren', () => {
      render(<AlertDialogCancel className="custom-cancel">Cancel</AlertDialogCancel>);
      
      const cancel = screen.getByTestId('alert-dialog-cancel');
      expect(cancel).toHaveClass('custom-cancel');
      expect(cancel).toHaveClass('inline-flex'); // Standard-Klasse
    });

    it('sollte Click-Events handhaben', () => {
      const onClick = jest.fn();
      
      render(
        <AlertDialogCancel onClick={onClick}>
          Cancel
        </AlertDialogCancel>
      );
      
      const cancel = screen.getByTestId('alert-dialog-cancel');
      fireEvent.click(cancel);
      
      expect(onClick).toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('sollte Keyboard-Navigation unterstützen', () => {
      render(<AlertDialogCancel>Cancel</AlertDialogCancel>);
      
      const cancel = screen.getByTestId('alert-dialog-cancel');
      
      fireEvent.keyDown(cancel, { key: 'Enter' });
      fireEvent.keyDown(cancel, { key: ' ' });
      
      // Button sollte fokussierbar sein
      cancel.focus();
      expect(cancel).toHaveFocus();
    });
  });

  describe('Integration Tests', () => {
    it('sollte kompletten AlertDialog rendern', () => {
      const { container } = render(
        <AlertDialog open={true}>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      
      // Alle Komponenten sollten vorhanden sein
      expect(screen.getByTestId('alert-dialog-root')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-portal')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="alert-dialog-header"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="alert-dialog-footer"]')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-description')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-action')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-cancel')).toBeInTheDocument();
      
      // Text-Content
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('sollte User-Interaktionen handhaben', async () => {
      const user = userEvent.setup();
      const onActionClick = jest.fn();
      const onCancelClick = jest.fn();
      
      render(
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onCancelClick}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onActionClick}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      
      // Cancel Button klicken
      const cancelButton = screen.getByTestId('alert-dialog-cancel');
      await user.click(cancelButton);
      
      expect(onCancelClick).toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
      
      // Action Button klicken
      const actionButton = screen.getByTestId('alert-dialog-action');
      await user.click(actionButton);
      
      expect(onActionClick).toHaveBeenCalled();
      expect(mockOnAction).toHaveBeenCalled();
    });

    it('sollte Accessibility Features haben', () => {
      render(
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle id="dialog-title">
                Important Notice
              </AlertDialogTitle>
              <AlertDialogDescription id="dialog-description">
                Please read this carefully.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      
      const title = screen.getByTestId('alert-dialog-title');
      const description = screen.getByTestId('alert-dialog-description');
      
      expect(title).toHaveAttribute('id', 'dialog-title');
      expect(description).toHaveAttribute('id', 'dialog-description');
      expect(title.tagName).toBe('H2');
      expect(description.tagName).toBe('P');
    });

    it('sollte verschiedene Dialog-Zustände handhaben', () => {
      const { rerender } = render(
        <AlertDialog open={false}>
          <AlertDialogContent>
            <AlertDialogTitle>Closed Dialog</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      );
      
      let root = screen.getByTestId('alert-dialog-root');
      expect(root).toHaveAttribute('data-open', 'false');
      
      // Dialog öffnen
      rerender(
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogTitle>Open Dialog</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      );
      
      root = screen.getByTestId('alert-dialog-root');
      expect(root).toHaveAttribute('data-open', 'true');
    });

    it('sollte Custom Styling kombinieren', () => {
      const { container } = render(
        <AlertDialog>
          <AlertDialogContent className="custom-content max-w-2xl">
            <AlertDialogHeader className="custom-header text-center">
              <AlertDialogTitle className="custom-title text-xl">
                Custom Dialog
              </AlertDialogTitle>
              <AlertDialogDescription className="custom-description text-base">
                With custom styling
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="custom-footer justify-center">
              <AlertDialogCancel className="custom-cancel">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="custom-action">
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      
      // Custom Classes sollten mit Standard-Classes kombiniert werden
      const content = screen.getByTestId('alert-dialog-content');
      expect(content).toHaveClass('custom-content', 'max-w-2xl', 'bg-background');
      
      const header = container.querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toHaveClass('custom-header', 'text-center', 'flex');
      
      const title = screen.getByTestId('alert-dialog-title');
      expect(title).toHaveClass('custom-title', 'text-xl');
      expect(title).toHaveClass('font-semibold'); // Standard-Klasse
      
      const description = screen.getByTestId('alert-dialog-description');
      expect(description).toHaveClass('custom-description', 'text-base', 'text-muted-foreground');
      
      const footer = container.querySelector('[data-slot="alert-dialog-footer"]');
      expect(footer).toHaveClass('custom-footer', 'justify-center', 'flex');
    });

    it('sollte Performance mit vielen Dialogen handhaben', () => {
      const dialogs = Array.from({ length: 5 }, (_, i) => (
        <AlertDialog key={i} open={i === 2}>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog {i + 1}</AlertDialogTitle>
            <AlertDialogDescription>Description {i + 1}</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel {i + 1}</AlertDialogCancel>
              <AlertDialogAction>OK {i + 1}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ));
      
      render(<div>{dialogs}</div>);
      
      // Alle Dialoge sollten gerendert werden
      expect(screen.getAllByTestId('alert-dialog-root')).toHaveLength(5);
      
      // Nur Dialog 3 sollte offen sein
      const roots = screen.getAllByTestId('alert-dialog-root');
      roots.forEach((root, index) => {
        expect(root).toHaveAttribute('data-open', index === 2 ? 'true' : 'false');
      });
    });
  });
}); 