import ApiClient from './api-client';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile, BusinessUser, UserType, BusinessHistory } from '../models/users';
import { useMemo } from 'react';

// Hier die Backend-URL einfügen
const API_BASE_URL = 'http://localhost:3000';

export function useApi() {
  const { getToken } = useAuth();
  
  return useMemo(() => new ApiClient({
    baseUrl: API_BASE_URL,
    getToken,
  }), [getToken]);
}

export interface Business {
  id: string;
  name: string;
  description: string;
  // Weitere Business-Eigenschaften hier
}

export interface City {
  id: string;
  name: string;
  // Weitere City-Eigenschaften hier
}

// API-Endpoints
export const endpoints = {
  // User endpoints
  users: '/users',
  userProfile: (id: string) => `/users/${id}/profile`,
  businessUsers: '/users/business',
  businessUserById: (id: string) => `/users/business/${id}`,
  
  // Other endpoints
  businesses: '/businesses',
  businessCategories: '/business-categories',
  cities: '/cities',
  events: '/events',
  keywords: '/keywords',
  news: '/news',
} as const;

// Re-export models
export type { UserProfile, BusinessUser, UserType, BusinessHistory } from '../models/users'; 