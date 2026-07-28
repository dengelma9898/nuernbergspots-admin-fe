import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { MaterialIcon } from '../material-icon';

describe('MaterialIcon Component', () => {
  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<MaterialIcon icon="home" />);

      const icon = screen.getByText('home');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('SPAN');
    });

    it('sollte das übergebene Icon anzeigen', () => {
      render(<MaterialIcon icon="star" />);

      const icon = screen.getByText('star');
      expect(icon).toHaveTextContent('star');
    });

    it('sollte verschiedene Icons handhaben', () => {
      const icons = ['home', 'star', 'favorite', 'settings', 'search'];

      icons.forEach(iconName => {
        const { unmount } = render(<MaterialIcon icon={iconName} />);

        const icon = screen.getByText(iconName);
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveTextContent(iconName);

        unmount();
      });
    });

    it('sollte leere Icon-Strings handhaben', () => {
      render(<MaterialIcon icon="" />);

      const icon = document.querySelector('.material-icons');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('');
    });
  });

  describe('Standard CSS Classes', () => {
    it('sollte Standard-Klassen haben', () => {
      render(<MaterialIcon icon="home" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('material-icons');
    });

    it('sollte Standard-Size (medium) haben', () => {
      render(<MaterialIcon icon="home" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('text-2xl');
    });

    it('sollte custom className akzeptieren', () => {
      render(<MaterialIcon icon="home" className="custom-icon" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('custom-icon');
      expect(icon).toHaveClass('material-icons'); // Standard-Klasse sollte auch da sein
    });

    it('sollte Klassen mit cn utility kombinieren', () => {
      render(<MaterialIcon icon="home" className="text-red-500 p-2" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('text-red-500');
      expect(icon).toHaveClass('p-2');
      expect(icon).toHaveClass('material-icons');
      expect(icon).toHaveClass('text-2xl'); // Standard medium size
    });
  });

  describe('Size Prop', () => {
    it('sollte small size korrekt setzen', () => {
      render(<MaterialIcon icon="home" size="small" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('text-lg');
    });

    it('sollte medium size korrekt setzen', () => {
      render(<MaterialIcon icon="home" size="medium" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('text-2xl');
    });

    it('sollte large size korrekt setzen', () => {
      render(<MaterialIcon icon="home" size="large" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('text-3xl');
    });

    it('sollte alle Size-Varianten testen', () => {
      const sizes = [
        { size: 'small' as const, expectedClass: 'text-lg' },
        { size: 'medium' as const, expectedClass: 'text-2xl' },
        { size: 'large' as const, expectedClass: 'text-3xl' },
      ];

      sizes.forEach(({ size, expectedClass }) => {
        const { unmount } = render(<MaterialIcon icon="test" size={size} />);

        const icon = screen.getByText('test');
        expect(icon).toHaveClass(expectedClass);
        expect(icon).toHaveClass('material-icons');

        unmount();
      });
    });
  });

  describe('Icon Variant', () => {
    it('sollte standardmäßig material-icons verwenden', () => {
      render(<MaterialIcon icon="home" />);

      const icon = screen.getByText('home');
      expect(icon).toHaveClass('material-icons');
      expect(icon).not.toHaveClass('material-icons-outlined');
    });

    it('sollte filled prop korrekt handhaben', () => {
      const { unmount: unmount1 } = render(<MaterialIcon icon="star" filled={true} />);
      let icon = screen.getByText('star');
      expect(icon).toHaveClass('material-icons');
      unmount1();

      const { unmount: unmount2 } = render(<MaterialIcon icon="star" filled={false} />);
      icon = screen.getByText('star');
      expect(icon).toHaveClass('material-icons-outlined');
      unmount2();
    });
  });

  describe('HTML Props', () => {
    it('sollte HTML-Span-Props weiterleiten', () => {
      render(
        <MaterialIcon
          icon="home"
          id="test-icon"
          role="img"
          aria-label="Home icon"
          data-testid="material-icon"
        />
      );

      const icon = screen.getByTestId('material-icon');
      expect(icon).toHaveAttribute('id', 'test-icon');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).toHaveAttribute('aria-label', 'Home icon');
    });

    it('sollte onClick events unterstützen', () => {
      const onClick = jest.fn();

      render(<MaterialIcon icon="button" onClick={onClick} />);

      const icon = screen.getByText('button');
      icon.click();

      expect(onClick).toHaveBeenCalled();
    });

    it('sollte title attribute unterstützen', () => {
      render(<MaterialIcon icon="info" title="Information icon" />);

      const icon = screen.getByText('info');
      expect(icon).toHaveAttribute('title', 'Information icon');
    });

    it('sollte style attribute korrekt setzen', () => {
      render(<MaterialIcon icon="home" style={{ color: 'red', fontSize: '32px' }} />);

      const icon = screen.getByText('home');
      const style = icon.getAttribute('style');

      // Custom style überschreibt die font-variation-settings (aktuelles Verhalten)
      expect(style).toContain('color: red');
      expect(style).toContain('font-size: 32px');
    });

    it('sollte tabIndex unterstützen', () => {
      render(<MaterialIcon icon="focus" tabIndex={0} />);

      const icon = screen.getByText('focus');
      expect(icon).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('sollte ARIA-Labels unterstützen', () => {
      render(<MaterialIcon icon="search" aria-label="Search button" aria-hidden="false" />);

      const icon = screen.getByText('search');
      expect(icon).toHaveAttribute('aria-label', 'Search button');
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });

    it('sollte role attribute unterstützen', () => {
      render(<MaterialIcon icon="button" role="button" />);

      const icon = screen.getByText('button');
      expect(icon).toHaveAttribute('role', 'button');
    });

    it('sollte als decorative icon funktionieren', () => {
      render(<MaterialIcon icon="decoration" aria-hidden="true" />);

      const icon = screen.getByText('decoration');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('sollte keyboard focus unterstützen', () => {
      render(<MaterialIcon icon="focus" tabIndex={0} />);

      const icon = screen.getByText('focus');
      icon.focus();
      expect(icon).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('sollte undefined props sicher handhaben', () => {
      render(
        <MaterialIcon
          icon="test"
          size={undefined as any}
          filled={undefined as any}
          weight={undefined as any}
        />
      );

      const icon = screen.getByText('test');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('material-icons');
    });

    it('sollte sehr lange Icon-Namen handhaben', () => {
      const longIconName = 'very_long_icon_name_that_might_not_exist';

      render(<MaterialIcon icon={longIconName} />);

      const icon = screen.getByText(longIconName);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent(longIconName);
    });

    it('sollte special characters in Icon-Namen handhaben', () => {
      const specialIcon = 'icon-with-dashes_and_underscores';

      render(<MaterialIcon icon={specialIcon} />);

      const icon = screen.getByText(specialIcon);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent(specialIcon);
    });

    it('sollte null/empty className handhaben', () => {
      render(<MaterialIcon icon="test" className="" />);

      const icon = screen.getByText('test');
      expect(icon).toHaveClass('material-icons');
      expect(icon).toHaveClass('text-2xl');
    });
  });

  describe('Performance & Rendering', () => {
    it('sollte mehrere Icons gleichzeitig rendern', () => {
      const icons = ['home', 'star', 'settings', 'search', 'favorite'];

      render(
        <div>
          {icons.map((icon, index) => (
            <MaterialIcon key={index} icon={icon} />
          ))}
        </div>
      );

      icons.forEach(iconName => {
        expect(screen.getByText(iconName)).toBeInTheDocument();
      });
    });

    it('sollte Icons mit verschiedenen Konfigurationen rendern', () => {
      render(
        <div>
          <MaterialIcon icon="small" size="small" filled={false} weight={300} />
          <MaterialIcon icon="medium" size="medium" filled={true} weight={400} />
          <MaterialIcon icon="large" size="large" filled={false} weight={700} />
        </div>
      );

      const smallIcon = screen.getByText('small');
      const mediumIcon = screen.getByText('medium');
      const largeIcon = screen.getByText('large');

      expect(smallIcon).toHaveClass('text-lg');
      expect(mediumIcon).toHaveClass('text-2xl');
      expect(largeIcon).toHaveClass('text-3xl');

      expect(smallIcon).toHaveClass('material-icons-outlined');
      expect(mediumIcon).toHaveClass('material-icons');
      expect(largeIcon).toHaveClass('material-icons-outlined');
    });

    it('sollte Re-Rendering bei Props-Änderungen handhaben', () => {
      const { rerender } = render(<MaterialIcon icon="star" filled={false} size="small" />);

      let icon = screen.getByText('star');
      expect(icon).toHaveClass('text-lg');
      expect(icon).toHaveClass('material-icons-outlined');

      // Props ändern
      rerender(<MaterialIcon icon="star" filled={true} size="large" />);

      icon = screen.getByText('star');
      expect(icon).toHaveClass('text-3xl');
      expect(icon).toHaveClass('material-icons');
    });
  });

  describe('Integration Tests', () => {
    it('sollte vollständiges MaterialIcon mit allen Features rendern', () => {
      render(
        <MaterialIcon
          icon="favorite"
          size="large"
          filled={true}
          weight={600}
          grade={200}
          opticalSize={48}
          className="text-red-500 cursor-pointer"
          onClick={jest.fn()}
          aria-label="Favorite button"
          role="button"
          tabIndex={0}
          title="Add to favorites"
        />
      );

      const icon = screen.getByText('favorite');

      // Basic rendering
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('favorite');

      // CSS Classes
      expect(icon).toHaveClass('material-icons');
      expect(icon).toHaveClass('text-3xl'); // large size
      expect(icon).toHaveClass('text-red-500');
      expect(icon).toHaveClass('cursor-pointer');

      // Accessibility
      expect(icon).toHaveAttribute('aria-label', 'Favorite button');
      expect(icon).toHaveAttribute('role', 'button');
      expect(icon).toHaveAttribute('tabIndex', '0');
      expect(icon).toHaveAttribute('title', 'Add to favorites');
    });

    it('sollte als Button-Alternative funktionieren', () => {
      const onClick = jest.fn();

      render(
        <MaterialIcon
          icon="add"
          size="medium"
          role="button"
          tabIndex={0}
          onClick={onClick}
          aria-label="Add item"
          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
        />
      );

      const icon = screen.getByText('add');

      // Button-ähnliche Eigenschaften
      expect(icon).toHaveAttribute('role', 'button');
      expect(icon).toHaveAttribute('tabIndex', '0');
      expect(icon).toHaveClass('cursor-pointer');

      // Click functionality
      icon.click();
      expect(onClick).toHaveBeenCalled();

      // Focus functionality
      icon.focus();
      expect(icon).toHaveFocus();
    });

    it('sollte in Listen mit verschiedenen Konfigurationen funktionieren', () => {
      const iconConfigs = [
        { icon: 'home', size: 'small', filled: true, weight: 400 },
        { icon: 'star', size: 'medium', filled: false, weight: 500 },
        { icon: 'settings', size: 'large', filled: true, weight: 600 },
      ] as const;

      render(
        <ul>
          {iconConfigs.map((config, index) => (
            <li key={index}>
              <MaterialIcon {...config} />
            </li>
          ))}
        </ul>
      );

      // Verify each icon
      iconConfigs.forEach(({ icon, size }) => {
        const iconElement = screen.getByText(icon);
        expect(iconElement).toBeInTheDocument();

        const sizeMap = {
          small: 'text-lg',
          medium: 'text-2xl',
          large: 'text-3xl',
        };
        expect(iconElement).toHaveClass(sizeMap[size]);
      });
    });

    it('sollte Theme und Design System Integration haben', () => {
      render(
        <div className="dark">
          <MaterialIcon
            icon="theme"
            size="medium"
            className="text-primary dark:text-primary-dark"
            filled={true}
            weight={500}
          />
        </div>
      );

      const icon = screen.getByText('theme');
      expect(icon).toHaveClass('text-primary');
      expect(icon).toHaveClass('dark:text-primary-dark');
      expect(icon).toHaveClass('material-icons');
    });
  });
});
