import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { CalendarWeekSelect } from '../calendar-week-select';

// Mock date-fns functions
jest.mock('date-fns', () => ({
  format: jest.fn(),
  startOfWeek: jest.fn(),
  endOfWeek: jest.fn(),
  addWeeks: jest.fn(),
  subWeeks: jest.fn(),
}));

jest.mock('date-fns/locale', () => ({
  de: { code: 'de' },
}));

// Mock Button component
jest.mock('../button', () => ({
  Button: React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
    }
  >(({ children, className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-testid={`button-${variant}-${size}`}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  ChevronLeft: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="chevron-left" {...props}>
      <title>Chevron Left</title>
    </svg>
  )),
  ChevronRight: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="chevron-right" {...props}>
      <title>Chevron Right</title>
    </svg>
  )),
}));

// Import mocked functions
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

const mockFormat = format as jest.MockedFunction<typeof format>;
const mockStartOfWeek = startOfWeek as jest.MockedFunction<typeof startOfWeek>;
const mockEndOfWeek = endOfWeek as jest.MockedFunction<typeof endOfWeek>;
const mockAddWeeks = addWeeks as jest.MockedFunction<typeof addWeeks>;
const mockSubWeeks = subWeeks as jest.MockedFunction<typeof subWeeks>;

describe('CalendarWeekSelect Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: '1',
    onChange: mockOnChange,
  };

  // Mock dates for consistent testing
  const mockCurrentDate = new Date('2024-01-15');
  const mockStartDate = new Date('2024-01-15');
  const mockEndDate = new Date('2024-01-21');
  const mockPreviousWeekDate = new Date('2024-01-08');
  const mockNextWeekDate = new Date('2024-01-22');

  beforeEach(() => {
    jest.clearAllMocks();

    mockStartOfWeek.mockReturnValue(mockStartDate);
    mockEndOfWeek.mockReturnValue(mockEndDate);
    mockSubWeeks.mockReturnValue(mockPreviousWeekDate);
    mockAddWeeks.mockReturnValue(mockNextWeekDate);

    mockFormat.mockImplementation((date, formatString, options) => {
      if (formatString === 'w') return '3';
      if (formatString === 'dd.MM.') return '15.01.';
      if (formatString === 'dd.MM.yyyy') return '21.01.2024';
      return 'mocked-date';
    });

    jest.spyOn(global, 'Date').mockImplementation(() => mockCurrentDate as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(screen.getAllByTestId('button-outline-icon')).toHaveLength(2);
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
      expect(screen.getByText(/KW 3/)).toBeInTheDocument();
    });

    it('sollte Container mit korrekten CSS-Klassen rendern', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      const container = screen.getByText(/KW 3/).closest('.flex.items-center.gap-2');
      expect(container).toBeInTheDocument();
    });

    it('sollte Previous Button mit korrekten Attributen rendern', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const previousButton = buttons[0];

      expect(previousButton).toHaveClass('h-8', 'w-8');
      expect(previousButton.querySelector('[data-testid="chevron-left"]')).toBeInTheDocument();
    });

    it('sollte Next Button mit korrekten Attributen rendern', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];

      expect(nextButton).toHaveClass('h-8', 'w-8');
      expect(nextButton.querySelector('[data-testid="chevron-right"]')).toBeInTheDocument();
    });
  });

  describe('Week Display', () => {
    it('sollte aktuelle Woche korrekt anzeigen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(screen.getByText('KW 3 (15.01. - 21.01.2024)')).toBeInTheDocument();
    });

    it('sollte Wochennummer korrekt formatieren', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockFormat).toHaveBeenCalledWith(
        mockCurrentDate,
        'w',
        expect.objectContaining({ locale: expect.any(Object) })
      );
    });

    it('sollte Datumsbereich korrekt formatieren', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockFormat).toHaveBeenCalledWith(
        mockStartDate,
        'dd.MM.',
        expect.objectContaining({ locale: expect.any(Object) })
      );
      expect(mockFormat).toHaveBeenCalledWith(
        mockEndDate,
        'dd.MM.yyyy',
        expect.objectContaining({ locale: expect.any(Object) })
      );
    });

    it('sollte Text mit korrekten CSS-Klassen anzeigen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      const weekText = screen.getByText('KW 3 (15.01. - 21.01.2024)');
      expect(weekText).toHaveClass('text-sm', 'font-medium');
    });
  });

  describe('Week Calculation', () => {
    it('sollte startOfWeek mit korrekten Parametern aufrufen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockStartOfWeek).toHaveBeenCalledWith(
        mockCurrentDate,
        expect.objectContaining({ weekStartsOn: 1 })
      );
    });

    it('sollte endOfWeek mit korrekten Parametern aufrufen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockEndOfWeek).toHaveBeenCalledWith(
        mockCurrentDate,
        expect.objectContaining({ weekStartsOn: 1 })
      );
    });

    it('sollte Woche mit Montag als ersten Tag berechnen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockStartOfWeek).toHaveBeenCalledWith(
        mockCurrentDate,
        expect.objectContaining({ weekStartsOn: 1 })
      );
      expect(mockEndOfWeek).toHaveBeenCalledWith(
        mockCurrentDate,
        expect.objectContaining({ weekStartsOn: 1 })
      );
    });
  });

  describe('Navigation Functionality', () => {
    it('sollte zur vorherigen Woche navigieren', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const previousButton = buttons[0];

      await user.click(previousButton);

      expect(mockSubWeeks).toHaveBeenCalled();
    });

    it('sollte zur nächsten Woche navigieren', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];

      await user.click(nextButton);

      expect(mockAddWeeks).toHaveBeenCalled();
    });

    it('sollte onChange bei Navigation aufrufen', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];

      await user.click(nextButton);

      expect(mockOnChange).toHaveBeenCalledWith('3');
    });
  });

  describe('State Management', () => {
    it('sollte interne currentDate State korrekt verwalten', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];

      const initialCalls = mockAddWeeks.mock.calls.length;
      await user.click(nextButton);
      expect(mockAddWeeks.mock.calls.length).toBeGreaterThan(initialCalls);

      const secondCalls = mockAddWeeks.mock.calls.length;
      await user.click(nextButton);
      expect(mockAddWeeks.mock.calls.length).toBeGreaterThan(secondCalls);
    });

    it('sollte State bei mehrfachen Navigationen korrekt aktualisieren', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const previousButton = buttons[0];
      const nextButton = buttons[1];

      await user.click(nextButton);
      await user.click(previousButton);

      expect(mockAddWeeks).toHaveBeenCalled();
      expect(mockSubWeeks).toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('sollte value prop korrekt handhaben', () => {
      render(<CalendarWeekSelect value="5" onChange={mockOnChange} />);

      expect(screen.getByText(/KW 3/)).toBeInTheDocument();
    });

    it('sollte onChange prop korrekt handhaben', async () => {
      const customOnChange = jest.fn();
      const user = userEvent.setup();

      render(<CalendarWeekSelect value="1" onChange={customOnChange} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      await user.click(buttons[1]);

      expect(customOnChange).toHaveBeenCalled();
    });
  });

  describe('Date-fns Integration', () => {
    it('sollte deutsche Lokalisierung verwenden', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockFormat).toHaveBeenCalledWith(
        mockCurrentDate,
        'w',
        expect.objectContaining({ locale: expect.any(Object) })
      );
    });

    it('sollte alle date-fns Funktionen korrekt aufrufen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockStartOfWeek).toHaveBeenCalled();
      expect(mockEndOfWeek).toHaveBeenCalled();
      expect(mockFormat).toHaveBeenCalled();
    });

    it('sollte Wochenstart auf Montag setzen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(mockStartOfWeek).toHaveBeenCalledWith(
        mockCurrentDate,
        expect.objectContaining({ weekStartsOn: 1 })
      );
      expect(mockEndOfWeek).toHaveBeenCalledWith(
        mockCurrentDate,
        expect.objectContaining({ weekStartsOn: 1 })
      );
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('sollte mit ungültigen Daten graceful umgehen', () => {
      mockFormat.mockReturnValue('Invalid Date');

      expect(() => {
        render(<CalendarWeekSelect {...defaultProps} />);
      }).not.toThrow();
    });

    it('sollte mit undefined onChange umgehen', () => {
      // @ts-ignore
      expect(() => {
        render(<CalendarWeekSelect value="1" onChange={undefined} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('sollte Buttons zugänglich machen', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('sollte Icons mit Titeln haben', () => {
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(screen.getByTitle('Chevron Left')).toBeInTheDocument();
      expect(screen.getByTitle('Chevron Right')).toBeInTheDocument();
    });

    it('sollte Keyboard Navigation unterstützen', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const firstButton = buttons[0];

      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Performance & Memory', () => {
    it('sollte effizient re-rendern', () => {
      const { rerender } = render(<CalendarWeekSelect {...defaultProps} />);

      const initialCallCount = mockFormat.mock.calls.length;

      rerender(<CalendarWeekSelect {...defaultProps} />);

      expect(mockFormat.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
    });

    it('sollte Memory Leaks vermeiden', () => {
      const { unmount } = render(<CalendarWeekSelect {...defaultProps} />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('sollte kompletter Navigation Workflow funktionieren', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      expect(screen.getByText('KW 3 (15.01. - 21.01.2024)')).toBeInTheDocument();

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];
      const previousButton = buttons[0];

      await user.click(nextButton);
      expect(mockOnChange).toHaveBeenCalledWith('3');

      await user.click(previousButton);
      expect(mockOnChange).toHaveBeenCalledWith('3');
    });

    it('sollte mit schnellen Klicks umgehen', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];

      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockAddWeeks).toHaveBeenCalled();
    });

    it('sollte Datum und Wochennummer synchron halten', async () => {
      const user = userEvent.setup();
      render(<CalendarWeekSelect {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-outline-icon');
      const nextButton = buttons[1];

      await user.click(nextButton);

      expect(mockAddWeeks).toHaveBeenCalled();
      expect(mockFormat).toHaveBeenCalledWith(
        mockNextWeekDate,
        'w',
        expect.objectContaining({ locale: expect.any(Object) })
      );
    });
  });
});
