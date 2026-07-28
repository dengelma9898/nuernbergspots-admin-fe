import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function EventListSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
        <div className={listSectionPreset}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
            <Skeleton className="bg-muted h-10 w-full sm:w-48 rounded-lg" />
            <Skeleton className="bg-muted h-8 w-32 rounded" />
            <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
              <Skeleton className="bg-muted h-10 w-full sm:w-32 rounded-lg" />
              <Skeleton className="bg-muted h-10 w-full sm:w-32 rounded-lg" />
              <Skeleton className="bg-muted h-10 w-full sm:w-40 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <Skeleton className="bg-muted h-10 flex-1 rounded-lg" />
            <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
            <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
            <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
            <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
            <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
          </div>
        </div>

        <div className="space-y-8">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <Skeleton className="bg-muted h-8 w-48 mb-6 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(6)].map((_, cardIndex) => (
                  <Card key={cardIndex} className={cn(cardPreset, 'flex flex-col')}>
                    <Skeleton className="bg-muted h-48 w-full rounded-t-lg" />
                    <div className="p-6">
                      <Skeleton className="bg-muted h-6 w-40 rounded mb-2" />
                      <Skeleton className="bg-muted h-4 w-32 rounded" />
                    </div>
                    <div className="px-6 pb-6 flex-grow">
                      <Skeleton className="bg-muted h-4 w-full rounded mb-2" />
                      <Skeleton className="bg-muted h-4 w-3/4 rounded" />
                    </div>
                    <div className="px-6 pb-6">
                      <div className="flex justify-between items-center">
                        <Skeleton className="bg-muted h-3 w-24 rounded" />
                        <div className="flex gap-2">
                          <Skeleton className="bg-muted h-8 w-20 rounded-lg" />
                          <Skeleton className="bg-muted h-8 w-16 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
