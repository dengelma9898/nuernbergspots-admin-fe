import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Briefcase,
  Calendar,
  Car,
  FileText,
  Handshake,
  Home,
  Key,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Power,
  Shield,
  Sparkles,
  Star,
  Store,
  Tag,
  Tags,
  Users,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Exakter Match oder Prefix für Unterrouten */
  match?: 'exact' | 'prefix';
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: 'Übersicht',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: Home, match: 'exact' }],
  },
  {
    title: 'Partner',
    items: [
      { label: 'Partner', href: '/businesses', icon: Store },
      { label: 'Business User', href: '/business-users', icon: Users },
      { label: 'Inhaber prüfen', href: '/users/business/review', icon: Users },
      { label: 'Kategorien', href: '/categories', icon: Tags },
      { label: 'Keywords', href: '/keywords', icon: Key },
      { label: 'Feature Flags', href: '/feature-flags', icon: Calendar },
    ],
  },
  {
    title: 'Events',
    items: [
      { label: 'Events', href: '/events', icon: Calendar },
      { label: 'Event-Kategorien', href: '/event-categories', icon: Tag },
    ],
  },
  {
    title: 'Kontakt',
    items: [{ label: 'Kontaktanfragen', href: '/contacts', icon: MessageSquare }],
  },
  {
    title: 'Community',
    items: [
      { label: 'News', href: '/news-management', icon: MessageSquare },
      { label: 'Mittmach Mittwoch', href: '/mittmach-mittwoch', icon: Handshake },
      { label: 'Adventskalender', href: '/advent-calendar', icon: Calendar },
      { label: 'Ostereiersuche', href: '/easter-egg-hunt', icon: Calendar },
      { label: 'Chatrooms', href: '/chatrooms', icon: MessageCircle },
      { label: 'Jobs', href: '/job-offers', icon: Briefcase },
      { label: 'Job-Kategorien', href: '/job-categories', icon: Tags },
      { label: 'Taxistandorte', href: '/taxi-stands', icon: Car },
    ],
  },
  {
    title: 'Kuratierte Inhalte',
    items: [
      { label: 'Kuratierte Spots', href: '/curated-spots', icon: MapPin },
      { label: 'Spot-Bewertungen', href: '/curated-spots/settings', icon: Star },
      { label: 'Spot-Keywords', href: '/spot-keywords', icon: Sparkles },
    ],
  },
  {
    title: 'Verwaltung',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart },
      { label: 'User', href: '/users', icon: Users },
      { label: 'Accounts', href: '/account-management', icon: Users },
      { label: 'Blockierung', href: '/users/block-management', icon: Shield },
      { label: 'Downtime', href: '/downtime-management', icon: Power },
      { label: 'App-Version', href: '/app-version-management', icon: Package },
    ],
  },
  {
    title: 'Legal',
    items: [{ label: 'Dokumente', href: '/legal', icon: FileText }],
  },
];

/** Segment → Anzeigename für Breadcrumbs */
export const routeSegmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  businesses: 'Partner',
  categories: 'Kategorien',
  events: 'Events',
  import: 'Import',
  csv: 'CSV',
  keywords: 'Keywords',
  'create-event': 'Event erstellen',
  'create-business': 'Partner erstellen',
  users: 'User',
  business: 'Business',
  review: 'Prüfung',
  'business-users': 'Business User',
  'block-management': 'Blockierung',
  contacts: 'Kontaktanfragen',
  'event-categories': 'Event-Kategorien',
  analytics: 'Analytics',
  profile: 'Profil',
  'news-management': 'News',
  'job-offers': 'Jobs',
  create: 'Erstellen',
  'job-categories': 'Job-Kategorien',
  chatrooms: 'Chatrooms',
  messages: 'Nachrichten',
  'mittmach-mittwoch': 'Mittmach Mittwoch',
  'account-management': 'Accounts',
  'downtime-management': 'Downtime',
  'advent-calendar': 'Adventskalender',
  new: 'Neu',
  participants: 'Teilnehmer',
  legal: 'Legal',
  edit: 'Bearbeiten',
  'app-version-management': 'App-Version',
  'feature-flags': 'Feature Flags',
  'easter-egg-hunt': 'Ostereiersuche',
  'taxi-stands': 'Taxistandorte',
  'curated-spots': 'Kuratierte Spots',
  settings: 'Einstellungen',
  'spot-keywords': 'Spot-Keywords',
  'image-editor': 'Bild-Editor',
  copy: 'Kopieren',
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  agb: 'AGBs',
};

export function isNavItemActive(pathname: string, item: AdminNavItem): boolean {
  if (item.match === 'exact') {
    return pathname === item.href || (item.href === '/dashboard' && pathname === '/');
  }

  if (item.href === '/curated-spots') {
    return (
      pathname === '/curated-spots' ||
      (pathname.startsWith('/curated-spots/') && !pathname.startsWith('/curated-spots/settings'))
    );
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function buildBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  if (pathname === '/' || pathname === '/dashboard') {
    return [{ label: 'Dashboard' }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];

  let path = '';
  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    const label =
      routeSegmentLabels[segment] ??
      (/^[a-f0-9-]{20,}$/i.test(segment) || /^\d+$/.test(segment) ? 'Detail' : segment);

    crumbs.push({
      label,
      href: isLast ? undefined : path,
    });
  });

  return crumbs;
}
