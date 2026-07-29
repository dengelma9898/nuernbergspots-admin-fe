import React from 'react';
import { cn } from '@/lib/utils';

interface BrandIconProps {
  path: string;
  className?: string;
}

export function BrandIcon({ path, className }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      aria-hidden
      width={16}
      height={16}
    >
      <path fill="currentColor" d={path} />
    </svg>
  );
}
