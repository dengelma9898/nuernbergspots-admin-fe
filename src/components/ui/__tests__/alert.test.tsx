import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert Komponente', () => {
  describe('Alert Root', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<Alert data-testid="alert">Test Alert</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Alert data-testid="alert" />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'p-4'
      );
    });

    it('sollte default variant haben', () => {
      render(<Alert data-testid="alert" />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('sollte destructive variant unterstützen', () => {
      render(<Alert variant="destructive" data-testid="alert" />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(<Alert className="custom-alert" data-testid="alert" />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('sollte zusätzliche Props weiterleiten', () => {
      render(<Alert id="my-alert" data-testid="alert" />);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('id', 'my-alert');
    });

    it('sollte Kinder-Elemente rendern', () => {
      render(
        <Alert data-testid="alert">
          <span>Alert content</span>
        </Alert>
      );
      expect(screen.getByText('Alert content')).toBeInTheDocument();
    });
  });

  describe('AlertTitle', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>);
      const title = screen.getByTestId('alert-title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H5');
    });

    it('sollte Text-Inhalt anzeigen', () => {
      render(<AlertTitle data-testid="alert-title">Important Alert</AlertTitle>);
      expect(screen.getByText('Important Alert')).toBeInTheDocument();
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<AlertTitle data-testid="alert-title">Title</AlertTitle>);
      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass(
        'mb-1',
        'font-medium',
        'leading-none',
        'tracking-tight'
      );
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(
        <AlertTitle className="custom-title" data-testid="alert-title">
          Title
        </AlertTitle>
      );
      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass('custom-title');
    });

    it('sollte zusätzliche Props weiterleiten', () => {
      render(
        <AlertTitle id="my-title" data-testid="alert-title">
          Title
        </AlertTitle>
      );
      const title = screen.getByTestId('alert-title');
      expect(title).toHaveAttribute('id', 'my-title');
    });

    it('sollte verschiedene Inhaltstypen unterstützen', () => {
      render(
        <AlertTitle data-testid="alert-title">
          <span>Complex</span> Title
        </AlertTitle>
      );
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('AlertDescription', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <AlertDescription data-testid="alert-description">
          Alert Description
        </AlertDescription>
      );
      const description = screen.getByTestId('alert-description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('DIV');
    });

    it('sollte Text-Inhalt anzeigen', () => {
      render(
        <AlertDescription data-testid="alert-description">
          This is an important alert message.
        </AlertDescription>
      );
      expect(screen.getByText('This is an important alert message.')).toBeInTheDocument();
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(
        <AlertDescription data-testid="alert-description">
          Description
        </AlertDescription>
      );
      const description = screen.getByTestId('alert-description');
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(
        <AlertDescription className="custom-description" data-testid="alert-description">
          Description
        </AlertDescription>
      );
      const description = screen.getByTestId('alert-description');
      expect(description).toHaveClass('custom-description');
    });

    it('sollte zusätzliche Props weiterleiten', () => {
      render(
        <AlertDescription id="my-description" data-testid="alert-description">
          Description
        </AlertDescription>
      );
      const description = screen.getByTestId('alert-description');
      expect(description).toHaveAttribute('id', 'my-description');
    });

    it('sollte HTML-Inhalt unterstützen', () => {
      render(
        <AlertDescription data-testid="alert-description">
          <p>Paragraph content</p>
          <strong>Bold text</strong>
        </AlertDescription>
      );
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });
  });

  describe('Alert Komposition', () => {
    it('sollte vollständige Alert mit Title und Description rendern', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle data-testid="alert-title">Error</AlertTitle>
          <AlertDescription data-testid="alert-description">
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-title')).toBeInTheDocument();
      expect(screen.getByTestId('alert-description')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    it('sollte nur mit Title funktionieren', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle data-testid="alert-title">Success</AlertTitle>
        </Alert>
      );

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-title')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('sollte nur mit Description funktionieren', () => {
      render(
        <Alert data-testid="alert">
          <AlertDescription data-testid="alert-description">
            Simple message
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-description')).toBeInTheDocument();
      expect(screen.getByText('Simple message')).toBeInTheDocument();
    });

    it('sollte mit Icon funktionieren', () => {
      render(
        <Alert data-testid="alert">
          <svg data-testid="alert-icon" />
          <AlertTitle data-testid="alert-title">Warning</AlertTitle>
          <AlertDescription data-testid="alert-description">
            Check your input
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-title')).toBeInTheDocument();
      expect(screen.getByTestId('alert-description')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute haben', () => {
      render(
        <Alert aria-label="Error alert" data-testid="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveAttribute('aria-label', 'Error alert');
    });

    it('sollte aria-describedby unterstützen', () => {
      render(
        <Alert aria-describedby="error-description" data-testid="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription id="error-description">
            Detailed error message
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('aria-describedby', 'error-description');
    });

    it('sollte aria-live unterstützen', () => {
      render(
        <Alert aria-live="polite" data-testid="alert">
          <AlertDescription>Status update</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Verschiedene Alert-Typen', () => {
    it('sollte Success Alert rendern', () => {
      render(
        <Alert variant="default" className="border-green-500" data-testid="alert">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-green-500');
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('sollte Warning Alert rendern', () => {
      render(
        <Alert variant="default" className="border-yellow-500" data-testid="alert">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review your input</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-yellow-500');
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('sollte Error Alert rendern', () => {
      render(
        <Alert variant="destructive" data-testid="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>An error occurred</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('sollte Info Alert rendern', () => {
      render(
        <Alert variant="default" className="border-blue-500" data-testid="alert">
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Here is some useful information</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-blue-500');
      expect(screen.getByText('Information')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('sollte leeren Inhalt handhaben', () => {
      render(<Alert data-testid="alert" />);
      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toBeEmptyDOMElement();
    });

    it('sollte leeren Title handhaben', () => {
      render(<AlertTitle data-testid="alert-title" />);
      const title = screen.getByTestId('alert-title');
      expect(title).toBeInTheDocument();
      expect(title).toBeEmptyDOMElement();
    });

    it('sollte leere Description handhaben', () => {
      render(<AlertDescription data-testid="alert-description" />);
      const description = screen.getByTestId('alert-description');
      expect(description).toBeInTheDocument();
      expect(description).toBeEmptyDOMElement();
    });

    it('sollte sehr langen Text handhaben', () => {
      const longText = 'Lorem ipsum '.repeat(100);
      render(
        <Alert data-testid="alert">
          <AlertTitle>Very Long Title {longText}</AlertTitle>
          <AlertDescription>Very Long Description {longText}</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      // Use partial text matching for long text that might be split across elements
      expect(screen.getByText(/Very Long Title/)).toBeInTheDocument();
      expect(screen.getByText(/Very Long Description/)).toBeInTheDocument();
    });

    it('sollte mit komplexen className-Kombinationen umgehen', () => {
      render(
        <Alert 
          className="custom-1 custom-2 bg-red-500 text-white border-2" 
          data-testid="alert"
        >
          <AlertTitle className="text-lg font-bold">Title</AlertTitle>
          <AlertDescription className="text-sm opacity-80">Description</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('custom-1', 'custom-2', 'bg-red-500', 'text-white', 'border-2');
    });
  });
}); 