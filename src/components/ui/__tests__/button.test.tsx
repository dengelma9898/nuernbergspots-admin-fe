import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('sollte einen Button mit Standard-Props rendern', () => {
      render(<Button>Test Button</Button>);

      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('sollte Children korrekt rendern', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('sollte als Child-Element rendern wenn asChild true ist', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Link Button');
    });
  });

  describe('Varianten', () => {
    it('sollte default Variante korrekt rendern', () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('sollte destructive Variante korrekt rendern', () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-white');
    });

    it('sollte outline Variante korrekt rendern', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'bg-background');
    });

    it('sollte secondary Variante korrekt rendern', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('sollte ghost Variante korrekt rendern', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('sollte link Variante korrekt rendern', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('Größen', () => {
    it('sollte default Größe korrekt rendern', () => {
      render(<Button size="default">Default Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-5', 'py-2');
    });

    it('sollte small Größe korrekt rendern', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-4');
    });

    it('sollte large Größe korrekt rendern', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'px-7');
    });

    it('sollte icon Größe korrekt rendern', () => {
      render(<Button size="icon">🔍</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-11');
    });
  });

  describe('Interaktionen', () => {
    it('sollte onClick Event korrekt behandeln', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('sollte disabled State korrekt behandeln', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('sollte focus State korrekt behandeln', () => {
      render(<Button>Focus me</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('sollte custom className korrekt anwenden', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('sollte HTML Attribute korrekt weiterleiten', () => {
      render(
        <Button type="submit" id="submit-btn">
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('id', 'submit-btn');
    });

    it('sollte aria-label korrekt setzen', () => {
      render(<Button aria-label="Close dialog">×</Button>);

      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute haben', () => {
      render(<Button aria-pressed="true">Toggle</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('sollte keyboard navigation unterstützen', () => {
      render(<Button>Keyboard</Button>);

      const button = screen.getByRole('button');

      // Test Tab-Navigation
      expect(button).not.toHaveFocus();
      button.focus();
      expect(button).toHaveFocus();

      // Test dass Button focusable ist
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leerem Content umgehen', () => {
      render(<Button></Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it('sollte mit sehr langem Text umgehen', () => {
      const longText =
        'Dies ist ein sehr langer Button-Text der möglicherweise umgebrochen werden muss';
      render(<Button>{longText}</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('sollte mit SVG Icons umgehen', () => {
      const TestIcon = () => (
        <svg data-testid="test-icon">
          <path />
        </svg>
      );
      render(
        <Button>
          <TestIcon />
          Mit Icon
        </Button>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Mit Icon')).toBeInTheDocument();
    });
  });

  describe('Kombinationen', () => {
    it('sollte verschiedene Varianten und Größen kombinieren', () => {
      render(
        <Button variant="destructive" size="lg">
          Large Delete
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'h-12');
    });

    it('sollte asChild mit custom Props kombinieren', () => {
      render(
        <Button asChild variant="outline" size="sm">
          <a href="/link" className="custom-link">
            Link Button
          </a>
        </Button>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('border', 'h-11', 'custom-link');
    });
  });
});
