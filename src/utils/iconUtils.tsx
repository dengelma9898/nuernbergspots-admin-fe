import React from 'react';
import * as Icons from '@mui/icons-material';
import { Icon } from '@mui/material';

export function convertToIconName(snakeCase: string): string {
  if (!snakeCase) return 'Storefront';
  
  // Spezielle Konvertierungsregeln
  const specialCases: Record<string, string> = {
    'bakery': 'BakeryDining',
    // Hier können weitere spezielle Fälle hinzugefügt werden
  };

  if (specialCases[snakeCase]) {
    return specialCases[snakeCase];
  }
  
  return snakeCase
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function getIconComponent(iconName: string): JSX.Element {
  const convertedIconName = convertToIconName(iconName);
  const IconComponent = (Icons as any)[convertedIconName] || Icons.Storefront;
  return <Icon component={IconComponent} className="text-xl" />;
} 