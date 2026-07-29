import React from 'react';

interface NewsMonthHeaderProps {
  label: string;
}

export function NewsMonthHeader({ label }: NewsMonthHeaderProps) {
  return (
    <div className="sticky top-0 z-20 py-3 mb-2">
      <h2 className="text-base md:text-lg font-semibold text-muted-foreground capitalize">
        {label}
      </h2>
    </div>
  );
}
