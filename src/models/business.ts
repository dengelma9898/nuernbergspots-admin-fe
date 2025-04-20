import { BusinessCategory } from './business-category';
import { BusinessContact } from './business-contact';
import { BusinessAddress } from './business-address';
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
    phoneNumber?: string;
    email?: string;
    website?: string;
  };
  openingHours: Record<string, string>;
  status: BusinessStatus;
  imageUrls: string[];
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