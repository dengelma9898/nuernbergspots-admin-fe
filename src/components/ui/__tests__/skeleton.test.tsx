import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '../skeleton';

describe('Skeleton Komponente', () => {
  describe('Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });

    it('sollte als div-Element gerendert werden', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });

    it('sollte Standard-CSS-Klassen haben', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('sollte benutzerdefinierte className akzeptieren', () => {
      render(<Skeleton className="custom-skeleton-class" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-skeleton-class');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });
  });

  describe('Props Weiterleitung', () => {
    it('sollte zusätzliche Props weiterleiten', () => {
      render(
        <Skeleton
          data-testid="skeleton"
          id="my-skeleton"
          role="presentation"
          aria-label="Loading content"
        />
      );
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'my-skeleton');
      expect(skeleton).toHaveAttribute('role', 'presentation');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('sollte style Props akzeptieren', () => {
      const customStyle = { width: '200px', height: '100px' };
      render(<Skeleton style={customStyle} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle('width: 200px');
      expect(skeleton).toHaveStyle('height: 100px');
    });

    it('sollte onClick Handler akzeptieren', () => {
      const handleClick = jest.fn();
      render(<Skeleton onClick={handleClick} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');

      skeleton.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Größen und Dimensionen', () => {
    it('sollte verschiedene Größen mit className unterstützen', () => {
      render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4', 'w-full');
    });

    it('sollte runde Skelette unterstützen', () => {
      render(<Skeleton className="h-12 w-12 rounded-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
    });

    it('sollte rechteckige Skelette unterstützen', () => {
      render(<Skeleton className="h-32 w-64 rounded-lg" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-32', 'w-64', 'rounded-lg');
    });
  });

  describe('Inhalt', () => {
    it('sollte standardmäßig leer sein', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeEmptyDOMElement();
    });

    it('sollte Kinder-Elemente akzeptieren', () => {
      render(
        <Skeleton data-testid="skeleton">
          <span>Loading...</span>
        </Skeleton>
      );
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('Loading...');
    });

    it('sollte mehrere Kinder-Elemente handhaben', () => {
      render(
        <Skeleton data-testid="skeleton">
          <div>Line 1</div>
          <div>Line 2</div>
        </Skeleton>
      );
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveTextContent('Line 1Line 2');
    });
  });

  describe('Accessibility', () => {
    it('sollte aria-label für Screen Reader unterstützen', () => {
      render(<Skeleton aria-label="Loading user profile" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
    });

    it('sollte role="presentation" standardmäßig haben können', () => {
      render(<Skeleton role="presentation" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'presentation');
    });

    it('sollte aria-hidden unterstützen', () => {
      render(<Skeleton aria-hidden="true" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('sollte aria-busy unterstützen', () => {
      render(<Skeleton aria-busy="true" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Verschiedene Anwendungsfälle', () => {
    it('sollte als Text-Skeleton funktionieren', () => {
      render(
        <div>
          <Skeleton className="h-4 w-[250px] mb-2" data-testid="text-skeleton-1" />
          <Skeleton className="h-4 w-[200px]" data-testid="text-skeleton-2" />
        </div>
      );

      expect(screen.getByTestId('text-skeleton-1')).toHaveClass('h-4', 'w-[250px]', 'mb-2');
      expect(screen.getByTestId('text-skeleton-2')).toHaveClass('h-4', 'w-[200px]');
    });

    it('sollte als Avatar-Skeleton funktionieren', () => {
      render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />);
      const skeleton = screen.getByTestId('avatar-skeleton');
      expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
    });

    it('sollte als Card-Skeleton funktionieren', () => {
      render(
        <div className="space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" data-testid="card-skeleton" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="title-skeleton" />
            <Skeleton className="h-4 w-[200px]" data-testid="description-skeleton" />
          </div>
        </div>
      );

      expect(screen.getByTestId('card-skeleton')).toHaveClass(
        'h-[125px]',
        'w-[250px]',
        'rounded-xl'
      );
      expect(screen.getByTestId('title-skeleton')).toHaveClass('h-4', 'w-[250px]');
      expect(screen.getByTestId('description-skeleton')).toHaveClass('h-4', 'w-[200px]');
    });

    it('sollte als Button-Skeleton funktionieren', () => {
      render(<Skeleton className="h-10 w-[100px] rounded-md" data-testid="button-skeleton" />);
      const skeleton = screen.getByTestId('button-skeleton');
      expect(skeleton).toHaveClass('h-10', 'w-[100px]', 'rounded-md');
    });
  });

  describe('Animation', () => {
    it('sollte animate-pulse Klasse haben', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('sollte Animation deaktivieren können', () => {
      render(<Skeleton className="animate-none" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-none');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit sehr kleinen Dimensionen umgehen', () => {
      render(<Skeleton className="h-1 w-1" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-1', 'w-1');
    });

    it('sollte mit sehr großen Dimensionen umgehen', () => {
      render(<Skeleton className="h-96 w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-96', 'w-full');
    });

    it('sollte mit komplexen className-Kombinationen umgehen', () => {
      const complexClasses = 'h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse';
      render(<Skeleton className={complexClasses} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass(
        'h-4',
        'w-full',
        'bg-gray-200',
        'dark:bg-gray-700',
        'rounded',
        'animate-pulse'
      );
    });

    it('sollte mit leerer className umgehen', () => {
      render(<Skeleton className="" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });

    it('sollte mit undefined className umgehen', () => {
      render(<Skeleton className={undefined} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
    });
  });

  describe('Komposition mit anderen Komponenten', () => {
    it('sollte in einem Container funktionieren', () => {
      render(
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="name-skeleton" />
            <Skeleton className="h-4 w-[200px]" data-testid="email-skeleton" />
          </div>
        </div>
      );

      expect(screen.getByTestId('avatar-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('name-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('email-skeleton')).toBeInTheDocument();
    });
  });
});
