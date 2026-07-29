import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { cardPreset } from '@/lib/designTokens';

export function TaxiStandCardSkeleton() {
  return (
    <Card className={cn(cardPreset, 'p-2 sm:p-4 flex flex-col justify-between h-full')}>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded mt-1" />
      </div>
      <div className="px-4 flex-grow">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
        <Skeleton className="h-4 w-32 rounded" />
      </div>
      <div className="flex justify-between items-center p-4 pt-0">
        <Skeleton className="h-3 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

export function TaxiStandMobileSkeleton() {
  return (
    <Card className={cn(cardPreset, 'p-4')}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-40 rounded mb-2" />
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}
