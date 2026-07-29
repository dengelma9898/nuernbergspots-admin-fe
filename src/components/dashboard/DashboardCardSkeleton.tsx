import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPresetHover } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface DashboardCardSkeletonProps {
  icon: LucideIcon;
  titleText: string;
}

export function DashboardCardSkeleton({ icon: Icon, titleText }: DashboardCardSkeletonProps) {
  return (
    <Card className={cn(cardPresetHover, 'p-4')}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-5 w-5 text-foreground" />
          <span className="text-sm sm:text-base font-semibold text-foreground">{titleText}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="shrink-0">
            <Skeleton className="w-20 sm:w-24 h-8 rounded-xl" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-3/4 h-3 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
