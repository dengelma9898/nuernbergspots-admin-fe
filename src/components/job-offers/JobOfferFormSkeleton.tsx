import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function JobOfferFormSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <Card className={cn(cardPreset, 'p-4 sm:p-6 mb-6 sm:mb-8')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-8 w-64 rounded" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className={cn(cardPreset, 'overflow-hidden')}>
            <div className="p-4 sm:p-6 border-b border-secondary">
              <Skeleton className="h-6 w-48 rounded" />
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-10 rounded-full" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded" />
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded" />
                    <Skeleton className="h-10 w-10 rounded" />
                  </div>
                ))}
                <Skeleton className="h-10 w-40 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded" />
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded" />
                    <Skeleton className="h-10 w-10 rounded" />
                  </div>
                ))}
                <Skeleton className="h-10 w-36 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          </Card>

          <Card className={cn(cardPreset, 'overflow-hidden')}>
            <div className="p-4 sm:p-6 border-b border-secondary">
              <Skeleton className="h-6 w-16 rounded" />
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-56 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-10 rounded-full" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          </Card>

          <Card className={cn(cardPreset, 'overflow-hidden')}>
            <div className="p-4 sm:p-6 border-b border-secondary">
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              ))}
            </div>
          </Card>

          <Card className={cn(cardPreset, 'overflow-hidden')}>
            <div className="p-4 sm:p-6 border-b border-secondary">
              <Skeleton className="h-6 w-28 rounded" />
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-4 mt-2 rounded" />
                    <Skeleton className="h-10 flex-1 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className={cn(cardPreset, 'overflow-hidden')}>
            <div className="p-4 sm:p-6 border-b border-secondary">
              <Skeleton className="h-6 w-12 rounded" />
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}
