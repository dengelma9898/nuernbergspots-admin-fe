import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('sollte Textarea mit Standard-Props rendern', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('sollte placeholder korrekt anzeigen', () => {
      render(<Textarea placeholder="Enter your message here" />);
      
      const textarea = screen.getByPlaceholderText('Enter your message here');
      expect(textarea).toBeInTheDocument();
    });

    it('sollte value korrekt anzeigen', () => {
      render(<Textarea value="Test message" readOnly />);
      
      const textarea = screen.getByDisplayValue('Test message');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Interaktionen', () => {
    it('sollte onChange Event korrekt behandeln', () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new message' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'new message'
          })
        })
      );
    });

    it('sollte onFocus Event korrekt behandeln', () => {
      const handleFocus = jest.fn();
      render(<Textarea onFocus={handleFocus} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.focus(textarea);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('sollte onBlur Event korrekt behandeln', () => {
      const handleBlur = jest.fn();
      render(<Textarea onBlur={handleBlur} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.focus(textarea);
      fireEvent.blur(textarea);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('sollte onKeyDown Event korrekt behandeln', () => {
      const handleKeyDown = jest.fn();
      render(<Textarea onKeyDown={handleKeyDown} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('sollte disabled State korrekt behandeln', () => {
      render(<Textarea disabled />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('sollte readOnly State korrekt behandeln', () => {
      render(<Textarea readOnly value="readonly message" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
      expect(textarea).toHaveValue('readonly message');
    });

    it('sollte required State korrekt behandeln', () => {
      render(<Textarea required />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('sollte focus State korrekt behandeln', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      
      expect(textarea).toHaveFocus();
    });
  });

  describe('Validation', () => {
    it('sollte aria-invalid korrekt setzen', () => {
      render(<Textarea aria-invalid="true" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveClass('aria-invalid:border-destructive');
    });

    it('sollte mit minLength und maxLength umgehen', () => {
      render(<Textarea minLength={10} maxLength={500} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('minlength', '10');
      expect(textarea).toHaveAttribute('maxlength', '500');
    });

    it('sollte mit rows und cols umgehen', () => {
      render(<Textarea rows={5} cols={40} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '40');
    });
  });

  describe('Custom Props', () => {
    it('sollte custom className korrekt anwenden', () => {
      render(<Textarea className="custom-textarea" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('sollte HTML Attribute korrekt weiterleiten', () => {
      render(<Textarea id="test-textarea" name="testName" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(textarea).toHaveAttribute('name', 'testName');
    });

    it('sollte data Attribute korrekt weiterleiten', () => {
      render(<Textarea data-testid="custom-textarea" data-custom="value" />);
      
      const textarea = screen.getByTestId('custom-textarea');
      expect(textarea).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Accessibility', () => {
    it('sollte aria-label korrekt setzen', () => {
      render(<Textarea aria-label="Message input" />);
      
      const textarea = screen.getByLabelText('Message input');
      expect(textarea).toBeInTheDocument();
    });

    it('sollte aria-describedby korrekt setzen', () => {
      render(<Textarea aria-describedby="help-text" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('sollte mit Label verknüpft werden', () => {
      render(
        <div>
          <label htmlFor="message">Message</label>
          <Textarea id="message" />
        </div>
      );
      
      const label = screen.getByText('Message');
      const textarea = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'message');
      expect(textarea).toHaveAttribute('id', 'message');
    });
  });

  describe('Resize Behavior', () => {
    it('sollte resize Attribut korrekt setzen', () => {
      render(<Textarea style={{ resize: 'vertical' }} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveStyle('resize: vertical');
    });

    it('sollte resize none unterstützen', () => {
      render(<Textarea style={{ resize: 'none' }} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveStyle('resize: none');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit sehr langen Werten umgehen', () => {
      const longValue = 'a'.repeat(1000);
      render(<Textarea value={longValue} readOnly />);
      
      const textarea = screen.getByDisplayValue(longValue);
      expect(textarea).toBeInTheDocument();
    });

    it('sollte mit Unicode-Zeichen umgehen', () => {
      const unicodeValue = '🚀 Hello 世界 🌍\nMultiline text';
      render(<Textarea value={unicodeValue} readOnly />);
      
      const textarea = screen.getByDisplayValue(unicodeValue);
      expect(textarea).toBeInTheDocument();
    });

    it('sollte mit leeren Werten umgehen', () => {
      render(<Textarea value="" readOnly />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('sollte controlled und uncontrolled modes unterstützen', () => {
      // Uncontrolled
      render(<Textarea defaultValue="initial message" data-testid="uncontrolled-textarea" />);
      const uncontrolledTextarea = screen.getByTestId('uncontrolled-textarea');
      expect(uncontrolledTextarea).toHaveValue('initial message');

      // Controlled (separate render)
      render(<Textarea value="controlled message" readOnly data-testid="controlled-textarea" />);
      const controlledTextarea = screen.getByTestId('controlled-textarea');
      expect(controlledTextarea).toHaveValue('controlled message');
    });

    it('sollte mit Zeilenwechseln umgehen', () => {
      const multilineValue = 'Line 1\nLine 2\nLine 3';
      render(<Textarea value={multilineValue} readOnly />);
      
      const textarea = screen.getByDisplayValue(multilineValue);
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Styling Classes', () => {
    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[60px]',
        'w-full',
        'rounded-md',
        'border',
        'bg-transparent',
        'px-3',
        'py-2'
      );
    });

    it('sollte focus-visible Klassen haben', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('focus-visible:border-ring');
    });

    it('sollte placeholder Styling haben', () => {
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('placeholder:text-muted-foreground');
    });

    it('sollte disabled Styling haben', () => {
      render(<Textarea disabled />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Form Integration', () => {
    it('sollte in einem Formular funktionieren', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" defaultValue="Test message" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveValue('Test message');
      
      fireEvent.click(button);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
}); 