import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Switch } from '../switch';

describe('Switch Komponente', () => {
  describe('Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('data-slot', 'switch');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveClass(
        'peer',
        'inline-flex',
        'h-[1.15rem]',
        'w-8',
        'shrink-0',
        'items-center',
        'rounded-full',
        'border',
        'border-transparent',
        'shadow-xs',
        'transition-all',
        'outline-none'
      );
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(<Switch className="custom-switch-class" data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveClass('custom-switch-class');
    });

    it('sollte Thumb-Element enthalten', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      const thumb = switchElement.querySelector('[data-slot="switch-thumb"]');
      expect(thumb).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('sollte standardmäßig unchecked sein', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('sollte checked State akzeptieren', () => {
      render(<Switch checked={true} data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('sollte defaultChecked akzeptieren', () => {
      render(<Switch defaultChecked={true} data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('sollte disabled State handhaben', () => {
      render(<Switch disabled data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeDisabled();
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Interaktionen', () => {
    it('sollte auf Klick reagieren', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Switch onCheckedChange={handleChange} data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      await user.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('sollte zwischen checked und unchecked wechseln', async () => {
      const user = userEvent.setup();

      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'checked');

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('sollte nicht reagieren wenn disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Switch disabled onCheckedChange={handleChange} data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      await user.click(switchElement);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('sollte fokussierbar sein', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      switchElement.focus();
      expect(switchElement).toHaveFocus();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('sollte als uncontrolled component funktionieren', async () => {
      const user = userEvent.setup();

      render(<Switch defaultChecked={false} data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('sollte als controlled component funktionieren', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      const { rerender } = render(
        <Switch checked={false} onCheckedChange={handleChange} data-testid="switch" />
      );
      const switchElement = screen.getByTestId('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      await user.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(true);

      // Simulate parent component updating the checked prop
      rerender(<Switch checked={true} onCheckedChange={handleChange} data-testid="switch" />);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute haben', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('role', 'switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('sollte aria-checked korrekt aktualisieren', async () => {
      const user = userEvent.setup();

      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');

      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('sollte aria-label akzeptieren', () => {
      render(<Switch aria-label="Toggle notifications" data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('aria-label', 'Toggle notifications');
    });

    it('sollte aria-labelledby akzeptieren', () => {
      render(
        <div>
          <label id="switch-label">Enable notifications</label>
          <Switch aria-labelledby="switch-label" data-testid="switch" />
        </div>
      );
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('aria-labelledby', 'switch-label');
    });

    it('sollte aria-describedby akzeptieren', () => {
      render(
        <div>
          <Switch aria-describedby="switch-description" data-testid="switch" />
          <div id="switch-description">This will enable push notifications</div>
        </div>
      );
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('aria-describedby', 'switch-description');
    });

    it('sollte focus-visible Klassen haben', () => {
      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveClass(
        'focus-visible:border-ring',
        'focus-visible:ring-ring/50',
        'focus-visible:ring-[3px]'
      );
    });
  });

  describe('Props Weiterleitung', () => {
    it('sollte zusätzliche Props weiterleiten', () => {
      render(<Switch data-testid="switch" id="my-switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('id', 'my-switch');
    });

    it('sollte value Prop akzeptieren', () => {
      render(<Switch value="on" data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toHaveAttribute('value', 'on');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit schnellen aufeinanderfolgenden Klicks umgehen', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Switch onCheckedChange={handleChange} data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('sollte mit undefined onCheckedChange umgehen', async () => {
      const user = userEvent.setup();

      render(<Switch data-testid="switch" />);
      const switchElement = screen.getByTestId('switch');

      // Should not throw error
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });
});
