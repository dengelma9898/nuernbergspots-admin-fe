import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Label } from '../label';

describe('Label Component', () => {
  describe('Rendering', () => {
    it('sollte Label mit Standard-Props rendern', () => {
      render(<Label>Test Label</Label>);

      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('sollte Children korrekt rendern', () => {
      render(<Label>Label Content</Label>);

      expect(screen.getByText('Label Content')).toBeInTheDocument();
    });

    it('sollte als Child-Element rendern wenn asChild true ist', () => {
      render(
        <Label asChild>
          <span>Span Label</span>
        </Label>
      );

      const span = screen.getByText('Span Label');
      expect(span).toBeInTheDocument();
      expect(span.tagName).toBe('SPAN');
    });
  });

  describe('HTML Attributes', () => {
    it('sollte htmlFor Attribut korrekt setzen', () => {
      render(<Label htmlFor="test-input">Input Label</Label>);

      const label = screen.getByText('Input Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('sollte custom className korrekt anwenden', () => {
      render(<Label className="custom-label">Custom Label</Label>);

      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass('custom-label');
    });

    it('sollte HTML Attribute korrekt weiterleiten', () => {
      render(
        <Label id="test-label" data-testid="label">
          Test
        </Label>
      );

      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('id', 'test-label');
    });
  });

  describe('Styling Classes', () => {
    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Label>Standard Label</Label>);

      const label = screen.getByText('Standard Label');
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
    });

    it('sollte peer-disabled Styling haben', () => {
      render(<Label>Disabled Label</Label>);

      const label = screen.getByText('Disabled Label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('sollte mit Input-Element verknüpft werden', () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </div>
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('sollte aria-label korrekt setzen', () => {
      render(<Label aria-label="Form label">Visible Text</Label>);

      const label = screen.getByLabelText('Form label');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Content Types', () => {
    it('sollte mit Text-Content umgehen', () => {
      render(<Label>Text Label</Label>);

      expect(screen.getByText('Text Label')).toBeInTheDocument();
    });

    it('sollte mit Icons umgehen', () => {
      const TestIcon = () => (
        <svg data-testid="test-icon">
          <path />
        </svg>
      );
      render(
        <Label>
          <TestIcon />
          Label with Icon
        </Label>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Label with Icon')).toBeInTheDocument();
    });

    it('sollte mit leerem Content umgehen', () => {
      render(<Label data-testid="empty-label"></Label>);

      const label = screen.getByTestId('empty-label');
      expect(label).toBeInTheDocument();
      expect(label).toBeEmptyDOMElement();
    });
  });

  describe('Form Integration', () => {
    it('sollte mit verschiedenen Input-Typen funktionieren', () => {
      render(
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />

          <Label htmlFor="password">Password</Label>
          <input id="password" type="password" />

          <Label htmlFor="checkbox">Accept Terms</Label>
          <input id="checkbox" type="checkbox" />
        </div>
      );

      expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
      expect(screen.getByText('Password')).toHaveAttribute('for', 'password');
      expect(screen.getByText('Accept Terms')).toHaveAttribute('for', 'checkbox');
    });

    it('sollte mit Textarea funktionieren', () => {
      render(
        <div>
          <Label htmlFor="message">Message</Label>
          <textarea id="message"></textarea>
        </div>
      );

      const label = screen.getByText('Message');
      const textarea = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'message');
      expect(textarea).toHaveAttribute('id', 'message');
    });

    it('sollte mit Select funktionieren', () => {
      render(
        <div>
          <Label htmlFor="country">Country</Label>
          <select id="country">
            <option value="de">Germany</option>
            <option value="us">USA</option>
          </select>
        </div>
      );

      const label = screen.getByText('Country');
      const select = screen.getByRole('combobox');

      expect(label).toHaveAttribute('for', 'country');
      expect(select).toHaveAttribute('id', 'country');
    });
  });

  describe('Required/Optional Indicators', () => {
    it('sollte Required-Indikator anzeigen', () => {
      render(
        <Label>
          Username <span className="text-destructive">*</span>
        </Label>
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('sollte Optional-Indikator anzeigen', () => {
      render(
        <Label>
          Phone <span className="text-muted-foreground">(optional)</span>
        </Label>
      );

      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('(optional)')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit sehr langem Text umgehen', () => {
      const longText =
        'Dies ist ein sehr langer Label-Text der möglicherweise umgebrochen werden muss';
      render(<Label>{longText}</Label>);

      const label = screen.getByText(longText);
      expect(label).toBeInTheDocument();
    });

    it('sollte mit Unicode-Zeichen umgehen', () => {
      const unicodeText = '🏷️ Label 世界 🌍';
      render(<Label>{unicodeText}</Label>);

      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('sollte mit Sonderzeichen umgehen', () => {
      const specialText = '< > & " \' /';
      render(<Label>{specialText}</Label>);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });

  describe('Kombinationen', () => {
    it('sollte asChild mit custom Props kombinieren', () => {
      render(
        <Label asChild className="custom-span">
          <span data-testid="span-label">Span Label</span>
        </Label>
      );

      const span = screen.getByTestId('span-label');
      expect(span).toHaveClass('custom-span');
      expect(span).toHaveTextContent('Span Label');
    });

    it('sollte mehrere Labels in einem Formular rendern', () => {
      render(
        <form>
          <Label htmlFor="first">First Name</Label>
          <input id="first" type="text" />

          <Label htmlFor="last">Last Name</Label>
          <input id="last" type="text" />

          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
        </form>
      );

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });
});
