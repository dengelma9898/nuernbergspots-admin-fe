import type { LucideIcon } from 'lucide-react';
import { dashboardNavigationSections } from '@/utils/dashboardNavigationConfig';

export interface CommandPaletteItem {
  id: string;
  title: string;
  description: string;
  href: string;
  section: string;
  icon?: LucideIcon;
  keywords?: string[];
}

export const commandPaletteItems: CommandPaletteItem[] = [
  ...dashboardNavigationSections.flatMap(section =>
    section.items.map(item => ({
      id: item.href,
      title: item.title,
      description: item.description,
      href: item.href,
      section: section.title,
      icon: item.icon,
      keywords: [section.title, item.title, item.description],
    }))
  ),
  {
    id: '/profile',
    title: 'Profil',
    description: 'Eigenes Admin-Profil bearbeiten',
    href: '/profile',
    section: 'Account',
    keywords: ['profile', 'account', 'einstellungen'],
  },
  {
    id: '/create-event',
    title: 'Event erstellen',
    description: 'Neues Event anlegen',
    href: '/create-event',
    section: 'Events',
    keywords: ['event', 'neu', 'create'],
  },
  {
    id: '/create-business',
    title: 'Partner anlegen',
    description: 'Neuen Partner erstellen',
    href: '/create-business',
    section: 'Partner',
    keywords: ['business', 'partner', 'neu'],
  },
];

export function filterCommandPaletteItems(query: string): CommandPaletteItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return commandPaletteItems;
  }

  return commandPaletteItems.filter(item => {
    const haystack = [item.title, item.description, item.section, ...(item.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
