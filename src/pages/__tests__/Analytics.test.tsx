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
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardDescription: ({ children, className }: any) => <div className={className} data-testid="card-description">{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className} data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className} data-testid="card-title">{children}</div>,
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
  Skeleton: ({ className }: any) => <div className={className} data-testid="skeleton">Loading...</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange?.('Restaurant Alpha')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, className }: any) => <div className={className} data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
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
    price: 25.50,
    numberOfPeople: 2,
    benefit: '10% Rabatt',
    businessName: 'Restaurant Alpha',
    additionalInfo: 'Mittag',
  },
  {
    customerId: 'customer2',
    scannedAt: '2024-01-16T14:20:00Z',
    price: 15.00,
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
  averagePrice: 22.50,
  averageNumberOfPeople: 2.3,
  uniqueCustomers: 85,
  customerScans: mockCustomerScans,
  weeklyTrend: 12.5,
  monthlyTrend: 8.2,
  revenueData: {
    total: 3375.00,
    weekly: 562.50,
    monthly: 2250.00,
    yearly: 27000.00,
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
    total: 7875.00,
    weekly: 1312.50,
    monthly: 5250.00,
    yearly: 63000.00,
    averagePerScan: 22.50,
    projectedMonthly: 5500.00,
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
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
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
      expect(screen.getByText('Detaillierte Einblicke in die Performance deiner Partner')).toBeInTheDocument();
      
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
        expect(mockAnalyticsService.calculateDashboardAnalytics).toHaveBeenCalledWith(mockCustomerScans);
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
        expect(mockToast.error).toHaveBeenCalledWith('Die Analytics konnten nicht geladen werden.');
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
        expect(screen.getByText('Gesamtscans')).toBeInTheDocument();
        expect(screen.getByText('350')).toBeInTheDocument();
        expect(screen.getByText('125 unique Kunden')).toBeInTheDocument();

        expect(screen.getByText('Umsatz (30 Tage)')).toBeInTheDocument();
        expect(screen.getByText('5250.00€')).toBeInTheDocument();

        expect(screen.getByText('Kundenbindung')).toBeInTheDocument();
        expect(screen.getByText('42.4%')).toBeInTheDocument();

        expect(screen.getByText('Scans pro Partner')).toBeInTheDocument();
        expect(screen.getByText('116.7')).toBeInTheDocument();
      });
    });

    it('sollte Trend-Indikatoren korrekt anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByTestId('trending-up-icon')).toHaveLength(2);
        expect(screen.getByText('10.5%')).toBeInTheDocument(); // monthly trend
        expect(screen.getByText('15.2%')).toBeInTheDocument(); // weekly trend
      });
    });
  });

  describe('Revenue Overview', () => {
    it('sollte Umsatzverteilung korrekt anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Umsatzverteilung')).toBeInTheDocument();
        expect(screen.getByText('Diese Woche')).toBeInTheDocument();
        expect(screen.getByText('1312.50€')).toBeInTheDocument();
        expect(screen.getByText('Dieser Monat')).toBeInTheDocument();
        expect(screen.getByText('5250.00€')).toBeInTheDocument();
        expect(screen.getByText('Dieses Jahr')).toBeInTheDocument();
        expect(screen.getByText('63000.00€')).toBeInTheDocument();
        expect(screen.getByText('Ø pro Scan')).toBeInTheDocument();
        expect(screen.getByText('22.50€')).toBeInTheDocument();
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
        expect(screen.getByText('Freitag')).toBeInTheDocument();
        expect(screen.getByText('Samstag')).toBeInTheDocument();
        expect(screen.getByText('Sonntag')).toBeInTheDocument();
        expect(screen.getByText('19:00 Uhr')).toBeInTheDocument();
        expect(screen.getByText('18:00 Uhr')).toBeInTheDocument();
        expect(screen.getByText('20:00 Uhr')).toBeInTheDocument();
      });
    });
  });

  describe('Customer Retention Card', () => {
    it('sollte Kundenbindungsanalyse korrekt rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Kundenbindung')).toBeInTheDocument();
        expect(screen.getByText('Analyse der Kundenbeziehungen')).toBeInTheDocument();
        expect(screen.getByText('Neue Kunden (30 Tage)')).toBeInTheDocument();
        expect(screen.getByText('28')).toBeInTheDocument();
        expect(screen.getByText('Wiederkehrende Kunden')).toBeInTheDocument();
        expect(screen.getByText('42.4%')).toBeInTheDocument();
        expect(screen.getByText('Durchschnittliche Gruppengröße')).toBeInTheDocument();
        expect(screen.getByText('2.1 Personen')).toBeInTheDocument();
      });
    });
  });

  describe('Top Businesses Section', () => {
    it('sollte Top Partner Sektion rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Top Partner')).toBeInTheDocument();
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
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
        expect(screen.getByText('Restaurant Alpha')).toBeInTheDocument();
        expect(screen.getAllByText('85')[0]).toBeInTheDocument(); // unique customers
        expect(screen.getByText('Gesamtscans')).toBeInTheDocument();
        expect(screen.getAllByText('150')[0]).toBeInTheDocument();
        expect(screen.getByText('Woche')).toBeInTheDocument();
        expect(screen.getAllByText('25')[0]).toBeInTheDocument();
        expect(screen.getByText('Monat')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Jahr')).toBeInTheDocument();
        expect(screen.getByText('1200')).toBeInTheDocument();
      });
    });

    it('sollte Durchschnittswerte korrekt anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Ø Preis:')).toBeInTheDocument();
        expect(screen.getByText('22.50€')).toBeInTheDocument();
        expect(screen.getByText('Ø Personen:')).toBeInTheDocument();
        expect(screen.getByText('2.3')).toBeInTheDocument();
      });
    });

    it('sollte Kundentreue-Daten anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Stammkunden')).toBeInTheDocument();
        expect(screen.getByText('32')).toBeInTheDocument();
        expect(screen.getByText('Treue-Rate')).toBeInTheDocument();
        expect(screen.getByText('37.6%')).toBeInTheDocument();
      });
    });

    it('sollte Peak Times anzeigen', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Beliebteste Zeiten:')).toBeInTheDocument();
        expect(screen.getByText('Freitag')).toBeInTheDocument();
        expect(screen.getByText('19:00')).toBeInTheDocument();
        expect(screen.getByText('Tag')).toBeInTheDocument();
        expect(screen.getByText('Uhrzeit')).toBeInTheDocument();
      });
    });
  });

  describe('Business Selection', () => {
    it('sollte Business-Auswahl rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByText('Business-Details')).toBeInTheDocument();
        expect(screen.getByTestId('select')).toBeInTheDocument();
        expect(screen.getByText('Business auswählen')).toBeInTheDocument();
      });
    });

    it('sollte Business Details anzeigen bei Auswahl', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        const select = screen.getByTestId('select');
        fireEvent.click(select);
      });

      await waitFor(() => {
        expect(screen.getByText('Detaillierte Business-Analyse')).toBeInTheDocument();
        expect(screen.getByText('Ausführliche Statistiken für Restaurant Alpha')).toBeInTheDocument();
      });
    });
  });

  describe('Pricing Calculator', () => {
    it('sollte PricingCalculator rendern wenn Daten vorhanden', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getByTestId('pricing-calculator')).toBeInTheDocument();
        expect(screen.getByText('Pricing Calculator: 1 businesses')).toBeInTheDocument();
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
        expect(screen.getByText('Detaillierte Business-Analyse')).toBeInTheDocument();
        expect(screen.getByText('Scans')).toBeInTheDocument();
        expect(screen.getByText('Gesamt')).toBeInTheDocument();
        expect(screen.getAllByText('150')[0]).toBeInTheDocument();
        expect(screen.getByText('Diese Woche')).toBeInTheDocument();
        expect(screen.getAllByText('25')[0]).toBeInTheDocument();
        expect(screen.getByText('Kunden')).toBeInTheDocument();
        expect(screen.getByText('Unique Kunden')).toBeInTheDocument();
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
        expect(screen.getByText('Ø Scans/Kunde')).toBeInTheDocument();
        // 150 scans / 85 customers = 1.76...
        expect(screen.getByText('1.7647058823529411')).toBeInTheDocument();
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

      const buttonContainer = screen.getByText('Aktualisieren').closest('div')?.parentElement;
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });
  });

  describe('Progress Component', () => {
    it('sollte Progress mit korrektem Wert rendern', async () => {
      renderWithRouter(<Analytics />);

      await waitFor(() => {
        const progressElements = screen.getAllByTestId('progress');
        expect(progressElements.length).toBeGreaterThan(0);
        // Überprüfe den ersten Progress-Balken
        expect(progressElements[0]).toHaveAttribute('data-value', '8.333333333333334');
      });
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
        monthlyTrend: -8.1
      };
      mockAnalyticsService.calculateDashboardAnalytics.mockReturnValue(analyticsWithNegativeTrend);

      renderWithRouter(<Analytics />);

      await waitFor(() => {
        expect(screen.getAllByTestId('trending-down-icon')).toHaveLength(2);
        expect(screen.getByText('8.1%')).toBeInTheDocument(); // absolute value
        expect(screen.getByText('5.2%')).toBeInTheDocument(); // absolute value
      });
    });
  });

  describe('Empty Data Scenarios', () => {
    it('sollte korrekt mit leeren Analytics umgehen', async () => {
      const emptyAnalytics = {
        ...mockDashboardAnalytics,
        businesses: [],
        totalScans: 0,
        topBusinesses: []
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