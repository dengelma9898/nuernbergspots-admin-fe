import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

type NewsSkeletonBubbleProps = {
  type?: 'text' | 'image' | 'poll';
};

export const NewsSkeletonBubble: React.FC<NewsSkeletonBubbleProps> = ({ type = 'text' }) => {
  return (
    <Card className={cn(cardPreset, 'w-full')}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-16 rounded" />
        </div>

        {type === 'text' && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        )}

        {type === 'image' && (
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {[...Array(3)].map((_, idx) => (
                <Skeleton key={idx} className="w-24 h-24 rounded-xl" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
        )}

        {type === 'poll' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className={cn(cardPreset, 'flex justify-between items-center p-3')}>
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          {[...Array(2)].map((_, idx) => (
            <Skeleton key={idx} className="h-6 w-12 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
