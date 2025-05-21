import React from 'react';
import { cn } from '@/lib/utils';

interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: string;
  size?: 'small' | 'medium' | 'large';
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
}

const sizeMap = {
  small: 'text-lg',
  medium: 'text-2xl',
  large: 'text-3xl',
};

export function MaterialIcon({
  icon,
  size = 'medium',
  filled = true,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className,
  ...props
}: MaterialIconProps) {
  return (
    <span
      className={cn(
        'material-symbols-rounded',
        sizeMap[size],
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
      {...props}
    >
      {icon}
    </span>
  );
} 