export interface ContactData {
  person?: string;
  email: string;
  phone?: string;
}

export interface SocialMedia {
  linkedin?: string | null;
  xing?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface JobOffer {
  id: string;
  title: string;
  companyLogo: string;
  generalDescription: string;
  neededProfile: string;
  tasks: string[];
  benefits: string[];
  images: string[];
  location: Location;
  typeOfEmployment: string;
  additionalNotesForTypeOfEmployment?: string | null;
  homeOffice: boolean;
  additionalNotesHomeOffice?: string | null;
  wage?: string | null;
  startDate: string;
  contactData: ContactData;
  link: string;
  socialMedia?: SocialMedia | null;
  isHighlight: boolean;
  businessIds?: string[];
  jobOfferCategoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferCreation {
  title: string;
  companyLogo: string;
  generalDescription: string;
  neededProfile: string;
  tasks: string[];
  benefits: string[];
  images: string[];
  location: Location;
  typeOfEmployment: string;
  additionalNotesForTypeOfEmployment?: string | null;
  homeOffice: boolean;
  additionalNotesHomeOffice?: string | null;
  wage?: string | null;
  startDate: string;
  contactData: ContactData;
  link: string;
  socialMedia?: SocialMedia | null;
  isHighlight: boolean;
  businessIds?: string[];
  jobOfferCategoryId: string;
} 