import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('sollte ein Input-Element mit Standard-Props rendern', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('sollte placeholder korrekt anzeigen', () => {
      render(<Input placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('sollte value korrekt anzeigen', () => {
      render(<Input value="Test value" readOnly />);

      const input = screen.getByDisplayValue('Test value');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('sollte text type korrekt rendern', () => {
      render(<Input type="text" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('sollte email type korrekt rendern', () => {
      render(<Input type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('sollte password type korrekt rendern', () => {
      render(<Input type="password" data-testid="password-input" />);

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('sollte number type korrekt rendern', () => {
      render(<Input type="number" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('sollte file type korrekt rendern', () => {
      render(<Input type="file" data-testid="file-input" />);

      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('sollte search type korrekt rendern', () => {
      render(<Input type="search" />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('sollte url type korrekt rendern', () => {
      render(<Input type="url" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('sollte tel type korrekt rendern', () => {
      render(<Input type="tel" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('Interaktionen', () => {
    it('sollte onChange Event korrekt behandeln', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'new value',
          }),
        })
      );
    });

    it('sollte onFocus Event korrekt behandeln', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('sollte onBlur Event korrekt behandeln', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('sollte onKeyDown Event korrekt behandeln', () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('sollte disabled State korrekt behandeln', () => {
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('sollte readOnly State korrekt behandeln', () => {
      render(<Input readOnly value="readonly value" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('readonly value');
    });

    it('sollte required State korrekt behandeln', () => {
      render(<Input required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('sollte focus State korrekt behandeln', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      input.focus();

      expect(input).toHaveFocus();
    });
  });

  describe('Validation', () => {
    it('sollte aria-invalid korrekt setzen', () => {
      render(<Input aria-invalid="true" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveClass('aria-invalid:border-destructive');
    });

    it('sollte mit pattern Attribut umgehen', () => {
      render(<Input pattern="[0-9]*" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('sollte mit minLength und maxLength umgehen', () => {
      render(<Input minLength={3} maxLength={10} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minlength', '3');
      expect(input).toHaveAttribute('maxlength', '10');
    });

    it('sollte mit min und max für number inputs umgehen', () => {
      render(<Input type="number" min={0} max={100} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });
  });

  describe('Custom Props', () => {
    it('sollte custom className korrekt anwenden', () => {
      render(<Input className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('sollte HTML Attribute korrekt weiterleiten', () => {
      render(<Input id="test-input" name="testName" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testName');
    });

    it('sollte data Attribute korrekt weiterleiten', () => {
      render(<Input data-testid="custom-input" data-custom="value" />);

      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Accessibility', () => {
    it('sollte aria-label korrekt setzen', () => {
      render(<Input aria-label="Search input" />);

      const input = screen.getByLabelText('Search input');
      expect(input).toBeInTheDocument();
    });

    it('sollte aria-describedby korrekt setzen', () => {
      render(<Input aria-describedby="help-text" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('sollte autocomplete korrekt setzen', () => {
      render(<Input autoComplete="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('File Input Spezifisch', () => {
    it('sollte accept Attribut für file input setzen', () => {
      render(<Input type="file" accept=".jpg,.png" data-testid="file-input-accept" />);

      const input = screen.getByTestId('file-input-accept');
      expect(input).toHaveAttribute('accept', '.jpg,.png');
    });

    it('sollte multiple Attribut für file input setzen', () => {
      render(<Input type="file" multiple data-testid="file-input-multiple" />);

      const input = screen.getByTestId('file-input-multiple');
      expect(input).toHaveAttribute('multiple');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit sehr langen Werten umgehen', () => {
      const longValue = 'a'.repeat(1000);
      render(<Input value={longValue} readOnly />);

      const input = screen.getByDisplayValue(longValue);
      expect(input).toBeInTheDocument();
    });

    it('sollte mit Unicode-Zeichen umgehen', () => {
      const unicodeValue = '🚀 Hello 世界 🌍';
      render(<Input value={unicodeValue} readOnly />);

      const input = screen.getByDisplayValue(unicodeValue);
      expect(input).toBeInTheDocument();
    });

    it('sollte mit leeren Werten umgehen', () => {
      render(<Input value="" readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('sollte controlled und uncontrolled modes unterstützen', () => {
      // Uncontrolled
      render(<Input defaultValue="initial" data-testid="uncontrolled-input" />);
      const uncontrolledInput = screen.getByTestId('uncontrolled-input');
      expect(uncontrolledInput).toHaveValue('initial');

      // Controlled (separate render)
      render(<Input value="controlled" readOnly data-testid="controlled-input" />);
      const controlledInput = screen.getByTestId('controlled-input');
      expect(controlledInput).toHaveValue('controlled');
    });
  });

  describe('Styling Classes', () => {
    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'flex',
        'h-9',
        'w-full',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-1'
      );
    });

    it('sollte focus-visible Klassen haben', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:border-ring');
    });

    it('sollte placeholder Styling haben', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });
  });
});
