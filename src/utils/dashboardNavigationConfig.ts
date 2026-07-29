import type { LucideIcon } from 'lucide-react';
import {
  User,
  Calendar,
  Store,
  Tags,
  Key,
  Tag,
  Users,
  BarChart,
  MessageSquare,
  Briefcase,
  MessageCircle,
  Handshake,
  Power,
  Shield,
  FileText,
  Package,
  Car,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react';

export interface DashboardNavItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
  gridClassName?: string;
}

export const dashboardNavigationSections: DashboardNavSection[] = [
  {
    title: 'Partner',
    items: [
      {
        icon: Store,
        title: 'Partner verwalten',
        description: 'Partner hinzufügen, bearbeiten und löschen',
        href: '/businesses',
      },
      {
        icon: Users,
        title: 'Business User verwalten',
        description: 'Business-User und deren Berechtigungen verwalten',
        href: '/business-users',
      },
      {
        icon: User,
        title: 'Geschäftsinhaber prüfen',
        description: 'Geschäftsinhaber warten auf Verifizierung',
        href: '/users/business/review',
      },
      {
        icon: Tags,
        title: 'Business Kategorien verwalten',
        description: 'Geschäftskategorien und deren Zuordnungen verwalten',
        href: '/categories',
      },
      {
        icon: Key,
        title: 'Keywords verwalten',
        description: 'Suchbegriffe und Tags für bessere Auffindbarkeit',
        href: '/keywords',
      },
      {
        icon: Calendar,
        title: 'Feature Flags verwalten',
        description: 'Feature Flags ein- und ausschalten',
        href: '/feature-flags',
      },
    ],
  },
  {
    title: 'Events',
    items: [
      {
        icon: Calendar,
        title: 'Events verwalten',
        description: 'Events und Veranstaltungen organisieren',
        href: '/events',
      },
      {
        icon: Tag,
        title: 'Event Kategorien verwalten',
        description: 'Event-Kategorien hinzufügen und bearbeiten',
        href: '/event-categories',
      },
    ],
  },
  {
    title: 'Kontaktanfragen',
    items: [
      {
        icon: MessageSquare,
        title: 'Partner',
        description: 'Offene Kontaktanfragen von Partnern verwalten',
        href: '/contacts?filter=partner',
      },
      {
        icon: MessageSquare,
        title: 'Nutzer',
        description: 'Offene Kontaktanfragen von Nutzern verwalten',
        href: '/contacts?filter=user',
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        icon: MessageSquare,
        title: 'News',
        description: 'Verwalte aktuelle News und Ankündigungen.',
        href: '/news-management',
      },
      {
        icon: Handshake,
        title: 'Mittmach Mittwoch',
        description: 'Aktionen, Ideen und Engagement für die Community am Mittwoch.',
        href: '/mittmach-mittwoch',
      },
      {
        icon: Calendar,
        title: 'Adventskalender',
        description: 'Adventskalender-Einträge erstellen und verwalten',
        href: '/advent-calendar',
      },
      {
        icon: Calendar,
        title: 'Ostereiersuche',
        description: 'Ostereier anlegen, Gewinner auslosen und Statistiken einsehen',
        href: '/easter-egg-hunt',
      },
      {
        icon: MessageCircle,
        title: 'Chatrooms',
        description: 'Chatrooms erstellen, bearbeiten und moderieren',
        href: '/chatrooms',
      },
      {
        icon: Briefcase,
        title: 'Jobs',
        description: 'Stellenangebote erstellen und verwalten',
        href: '/job-offers',
      },
      {
        icon: Tags,
        title: 'Job-Kategorien',
        description: 'Verwalten Sie die Kategorien für Stellenanzeigen',
        href: '/job-categories',
      },
      {
        icon: Car,
        title: 'Taxistandorte',
        description: 'Taxistandorte anlegen, bearbeiten und Klick-Statistiken einsehen',
        href: '/taxi-stands',
      },
    ],
  },
  {
    title: 'Kuratierte Inhalte',
    items: [
      {
        icon: MapPin,
        title: 'Kuratierte Spots',
        description: 'Spots anlegen, bearbeiten, freigeben und Medien hochladen (eigene API)',
        href: '/curated-spots',
      },
      {
        icon: Star,
        title: 'Community-Bewertungen (Spots)',
        description: 'Toggle, ob Nutzer kuratierte Spots einmalig bewerten dürfen',
        href: '/curated-spots/settings',
      },
      {
        icon: Sparkles,
        title: 'Spot-Keywords',
        description: 'Vokabular für Spot-Tags (getrennt von Partner-Keywords)',
        href: '/spot-keywords',
      },
    ],
  },
  {
    title: 'Analytics und Sonstiges',
    items: [
      {
        icon: BarChart,
        title: 'Analytics Dashboard',
        description: 'Detaillierte Einblicke in die Performance deiner Partner',
        href: '/analytics',
      },
      {
        icon: Users,
        title: 'User-Verwaltung',
        description: 'Übersicht aller registrierten Benutzer und Statistiken',
        href: '/users',
      },
      {
        icon: Users,
        title: 'Account-Management',
        description: 'Verwaltung und Bereinigung von anonymen Benutzeraccounts',
        href: '/account-management',
      },
      {
        icon: Shield,
        title: 'User Blockierung',
        description: 'User blockieren oder entsperren bei Verstößen gegen AGBs',
        href: '/users/block-management',
      },
      {
        icon: Power,
        title: 'Downtime-Verwaltung',
        description: 'Wartungsmodus aktivieren oder deaktivieren',
        href: '/downtime-management',
      },
      {
        icon: Package,
        title: 'App-Version-Verwaltung',
        description: 'Mindestversion der App setzen und verwalten',
        href: '/app-version-management',
      },
    ],
  },
  {
    title: 'Legal',
    gridClassName: 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    items: [
      {
        icon: FileText,
        title: 'Impressum',
        description: 'Impressums-Informationen verwalten und bearbeiten',
        href: '/legal/impressum/edit',
      },
      {
        icon: FileText,
        title: 'Datenschutzerklärung',
        description: 'Datenschutzerklärung verwalten und bearbeiten',
        href: '/legal/datenschutz/edit',
      },
      {
        icon: FileText,
        title: 'AGBs',
        description: 'Allgemeine Geschäftsbedingungen verwalten und bearbeiten',
        href: '/legal/agb/edit',
      },
    ],
  },
];
