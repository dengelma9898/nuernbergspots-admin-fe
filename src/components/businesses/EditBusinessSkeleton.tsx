import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export const EditBusinessSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <div className={cn(cardPreset, 'p-6 mb-8')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-8 w-48 rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="h-6 w-40 rounded mb-2" />
                <Skeleton className="h-4 w-64 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    {index === 3 && <Skeleton className="h-4 w-3/4 rounded" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="h-6 w-40 rounded mb-2" />
                <Skeleton className="h-4 w-48 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="h-6 w-32 rounded mb-2" />
                <Skeleton className="h-4 w-40 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }, (_, index) => (
                      <Skeleton key={index} className="h-6 w-20 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }, (_, index) => (
                      <Skeleton key={index} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="h-6 w-20 rounded mb-2" />
                <Skeleton className="h-4 w-48 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-5 w-12 rounded mb-2" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-32 h-32 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-32 rounded" />
                        <Skeleton className="h-3 w-40 rounded" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 rounded mb-2" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} className="aspect-video rounded-lg" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-48 rounded mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="h-6 w-32 rounded mb-2" />
                <Skeleton className="h-4 w-64 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                {Array.from({ length: 2 }, (_, index) => (
                  <div key={index} className={cn(cardPreset, 'p-4 space-y-4')}>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-20 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full rounded" />
                      <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                          <Skeleton key={dayIndex} className="h-6 w-16 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div className={cn(cardPreset, 'p-4 space-y-4')}>
                  <Skeleton className="h-5 w-32 rounded" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 7 }, (_, dayIndex) => (
                        <Skeleton key={dayIndex} className="h-6 w-16 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="h-6 w-48 rounded mb-2" />
                <Skeleton className="h-4 w-56 rounded" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-24 w-full rounded" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-28 rounded mb-2" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="aspect-video rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <Skeleton className="h-10 w-24 rounded" />
              <Skeleton className="h-10 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
