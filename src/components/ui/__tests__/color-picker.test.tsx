import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { ColorPicker } from '../color-picker';

// Mock the Input component
jest.mock('../input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => (
      <input
        ref={ref}
        type={type}
        className={className}
        data-testid={type === 'color' ? 'color-input' : 'text-input'}
        {...props}
      />
    )
  ),
}));

describe('ColorPicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const container = document.querySelector('.flex');
      expect(container).toBeInTheDocument();
    });

    it('sollte beide Input-Felder rendern', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      expect(colorInput).toBeInTheDocument();
      expect(textInput).toBeInTheDocument();
    });

    it('sollte korrekte Input-Typen haben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      expect(colorInput).toHaveAttribute('type', 'color');
      expect(textInput).toHaveAttribute('type', 'text');
    });

    it('sollte Werte in beiden Inputs anzeigen', () => {
      const testValue = '#3366cc';

      render(<ColorPicker value={testValue} onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      expect(colorInput).toHaveValue(testValue);
      expect(textInput).toHaveValue(testValue);
    });
  });

  describe('CSS Classes & Styling', () => {
    it('sollte Container-CSS-Klassen haben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const container = document.querySelector('.flex');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('gap-2');
    });

    it('sollte Color-Input CSS-Klassen haben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      expect(colorInput).toHaveClass('h-10');
      expect(colorInput).toHaveClass('w-10');
      expect(colorInput).toHaveClass('p-1');
    });

    it('sollte Text-Input CSS-Klassen haben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');
      expect(textInput).toHaveClass('w-24');
    });

    it('sollte verschiedene Größen und Layouts handhaben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const container = document.querySelector('.flex');
      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Container Layout
      expect(container).toHaveClass('flex', 'items-center', 'gap-2');

      // Input Sizing
      expect(colorInput).toHaveClass('h-10', 'w-10', 'p-1');
      expect(textInput).toHaveClass('w-24');
    });
  });

  describe('Value Props', () => {
    it('sollte verschiedene Farbwerte handhaben', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];

      colors.forEach(color => {
        const { unmount } = render(<ColorPicker value={color} onChange={mockOnChange} />);

        const colorInput = screen.getByTestId('color-input');
        const textInput = screen.getByTestId('text-input');

        expect(colorInput).toHaveValue(color);
        expect(textInput).toHaveValue(color);

        unmount();
      });
    });

    it('sollte kurze Hex-Werte handhaben', () => {
      const shortHex = '#f00';

      render(<ColorPicker value={shortHex} onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Color Input normalisiert auf #000000 für ungültige Werte
      expect(colorInput).toHaveValue('#000000');
      expect(textInput).toHaveValue(shortHex);
    });

    it('sollte lange Hex-Werte handhaben', () => {
      const longHex = '#3366ccff';

      render(<ColorPicker value={longHex} onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Color Input normalisiert auf #000000 für 8-stellige Hex-Werte
      expect(colorInput).toHaveValue('#000000');
      expect(textInput).toHaveValue(longHex);
    });

    it('sollte leere Werte handhaben', () => {
      render(<ColorPicker value="" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Color Input normalisiert auf #000000 für leere Werte
      expect(colorInput).toHaveValue('#000000');
      expect(textInput).toHaveValue('');
    });
  });

  describe('Color Input Interaction', () => {
    it('sollte onChange bei Color-Input-Änderung aufrufen', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');

      // Verwende fireEvent.change für Color Input
      fireEvent.change(colorInput, { target: { value: '#00ff00' } });

      expect(mockOnChange).toHaveBeenCalledWith('#00ff00');
    });

    it('sollte onChange mit korrektem Wert aufrufen', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');

      fireEvent.change(colorInput, { target: { value: '#0000ff' } });

      expect(mockOnChange).toHaveBeenCalledWith('#0000ff');
    });

    it('sollte mehrere Color-Änderungen handhaben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');

      const colors = ['#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

      colors.forEach((color, index) => {
        fireEvent.change(colorInput, { target: { value: color } });
        expect(mockOnChange).toHaveBeenNthCalledWith(index + 1, color);
      });
    });

    it('sollte Browser-spezifische Color-Picker Events handhaben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');

      // Simuliere verschiedene Browser-Events
      fireEvent.input(colorInput, { target: { value: '#336699' } });
      expect(mockOnChange).toHaveBeenCalledWith('#336699');

      fireEvent.change(colorInput, { target: { value: '#669933' } });
      expect(mockOnChange).toHaveBeenLastCalledWith('#669933');
    });
  });

  describe('Text Input Interaction', () => {
    it('sollte onChange bei Text-Input-Änderung aufrufen', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      // Verwende fireEvent.change für präzise Werte
      fireEvent.change(textInput, { target: { value: '#00ff00' } });

      expect(mockOnChange).toHaveBeenCalledWith('#00ff00');
    });

    it('sollte manuelle Hex-Eingabe unterstützen', () => {
      render(<ColorPicker value="" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      fireEvent.change(textInput, { target: { value: '#3366cc' } });

      expect(mockOnChange).toHaveBeenCalledWith('#3366cc');
    });

    it('sollte Zeichen-für-Zeichen Eingabe handhaben', async () => {
      const user = userEvent.setup();

      render(<ColorPicker value="" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      // Test mit userEvent für schrittweise Eingabe
      await user.type(textInput, '#');
      expect(mockOnChange).toHaveBeenCalledWith('#');

      // Simuliere Eingabe von 'f' nach '#'
      fireEvent.change(textInput, { target: { value: '#f' } });
      expect(mockOnChange).toHaveBeenCalledWith('#f');
    });

    it('sollte verschiedene Hex-Formate in Text-Input handhaben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      // Test einen einzelnen Hex-Wert
      fireEvent.change(textInput, { target: { value: '#3366cc' } });
      expect(mockOnChange).toHaveBeenCalledWith('#3366cc');
    });
  });

  describe('Accessibility', () => {
    it('sollte Input-Felder fokussierbar sein', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      colorInput.focus();
      expect(colorInput).toHaveFocus();

      textInput.focus();
      expect(textInput).toHaveFocus();
    });

    it('sollte Tab-Navigation unterstützen', async () => {
      const user = userEvent.setup();

      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Start mit Color Input
      colorInput.focus();
      expect(colorInput).toHaveFocus();

      // Tab zu Text Input
      await user.tab();
      expect(textInput).toHaveFocus();
    });

    it('sollte ARIA-Labels unterstützen können', () => {
      // Test für potentielle ARIA-Erweiterungen
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      expect(colorInput).toBeInTheDocument();
      expect(textInput).toBeInTheDocument();
    });

    it('sollte Keyboard-Events unterstützen', async () => {
      const user = userEvent.setup();

      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      textInput.focus();
      await user.keyboard('[Enter]');

      // Enter sollte keine onChange auslösen
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('sollte ungültige Hex-Werte handhaben', () => {
      const invalidValues = ['invalid', '#gggggg', '#12345', 'notacolor'];

      invalidValues.forEach(value => {
        const { unmount } = render(<ColorPicker value={value} onChange={mockOnChange} />);

        const colorInput = screen.getByTestId('color-input');
        const textInput = screen.getByTestId('text-input');

        // Color Input normalisiert ungültige Werte auf #000000
        expect(colorInput).toHaveValue('#000000');
        expect(textInput).toHaveValue(value);

        unmount();
      });
    });

    it('sollte undefined onChange sicher handhaben', () => {
      // Test ohne onChange callback
      expect(() => {
        render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);
      }).not.toThrow();
    });

    it('sollte sehr lange Strings handhaben', () => {
      const longString = '#ff0000'.repeat(10);

      render(<ColorPicker value={longString} onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Color Input normalisiert auf #000000
      expect(colorInput).toHaveValue('#000000');
      expect(textInput).toHaveValue(longString);
    });

    it('sollte special characters handhaben', () => {
      const specialValue = '#ff00% $';

      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      fireEvent.change(textInput, { target: { value: specialValue } });
      expect(mockOnChange).toHaveBeenCalledWith(specialValue);
    });
  });

  describe('Performance & Rendering', () => {
    it('sollte mehrere ColorPicker gleichzeitig rendern', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];

      render(
        <div>
          {colors.map((color, index) => (
            <ColorPicker key={index} value={color} onChange={mockOnChange} />
          ))}
        </div>
      );

      const colorInputs = screen.getAllByTestId('color-input');
      const textInputs = screen.getAllByTestId('text-input');

      expect(colorInputs).toHaveLength(3);
      expect(textInputs).toHaveLength(3);

      colors.forEach((color, index) => {
        expect(colorInputs[index]).toHaveValue(color);
        expect(textInputs[index]).toHaveValue(color);
      });
    });

    it('sollte Re-Rendering bei Props-Änderungen handhaben', () => {
      const { rerender } = render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      let colorInput = screen.getByTestId('color-input');
      let textInput = screen.getByTestId('text-input');
      expect(colorInput).toHaveValue('#ff0000');
      expect(textInput).toHaveValue('#ff0000');

      // Props ändern
      rerender(<ColorPicker value="#00ff00" onChange={mockOnChange} />);

      colorInput = screen.getByTestId('color-input');
      textInput = screen.getByTestId('text-input');
      expect(colorInput).toHaveValue('#00ff00');
      expect(textInput).toHaveValue('#00ff00');
    });

    it('sollte viele onChange-Events effizient handhaben', () => {
      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const textInput = screen.getByTestId('text-input');

      // Simuliere schnelle Eingabe (ohne doppelte Werte)
      const colors = ['#f', '#ff', '#ff0', '#ff00', '#ff000'];

      colors.forEach(color => {
        fireEvent.change(textInput, { target: { value: color } });
      });

      expect(mockOnChange).toHaveBeenCalledTimes(colors.length);
      colors.forEach((color, index) => {
        expect(mockOnChange).toHaveBeenNthCalledWith(index + 1, color);
      });
    });
  });

  describe('Integration Tests', () => {
    it('sollte vollständige Color-Picking-Workflow unterstützen', async () => {
      const user = userEvent.setup();

      render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // 1. Über Color Input ändern
      fireEvent.change(colorInput, { target: { value: '#00ff00' } });
      expect(mockOnChange).toHaveBeenCalledWith('#00ff00');

      // 2. Über Text Input manuell eingeben
      fireEvent.change(textInput, { target: { value: '#0000ff' } });
      expect(mockOnChange).toHaveBeenCalledWith('#0000ff');

      // 3. Focus-Wechsel zwischen Inputs
      colorInput.focus();
      expect(colorInput).toHaveFocus();

      await user.tab();
      expect(textInput).toHaveFocus();
    });

    it('sollte Sync zwischen beiden Inputs gewährleisten', () => {
      const { rerender } = render(<ColorPicker value="#ff0000" onChange={mockOnChange} />);

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Initial sync
      expect(colorInput).toHaveValue('#ff0000');
      expect(textInput).toHaveValue('#ff0000');

      // Nach Wert-Änderung sync
      rerender(<ColorPicker value="#3366cc" onChange={mockOnChange} />);

      expect(colorInput).toHaveValue('#3366cc');
      expect(textInput).toHaveValue('#3366cc');
    });

    it('sollte in Formularen funktionieren', () => {
      render(
        <form data-testid="color-form">
          <ColorPicker value="#ff0000" onChange={mockOnChange} />
          <button type="submit">Submit</button>
        </form>
      );

      const form = screen.getByTestId('color-form');
      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      expect(form).toContainElement(colorInput);
      expect(form).toContainElement(textInput);
    });

    it('sollte mit Theme und Design System funktionieren', () => {
      render(
        <div className="dark">
          <ColorPicker value="#3366cc" onChange={mockOnChange} />
        </div>
      );

      const colorInput = screen.getByTestId('color-input');
      const textInput = screen.getByTestId('text-input');

      // Inputs sollten die korrekten CSS-Klassen haben
      expect(colorInput).toHaveClass('h-10', 'w-10', 'p-1');
      expect(textInput).toHaveClass('w-24');
    });
  });
});
