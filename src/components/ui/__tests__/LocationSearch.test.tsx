// LocationSearch Tests

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { LocationSearch, LocationResult } from '../LocationSearch';

// Mock API Hook
const mockApiGet = jest.fn();
jest.mock('@/lib/api', () => ({
  useApi: () => ({
    get: mockApiGet,
  }),
}));

// Mock API Utils
jest.mock('@/lib/apiUtils', () => ({
  unwrapData: jest.fn(response => response.data),
}));

// Mock UI Components
jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
      <input ref={ref} data-testid="location-input" className={className} {...props} />
    )
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      variant?: string;
    }
  >(({ children, className, variant, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="location-badge"
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </div>
  )),
}));

jest.mock('@/components/ui/card', () => ({
  Card: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} data-testid="location-card" className={className} {...props}>
        {children}
      </div>
    )
  ),
  CardContent: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} data-testid="card-content" className={className} {...props}>
        {children}
      </div>
    )
  ),
}));

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
      data-testid="location-button"
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Check: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="check-icon" {...props}>
      <title>Check</title>
    </svg>
  )),
  MapPin: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="map-pin-icon" {...props}>
      <title>Map Pin</title>
    </svg>
  )),
  Loader2: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="loader-icon" {...props}>
      <title>Loader</title>
    </svg>
  )),
  X: React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-testid="x-icon" {...props}>
      <title>X</title>
    </svg>
  )),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('LocationSearch Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: null,
    onChange: mockOnChange,
  };

  // Mock location data
  const mockLocationResult: LocationResult = {
    title: 'Test Location',
    id: 'test-id-123',
    resultType: 'address',
    position: {
      lat: 49.4521,
      lng: 11.0767,
    },
    address: {
      label: 'Hauptstraße 1, 90403 Nürnberg, Deutschland',
      countryCode: 'DE',
      countryName: 'Deutschland',
      stateCode: 'BY',
      state: 'Bayern',
      county: 'Mittelfranken',
      city: 'Nürnberg',
      district: 'Altstadt',
      street: 'Hauptstraße',
      postalCode: '90403',
      houseNumber: '1',
    },
  };

  const mockSearchResults: LocationResult[] = [
    mockLocationResult,
    {
      ...mockLocationResult,
      id: 'test-id-456',
      address: {
        ...mockLocationResult.address,
        label: 'Nebenstraße 2, 90403 Nürnberg, Deutschland',
        street: 'Nebenstraße',
        houseNumber: '2',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockApiGet.mockResolvedValue({ data: mockSearchResults });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('sollte korrekt gerendert werden', () => {
      render(<LocationSearch {...defaultProps} />);

      expect(screen.getByTestId('location-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Adresse suchen...')).toBeInTheDocument();
    });

    it('sollte Container mit korrekten CSS-Klassen rendern', () => {
      render(<LocationSearch {...defaultProps} />);

      const container = screen.getByTestId('location-input').closest('.space-y-2');
      expect(container).toBeInTheDocument();
    });

    it('sollte Input mit korrekten Attributen rendern', () => {
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      expect(input).toHaveClass('w-full', 'pr-10');
      expect(input).toHaveAttribute('placeholder', 'Adresse suchen...');
    });

    it('sollte custom placeholder verwenden', () => {
      render(<LocationSearch {...defaultProps} placeholder="Custom Placeholder" />);

      expect(screen.getByPlaceholderText('Custom Placeholder')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('sollte Suche bei Texteingabe starten', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith('/location/search?query=Hauptstra%C3%9Fe');
      });
    });

    it('sollte nicht suchen bei weniger als 3 Zeichen', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Ha');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('sollte Debouncing implementieren', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} debounce={1000} />);

      const input = screen.getByTestId('location-input');

      await user.type(input, 'Haupt');
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockApiGet).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalled();
      });
    });
  });

  describe('Suggestions Display', () => {
    it('sollte Vorschläge nach erfolgreicher Suche anzeigen', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.getByTestId('location-card')).toBeInTheDocument();
        expect(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland')).toBeInTheDocument();
        expect(screen.getByText('Nebenstraße 2, 90403 Nürnberg, Deutschland')).toBeInTheDocument();
      });
    });

    it('sollte MapPin Icons bei Vorschlägen anzeigen', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        const mapPinIcons = screen.getAllByTestId('map-pin-icon');
        expect(mapPinIcons.length).toBeGreaterThan(0);
      });
    });

    it('sollte Vorschlag bei Klick auswählen', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland'));

      expect(mockOnChange).toHaveBeenCalledWith(mockLocationResult);
    });
  });

  describe('Selected Location Display', () => {
    it('sollte ausgewählte Location anzeigen', () => {
      render(<LocationSearch {...defaultProps} value={mockLocationResult} />);

      expect(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland')).toBeInTheDocument();
      expect(screen.getByText('Hauptstraße 1')).toBeInTheDocument();
      expect(screen.getByText('90403 Nürnberg')).toBeInTheDocument();
      expect(screen.getByText('49.452100')).toBeInTheDocument();
      expect(screen.getByText('11.076700')).toBeInTheDocument();
    });

    it('sollte vollständige Adresse Badge anzeigen', () => {
      render(<LocationSearch {...defaultProps} value={mockLocationResult} />);

      const badge = screen.getByTestId('location-badge');
      expect(badge).toHaveAttribute('data-variant', 'default');
      expect(screen.getByText('Adressdaten vollständig')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('sollte Clear Button anzeigen', () => {
      render(<LocationSearch {...defaultProps} value={mockLocationResult} />);

      const clearButton = screen.getByTestId('location-button');
      expect(clearButton).toHaveAttribute('data-variant', 'ghost');
      expect(clearButton).toHaveAttribute('data-size', 'icon');
    });
  });

  describe('Input Value Management', () => {
    it('sollte Input-Wert bei value prop setzen', () => {
      render(<LocationSearch {...defaultProps} value={mockLocationResult} />);

      const input = screen.getByTestId('location-input');
      expect(input).toHaveValue('Hauptstraße 1, 90403 Nürnberg, Deutschland');
    });

    it('sollte Input-Wert bei value Änderung aktualisieren', () => {
      const { rerender } = render(<LocationSearch {...defaultProps} value={null} />);

      const input = screen.getByTestId('location-input');
      expect(input).toHaveValue('');

      rerender(<LocationSearch {...defaultProps} value={mockLocationResult} />);
      expect(input).toHaveValue('Hauptstraße 1, 90403 Nürnberg, Deutschland');
    });
  });

  describe('Error Handling', () => {
    it('sollte API-Fehler graceful handhaben', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockApiGet.mockRejectedValue(new Error('API Error'));

      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Fehler bei der Adresssuche:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('sollte mit leeren API-Ergebnissen umgehen', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      mockApiGet.mockResolvedValue({ data: [] });

      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('location-card')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    it('sollte verschiedene debounce Werte handhaben', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} debounce={500} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalled();
      });
    });

    it('sollte onChange korrekt aufrufen', async () => {
      const customOnChange = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<LocationSearch value={null} onChange={customOnChange} />);

      const input = screen.getByTestId('location-input');
      await user.type(input, 'Hauptstraße');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland'));

      expect(customOnChange).toHaveBeenCalledWith(mockLocationResult);
    });
  });

  describe('Integration Tests', () => {
    it('sollte kompletter Workflow funktionieren', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');

      // 1. Suche eingeben
      await user.type(input, 'Hauptstraße');

      // 2. Debounce warten
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // 3. Vorschläge sollten erscheinen
      await waitFor(() => {
        expect(screen.getByTestId('location-card')).toBeInTheDocument();
      });

      // 4. Vorschlag auswählen
      await user.click(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland'));

      // 5. Location sollte ausgewählt sein
      expect(mockOnChange).toHaveBeenCalledWith(mockLocationResult);

      // 6. Vorschläge sollten verschwinden
      expect(screen.queryByTestId('location-card')).not.toBeInTheDocument();
    });

    it('sollte Suche, Auswahl und Clear Workflow funktionieren', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { rerender } = render(<LocationSearch {...defaultProps} />);

      const input = screen.getByTestId('location-input');

      // Suche und Auswahl
      await user.type(input, 'Hauptstraße');
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(screen.getByTestId('location-card')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Hauptstraße 1, 90403 Nürnberg, Deutschland'));

      // Rerender mit ausgewählter Location
      rerender(<LocationSearch value={mockLocationResult} onChange={mockOnChange} />);

      // Clear Button klicken
      const clearButton = screen.getByTestId('location-button');
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });
});
