// Analytics Service Tests

import { useAnalyticsService } from '../analyticsService';
import { BusinessCustomerScans, CustomerScan } from '../../models/business';

describe('Analytics Service', () => {
  let analyticsService: ReturnType<typeof useAnalyticsService>;

  beforeEach(() => {
    analyticsService = useAnalyticsService();
  });

  const createMockScan = (overrides: Partial<CustomerScan> = {}): CustomerScan => ({
    customerId: 'customer1',
    scannedAt: '2024-01-15T10:30:00Z',
    price: 25.5,
    numberOfPeople: 2,
    benefit: '10% Rabatt',
    businessName: 'Test Business',
    ...overrides,
  });

  const createMockBusiness = (
    overrides: Partial<BusinessCustomerScans> = {}
  ): BusinessCustomerScans => ({
    businessName: 'Test Business',
    scans: [createMockScan()],
    ...overrides,
  });

  describe('calculateBusinessAnalytics', () => {
    it('should calculate basic analytics for a business', () => {
      const business = createMockBusiness({
        scans: [
          createMockScan({ price: 20, numberOfPeople: 2 }),
          createMockScan({ price: 30, numberOfPeople: 3, customerId: 'customer2' }),
        ],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.businessName).toBe('Test Business');
      expect(result.totalScans).toBe(2);
      expect(result.uniqueCustomers).toBe(2);
      expect(result.averagePrice).toBe(25); // (20 + 30) / 2
      expect(result.averageNumberOfPeople).toBe(2.5); // (2 + 3) / 2
    });

    it('should handle business with no scans', () => {
      const business = createMockBusiness({ scans: [] });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.totalScans).toBe(0);
      expect(result.uniqueCustomers).toBe(0);
      expect(result.averagePrice).toBe(0);
      expect(result.averageNumberOfPeople).toBe(0);
    });

    it('should handle scans with null/undefined values', () => {
      const business = createMockBusiness({
        scans: [
          createMockScan({ price: null as any, numberOfPeople: undefined as any }),
          createMockScan({ price: 30, numberOfPeople: 2 }),
        ],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.totalScans).toBe(2);
      expect(result.averagePrice).toBe(30); // Only valid price
      expect(result.averageNumberOfPeople).toBe(2); // Only valid count
    });

    it('should calculate customer retention correctly', () => {
      const business = createMockBusiness({
        scans: [
          createMockScan({ customerId: 'customer1' }),
          createMockScan({ customerId: 'customer1' }), // Returning customer
          createMockScan({ customerId: 'customer2' }), // One-time customer
        ],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.customerRetention.returningCustomers).toBe(1);
      expect(result.customerRetention.retentionRate).toBe(50); // 1 out of 2 customers returned
    });

    it('should calculate peak times correctly', () => {
      const business = createMockBusiness({
        scans: [
          createMockScan({ scannedAt: '2024-01-15T10:30:00Z' }), // Monday 10:00
          createMockScan({ scannedAt: '2024-01-15T10:45:00Z' }), // Monday 10:00
          createMockScan({ scannedAt: '2024-01-16T14:30:00Z' }), // Tuesday 14:00
        ],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.peakTimes.dayOfWeek).toBe('Montag');
      // Flexible Zeit-Test wegen Zeitzone
      expect(result.peakTimes.timeOfDay).toMatch(/^\d{1,2}:00$/);
    });
  });

  describe('calculateDashboardAnalytics', () => {
    it('should calculate dashboard analytics for multiple businesses', () => {
      const businesses = [
        createMockBusiness({
          businessName: 'Business 1',
          scans: [
            createMockScan({ price: 20, customerId: 'customer1' }),
            createMockScan({ price: 30, customerId: 'customer2' }),
          ],
        }),
        createMockBusiness({
          businessName: 'Business 2',
          scans: [createMockScan({ price: 40, customerId: 'customer3' })],
        }),
      ];

      const result = analyticsService.calculateDashboardAnalytics(businesses);

      expect(result.totalScans).toBe(3);
      expect(result.totalCustomers).toBe(3);
      expect(result.averageScansPerBusiness).toBe(1.5); // 3 scans / 2 businesses
      expect(result.revenueData.total).toBe(90); // 20 + 30 + 40
    });

    it('should handle empty businesses array', () => {
      const result = analyticsService.calculateDashboardAnalytics([]);

      expect(result.totalScans).toBe(0);
      expect(result.totalCustomers).toBe(0);
      expect(result.averageScansPerBusiness).toBe(0);
      expect(result.revenueData.total).toBe(0);
    });

    it('should handle null/undefined businesses', () => {
      const result = analyticsService.calculateDashboardAnalytics(null as any);

      expect(result.totalScans).toBe(0);
      expect(result.totalCustomers).toBe(0);
      expect(result.averageScansPerBusiness).toBe(0);
    });

    it('should identify top businesses correctly', () => {
      const businesses = [
        createMockBusiness({
          businessName: 'Low Volume',
          scans: [createMockScan()],
        }),
        createMockBusiness({
          businessName: 'High Volume',
          scans: [
            createMockScan(),
            createMockScan({ customerId: 'customer2' }),
            createMockScan({ customerId: 'customer3' }),
          ],
        }),
      ];

      const result = analyticsService.calculateDashboardAnalytics(businesses);

      expect(result.topBusinesses[0].businessName).toBe('High Volume');
      expect(result.topBusinesses[0].totalScans).toBe(3);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle businesses with undefined scans', () => {
      const business = createMockBusiness({ scans: undefined as any });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.totalScans).toBe(0);
      expect(result.uniqueCustomers).toBe(0);
    });

    it('should handle invalid date formats gracefully', () => {
      const business = createMockBusiness({
        scans: [
          createMockScan({ scannedAt: 'invalid-date' }),
          createMockScan({ scannedAt: '2024-01-15T10:30:00Z' }),
        ],
      });

      // Should not throw an error
      expect(() => analyticsService.calculateBusinessAnalytics(business)).not.toThrow();
    });

    it('should handle very large numbers', () => {
      const business = createMockBusiness({
        scans: [createMockScan({ price: 999999.99, numberOfPeople: 1000 })],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.averagePrice).toBe(999999.99);
      expect(result.averageNumberOfPeople).toBe(1000);
    });

    it('should handle negative prices and people counts', () => {
      const business = createMockBusiness({
        scans: [
          createMockScan({ price: -10, numberOfPeople: -1 }),
          createMockScan({ price: 20, numberOfPeople: 2 }),
        ],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.averagePrice).toBe(5); // (-10 + 20) / 2
      expect(result.averageNumberOfPeople).toBe(0.5); // (-1 + 2) / 2
    });
  });

  describe('time-based calculations', () => {
    it('should correctly filter scans by date range', () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const business = createMockBusiness({
        scans: [
          createMockScan({ scannedAt: now.toISOString() }), // Recent
          createMockScan({ scannedAt: weekAgo.toISOString() }), // Week old
          createMockScan({ scannedAt: monthAgo.toISOString() }), // Month old
        ],
      });

      const result = analyticsService.calculateBusinessAnalytics(business);

      expect(result.weeklyScans).toBeGreaterThanOrEqual(1);
      expect(result.monthlyScans).toBeGreaterThanOrEqual(2);
      expect(result.yearlyScans).toBe(3);
    });
  });
});
