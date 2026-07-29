import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function AppVersionManagementSkeleton() {
  return (
    <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
      <Card className={cn(cardPreset, 'p-4 sm:p-6 mb-6')}>
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-64 rounded" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </Card>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className={cn(cardPreset)}>
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
