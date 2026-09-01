import { describe, expect, it } from 'vitest';

import { buildBreadcrumbs, isNavItemActive } from '@/lib/adminNavigation';

describe('adminNavigation', () => {
  it('marks dashboard as active for root path', () => {
    expect(
      isNavItemActive('/', {
        label: 'Dashboard',
        href: '/dashboard',
        icon: {} as never,
        match: 'exact',
      })
    ).toBe(true);
  });

  it('builds breadcrumbs for nested routes', () => {
    expect(buildBreadcrumbs('/events/0123456789abcdef01234567/copy')).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Events', href: '/events' },
      { label: 'Detail', href: '/events/0123456789abcdef01234567' },
      { label: 'Kopieren' },
    ]);
  });

  it('excludes curated-spots settings from curated-spots nav match', () => {
    expect(
      isNavItemActive('/curated-spots/settings', {
        label: 'Kuratierte Spots',
        href: '/curated-spots',
        icon: {} as never,
      })
    ).toBe(false);
  });
});
