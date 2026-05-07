import ApiClient from './api-client';
import { useAuth } from '../contexts/AuthContext';
import { useMemo } from 'react';

/** Jest nutzt process.env (setupTests); Vite setzt process.env.VITE_API_URL per define in vite.config.ts. */
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export function useApi() {
  const { getToken } = useAuth();

  return useMemo(
    () =>
      new ApiClient({
        baseUrl: API_BASE_URL,
        getToken,
      }),
    [getToken]
  );
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
  businessEventsSettings: '/businesses/events/settings',
  businessCategories: '/business-categories',
  cities: '/cities',
  events: '/events',
  eventCategories: '/event-categories',
  keywords: '/keywords',
  contacts: '/contacts',
  news: '/news',
  chatrooms: '/chatrooms',
  chatroomById: (id: string) => `/chatrooms/${id}`,
  chatroomParticipants: (id: string) => `/chatrooms/${id}/participants`,
  chatroomMessages: (id: string) => `/chatrooms/${id}/messages`,
  specialPolls: (options?: { highlighted?: boolean }) => {
    const base = '/special-polls';
    return options?.highlighted === true ? `${base}?highlighted=true` : base;
  },
  specialPollById: (id: string) => `/special-polls/${id}`,
  specialPollHighlight: (id: string) => `/special-polls/${id}/highlight`,
  specialPollResponseUpvote: (pollId: string, responseId: string) =>
    `/special-polls/${pollId}/responses/${encodeURIComponent(responseId)}/upvote`,
  specialPollResponsesMe: (pollId: string) => `/special-polls/${pollId}/responses/me`,
  easterEggHunt: '/easter-egg-hunt',
  downtime: '/downtime',
  appVersions: {
    minimumVersion: '/app-versions/admin/minimum-version',
  },
  curatedSpots: '/curated-spots',
  curatedSpotsAdmin: '/curated-spots/admin',
  curatedSpotAdminById: (id: string) => `/curated-spots/admin/${id}`,
  curatedSpotImages: (id: string) => `/curated-spots/${id}/images`,
  curatedSpotVideo: (id: string) => `/curated-spots/${id}/video`,
  spotKeywords: '/spot-keywords',
  spotKeywordById: (id: string) => `/spot-keywords/${encodeURIComponent(id)}`,
  spotKeywordsSuggest: (q: string, limit?: number) => {
    const params = new URLSearchParams({ q });
    if (limit != null) {
      params.set('limit', String(limit));
    }
    return `/spot-keywords/suggest?${params.toString()}`;
  },
} as const;

// Re-export models
export type { UserProfile, BusinessUser, UserType, BusinessHistory, User } from '../models/users';
