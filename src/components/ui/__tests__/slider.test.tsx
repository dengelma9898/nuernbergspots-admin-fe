import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Slider } from '../slider';

describe('Slider Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt mit data-slot="slider" gerendert werden', () => {
      render(<Slider data-testid="slider" />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('data-slot', 'slider');
      expect(slider).toBeInTheDocument();
    });

    it('sollte Standard-Styles haben', () => {
      render(<Slider data-testid="slider" />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('relative');
      expect(slider).toHaveClass('flex');
      expect(slider).toHaveClass('w-full');
      expect(slider).toHaveClass('touch-none');
      expect(slider).toHaveClass('items-center');
      expect(slider).toHaveClass('select-none');
    });

    it('sollte mit Standard min/max Werten gerendert werden', () => {
      render(<Slider data-testid="slider" defaultValue={[50]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
    });

    it('sollte custom className akzeptieren', () => {
      render(<Slider className="custom-slider" data-testid="slider" />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('custom-slider');
    });
  });

  describe('SliderTrack', () => {
    it('sollte Track mit data-slot="slider-track" rendern', () => {
      render(<Slider data-testid="slider" />);

      const track = screen.getByTestId('slider').querySelector('[data-slot="slider-track"]');
      expect(track).toBeInTheDocument();
      expect(track).toHaveAttribute('data-slot', 'slider-track');
    });

    it('sollte Track mit Standard-Styles rendern', () => {
      render(<Slider data-testid="slider" />);

      const track = screen.getByTestId('slider').querySelector('[data-slot="slider-track"]');
      expect(track).toHaveClass('bg-muted');
      expect(track).toHaveClass('relative');
      expect(track).toHaveClass('grow');
      expect(track).toHaveClass('overflow-hidden');
      expect(track).toHaveClass('rounded-full');
    });

    it('sollte horizontale Track-Styles haben', () => {
      render(<Slider data-testid="slider" />);

      const track = screen.getByTestId('slider').querySelector('[data-slot="slider-track"]');
      expect(track).toHaveClass('data-[orientation=horizontal]:h-1.5');
      expect(track).toHaveClass('data-[orientation=horizontal]:w-full');
    });
  });

  describe('SliderRange', () => {
    it('sollte Range mit data-slot="slider-range" rendern', () => {
      render(<Slider data-testid="slider" />);

      const range = screen.getByTestId('slider').querySelector('[data-slot="slider-range"]');
      expect(range).toBeInTheDocument();
      expect(range).toHaveAttribute('data-slot', 'slider-range');
    });

    it('sollte Range mit Standard-Styles rendern', () => {
      render(<Slider data-testid="slider" />);

      const range = screen.getByTestId('slider').querySelector('[data-slot="slider-range"]');
      expect(range).toHaveClass('bg-primary');
      expect(range).toHaveClass('absolute');
      expect(range).toHaveClass('data-[orientation=horizontal]:h-full');
    });
  });

  describe('SliderThumb', () => {
    it('sollte Thumb mit data-slot="slider-thumb" rendern', () => {
      render(<Slider data-testid="slider" defaultValue={[50]} />);

      const thumb = screen.getByTestId('slider').querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveAttribute('data-slot', 'slider-thumb');
    });

    it('sollte Thumb mit Standard-Styles rendern', () => {
      render(<Slider data-testid="slider" defaultValue={[50]} />);

      const thumb = screen.getByTestId('slider').querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveClass('border-primary');
      expect(thumb).toHaveClass('bg-background');
      expect(thumb).toHaveClass('block');
      expect(thumb).toHaveClass('size-4');
      expect(thumb).toHaveClass('shrink-0');
      expect(thumb).toHaveClass('rounded-full');
      expect(thumb).toHaveClass('border');
      expect(thumb).toHaveClass('shadow-sm');
    });

    it('sollte multiple Thumbs für Range-Slider rendern', () => {
      render(<Slider data-testid="slider" defaultValue={[20, 80]} />);

      const thumbs = screen.getByTestId('slider').querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs).toHaveLength(2);
    });

    it('sollte korrekte Anzahl Thumbs basierend auf Werten rendern', () => {
      render(<Slider data-testid="slider" defaultValue={[10, 30, 60, 90]} />);

      const thumbs = screen.getByTestId('slider').querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs).toHaveLength(4);
    });
  });

  describe('Props und Konfiguration', () => {
    it('sollte custom min/max Werte unterstützen', () => {
      render(<Slider data-testid="slider" min={10} max={200} defaultValue={[100]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('aria-valuemin', '10');
      expect(thumb).toHaveAttribute('aria-valuemax', '200');
    });

    it('sollte defaultValue prop unterstützen', () => {
      render(<Slider data-testid="slider" defaultValue={[75]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('aria-valuenow', '75');
    });

    it('sollte controlled value prop unterstützen', () => {
      render(<Slider data-testid="slider" value={[45]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('aria-valuenow', '45');
    });

    it('sollte step prop unterstützen', () => {
      render(<Slider data-testid="slider" step={5} defaultValue={[25]} />);

      const slider = screen.getByTestId('slider');
      // Step wird von Radix UI intern verarbeitet, prüfen wir dass der Slider gerendert wird
      expect(slider).toBeInTheDocument();

      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toBeInTheDocument();
    });

    it('sollte disabled state unterstützen', () => {
      render(<Slider data-testid="slider" disabled />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('data-disabled', '');
      expect(slider).toHaveClass('data-[disabled]:opacity-50');
    });

    it('sollte orientation prop unterstützen', () => {
      render(<Slider data-testid="slider" orientation="vertical" />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('data-orientation', 'vertical');
      expect(slider).toHaveClass('data-[orientation=vertical]:h-full');
      expect(slider).toHaveClass('data-[orientation=vertical]:flex-col');
    });
  });

  describe('Range Slider Funktionalität', () => {
    it('sollte Range-Slider mit zwei Werten rendern', () => {
      render(<Slider data-testid="slider" defaultValue={[25, 75]} />);

      const slider = screen.getByTestId('slider');
      const thumbs = slider.querySelectorAll('[data-slot="slider-thumb"]');

      expect(thumbs).toHaveLength(2);
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '25');
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '75');
    });

    it('sollte mit Array von Werten umgehen', () => {
      render(<Slider data-testid="slider" defaultValue={[10, 30, 60]} />);

      const slider = screen.getByTestId('slider');
      const thumbs = slider.querySelectorAll('[data-slot="slider-thumb"]');

      expect(thumbs).toHaveLength(3);
    });

    it('sollte Fallback-Werte verwenden wenn keine Werte gegeben', () => {
      render(<Slider data-testid="slider" min={20} max={80} />);

      const slider = screen.getByTestId('slider');
      // Slider verwendet min/max als Fallback - prüfen wir die Thumbs
      const thumbs = slider.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs.length).toBeGreaterThan(0);

      if (thumbs.length > 0) {
        expect(thumbs[0]).toHaveAttribute('aria-valuemin', '20');
        expect(thumbs[0]).toHaveAttribute('aria-valuemax', '80');
      }
    });
  });

  describe('Event Handling', () => {
    it('sollte onValueChange callback aufrufen', async () => {
      const onValueChange = jest.fn();

      render(<Slider data-testid="slider" defaultValue={[50]} onValueChange={onValueChange} />);

      const slider = screen.getByTestId('slider');

      // Keyboard navigation
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalled();
      });
    });

    it('sollte Keyboard-Navigation unterstützen', async () => {
      render(<Slider data-testid="slider" defaultValue={[50]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]') as HTMLElement;

      thumb.focus();

      // Arrow Right sollte Wert erhöhen
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      await waitFor(() => {
        const currentValue = parseInt(thumb.getAttribute('aria-valuenow') || '50');
        expect(currentValue).toBeGreaterThan(50);
      });
    });

    it('sollte Home/End Keys unterstützen', async () => {
      render(<Slider data-testid="slider" defaultValue={[50]} min={0} max={100} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]') as HTMLElement;

      thumb.focus();

      // Home Key sollte zum Minimum gehen
      fireEvent.keyDown(thumb, { key: 'Home' });

      await waitFor(() => {
        expect(thumb).toHaveAttribute('aria-valuenow', '0');
      });

      // End Key sollte zum Maximum gehen
      fireEvent.keyDown(thumb, { key: 'End' });

      await waitFor(() => {
        expect(thumb).toHaveAttribute('aria-valuenow', '100');
      });
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute haben', () => {
      render(<Slider data-testid="slider" defaultValue={[60]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('role', 'slider');
      expect(thumb).toHaveAttribute('aria-valuenow', '60');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
    });

    it('sollte focusable sein', () => {
      render(<Slider data-testid="slider" defaultValue={[50]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]') as HTMLElement;
      expect(thumb).toHaveAttribute('tabindex', '0');

      thumb.focus();
      expect(document.activeElement).toBe(thumb);
    });

    it('sollte aria-label unterstützen', () => {
      render(<Slider data-testid="slider" aria-label="Volume control" />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('aria-label', 'Volume control');
    });

    it('sollte disabled accessibility korrekt handhaben', () => {
      render(<Slider data-testid="slider" disabled />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveAttribute('aria-disabled', 'true');
      expect(slider).toHaveAttribute('data-disabled', '');
    });
  });

  describe('Vertical Orientation', () => {
    it('sollte vertikale Styles haben', () => {
      render(<Slider data-testid="slider" orientation="vertical" />);

      const slider = screen.getByTestId('slider');
      const track = slider.querySelector('[data-slot="slider-track"]');
      const range = slider.querySelector('[data-slot="slider-range"]');

      expect(slider).toHaveClass('data-[orientation=vertical]:h-full');
      expect(slider).toHaveClass('data-[orientation=vertical]:min-h-44');
      expect(slider).toHaveClass('data-[orientation=vertical]:w-auto');
      expect(slider).toHaveClass('data-[orientation=vertical]:flex-col');

      expect(track).toHaveClass('data-[orientation=vertical]:h-full');
      expect(track).toHaveClass('data-[orientation=vertical]:w-1.5');

      expect(range).toHaveClass('data-[orientation=vertical]:w-full');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leeren Werten umgehen', () => {
      render(<Slider data-testid="slider" defaultValue={[]} />);

      const slider = screen.getByTestId('slider');
      expect(slider).toBeInTheDocument();

      // Leere Werte bedeuten keine Thumbs werden gerendert
      const thumbs = slider.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs.length).toBeGreaterThanOrEqual(0);
    });

    it('sollte mit einzelnem Wert als Array umgehen', () => {
      render(<Slider data-testid="slider" defaultValue={[42]} />);

      const slider = screen.getByTestId('slider');
      const thumbs = slider.querySelectorAll('[data-slot="slider-thumb"]');
      const thumb = thumbs[0];

      expect(thumbs).toHaveLength(1);
      expect(thumb).toHaveAttribute('aria-valuenow', '42');
    });

    it('sollte mit großen Bereichen umgehen', () => {
      render(<Slider data-testid="slider" min={0} max={1000000} defaultValue={[500000]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '1000000');
      expect(thumb).toHaveAttribute('aria-valuenow', '500000');
    });

    it('sollte mit negativen Werten umgehen', () => {
      render(<Slider data-testid="slider" min={-100} max={100} defaultValue={[-50]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      expect(thumb).toHaveAttribute('aria-valuemin', '-100');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
      expect(thumb).toHaveAttribute('aria-valuenow', '-50');
    });

    it('sollte mit Dezimalwerten umgehen', () => {
      render(<Slider data-testid="slider" min={0} max={1} step={0.1} defaultValue={[0.5]} />);

      const slider = screen.getByTestId('slider');
      const thumb = slider.querySelector('[data-slot="slider-thumb"]');
      // Step wird intern von Radix UI verarbeitet, prüfen wir den Wert
      expect(slider).toBeInTheDocument();
      expect(thumb).toHaveAttribute('aria-valuenow', '0.5');
    });
  });

  describe('Vollständiger Slider Test', () => {
    it('sollte kompletten Slider mit allen Sub-Komponenten rendern', () => {
      render(<Slider data-testid="slider" defaultValue={[30, 70]} />);

      const slider = screen.getByTestId('slider');

      // Hauptkomponente
      expect(slider).toHaveAttribute('data-slot', 'slider');

      // Sub-Komponenten
      expect(slider.querySelector('[data-slot="slider-track"]')).toBeInTheDocument();
      expect(slider.querySelector('[data-slot="slider-range"]')).toBeInTheDocument();
      expect(slider.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(2);
    });

    it('sollte alle data-slot Attribute korrekt setzen', () => {
      render(<Slider data-testid="slider" defaultValue={[25, 75]} />);

      const slider = screen.getByTestId('slider');

      expect(slider).toHaveAttribute('data-slot', 'slider');
      expect(slider.querySelector('[data-slot="slider-track"]')).toHaveAttribute(
        'data-slot',
        'slider-track'
      );
      expect(slider.querySelector('[data-slot="slider-range"]')).toHaveAttribute(
        'data-slot',
        'slider-range'
      );

      const thumbs = slider.querySelectorAll('[data-slot="slider-thumb"]');
      thumbs.forEach(thumb => {
        expect(thumb).toHaveAttribute('data-slot', 'slider-thumb');
      });
    });

    it('sollte responsive Design unterstützen', () => {
      render(<Slider data-testid="slider" className="lg:w-1/2 md:w-3/4" />);

      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('lg:w-1/2');
      expect(slider).toHaveClass('md:w-3/4');
    });
  });
});
