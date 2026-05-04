import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '../Analytics';
import { useBusinessService } from '../../services/businessService';
import { useAnalyticsService } from '../../services/analyticsService';
import { DashboardAnalytics, BusinessAnalytics, CustomerScan } from '../../models/business';
import '@testing-library/jest-dom';

// Mock alle externen Dependencies
jest.mock('../../lib/api', () => ({
  apiRequest: jest.fn(),
}));
jest.mock('../../services/businessService');
jest.mock('../../services/analyticsService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div className={className} data-testid="card-description">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div className={className} data-testid="card-title">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value}>
      Progress: {value}%
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div className={className} data-testid="skeleton">
      Loading...
    </div>
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange?.('Restaurant Alpha')}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <div className={className} data-testid="select-trigger">
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Store: () => <div data-testid="store-icon">Store</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  TrendingDown: () => <div data-testid="trending-down-icon">TrendingDown</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Scan: () => <div data-testid="scan-icon">Scan</div>,
  Euro: () => <div data-testid="euro-icon">Euro</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  BarChart2: () => <div data-testid="bar-chart-icon">BarChart2</div>,
  RefreshCcw: () => <div data-testid="refresh-icon">RefreshCcw</div>,
  UserCheck: () => <div data-testid="user-check-icon">UserCheck</div>,
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock PricingCalculator component
jest.mock('@/components/PricingCalculator', () => ({
  PricingCalculator: ({ analytics }: any) => (
    <div data-testid="pricing-calculator">
      Pricing Calculator: {analytics?.length || 0} businesses
    </div>
  ),
}));

const mockNavigate = jest.fn();
const mockBusinessService = {
  getCustomerScans: jest.fn(),
};
const mockAnalyticsService = {
  calculateDashboardAnalytics: jest.fn(),
};

// Mock-Daten
const mockCustomerScans: CustomerScan[] = [
  {
    customerId: 'customer1',
    scannedAt: '2024-01-15T10:30:00Z',
    price: 25.5,
    numberOfPeople: 2,
    benefit: '10% Rabatt',
    businessName: 'Restaurant Alpha',
    additionalInfo: 'Mittag',
  },
  {
    customerId: 'customer2',
    scannedAt: '2024-01-16T14:20:00Z',
    price: 15.0,
    numberOfPeople: 1,
    benefit: '5€ Rabatt',
    businessName: 'Café Beta',
  },
];

const mockBusinessAnalytics: BusinessAnalytics = {
  businessName: 'Restaurant Alpha',
  totalScans: 150,
  weeklyScans: 25,
  monthlyScans: 100,
  yearlyScans: 1200,
  averagePrice: 22.5,
  averageNumberOfPeople: 2.3,
  uniqueCustomers: 85,
  customerScans: mockCustomerScans,
  weeklyTrend: 12.5,
  monthlyTrend: 8.2,
  revenueData: {
    total: 3375.0,
    weekly: 562.5,
    monthly: 2250.0,
    yearly: 27000.0,
  },
  customerRetention: {
    returningCustomers: 32,
    retentionRate: 37.6,
  },
  peakTimes: {
    dayOfWeek: 'Freitag',
    timeOfDay: '19:00',
  },
};

const mockDashboardAnalytics: DashboardAnalytics = {
  businesses: [mockBusinessAnalytics],
  totalScans: 350,
  totalCustomers: 125,
  averageScansPerBusiness: 116.7,
  topBusinesses: [mockBusinessAnalytics],
  weeklyTrend: 15.2,
  monthlyTrend: 10.5,
  revenueData: {
    total: 7875.0,
    weekly: 1312.5,
    monthly: 5250.0,
    yearly: 63000.0,
    averagePerScan: 22.5,
    projectedMonthly: 5500.0,
  },
  customerData: {
    total: 125,
    averagePerBusiness: 41.7,
    averageGroupSize: 2.1,
    newCustomersThisMonth: 28,
    returningCustomersRate: 42.4,
  },
  timeAnalysis: {
    peakDays: ['Freitag', 'Samstag', 'Sonntag'],
    peakHours: ['19:00', '18:00', '20:00'],
    averageVisitDuration: 85.5,
  },
  categoryAnalysis: {
    mostPopularDay: 'Freitag',
    mostPopularTime: '19:00',
    averageVisitsPerDay: 12.3,
  },
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Analytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useBusinessService as jest.Mock).mockReturnValue(mockBusinessService);
    (useAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);

    // Standard mock setup
    mockBusinessService.getCustomerScans.mockResolvedValue(mockCustomerScans);
    mockAnalyticsService.calculateDashboardAnalytics.mockReturnValue(mockDashboardAnalytics);
  });

  describe('Component Rendering', () => {
    it('sollte das Analytics Dashboard korrekt rendern', async () => {
      renderWithRouter(<Analytics />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText('Detaillierte Einblicke in die Performance deiner Partner')
      ).toBeInTheDocument();

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('Übersicht')).toBeInTheDocument();
      });
    });

    it('sollte alle Header-Buttons rendern', () => {
      renderWithRouter(<Analytics />);

      expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      expect(screen.getByText('Zurück')).toBeInTheDocument();
    });

    it('sollte alle Hauptsektionen rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Übersicht')).toBeInTheDocument();
        expect(screen.getByText('Umsatzübersicht')).toBeInTheDocument();
        expect(screen.getByText('Top Partner')).toBeInTheDocument();
        expect(screen.getByText('Business-Details')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('sollte Skeleton-Komponenten während des Ladens anzeigen', () => {
      mockBusinessService.getCustomerScans.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      renderWithRouter(<Analytics />);

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    it('sollte den Aktualisieren-Button während des Ladens deaktivieren', async () => {
      mockBusinessService.getCustomerScans.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockCustomerScans), 100))
      );

      renderWithRouter(<Analytics />);

      const refreshButton = screen.getByText('Aktualisieren').closest('button');
      expect(refreshButton).toBeDisabled();

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });
  });

  describe('Data Fetching', () => {
    it('sollte Analytics beim Initial Mount laden', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(mockBusinessService.getCustomerScans).toHaveBeenCalledTimes(1);
        expect(mockAnalyticsService.calculateDashboardAnalytics).toHaveBeenCalledWith(
          mockCustomerScans
        );
      });
    });

    it('sollte Analytics beim Klick auf Aktualisieren neu laden', async () => {
      renderWithRouter(<Analytics />);

      // Warte auf initiales Laden
      await waitFor(() => {
        expect(mockBusinessService.getCustomerScans).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByText('Aktualisieren');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockBusinessService.getCustomerScans).toHaveBeenCalledTimes(2);
      });
    });

    it('sollte Fehler beim Laden der Analytics behandeln', async () => {
      const mockToast = require('sonner').toast;
      mockBusinessService.getCustomerScans.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('Fehler beim Laden der Analytics'),
          expect.objectContaining({ description: expect.any(String) })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zur Dashboard-Seite navigieren beim Klick auf Zurück', async () => {
      renderWithRouter(<Analytics />);

      const backButton = screen.getByText('Zurück');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Overview Cards', () => {
    it('sollte alle Overview-Karten mit korrekten Daten rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Gesamtscans')[0]).toBeInTheDocument();
        expect(screen.getAllByText('350')[0]).toBeInTheDocument();
        expect(screen.getAllByText('125 unique Kunden')[0]).toBeInTheDocument();

        expect(screen.getAllByText('Umsatz (30 Tage)')[0]).toBeInTheDocument();
        expect(screen.getAllByText('5250.00€')[0]).toBeInTheDocument();

        expect(screen.getAllByText('Kundenbindung')[0]).toBeInTheDocument();
        expect(screen.getAllByText('42.4%')[0]).toBeInTheDocument();

        expect(screen.getAllByText('Scans pro Partner')[0]).toBeInTheDocument();
        expect(screen.getAllByText('116.7')[0]).toBeInTheDocument();
      });
    });

    it('sollte Trend-Indikatoren korrekt anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByTestId('trending-up-icon')).toHaveLength(2);
        expect(screen.getAllByText('10.5%')[0]).toBeInTheDocument(); // monthly trend
        expect(screen.getAllByText('15.2%')[0]).toBeInTheDocument(); // weekly trend
      });
    });
  });

  describe('Revenue Overview', () => {
    it('sollte Umsatzverteilung korrekt anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Umsatzverteilung')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Diese Woche')[0]).toBeInTheDocument();
        expect(screen.getAllByText('1312.50€')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Dieser Monat')[0]).toBeInTheDocument();
        expect(screen.getAllByText('5250.00€')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Dieses Jahr')[0]).toBeInTheDocument();
        expect(screen.getAllByText('63000.00€')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Ø pro Scan')[0]).toBeInTheDocument();
        expect(screen.getAllByText('22.50€')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Time Analysis Card', () => {
    it('sollte Zeitanalyse korrekt rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Zeitanalyse')).toBeInTheDocument();
        expect(screen.getByText('Besuchermuster und Stoßzeiten')).toBeInTheDocument();
        expect(screen.getByText('Beliebteste Tage')).toBeInTheDocument();
        expect(screen.getByText('Stoßzeiten')).toBeInTheDocument();
        expect(screen.getByText('Durchschnittliche Besuche pro Tag')).toBeInTheDocument();
        expect(screen.getByText('12.3')).toBeInTheDocument();
      });
    });

    it('sollte Top 3 Tage und Uhrzeiten anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Freitag')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Samstag')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Sonntag')[0]).toBeInTheDocument();
        expect(screen.getAllByText('19:00 Uhr')[0]).toBeInTheDocument();
        expect(screen.getAllByText('18:00 Uhr')[0]).toBeInTheDocument();
        expect(screen.getAllByText('20:00 Uhr')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Customer Retention Card', () => {
    it('sollte Kundenbindungsanalyse korrekt rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Kundenbindung')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Analyse der Kundenbeziehungen')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Neue Kunden (30 Tage)')[0]).toBeInTheDocument();
        expect(screen.getAllByText('28')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Wiederkehrende Kunden')[0]).toBeInTheDocument();
        expect(screen.getAllByText('42.4%')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Durchschnittliche Gruppengröße')[0]).toBeInTheDocument();
        expect(screen.getAllByText('2.1 Personen')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Top Businesses Section', () => {
    it('sollte Top Partner Sektion rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Top Partner')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Restaurant Alpha')[0]).toBeInTheDocument();
      });
    });

    it('sollte "Noch keine Partner-Daten verfügbar" anzeigen wenn keine Daten vorhanden', async () => {
      const emptyAnalytics = { ...mockDashboardAnalytics, topBusinesses: [] };
      mockAnalyticsService.calculateDashboardAnalytics.mockReturnValue(emptyAnalytics);

      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Noch keine Partner-Daten verfügbar')).toBeInTheDocument();
      });
    });
  });

  describe('Business Analytics Card', () => {
    it('sollte Business Analytics Card korrekt rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Restaurant Alpha')[0]).toBeInTheDocument();
        expect(screen.getAllByText('85')[0]).toBeInTheDocument(); // unique customers
        expect(screen.getAllByText('Gesamtscans')[0]).toBeInTheDocument();
        expect(screen.getAllByText('150')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Woche')[0]).toBeInTheDocument();
        expect(screen.getAllByText('25')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Monat')[0]).toBeInTheDocument();
        expect(screen.getAllByText('100')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Jahr')[0]).toBeInTheDocument();
        expect(screen.getAllByText('1200')[0]).toBeInTheDocument();
      });
    });

    it('sollte Durchschnittswerte korrekt anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Ø Preis:')[0]).toBeInTheDocument();
        expect(screen.getAllByText('22.50€')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Ø Personen:')[0]).toBeInTheDocument();
        expect(screen.getAllByText('2.3')[0]).toBeInTheDocument();
      });
    });

    it('sollte Kundentreue-Daten anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Stammkunden')[0]).toBeInTheDocument();
        expect(screen.getAllByText('32')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Treue-Rate')[0]).toBeInTheDocument();
        expect(screen.getAllByText('37.6%')[0]).toBeInTheDocument();
      });
    });

    it('sollte Peak Times anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Beliebteste Zeiten:')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Freitag')[0]).toBeInTheDocument();
        expect(screen.getAllByText('19:00')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Tag')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Uhrzeit')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Business Selection', () => {
    it('sollte Business-Auswahl rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Business-Details')[0]).toBeInTheDocument();
        expect(screen.getByTestId('select')).toBeInTheDocument();
        expect(screen.getAllByText('Business auswählen')[0]).toBeInTheDocument();
      });
    });

    it('sollte Business Details anzeigen bei Auswahl', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        const select = screen.getByTestId('select');
        fireEvent.click(select);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Detaillierte Business-Analyse')[0]).toBeInTheDocument();
        expect(
          screen.getAllByText('Ausführliche Statistiken für Restaurant Alpha')[0]
        ).toBeInTheDocument();
      });
    });
  });

  describe('Pricing Calculator', () => {
    it('sollte PricingCalculator rendern wenn Daten vorhanden', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByTestId('pricing-calculator')).toBeInTheDocument();
        expect(screen.getAllByText('Pricing Calculator: 1 businesses')[0]).toBeInTheDocument();
      });
    });

    it('sollte PricingCalculator nicht rendern beim Laden', () => {
      mockBusinessService.getCustomerScans.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<Analytics />);

      expect(screen.queryByTestId('pricing-calculator')).not.toBeInTheDocument();
    });
  });

  describe('Business Details Component', () => {
    it('sollte Business Details korrekt rendern', async () => {
      renderWithRouter(<Analytics />);

      // Trigger business selection
      await waitFor(() => {
        const select = screen.getByTestId('select');
        fireEvent.click(select);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Detaillierte Business-Analyse')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Scans')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Gesamt')[0]).toBeInTheDocument();
        expect(screen.getAllByText('150')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Diese Woche')[0]).toBeInTheDocument();
        expect(screen.getAllByText('25')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Kunden')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Unique Kunden')[0]).toBeInTheDocument();
        expect(screen.getAllByText('85')[0]).toBeInTheDocument();
      });
    });

    it('sollte Scans/Kunde Verhältnis berechnen', async () => {
      renderWithRouter(<Analytics />);

      // Trigger business selection
      await waitFor(() => {
        const select = screen.getByTestId('select');
        fireEvent.click(select);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Ø Scans/Kunde')[0]).toBeInTheDocument();
        // 150 scans / 85 customers = 1.76...
        expect(screen.getAllByText('1.7647058823529411')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Klassen für Header haben', () => {
      renderWithRouter(<Analytics />);

      const header = screen.getByText('Analytics Dashboard');
      expect(header).toHaveClass('text-2xl', 'sm:text-3xl');
    });

    it('sollte responsive Button-Container haben', () => {
      renderWithRouter(<Analytics />);

      const buttonContainer = screen.getByText('Aktualisieren').closest('.flex.flex-col');
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });
  });

  describe('Progress Component', () => {
    it('sollte Progress mit korrektem Wert rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByText('Gesamtscans')[0]).toBeInTheDocument();
      });
      const bar = document.querySelector('.bg-primary.h-full') as HTMLElement | null;
      expect(bar).toBeTruthy();
      expect(bar?.style.width).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('sollte Konsolen-Fehler bei Analytics-Laden loggen', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockBusinessService.getCustomerScans.mockRejectedValue(new Error('Network Error'));

      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Fehler beim Laden der Analytics:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Initial Mount Behavior', () => {
    it('sollte Analytics nur beim ersten Mount laden', async () => {
      const { rerender } = renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(mockBusinessService.getCustomerScans).toHaveBeenCalledTimes(1);
      });

      // Re-render sollte nicht zu weiterem Laden führen
      rerender(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Warte einen Moment und überprüfe, dass es immer noch nur einmal aufgerufen wurde
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(mockBusinessService.getCustomerScans).toHaveBeenCalledTimes(1);
    });
  });

  describe('AnalyticsCard Component', () => {
    it('sollte AnalyticsCard mit Trend-Indikatoren rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        // Positive trend should show TrendingUp icon
        expect(screen.getAllByTestId('trending-up-icon')).toHaveLength(2);
      });
    });

    it('sollte Loading State für AnalyticsCard korrekt handhaben', () => {
      mockBusinessService.getCustomerScans.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<Analytics />);

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });
  });

  describe('Negative Trend Scenarios', () => {
    it('sollte TrendingDown Icon für negative Trends anzeigen', async () => {
      const analyticsWithNegativeTrend = {
        ...mockDashboardAnalytics,
        weeklyTrend: -5.2,
        monthlyTrend: -8.1,
      };
      mockAnalyticsService.calculateDashboardAnalytics.mockReturnValue(analyticsWithNegativeTrend);

      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByTestId('trending-down-icon')).toHaveLength(2);
        expect(screen.getAllByText('8.1%')[0]).toBeInTheDocument(); // absolute value
        expect(screen.getAllByText('5.2%')[0]).toBeInTheDocument(); // absolute value
      });
    });
  });

  describe('Empty Data Scenarios', () => {
    it('sollte korrekt mit leeren Analytics umgehen', async () => {
      const emptyAnalytics = {
        ...mockDashboardAnalytics,
        businesses: [],
        totalScans: 0,
        topBusinesses: [],
      };
      mockAnalyticsService.calculateDashboardAnalytics.mockReturnValue(emptyAnalytics);

      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // total scans
        expect(screen.getByText('Noch keine Partner-Daten verfügbar')).toBeInTheDocument();
      });
    });
  });
});
