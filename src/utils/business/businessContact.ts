import { Business } from '@/models/business';

export function cleanBusinessContact(contact: Business['contact']): Business['contact'] {
  return {
    email: contact.email || undefined,
    phoneNumber: contact.phoneNumber || undefined,
    website: contact.website || undefined,
    instagram: contact.instagram || undefined,
    facebook: contact.facebook || undefined,
    tiktok: contact.tiktok || undefined,
  };
}
