export enum ContactRequestType {
  GENERAL = 'GENERAL',
  FEEDBACK = 'FEEDBACK',
  BUSINESS_CLAIM = 'BUSINESS_CLAIM',
  BUSINESS_REQUEST = 'BUSINESS_REQUEST'
}

export interface ContactMessage {
  userId: string;
  message: string;
  createdAt: string;
  isAdminResponse: boolean;
}

export interface ContactRequest {
  id: string;
  type: ContactRequestType;
  message: string;
  businessId?: string;
  userId?: string;
  messages: ContactMessage[];
  createdAt: string;
  updatedAt: string;
  isProcessed: boolean;
  responded: boolean;
}
