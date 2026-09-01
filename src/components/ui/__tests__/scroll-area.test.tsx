import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ScrollArea, ScrollBar } from '../scroll-area';

// Mock für @radix-ui/react-scroll-area
vi.mock('@radix-ui/react-scroll-area', () => ({
  Root: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
    <div ref={ref} data-testid="scroll-area-root" className={className} {...props}>
      {children}
    </div>
  )),
  Viewport: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
    <div ref={ref} data-testid="scroll-area-viewport" className={className} {...props}>
      {children}
    </div>
  )),
  ScrollAreaScrollbar: React.forwardRef<HTMLDivElement, any>(
    ({ children, className, orientation, ...props }, ref) => (
      <div
        ref={ref}
        data-testid="scroll-area-scrollbar"
        data-orientation={orientation}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  ),
  ScrollAreaThumb: React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => (
    <div ref={ref} data-testid="scroll-area-thumb" className={className} {...props} />
  )),
  Corner: React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div ref={ref} data-testid="scroll-area-corner" {...props} />
  )),
}));

describe('ScrollArea Component', () => {
  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      const viewport = screen.getByTestId('scroll-area-viewport');
      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      const corner = screen.getByTestId('scroll-area-corner');

      expect(root).toBeInTheDocument();
      expect(viewport).toBeInTheDocument();
      expect(scrollbar).toBeInTheDocument();
      expect(corner).toBeInTheDocument();
    });

    it('sollte Kinder-Elemente rendern', () => {
      render(
        <ScrollArea>
          <div>Test Content</div>
          <p>More content</p>
        </ScrollArea>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('More content')).toBeInTheDocument();
    });

    it('sollte data-slot Attribute haben', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      const viewport = screen.getByTestId('scroll-area-viewport');
      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      const thumb = screen.getByTestId('scroll-area-thumb');

      expect(root).toHaveAttribute('data-slot', 'scroll-area');
      expect(viewport).toHaveAttribute('data-slot', 'scroll-area-viewport');
      expect(scrollbar).toHaveAttribute('data-slot', 'scroll-area-scrollbar');
      expect(thumb).toHaveAttribute('data-slot', 'scroll-area-thumb');
    });
  });

  describe('Styling Classes', () => {
    it('sollte Standard-Klassen für Root haben', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('relative');
    });

    it('sollte Standard-Klassen für Viewport haben', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = screen.getByTestId('scroll-area-viewport');
      expect(viewport).toHaveClass('ring-ring/10');
      expect(viewport).toHaveClass('dark:ring-ring/20');
      expect(viewport).toHaveClass('dark:outline-ring/40');
      expect(viewport).toHaveClass('outline-ring/50');
      expect(viewport).toHaveClass('size-full');
      expect(viewport).toHaveClass('rounded-[inherit]');
      expect(viewport).toHaveClass('transition-[color,box-shadow]');
      expect(viewport).toHaveClass('focus-visible:ring-4');
      expect(viewport).toHaveClass('focus-visible:outline-1');
    });

    it('sollte custom className für Root akzeptieren', () => {
      render(
        <ScrollArea className="custom-scroll">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('custom-scroll');
      expect(root).toHaveClass('relative'); // Standard-Klasse sollte auch vorhanden sein
    });

    it('sollte Klassen mit cn utility kombinieren', () => {
      render(
        <ScrollArea className="bg-red-500 p-4">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('bg-red-500');
      expect(root).toHaveClass('p-4');
      expect(root).toHaveClass('relative');
    });
  });

  describe('Props Forwarding', () => {
    it('sollte Props an Root weiterleiten', () => {
      render(
        <ScrollArea data-testprop="value" id="test-scroll">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('data-testprop', 'value');
      expect(root).toHaveAttribute('id', 'test-scroll');
    });

    it('sollte type prop unterstützen', () => {
      render(
        <ScrollArea type="hover">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('type', 'hover');
    });

    it('sollte scrollHideDelay prop unterstützen', () => {
      render(
        <ScrollArea scrollHideDelay={1000}>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('scrollHideDelay', '1000');
    });

    it('sollte dir prop unterstützen', () => {
      render(
        <ScrollArea dir="rtl">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('sollte ARIA-Labels unterstützen', () => {
      render(
        <ScrollArea aria-label="Scrollable content">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('aria-label', 'Scrollable content');
    });

    it('sollte role attribute unterstützen', () => {
      render(
        <ScrollArea role="region">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('role', 'region');
    });

    it('sollte aria-describedby unterstützen', () => {
      render(
        <ScrollArea aria-describedby="scroll-description">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('aria-describedby', 'scroll-description');
    });

    it('sollte tabindex unterstützen', () => {
      render(
        <ScrollArea tabIndex={0}>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Content Handling', () => {
    it('sollte lange Inhalte handhaben', () => {
      const longContent = 'Lorem ipsum '.repeat(100);

      render(
        <ScrollArea>
          <div data-testid="long-content">{longContent}</div>
        </ScrollArea>
      );

      const content = screen.getByTestId('long-content');
      expect(content).toBeInTheDocument();
      expect(content.textContent).toBe(longContent);
    });

    it('sollte mehrere Kinder handhaben', () => {
      render(
        <ScrollArea>
          <div>First child</div>
          <div>Second child</div>
          <div>Third child</div>
        </ScrollArea>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('sollte React-Elemente als Kinder unterstützen', () => {
      const CustomComponent = () => <span>Custom Component</span>;

      render(
        <ScrollArea>
          <CustomComponent />
        </ScrollArea>
      );

      expect(screen.getByText('Custom Component')).toBeInTheDocument();
    });

    it('sollte leere Inhalte handhaben', () => {
      render(<ScrollArea />);

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('sollte Scroll-Events unterstützen', () => {
      const onScroll = vi.fn();

      render(
        <ScrollArea onScroll={onScroll}>
          <div>Scrollable content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      fireEvent.scroll(root);

      expect(onScroll).toHaveBeenCalled();
    });

    it('sollte asChild prop unterstützen', () => {
      render(
        <ScrollArea asChild>
          <section>
            <div>Content</div>
          </section>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('sollte komplette ScrollArea mit allen Komponenten rendern', () => {
      render(
        <ScrollArea
          className="h-64 w-full"
          type="hover"
          scrollHideDelay={600}
          aria-label="Main content"
        >
          <div className="p-4">
            <h2>Scrollable Content</h2>
            <p>This is a long content that should be scrollable.</p>
            <div>More content...</div>
          </div>
        </ScrollArea>
      );

      // Root Element
      const root = screen.getByTestId('scroll-area-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('h-64', 'w-full', 'relative');
      expect(root).toHaveAttribute('type', 'hover');
      expect(root).toHaveAttribute('scrollHideDelay', '600');
      expect(root).toHaveAttribute('aria-label', 'Main content');

      // Viewport
      const viewport = screen.getByTestId('scroll-area-viewport');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toHaveClass('size-full');

      // Scrollbar
      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');

      // Thumb
      const thumb = screen.getByTestId('scroll-area-thumb');
      expect(thumb).toBeInTheDocument();

      // Corner
      const corner = screen.getByTestId('scroll-area-corner');
      expect(corner).toBeInTheDocument();

      // Content
      expect(screen.getByText('Scrollable Content')).toBeInTheDocument();
      expect(
        screen.getByText('This is a long content that should be scrollable.')
      ).toBeInTheDocument();
    });

    it('sollte mit verschiedenen Scroll-Typen funktionieren', () => {
      const scrollTypes = ['auto', 'always', 'scroll', 'hover'] as const;

      scrollTypes.forEach(type => {
        const { unmount } = render(
          <ScrollArea type={type}>
            <div>Content for {type}</div>
          </ScrollArea>
        );

        const root = screen.getByTestId('scroll-area-root');
        expect(root).toHaveAttribute('type', type);
        expect(screen.getByText(`Content for ${type}`)).toBeInTheDocument();

        unmount();
      });
    });
  });
});

describe('ScrollBar Component', () => {
  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      const thumb = screen.getByTestId('scroll-area-thumb');

      expect(scrollbar).toBeInTheDocument();
      expect(thumb).toBeInTheDocument();
    });

    it('sollte data-slot Attribute haben', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      const thumb = screen.getByTestId('scroll-area-thumb');

      expect(scrollbar).toHaveAttribute('data-slot', 'scroll-area-scrollbar');
      expect(thumb).toHaveAttribute('data-slot', 'scroll-area-thumb');
    });
  });

  describe('Orientation', () => {
    it('sollte Standard-Orientation (vertical) haben', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    });

    it('sollte vertical orientation korrekt setzen', () => {
      render(<ScrollBar orientation="vertical" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    });

    it('sollte horizontal orientation korrekt setzen', () => {
      render(<ScrollBar orientation="horizontal" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('Styling Classes', () => {
    it('sollte Standard-Klassen haben', () => {
      render(<ScrollBar />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveClass('flex');
      expect(scrollbar).toHaveClass('touch-none');
      expect(scrollbar).toHaveClass('p-px');
      expect(scrollbar).toHaveClass('transition-colors');
      expect(scrollbar).toHaveClass('select-none');
    });

    it('sollte vertikale Klassen haben', () => {
      render(<ScrollBar orientation="vertical" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveClass('h-full');
      expect(scrollbar).toHaveClass('w-2.5');
      expect(scrollbar).toHaveClass('border-l');
      expect(scrollbar).toHaveClass('border-l-transparent');
    });

    it('sollte horizontale Klassen haben', () => {
      render(<ScrollBar orientation="horizontal" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveClass('h-2.5');
      expect(scrollbar).toHaveClass('flex-col');
      expect(scrollbar).toHaveClass('border-t');
      expect(scrollbar).toHaveClass('border-t-transparent');
    });

    it('sollte Thumb-Klassen haben', () => {
      render(<ScrollBar />);

      const thumb = screen.getByTestId('scroll-area-thumb');
      expect(thumb).toHaveClass('bg-border');
      expect(thumb).toHaveClass('relative');
      expect(thumb).toHaveClass('flex-1');
      expect(thumb).toHaveClass('rounded-full');
    });

    it('sollte custom className akzeptieren', () => {
      render(<ScrollBar className="custom-scrollbar" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveClass('custom-scrollbar');
      expect(scrollbar).toHaveClass('flex'); // Standard-Klasse sollte auch vorhanden sein
    });
  });

  describe('Props Forwarding', () => {
    it('sollte Props weiterleiten', () => {
      render(<ScrollBar id="scroll-bar" orientation="horizontal" />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('id', 'scroll-bar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('sollte onPointerDown Events unterstützen', () => {
      const onPointerDown = vi.fn();

      render(<ScrollBar onPointerDown={onPointerDown} />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      fireEvent.pointerDown(scrollbar);

      expect(onPointerDown).toHaveBeenCalled();
    });

    it('sollte style prop unterstützen', () => {
      render(<ScrollBar style={{ backgroundColor: 'red' }} />);

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toHaveAttribute('style');
      expect(scrollbar.getAttribute('style')).toContain('background-color: red');
    });
  });

  describe('Standalone Usage', () => {
    it('sollte als standalone Komponente funktionieren', () => {
      render(
        <div>
          <h2>Custom Scroll Layout</h2>
          <ScrollBar orientation="horizontal" className="my-custom-scrollbar" />
        </div>
      );

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveClass('my-custom-scrollbar');
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('sollte mit beiden Orientierungen parallel funktionieren', () => {
      render(
        <div>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </div>
      );

      const scrollbars = screen.getAllByTestId('scroll-area-scrollbar');
      const verticalBar = scrollbars[0];
      const horizontalBar = scrollbars[1];

      expect(verticalBar).toHaveAttribute('data-orientation', 'vertical');
      expect(horizontalBar).toHaveAttribute('data-orientation', 'horizontal');

      // Unterschiedliche Styling-Klassen
      expect(verticalBar).toHaveClass('h-full', 'w-2.5');
      expect(horizontalBar).toHaveClass('h-2.5', 'flex-col');
    });
  });

  describe('Integration Tests', () => {
    it('sollte vollständige ScrollBar mit allen Features rendern', () => {
      render(
        <ScrollBar
          orientation="horizontal"
          className="custom-style bg-gray-200"
          style={{ minHeight: '12px' }}
          onPointerDown={vi.fn()}
        />
      );

      const scrollbar = screen.getByTestId('scroll-area-scrollbar');
      const thumb = screen.getByTestId('scroll-area-thumb');

      // Scrollbar
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
      expect(scrollbar).toHaveClass('custom-style', 'bg-gray-200');
      expect(scrollbar).toHaveClass('h-2.5', 'flex-col', 'border-t');
      expect(scrollbar).toHaveAttribute('style');
      expect(scrollbar.getAttribute('style')).toContain('min-height: 12px');

      // Thumb
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass('bg-border', 'relative', 'flex-1', 'rounded-full');
    });
  });
});

describe('ScrollArea & ScrollBar Integration', () => {
  it('sollte ScrollArea mit custom ScrollBar funktionieren', () => {
    render(
      <ScrollArea className="h-32 w-full">
        <div className="p-4 space-y-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i}>Item {i + 1}</div>
          ))}
        </div>
      </ScrollArea>
    );

    // ScrollArea Komponenten
    const root = screen.getByTestId('scroll-area-root');
    const viewport = screen.getByTestId('scroll-area-viewport');
    const scrollbar = screen.getByTestId('scroll-area-scrollbar');
    const thumb = screen.getByTestId('scroll-area-thumb');
    const corner = screen.getByTestId('scroll-area-corner');

    expect(root).toBeInTheDocument();
    expect(viewport).toBeInTheDocument();
    expect(scrollbar).toBeInTheDocument();
    expect(thumb).toBeInTheDocument();
    expect(corner).toBeInTheDocument();

    // Content
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 20')).toBeInTheDocument();

    // Styling
    expect(root).toHaveClass('h-32', 'w-full', 'relative');
    expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
  });

  it('sollte mit verschiedenen Scroll-Konfigurationen funktionieren', () => {
    render(
      <ScrollArea type="always" scrollHideDelay={0} dir="ltr" className="max-h-40 overflow-hidden">
        <div className="space-y-4">
          <div>Section 1</div>
          <div>Section 2</div>
          <div>Section 3</div>
        </div>
      </ScrollArea>
    );

    const root = screen.getByTestId('scroll-area-root');
    expect(root).toHaveAttribute('type', 'always');
    expect(root).toHaveAttribute('scrollHideDelay', '0');
    expect(root).toHaveAttribute('dir', 'ltr');
    expect(root).toHaveClass('max-h-40', 'overflow-hidden');
  });

  it('sollte Performance mit vielen Elementen handhaben', () => {
    const manyItems = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

    render(
      <ScrollArea className="h-48">
        <div>
          {manyItems.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      </ScrollArea>
    );

    // Erste und letzte Items sollten vorhanden sein
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1000')).toBeInTheDocument();

    // ScrollArea sollte funktionieren
    const root = screen.getByTestId('scroll-area-root');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('h-48');
  });
});
