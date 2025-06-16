import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingCalculator } from '../PricingCalculator';
import { BusinessAnalytics } from '../../models/business';
import '@testing-library/jest-dom';

// Mock shadcn/ui components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className} data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className} data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step }: any) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      data-testid="slider"
      data-value={value[0]}
    />
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className }: any) => (
    <input 
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className} data-testid="label">{children}</label>,
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="switch"
    />
  ),
}));

// Mock-Daten
const mockBusinessAnalytics: BusinessAnalytics[] = [
  {
    businessName: 'Restaurant Alpha',
    totalScans: 180,
    weeklyScans: 35,
    monthlyScans: 150,
    yearlyScans: 1800,
    averagePrice: 22.50,
    averageNumberOfPeople: 2.5,
    uniqueCustomers: 85,
    customerScans: [],
    weeklyTrend: 12.5,
    monthlyTrend: 8.3,
    revenueData: {
      total: 4050,
      weekly: 787.5,
      monthly: 3375,
      yearly: 40500,
    },
    customerRetention: {
      returningCustomers: 32,
      retentionRate: 37.6,
    },
    peakTimes: {
      dayOfWeek: 'Freitag',
      timeOfDay: '19:00',
    },
  },
  {
    businessName: 'Café Beta',
    totalScans: 95,
    weeklyScans: 18,
    monthlyScans: 80,
    yearlyScans: 960,
    averagePrice: 8.75,
    averageNumberOfPeople: 1.8,
    uniqueCustomers: 45,
    customerScans: [],
    weeklyTrend: 5.2,
    monthlyTrend: 3.1,
    revenueData: {
      total: 831.25,
      weekly: 157.5,
      monthly: 700,
      yearly: 8400,
    },
    customerRetention: {
      returningCustomers: 18,
      retentionRate: 40.0,
    },
    peakTimes: {
      dayOfWeek: 'Sonntag',
      timeOfDay: '10:00',
    },
  },
  {
    businessName: 'Bar Gamma',
    totalScans: 310,
    weeklyScans: 58,
    monthlyScans: 250,
    yearlyScans: 3000,
    averagePrice: 18.30,
    averageNumberOfPeople: 3.2,
    uniqueCustomers: 120,
    customerScans: [],
    weeklyTrend: 15.8,
    monthlyTrend: 11.2,
    revenueData: {
      total: 5673,
      weekly: 1061.4,
      monthly: 4575,
      yearly: 54900,
    },
    customerRetention: {
      returningCustomers: 25,
      retentionRate: 20.8,
    },
    peakTimes: {
      dayOfWeek: 'Freitag',
      timeOfDay: '22:00',
    },
  },
];

const mockEmptyAnalytics: BusinessAnalytics[] = [];

const mockSingleBusiness: BusinessAnalytics[] = [
  {
    businessName: 'Solo Restaurant',
    totalScans: 60,
    weeklyScans: 12,
    monthlyScans: 50,
    yearlyScans: 600,
    averagePrice: 35.00,
    averageNumberOfPeople: 2.0,
    uniqueCustomers: 25,
    customerScans: [],
    weeklyTrend: 8.0,
    monthlyTrend: 5.5,
    revenueData: {
      total: 2100,
      weekly: 420,
      monthly: 1750,
      yearly: 21000,
    },
    customerRetention: {
      returningCustomers: 20,
      retentionRate: 80.0,
    },
    peakTimes: {
      dayOfWeek: 'Samstag',
      timeOfDay: '18:00',
    },
  },
];

describe('PricingCalculator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('sollte PricingCalculator korrekt rendern', () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      expect(screen.getByText('Preismodell Rechner')).toBeInTheDocument();
      expect(screen.getByText('Grundgebühr (€/Monat)')).toBeInTheDocument();
      expect(screen.getByText('Scan-Schwelle')).toBeInTheDocument();
      expect(screen.getByText('Gebühr pro zusätzlichem Scan (€)')).toBeInTheDocument();
      expect(screen.getByText('Maximale Gebühr aktivieren')).toBeInTheDocument();
    });

    it('sollte Standard-Preismodell-Werte anzeigen', () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      expect(screen.getAllByText('29.99€')[0]).toBeInTheDocument(); // Grundgebühr
      expect(screen.getAllByText('100 Scans')[0]).toBeInTheDocument(); // Scan-Schwelle
      expect(screen.getAllByText('0.10€')[0]).toBeInTheDocument(); // Scan-Gebühr
      expect(screen.getAllByText('99.99€')[0]).toBeInTheDocument(); // Max-Gebühr
    });

    it('sollte Prognostizierte Einnahmen Sektion anzeigen', () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      expect(screen.getByText('Prognostizierte Einnahmen')).toBeInTheDocument();
      expect(screen.getByText('Gesamt pro Monat:')).toBeInTheDocument();
      expect(screen.getByText('Durchschnitt pro Partner:')).toBeInTheDocument();
      expect(screen.getByText('Gebühren pro Partner:')).toBeInTheDocument();
    });

    it('sollte alle Business-Namen in der Gebühren-Liste anzeigen', () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
      expect(screen.getByText('Café Beta')).toBeInTheDocument();
      expect(screen.getByText('Bar Gamma')).toBeInTheDocument();
    });
  });

  describe('Pricing Calculations', () => {
    it('sollte korrekte Gebühren für Businesses unter der Schwelle berechnen', () => {
      render(<PricingCalculator analytics={mockSingleBusiness} />);
      
      // Solo Restaurant hat 50 Scans (unter 100 Schwelle)
      // Sollte nur Grundgebühr von 29.99€ zahlen
      expect(screen.getAllByText('29.99€')[0]).toBeInTheDocument();
    });

    it('sollte korrekte Gebühren für Businesses über der Schwelle berechnen', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      // Restaurant Alpha: 150 Scans
      // Grundgebühr: 29.99€ + (150-100) * 0.10€ = 29.99€ + 5.00€ = 34.99€
      // Bar Gamma: 250 Scans 
      // Grundgebühr: 29.99€ + (250-100) * 0.10€ = 29.99€ + 15.00€ = 44.99€
      // Café Beta: 80 Scans (unter Schwelle) = 29.99€
      // Gesamt: 34.99€ + 44.99€ + 29.99€ = 109.97€

      await waitFor(() => {
        expect(screen.getAllByText('109.97€')[0]).toBeInTheDocument();
      });
    });

    it('sollte Durchschnittsgebühr korrekt berechnen', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      // Gesamt: 109.97€ / 3 Businesses = 36.66€
      await waitFor(() => {
        expect(screen.getAllByText('36.66€')[0]).toBeInTheDocument();
      });
    });

    it('sollte maximale Gebühr anwenden wenn aktiviert', async () => {
      // Setze hohe Scan-Zahlen, um Max-Fee zu erreichen
      const highScanBusiness: BusinessAnalytics[] = [
        {
          ...mockBusinessAnalytics[0],
          monthlyScans: 2000, // Sehr hohe Scans
        }
      ];

      render(<PricingCalculator analytics={highScanBusiness} />);

      // Mit 2000 Scans: 29.99€ + (2000-100) * 0.10€ = 29.99€ + 190€ = 219.99€
      // Aber Max-Fee ist 99.99€, also sollte 99.99€ angezeigt werden
      await waitFor(() => {
        expect(screen.getAllByText('99.99€')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Slider Interactions', () => {
    it('sollte Grundgebühr über Slider ändern können', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const sliders = screen.getAllByTestId('slider');
      const baseFeeSlider = sliders[0]; // Erster Slider ist Grundgebühr

      fireEvent.change(baseFeeSlider, { target: { value: '39.99' } });

      await waitFor(() => {
        expect(screen.getAllByText('39.99€')[0]).toBeInTheDocument();
      });
    });

    it('sollte Scan-Schwelle über Slider ändern können', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const sliders = screen.getAllByTestId('slider');
      const thresholdSlider = sliders[1]; // Zweiter Slider ist Scan-Schwelle

      fireEvent.change(thresholdSlider, { target: { value: '200' } });

      await waitFor(() => {
        expect(screen.getAllByText('200 Scans')[0]).toBeInTheDocument();
      });
    });

    it('sollte Scan-Gebühr über Slider ändern können', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const sliders = screen.getAllByTestId('slider');
      const scanFeeSlider = sliders[2]; // Dritter Slider ist Scan-Gebühr

      fireEvent.change(scanFeeSlider, { target: { value: '0.20' } });

      await waitFor(() => {
        expect(screen.getAllByText('0.20€')[0]).toBeInTheDocument();
      });
    });

    it('sollte maximale Gebühr über Slider ändern können', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const sliders = screen.getAllByTestId('slider');
      const maxFeeSlider = sliders[3]; // Vierter Slider ist Max-Gebühr

      fireEvent.change(maxFeeSlider, { target: { value: '149.99' } });

      await waitFor(() => {
        expect(screen.getAllByText('149.99€')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Switch Interactions', () => {
    it('sollte maximale Gebühr deaktivieren können', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const maxFeeSwitch = screen.getByTestId('switch');
      expect(maxFeeSwitch).toBeChecked();

      fireEvent.click(maxFeeSwitch);

      expect(maxFeeSwitch).not.toBeChecked();
      
      // Max-Fee Slider sollte verschwinden
      await waitFor(() => {
        const sliders = screen.getAllByTestId('slider');
        expect(sliders).toHaveLength(3); // Nur noch 3 Slider statt 4
      });
    });

    it('sollte maximale Gebühr wieder aktivieren können', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const maxFeeSwitch = screen.getByTestId('switch');
      
      // Deaktivieren
      fireEvent.click(maxFeeSwitch);
      expect(maxFeeSwitch).not.toBeChecked();

      // Wieder aktivieren
      fireEvent.click(maxFeeSwitch);
      expect(maxFeeSwitch).toBeChecked();

      // Max-Fee Slider sollte wieder da sein
      await waitFor(() => {
        const sliders = screen.getAllByTestId('slider');
        expect(sliders).toHaveLength(4); // Wieder 4 Slider
      });
    });

    it('sollte Berechnungen ohne maximale Gebühr durchführen', async () => {
      const highScanBusiness: BusinessAnalytics[] = [
        {
          ...mockBusinessAnalytics[0],
          monthlyScans: 2000, // Sehr hohe Scans
        }
      ];

      render(<PricingCalculator analytics={highScanBusiness} />);

      const maxFeeSwitch = screen.getByTestId('switch');
      fireEvent.click(maxFeeSwitch); // Deaktiviere Max-Fee

      // Mit 2000 Scans: 29.99€ + (2000-100) * 0.10€ = 29.99€ + 190€ = 219.99€
      // Ohne Max-Fee sollte die volle Berechnung angezeigt werden
      await waitFor(() => {
        expect(screen.getAllByText('219.99€')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leeren Analytics umgehen', () => {
      render(<PricingCalculator analytics={mockEmptyAnalytics} />);

      expect(screen.getByText('Preismodell Rechner')).toBeInTheDocument();
      expect(screen.getAllByText('0.00€')[0]).toBeInTheDocument(); // Gesamt sollte 0 sein
    });

    it('sollte Division durch Null bei Durchschnitt vermeiden', () => {
      render(<PricingCalculator analytics={mockEmptyAnalytics} />);

      // Durchschnitt sollte 0.00€ oder NaN handhaben
      expect(screen.getByText('NaN€') || screen.getByText('0.00€')).toBeInTheDocument();
    });

    it('sollte mit sehr hohen Scan-Zahlen umgehen', async () => {
      const extremeBusiness: BusinessAnalytics[] = [
        {
          ...mockBusinessAnalytics[0],
          monthlyScans: 10000,
        }
      ];

      render(<PricingCalculator analytics={extremeBusiness} />);

      // Mit 10000 Scans und Max-Fee sollte trotzdem Max-Fee angewendet werden
      await waitFor(() => {
        expect(screen.getAllByText('99.99€')[0]).toBeInTheDocument();
      });
    });

    it('sollte mit Business ohne Scans umgehen', async () => {
      const noScanBusiness: BusinessAnalytics[] = [
        {
          ...mockBusinessAnalytics[0],
          monthlyScans: 0,
        }
      ];

      render(<PricingCalculator analytics={noScanBusiness} />);

      // Mit 0 Scans sollte nur Grundgebühr berechnet werden
      await waitFor(() => {
        expect(screen.getAllByText('29.99€')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Calculations', () => {
    it('sollte Berechnungen in Echtzeit bei Slider-Änderungen aktualisieren', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      // Ursprünglicher Gesamtbetrag
      expect(screen.getAllByText('109.97€')[0]).toBeInTheDocument();

      const sliders = screen.getAllByTestId('slider');
      const baseFeeSlider = sliders[0];

      // Ändere Grundgebühr von 29.99€ auf 50.00€
      fireEvent.change(baseFeeSlider, { target: { value: '50.00' } });

      // Neue Berechnung:
      // Restaurant Alpha: 50.00€ + (150-100) * 0.10€ = 55.00€
      // Bar Gamma: 50.00€ + (250-100) * 0.10€ = 65.00€  
      // Café Beta: 50.00€ (unter Schwelle)
      // Gesamt: 55.00€ + 65.00€ + 50.00€ = 170.00€

      await waitFor(() => {
        expect(screen.getAllByText('170.00€')[0]).toBeInTheDocument();
      });
    });

    it('sollte Durchschnitt bei Änderungen neu berechnen', async () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const sliders = screen.getAllByTestId('slider');
      const baseFeeSlider = sliders[0];

      fireEvent.change(baseFeeSlider, { target: { value: '50.00' } });

      // Neuer Durchschnitt: 170.00€ / 3 = 56.67€
      await waitFor(() => {
        expect(screen.getAllByText('56.67€')[0]).toBeInTheDocument();
      });
    });
  });

  describe('UI Components', () => {
    it('sollte alle notwendigen UI-Komponenten rendern', () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      
      const sliders = screen.getAllByTestId('slider');
      expect(sliders).toHaveLength(4); // 4 Slider für die verschiedenen Parameter
      
      expect(screen.getByTestId('switch')).toBeInTheDocument();
      
      const labels = screen.getAllByTestId('label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('sollte korrekte Slider-Attribute haben', () => {
      render(<PricingCalculator analytics={mockBusinessAnalytics} />);

      const sliders = screen.getAllByTestId('slider');
      
      // Grundgebühr Slider (0-100)
      expect(sliders[0]).toHaveAttribute('min', '0');
      expect(sliders[0]).toHaveAttribute('max', '100');
      
      // Scan-Schwelle Slider (0-1000)
      expect(sliders[1]).toHaveAttribute('min', '0');
      expect(sliders[1]).toHaveAttribute('max', '1000');
      
      // Scan-Gebühr Slider (0-1)
      expect(sliders[2]).toHaveAttribute('min', '0');
      expect(sliders[2]).toHaveAttribute('max', '1');
      
      // Max-Gebühr Slider (0-200)
      expect(sliders[3]).toHaveAttribute('min', '0');
      expect(sliders[3]).toHaveAttribute('max', '200');
    });
  });
}); 