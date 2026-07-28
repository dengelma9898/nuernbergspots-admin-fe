import type { ReactElement } from 'react';

import { MaterialIcon } from '@/components/ui/material-icon';

const ICON_ALIASES: Record<string, string> = {
  bakery: 'bakery_dining',
};

function pascalToSnakeCase(value: string): string {
  return value
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
}

export function resolveIconName(iconName: string): string {
  if (!iconName) {
    return 'storefront';
  }

  const normalized = iconName.includes('_') ? iconName : pascalToSnakeCase(iconName);
  return ICON_ALIASES[normalized] ?? normalized;
}

/** @deprecated Use resolveIconName — kept for tests referencing convertToIconName */
export function convertToIconName(snakeCase: string): string {
  return resolveIconName(snakeCase);
}

export function getIconComponent(iconName: string): ReactElement {
  return <MaterialIcon icon={resolveIconName(iconName)} size="medium" className="text-xl" />;
}
