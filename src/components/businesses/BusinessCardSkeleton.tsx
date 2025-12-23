import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { glassCard } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

export const BusinessCardSkeleton: React.FC = () => (
  <Card className={cn(glassCard, 'overflow-hidden')}>
    {/* Image Skeleton */}
    <div className="relative h-48 w-full bg-muted">
      <Skeleton className="w-full h-full rounded-none" />
      {/* Image Counter Badge Skeleton */}
      <div className="absolute top-3 right-3">
        <Skeleton className="h-6 w-12 rounded-xl" />
      </div>
      {/* Promoted Badge Skeleton */}
      <div className="absolute top-3 left-3">
        <Skeleton className="h-6 w-20 rounded-xl" />
      </div>
    </div>

    <div className="p-4 sm:p-6">
      {/* Header Row Skeleton */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Logo Skeleton */}
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 min-w-0">
            {/* Name Skeleton */}
            <Skeleton className="h-6 w-3/4 rounded mb-2" />
            {/* Categories Skeleton */}
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
        {/* Status Badge Skeleton */}
        <Skeleton className="h-6 w-16 rounded-xl" />
      </div>

      {/* Description Skeleton */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>

      {/* Contact Info Skeletons */}
      <div className="space-y-2 mb-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center">
            <Skeleton className="h-4 w-4 rounded mr-2" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex justify-between items-center pt-4 border-t border-secondary">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  </Card>
);

