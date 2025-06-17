import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '../badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('sollte Badge mit Standard-Props rendern', () => {
      render(<Badge>Test Badge</Badge>);
      
      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('sollte Children korrekt rendern', () => {
      render(<Badge>Badge Content</Badge>);
      
      expect(screen.getByText('Badge Content')).toBeInTheDocument();
    });

    it('sollte als Child-Element rendern wenn asChild true ist', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Link Badge');
    });
  });

  describe('Varianten', () => {
    it('sollte default Variante korrekt rendern', () => {
      render(<Badge variant="default">Default</Badge>);
      
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('sollte secondary Variante korrekt rendern', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('sollte destructive Variante korrekt rendern', () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      
      const badge = screen.getByText('Destructive');
      expect(badge).toHaveClass('bg-destructive', 'text-white');
    });

    it('sollte outline Variante korrekt rendern', () => {
      render(<Badge variant="outline">Outline</Badge>);
      
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
    });
  });

  describe('Custom Props', () => {
    it('sollte custom className korrekt anwenden', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-badge');
    });

    it('sollte HTML Attribute korrekt weiterleiten', () => {
      render(<Badge id="test-badge" data-testid="badge">Test</Badge>);
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'test-badge');
    });
  });

  describe('Content Types', () => {
    it('sollte mit Text-Content umgehen', () => {
      render(<Badge>Text Badge</Badge>);
      
      expect(screen.getByText('Text Badge')).toBeInTheDocument();
    });

    it('sollte mit Zahlen umgehen', () => {
      render(<Badge>42</Badge>);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('sollte mit Icons umgehen', () => {
      const TestIcon = () => <svg data-testid="test-icon"><path /></svg>;
      render(
        <Badge>
          <TestIcon />
          Mit Icon
        </Badge>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Mit Icon')).toBeInTheDocument();
    });

    it('sollte mit leerem Content umgehen', () => {
      render(<Badge data-testid="empty-badge"></Badge>);
      
      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });
  });

  describe('Styling Classes', () => {
    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Badge>Standard</Badge>);
      
      const badge = screen.getByText('Standard');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'border',
        'px-2',
        'py-0.5',
        'text-xs',
        'font-medium'
      );
    });

    it('sollte focus-visible Klassen haben', () => {
      render(<Badge>Focus</Badge>);
      
      const badge = screen.getByText('Focus');
      expect(badge).toHaveClass('focus-visible:border-ring');
    });

    it('sollte aria-invalid Klassen haben', () => {
      render(<Badge>Invalid</Badge>);
      
      const badge = screen.getByText('Invalid');
      expect(badge).toHaveClass('aria-invalid:ring-destructive/20');
    });
  });

  describe('Accessibility', () => {
    it('sollte aria-label korrekt setzen', () => {
      render(<Badge aria-label="Status badge">Active</Badge>);
      
      const badge = screen.getByLabelText('Status badge');
      expect(badge).toBeInTheDocument();
    });

    it('sollte role korrekt setzen', () => {
      render(<Badge role="status">Status</Badge>);
      
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit sehr langem Text umgehen', () => {
      const longText = 'Dies ist ein sehr langer Badge-Text der möglicherweise umgebrochen werden muss';
      render(<Badge>{longText}</Badge>);
      
      const badge = screen.getByText(longText);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('whitespace-nowrap');
    });

    it('sollte mit Unicode-Zeichen umgehen', () => {
      const unicodeText = '🚀 Status 世界 🌍';
      render(<Badge>{unicodeText}</Badge>);
      
      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('sollte mit Sonderzeichen umgehen', () => {
      const specialText = '< > & " \' /';
      render(<Badge>{specialText}</Badge>);
      
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });

  describe('Kombinationen', () => {
    it('sollte verschiedene Varianten mit asChild kombinieren', () => {
      render(
        <Badge asChild variant="destructive">
          <button type="button">Button Badge</button>
        </Badge>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveTextContent('Button Badge');
    });

    it('sollte custom className mit Varianten kombinieren', () => {
      render(<Badge variant="outline" className="custom-outline">Outline Custom</Badge>);
      
      const badge = screen.getByText('Outline Custom');
      expect(badge).toHaveClass('text-foreground', 'custom-outline');
    });
  });

  describe('Interactive States', () => {
    it('sollte hover States für Link-Badges haben', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('[a&]:hover:bg-primary/90');
    });

    it('sollte focus States korrekt handhaben', () => {
      render(
        <Badge asChild>
          <button>Button Badge</button>
        </Badge>
      );
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });
  });

  describe('Multiple Badges', () => {
    it('sollte mehrere Badges korrekt rendern', () => {
      render(
        <div>
          <Badge variant="default">Badge 1</Badge>
          <Badge variant="secondary">Badge 2</Badge>
          <Badge variant="destructive">Badge 3</Badge>
        </div>
      );
      
      expect(screen.getByText('Badge 1')).toBeInTheDocument();
      expect(screen.getByText('Badge 2')).toBeInTheDocument();
      expect(screen.getByText('Badge 3')).toBeInTheDocument();
    });
  });
}); 