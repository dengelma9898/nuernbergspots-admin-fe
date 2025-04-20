import { BusinessCustomerScans, CustomerScan, BusinessAnalytics, DashboardAnalytics } from '../models/business';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

export function useAnalyticsService() {
  const calculateDateRangeScans = (scans: CustomerScan[], daysAgo: number): CustomerScan[] => {
    if (!scans) return [];
    
    const now = new Date();
    const startDate = new Date(now.getTime() - (daysAgo * MS_PER_DAY));
    return scans.filter(scan => new Date(scan.scannedAt) >= startDate);
  };

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const calculatePeakTimes = (scans: CustomerScan[]) => {
    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};
    
    scans.forEach(scan => {
      const date = new Date(scan.scannedAt);
      const day = date.toLocaleDateString('de-DE', { weekday: 'long' });
      const hour = date.getHours();
      
      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const peakDay = Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    
    const peakHour = Object.entries(hourCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      dayOfWeek: peakDay,
      timeOfDay: `${peakHour}:00`
    };
  };

  const calculateCustomerRetention = (scans: CustomerScan[]) => {
    const customerVisits: Record<string, number> = {};
    scans.forEach(scan => {
      customerVisits[scan.customerId] = (customerVisits[scan.customerId] || 0) + 1;
    });

    const returningCustomers = Object.values(customerVisits).filter(visits => visits > 1).length;
    const totalCustomers = Object.keys(customerVisits).length;

    return {
      returningCustomers,
      retentionRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0
    };
  };

  const calculateBusinessAnalytics = (business: BusinessCustomerScans): BusinessAnalytics => {
    const customerScans = business.scans || [];
    
    // Zeitbasierte Scans
    const weeklyScans = calculateDateRangeScans(customerScans, DAYS_PER_WEEK);
    const monthlyScans = calculateDateRangeScans(customerScans, DAYS_PER_MONTH);
    const yearlyScans = calculateDateRangeScans(customerScans, DAYS_PER_YEAR);

    // Vorherige Perioden für Trends
    const previousWeekScans = calculateDateRangeScans(
      customerScans,
      DAYS_PER_WEEK * 2
    ).slice(0, -DAYS_PER_WEEK);
    const previousMonthScans = calculateDateRangeScans(
      customerScans,
      DAYS_PER_MONTH * 2
    ).slice(0, -DAYS_PER_MONTH);

    // Durchschnittswerte
    const prices = customerScans
      .map(scan => scan.price)
      .filter((price): price is number => price !== null && price !== undefined);
    
    const peopleCount = customerScans
      .map(scan => scan.numberOfPeople)
      .filter((count): count is number => count !== null && count !== undefined);
    
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const averageNumberOfPeople = peopleCount.length > 0 ? peopleCount.reduce((a, b) => a + b, 0) / peopleCount.length : 0;

    // Unique Kunden
    const uniqueCustomers = new Set(customerScans.map(scan => scan.customerId)).size;

    // Umsatzdaten
    const revenueData = {
      total: prices.reduce((sum, price) => sum + price, 0),
      weekly: calculateDateRangeScans(customerScans, DAYS_PER_WEEK)
        .map(scan => scan.price)
        .filter((price): price is number => price !== null && price !== undefined)
        .reduce((sum, price) => sum + price, 0),
      monthly: calculateDateRangeScans(customerScans, DAYS_PER_MONTH)
        .map(scan => scan.price)
        .filter((price): price is number => price !== null && price !== undefined)
        .reduce((sum, price) => sum + price, 0),
      yearly: calculateDateRangeScans(customerScans, DAYS_PER_YEAR)
        .map(scan => scan.price)
        .filter((price): price is number => price !== null && price !== undefined)
        .reduce((sum, price) => sum + price, 0)
    };

    return {
      businessName: business.businessName,
      totalScans: customerScans.length,
      weeklyScans: weeklyScans.length,
      monthlyScans: monthlyScans.length,
      yearlyScans: yearlyScans.length,
      averagePrice,
      averageNumberOfPeople,
      uniqueCustomers,
      customerScans,
      weeklyTrend: calculateTrend(weeklyScans.length, previousWeekScans.length),
      monthlyTrend: calculateTrend(monthlyScans.length, previousMonthScans.length),
      revenueData,
      customerRetention: calculateCustomerRetention(customerScans),
      peakTimes: calculatePeakTimes(customerScans)
    };
  };

  const calculateDashboardAnalytics = (businesses: BusinessCustomerScans[]): DashboardAnalytics => {
    if (!businesses?.length) {
      return {
        businesses: [],
        totalScans: 0,
        totalCustomers: 0,
        averageScansPerBusiness: 0,
        topBusinesses: [],
        weeklyTrend: 0,
        monthlyTrend: 0,
        revenueData: {
          total: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
          averagePerScan: 0,
          projectedMonthly: 0
        },
        customerData: {
          total: 0,
          averagePerBusiness: 0,
          averageGroupSize: 0,
          newCustomersThisMonth: 0,
          returningCustomersRate: 0
        },
        timeAnalysis: {
          peakDays: [],
          peakHours: [],
          averageVisitDuration: 0
        },
        categoryAnalysis: {
          mostPopularDay: '',
          mostPopularTime: '',
          averageVisitsPerDay: 0
        }
      };
    }

    const businessAnalytics = businesses.map(calculateBusinessAnalytics);
    const allScans = businesses.flatMap(b => b.scans || []);
    
    // Basis-Metriken
    const totalScans = businessAnalytics.reduce((sum, b) => sum + b.totalScans, 0);
    const uniqueCustomerIds = new Set(allScans.map(scan => scan.customerId));
    
    // Zeit-Analyse
    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};
    allScans.forEach(scan => {
      const date = new Date(scan.scannedAt);
      const day = date.toLocaleDateString('de-DE', { weekday: 'long' });
      const hour = date.getHours();
      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const peakDays = Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .map(([day]) => day);

    const peakHours = Object.entries(hourCount)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => `${hour}:00`);

    // Umsatz-Analyse
    const validPrices = allScans
      .map(scan => scan.price)
      .filter((price): price is number => price !== null && price !== undefined);
    
    const totalRevenue = validPrices.reduce((sum, price) => sum + price, 0);
    const averagePerScan = validPrices.length > 0 ? totalRevenue / validPrices.length : 0;
    
    // Kunden-Analyse
    const monthlyCustomers = new Set(
      calculateDateRangeScans(allScans, DAYS_PER_MONTH)
        .map(scan => scan.customerId)
    ).size;

    const customerVisits: Record<string, number> = {};
    allScans.forEach(scan => {
      customerVisits[scan.customerId] = (customerVisits[scan.customerId] || 0) + 1;
    });

    const returningCustomers = Object.values(customerVisits).filter(visits => visits > 1).length;
    const returningRate = uniqueCustomerIds.size > 0 
      ? (returningCustomers / uniqueCustomerIds.size) * 100 
      : 0;

    // Durchschnittliche Gruppengröße
    const validGroupSizes = allScans
      .map(scan => scan.numberOfPeople)
      .filter((size): size is number => size !== null && size !== undefined);
    
    const averageGroupSize = validGroupSizes.length > 0
      ? validGroupSizes.reduce((sum, size) => sum + size, 0) / validGroupSizes.length
      : 0;

    return {
      businesses: businessAnalytics,
      totalScans,
      totalCustomers: uniqueCustomerIds.size,
      averageScansPerBusiness: businesses.length > 0 ? totalScans / businesses.length : 0,
      topBusinesses: [...businessAnalytics]
        .sort((a, b) => b.totalScans - a.totalScans)
        .slice(0, 5),
      weeklyTrend: calculateTrend(
        calculateDateRangeScans(allScans, DAYS_PER_WEEK).length,
        calculateDateRangeScans(allScans, DAYS_PER_WEEK * 2).slice(0, -DAYS_PER_WEEK).length
      ),
      monthlyTrend: calculateTrend(
        calculateDateRangeScans(allScans, DAYS_PER_MONTH).length,
        calculateDateRangeScans(allScans, DAYS_PER_MONTH * 2).slice(0, -DAYS_PER_MONTH).length
      ),
      revenueData: {
        total: totalRevenue,
        weekly: calculateDateRangeScans(allScans, DAYS_PER_WEEK)
          .map(scan => scan.price)
          .filter((price): price is number => price !== null && price !== undefined)
          .reduce((sum, price) => sum + price, 0),
        monthly: calculateDateRangeScans(allScans, DAYS_PER_MONTH)
          .map(scan => scan.price)
          .filter((price): price is number => price !== null && price !== undefined)
          .reduce((sum, price) => sum + price, 0),
        yearly: calculateDateRangeScans(allScans, DAYS_PER_YEAR)
          .map(scan => scan.price)
          .filter((price): price is number => price !== null && price !== undefined)
          .reduce((sum, price) => sum + price, 0),
        averagePerScan,
        projectedMonthly: (totalRevenue / allScans.length) * (totalScans / (allScans.length / DAYS_PER_MONTH))
      },
      customerData: {
        total: uniqueCustomerIds.size,
        averagePerBusiness: businesses.length > 0 ? uniqueCustomerIds.size / businesses.length : 0,
        averageGroupSize,
        newCustomersThisMonth: monthlyCustomers,
        returningCustomersRate: returningRate
      },
      timeAnalysis: {
        peakDays,
        peakHours,
        averageVisitDuration: 0 // Kann berechnet werden, wenn wir Besuchsdauer-Daten haben
      },
      categoryAnalysis: {
        mostPopularDay: peakDays[0] || '',
        mostPopularTime: peakHours[0] || '',
        averageVisitsPerDay: totalScans / DAYS_PER_MONTH
      }
    };
  };

  return {
    calculateBusinessAnalytics,
    calculateDashboardAnalytics
  };
} 