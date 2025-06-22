import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '../progress';

describe('Progress Komponente', () => {
  describe('Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute('data-slot', 'progress');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass(
        'bg-primary/20',
        'relative',
        'h-2',
        'w-full',
        'overflow-hidden',
        'rounded-full'
      );
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(<Progress className="custom-progress-class" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-progress-class');
      expect(progress).toHaveClass('bg-primary/20', 'relative', 'h-2', 'w-full');
    });

    it('sollte Indicator-Element enthalten', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Value Prop', () => {
    it('sollte ohne value Prop funktionieren', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-100%)');
    });

    it('sollte value=0 korrekt handhaben', () => {
      render(<Progress value={0} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-100%)');
    });

    it('sollte value=50 korrekt handhaben', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-50%)');
    });

    it('sollte value=100 korrekt handhaben', () => {
      render(<Progress value={100} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-0%)');
    });

    it('sollte Dezimalwerte korrekt handhaben', () => {
      render(<Progress value={33.33} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-66.67%)');
    });

    it('sollte negative Werte wie 0 behandeln', () => {
      render(<Progress value={-10} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-110%)');
    });

    it('sollte Werte über 100 korrekt handhaben', () => {
      render(<Progress value={150} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(--50%)');
    });
  });

  describe('Indicator Styling', () => {
    it('sollte Indicator Standard-CSS-Klassen haben', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass('bg-primary', 'h-full', 'w-full', 'flex-1', 'transition-all');
    });

    it('sollte Indicator data-slot Attribut haben', () => {
      render(<Progress data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveAttribute('data-slot', 'progress-indicator');
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Attribute haben', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('role', 'progressbar');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });

    it('sollte aria-label akzeptieren', () => {
      render(<Progress value={75} aria-label="Upload progress" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-label', 'Upload progress');
    });

    it('sollte aria-labelledby akzeptieren', () => {
      render(
        <div>
          <label id="progress-label">File upload</label>
          <Progress value={25} aria-labelledby="progress-label" data-testid="progress" />
        </div>
      );
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-labelledby', 'progress-label');
    });

    it('sollte aria-describedby akzeptieren', () => {
      render(
        <div>
          <Progress value={60} aria-describedby="progress-description" data-testid="progress" />
          <div id="progress-description">60% complete</div>
        </div>
      );
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-describedby', 'progress-description');
    });
  });

  describe('Props Weiterleitung', () => {
    it('sollte zusätzliche Props weiterleiten', () => {
      render(<Progress value={40} data-testid="progress" id="my-progress" title="Progress bar" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('id', 'my-progress');
      expect(progress).toHaveAttribute('title', 'Progress bar');
    });

    it('sollte style Props akzeptieren', () => {
      const customStyle = { width: '300px', height: '8px' };
      render(<Progress value={30} style={customStyle} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveStyle('width: 300px');
      expect(progress).toHaveStyle('height: 8px');
    });

    it('sollte value korrekt verarbeiten', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-50%)');
    });
  });

  describe('Verschiedene Größen', () => {
    it('sollte kleine Progress Bar unterstützen', () => {
      render(<Progress value={25} className="h-1" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-1');
    });

    it('sollte große Progress Bar unterstützen', () => {
      render(<Progress value={75} className="h-4" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-4');
    });

    it('sollte benutzerdefinierte Breite unterstützen', () => {
      render(<Progress value={50} className="w-64" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('w-64');
    });
  });

  describe('Verschiedene Stile', () => {
    it('sollte verschiedene Farben unterstützen', () => {
      render(<Progress value={80} className="bg-red-200" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('bg-red-200');
    });

    it('sollte verschiedene Border-Radius unterstützen', () => {
      render(<Progress value={45} className="rounded-none" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('rounded-none');
    });

    it('sollte quadratische Progress Bar unterstützen', () => {
      render(<Progress value={90} className="rounded-sm" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('rounded-sm');
    });
  });

  describe('Animation und Transition', () => {
    it('sollte Indicator transition-all Klasse haben', () => {
      render(<Progress value={70} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveClass('transition-all');
    });

    it('sollte smooth value changes handhaben', () => {
      const { rerender } = render(<Progress value={20} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle('transform: translateX(-80%)');

      rerender(<Progress value={60} data-testid="progress" />);
      expect(indicator).toHaveStyle('transform: translateX(-40%)');
    });
  });

  describe('Edge Cases', () => {
    it('sollte null value handhaben', () => {
      render(<Progress value={null} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-100%)');
    });

    it('sollte undefined value handhaben', () => {
      render(<Progress value={undefined} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-100%)');
    });

    it('sollte NaN value handhaben', () => {
      render(<Progress value={NaN} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-100%)');
    });

    it('sollte sehr kleine Werte handhaben', () => {
      render(<Progress value={0.01} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-99.99%)');
    });

    it('sollte sehr große Werte handhaben', () => {
      render(<Progress value={999} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(--899%)');
    });
  });

  describe('Verschiedene Anwendungsfälle', () => {
    it('sollte als Loading Indicator funktionieren', () => {
      render(<Progress value={0} aria-label="Loading..." data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-label', 'Loading...');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-100%)');
    });

    it('sollte als Upload Progress funktionieren', () => {
      render(<Progress value={65} aria-label="Upload progress: 65%" data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-label', 'Upload progress: 65%');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-35%)');
    });

    it('sollte als Skill Level Indicator funktionieren', () => {
      render(
        <div>
          <label id="skill-label">JavaScript</label>
          <Progress value={85} aria-labelledby="skill-label" data-testid="progress" />
        </div>
      );
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-labelledby', 'skill-label');
      const indicator = progress.querySelector('[data-slot="progress-indicator"]');
      expect(indicator).toHaveStyle('transform: translateX(-15%)');
    });
  });
});
