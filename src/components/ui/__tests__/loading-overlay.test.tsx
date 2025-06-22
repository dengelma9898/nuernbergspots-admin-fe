import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { LoadingOverlay } from '../loading-overlay';

// Mock the Calendar icon from lucide-react
jest.mock('lucide-react', () => ({
  Calendar: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="calendar-icon" className={props.className} {...props}>
      <title>Calendar</title>
    </svg>
  )),
}));

describe('LoadingOverlay Component', () => {
  // Mock timers für konsistente Tests
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden wenn nicht loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="child-content">Test Content</div>
        </LoadingOverlay>
      );

      const childContent = screen.getByTestId('child-content');
      expect(childContent).toBeInTheDocument();
      expect(childContent).toBeVisible();
    });

    it('sollte children rendern', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="child-content">Test Content</div>
          <button data-testid="child-button">Click me</button>
        </LoadingOverlay>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByTestId('child-button')).toBeInTheDocument();
    });

    it('sollte overlay rendern wenn isLoading true ist', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div data-testid="child-content">Test Content</div>
        </LoadingOverlay>
      );

      // Overlay sollte vorhanden sein
      const overlay = document.querySelector('.fixed.inset-0.z-50');
      expect(overlay).toBeInTheDocument();

      // Child content sollte immer noch da sein
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('sollte kein overlay rendern wenn isLoading false ist', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="child-content">Test Content</div>
        </LoadingOverlay>
      );

      const overlay = document.querySelector('.fixed.inset-0.z-50');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('Loading State Interaction', () => {
    it('sollte children mit pointer-events-none klasse versehen wenn loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div data-testid="child-content">Test Content</div>
        </LoadingOverlay>
      );

      const childContainer = document.querySelector('.pointer-events-none');
      expect(childContainer).toBeInTheDocument();
      expect(childContainer).toContainElement(screen.getByTestId('child-content'));
    });

    it('sollte children ohne pointer-events-none klasse versehen wenn nicht loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="child-content">Test Content</div>
        </LoadingOverlay>
      );

      const childContainer = document.querySelector('.pointer-events-none');
      expect(childContainer).not.toBeInTheDocument();
    });

    it('sollte Calendar Icon anzeigen wenn loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const calendarIcon = screen.getByTestId('calendar-icon');
      expect(calendarIcon).toBeInTheDocument();
      expect(calendarIcon).toHaveClass('w-14', 'h-14', 'text-gray-700');
    });

    it('sollte kein Calendar Icon anzeigen wenn nicht loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const calendarIcon = screen.queryByTestId('calendar-icon');
      expect(calendarIcon).not.toBeInTheDocument();
    });
  });

  describe('Loading Messages', () => {
    const expectedMessages = [
      'Suche nach Events in Nürnberg...',
      'Durchforste Veranstaltungskalender...',
      'Sammle Event-Details...',
      'Prüfe Verfügbarkeit...',
      'Organisiere Ergebnisse...',
    ];

    it('sollte erste Loading-Message anzeigen', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByText(expectedMessages[0])).toBeInTheDocument();
    });

    it('sollte zur nächsten Message nach 3 Sekunden wechseln', async () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Erste Message sollte sichtbar sein
      expect(screen.getByText(expectedMessages[0])).toBeInTheDocument();

      // Advance 3000ms + 300ms für Fade-Transition
      act(() => {
        jest.advanceTimersByTime(3300);
      });

      // Zweite Message sollte jetzt sichtbar sein
      expect(screen.getByText(expectedMessages[1])).toBeInTheDocument();
    });

    it('sollte durch alle Messages zyklisch durchlaufen', async () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Test alle 5 Messages
      for (let i = 0; i < expectedMessages.length; i++) {
        expect(screen.getByText(expectedMessages[i])).toBeInTheDocument();

        // Advance zum nächsten Message
        act(() => {
          jest.advanceTimersByTime(3300);
        });
      }

      // Nach dem letzten sollte wieder der erste kommen
      expect(screen.getByText(expectedMessages[0])).toBeInTheDocument();
    });

    it('sollte Messages nur ändern wenn isLoading true ist', () => {
      const { rerender } = render(
        <LoadingOverlay isLoading={false}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Timer advance sollte nichts ändern
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Setze isLoading auf true
      rerender(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Erste Message sollte angezeigt werden
      expect(screen.getByText(expectedMessages[0])).toBeInTheDocument();
    });

    it('sollte Message Rotation stoppen wenn isLoading auf false gesetzt wird', () => {
      const { rerender } = render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByText(expectedMessages[0])).toBeInTheDocument();

      // Setze isLoading auf false
      rerender(
        <LoadingOverlay isLoading={false}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Timer advance sollte keine Message-Änderungen bewirken
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Overlay sollte nicht mehr vorhanden sein
      const overlay = document.querySelector('.fixed.inset-0.z-50');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('Text Fade Animation', () => {
    it('sollte Text mit Opacity-Transition handhaben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const messageElement = screen.getByText('Suche nach Events in Nürnberg...');
      expect(messageElement).toHaveClass('opacity-100');

      // Nach 3 Sekunden sollte Text fade out
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(messageElement).toHaveClass('opacity-0');
    });

    it('sollte Text nach fade-in wieder sichtbar machen', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Advance zur nächsten Message
      act(() => {
        jest.advanceTimersByTime(3300);
      });

      const messageElement = screen.getByText('Durchforste Veranstaltungskalender...');
      expect(messageElement).toHaveClass('opacity-100');
    });

    it('sollte Transition-Duration CSS-Klasse haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const messageElement = screen.getByText('Suche nach Events in Nürnberg...');
      expect(messageElement).toHaveClass('transition-opacity', 'duration-300');
    });
  });

  describe('CSS Classes & Styling', () => {
    it('sollte korrekte Container-Klassen haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const overlay = document.querySelector('.fixed.inset-0.z-50');
      expect(overlay).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('sollte Liquid Glass Background-Klassen haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const liquidGlass = document.querySelector('.bg-white\\/25.backdrop-blur-2xl');
      expect(liquidGlass).toBeInTheDocument();
    });

    it('sollte Calendar Icon Container Klassen haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const iconContainer = document.querySelector('.w-28.h-28');
      expect(iconContainer).toBeInTheDocument();
    });

    it('sollte Loading Dots haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Spezifisch die Loading Dots im Container auswählen, nicht die Accent Dots
      const loadingDotsContainer = document.querySelector('.flex.space-x-3.justify-center');
      const loadingDots = loadingDotsContainer?.querySelectorAll('.w-2.h-2.rounded-full');
      expect(loadingDots).toHaveLength(3);
    });

    it('sollte Animation-Klassen haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      const calendarIcon = screen.getByTestId('calendar-icon');
      expect(calendarIcon).toHaveClass('animate-icon-float-subtle');
    });
  });

  describe('Performance & Memory', () => {
    it('sollte Timer cleanup bei Unmount durchführen', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('sollte Timer cleanup bei isLoading false durchführen', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { rerender } = render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      rerender(
        <LoadingOverlay isLoading={false}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('sollte nur einen Timer gleichzeitig laufen haben', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      setIntervalSpy.mockRestore();
    });

    it('sollte Timer bei Re-Rendering mit isLoading=true erneut setzen', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      const { rerender } = render(
        <LoadingOverlay isLoading={false}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      rerender(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      setIntervalSpy.mockRestore();
    });
  });

  describe('Props Handling', () => {
    it('sollte verschiedene children Typen handhaben', () => {
      const TestComponent = () => <div data-testid="test-component">Component</div>;

      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="div-child">Div Child</div>
          <TestComponent />
          <span data-testid="span-child">Span Child</span>
          Some text content
        </LoadingOverlay>
      );

      expect(screen.getByTestId('div-child')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByTestId('span-child')).toBeInTheDocument();
      expect(screen.getByText('Some text content')).toBeInTheDocument();
    });

    it('sollte null children handhaben', () => {
      render(<LoadingOverlay isLoading={false}>{null}</LoadingOverlay>);

      // Sollte nicht crashen
      expect(document.querySelector('.relative')).toBeInTheDocument();
    });

    it('sollte undefined children handhaben', () => {
      render(<LoadingOverlay isLoading={false}>{undefined}</LoadingOverlay>);

      // Sollte nicht crashen
      expect(document.querySelector('.relative')).toBeInTheDocument();
    });

    it('sollte array von children handhaben', () => {
      const children = [
        <div key="1" data-testid="child-1">
          Child 1
        </div>,
        <div key="2" data-testid="child-2">
          Child 2
        </div>,
      ];

      render(<LoadingOverlay isLoading={false}>{children}</LoadingOverlay>);

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('sollte sicher handhaben wenn Messages-Array leer wäre', () => {
      // Dies ist ein theoretischer Test, da Messages hardcoded sind
      render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Timer sollte trotzdem funktionieren
      act(() => {
        jest.advanceTimersByTime(3300);
      });

      // Sollte nicht crashen
      expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
    });

    it('sollte bei schnellen isLoading Toggles stabil bleiben', () => {
      const { rerender } = render(
        <LoadingOverlay isLoading={true}>
          <div>Test Content</div>
        </LoadingOverlay>
      );

      // Schnelle Toggles
      for (let i = 0; i < 5; i++) {
        rerender(
          <LoadingOverlay isLoading={false}>
            <div>Test Content</div>
          </LoadingOverlay>
        );

        rerender(
          <LoadingOverlay isLoading={true}>
            <div>Test Content</div>
          </LoadingOverlay>
        );
      }

      // Sollte stabil sein
      expect(screen.getByText('Suche nach Events in Nürnberg...')).toBeInTheDocument();
    });

    it('sollte bei Timer-Fehlern graceful degradieren', () => {
      const originalSetInterval = global.setInterval;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock setInterval to throw error
      global.setInterval = jest.fn(() => {
        throw new Error('Timer error');
      });

      // Die Komponente sollte jetzt graceful mit try-catch handhaben
      expect(() => {
        render(
          <LoadingOverlay isLoading={true}>
            <div>Test Content</div>
          </LoadingOverlay>
        );
      }).not.toThrow();

      // Überprüfe dass Error geloggt wurde
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error setting up loading timer:',
        expect.any(Error)
      );

      // Cleanup
      global.setInterval = originalSetInterval;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('sollte vollständiger Loading-Workflow funktionieren', async () => {
      const { rerender } = render(
        <LoadingOverlay isLoading={false}>
          <button data-testid="test-button">Click me</button>
        </LoadingOverlay>
      );

      // Initial: Kein Loading
      expect(screen.getByTestId('test-button')).toBeVisible();
      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();

      // Start Loading
      rerender(
        <LoadingOverlay isLoading={true}>
          <button data-testid="test-button">Click me</button>
        </LoadingOverlay>
      );

      // Loading State
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByText('Suche nach Events in Nürnberg...')).toBeInTheDocument();
      expect(document.querySelector('.pointer-events-none')).toBeInTheDocument();

      // Message Rotation
      act(() => {
        jest.advanceTimersByTime(3300);
      });

      expect(screen.getByText('Durchforste Veranstaltungskalender...')).toBeInTheDocument();

      // Stop Loading
      rerender(
        <LoadingOverlay isLoading={false}>
          <button data-testid="test-button">Click me</button>
        </LoadingOverlay>
      );

      // Back to normal
      expect(screen.getByTestId('test-button')).toBeVisible();
      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
      expect(document.querySelector('.pointer-events-none')).not.toBeInTheDocument();
    });

    it('sollte korrekte Z-Index Layering haben', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div style={{ zIndex: 10 }} data-testid="child-content">
            Content
          </div>
        </LoadingOverlay>
      );

      const overlay = document.querySelector('.z-50');
      const childContent = screen.getByTestId('child-content');

      expect(overlay).toBeInTheDocument();
      expect(childContent).toBeInTheDocument();

      // Overlay sollte höheren z-index haben
      expect(overlay).toHaveClass('z-50');
    });

    it('sollte mit komplexen nested Components funktionieren', () => {
      const ComplexChild = () => (
        <div data-testid="complex-child">
          <header>Header</header>
          <main>
            <section>
              <article data-testid="article">Article Content</article>
            </section>
          </main>
          <footer>Footer</footer>
        </div>
      );

      render(
        <LoadingOverlay isLoading={true}>
          <ComplexChild />
        </LoadingOverlay>
      );

      // Alle Elemente sollten vorhanden sein
      expect(screen.getByTestId('complex-child')).toBeInTheDocument();
      expect(screen.getByTestId('article')).toBeInTheDocument();
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();

      // Loading Overlay sollte auch da sein
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });
  });
});
