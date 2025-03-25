export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  BUSINESS = 'business',
  PREMIUM_BUSINESS = 'premium_business',
}

export interface BusinessHistory {
  /**
   * The ID of the business that was visited
   */
  businessId: string;

  /**
   * The name of the business at time of visit
   */
  businessName: string;

  /**
   * The benefit that was offered
   */
  benefit: string;

  /**
   * ISO string of when the business was visited
   */
  visitedAt: string;
}

export interface UserProfile {
  email: string;
  userType: UserType;
  managementId: string;
  name?: string;
  profilePictureUrl?: string;
  preferences?: string[];
  language?: string;
  livingInCitySinceYear?: number;
  memberSince?: string;
  customerId?: string;
  currentCityId?: string;
  businessHistory?: BusinessHistory[];
  favoriteEventIds?: string[];
  favoriteBusinessIds?: string[];
}

export interface BusinessUser {
  id: string;
  email: string;
  businessIds: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  needsReview: boolean;
  eventIds?: string[];
} 