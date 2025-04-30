import { BusinessCustomer } from './business-customer';

export enum BusinessStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface NuernbergspotsReview {
  reviewText?: string;
  reviewImageUrls?: string[];
}

export interface Business {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  contact: {
    email?: string;
    phoneNumber?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  openingHours: Record<string, string>;
  detailedOpeningHours: Record<string, Array<{ from: string; to: string }>>;
  status: BusinessStatus;
  imageUrls: string[];
  logoUrl?: string;
  keywordIds: string[];
  nuernbergspotsReview?: NuernbergspotsReview;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  hasAccount: boolean;
  isPromoted: boolean;
}

/**
 * Erweiterte Business-Schnittstelle mit aufgelösten Kategorien und Keywords
 * die als Antwort an den Client gesendet wird
 */
export interface BusinessResponse extends Business {
  category: {
    id: string;
    name: string;
    iconName: string;
  };
  keywordNames: string[];
}

export interface CustomerScan {
  /**
   * Die Kunden-ID aus dem Benutzerprofil
   */
  customerId: string;

  /**
   * ISO-String des Zeitpunkts, zu dem der Kunde gescannt wurde
   */
  scannedAt: string;

  /**
   * Optionaler Preis, der bezahlt wurde
   */
  price?: number | null;

  /**
   * Optionale Anzahl der Personen
   */
  numberOfPeople?: number | null;

  /**
   * Optionale Zusatzinformationen
   */
  additionalInfo?: string | null;

  /**
   * Das aktuelle Benefit des Businesses zum Zeitpunkt des Scans
   */
  benefit: string;

  /**
   * Der Name des Businesses, bei dem der Scan durchgeführt wurde
   */
  businessName: string;
}

export interface BusinessCustomerScans {
  /**
   * Der Name des Businesses, bei dem der Scan durchgeführt wurde
   */
  businessName: string;

  scans: CustomerScan[];

}

export interface BusinessAnalytics {
  businessName: string;
  totalScans: number;
  weeklyScans: number;
  monthlyScans: number;
  yearlyScans: number;
  averagePrice: number;
  averageNumberOfPeople: number;
  uniqueCustomers: number;
  customerScans: CustomerScan[];
  weeklyTrend: number;
  monthlyTrend: number;
  revenueData: {
    total: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  customerRetention: {
    returningCustomers: number;
    retentionRate: number;
  };
  peakTimes: {
    dayOfWeek: string;
    timeOfDay: string;
  };
}

export interface DashboardAnalytics {
  businesses: BusinessAnalytics[];
  totalScans: number;
  totalCustomers: number;
  averageScansPerBusiness: number;
  topBusinesses: BusinessAnalytics[];
  weeklyTrend: number;
  monthlyTrend: number;
  revenueData: {
    total: number;
    weekly: number;
    monthly: number;
    yearly: number;
    averagePerScan: number;
    projectedMonthly: number;
  };
  customerData: {
    total: number;
    averagePerBusiness: number;
    averageGroupSize: number;
    newCustomersThisMonth: number;
    returningCustomersRate: number;
  };
  timeAnalysis: {
    peakDays: string[];
    peakHours: string[];
    averageVisitDuration: number;
  };
  categoryAnalysis: {
    mostPopularDay: string;
    mostPopularTime: string;
    averageVisitsPerDay: number;
  };
} 