import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <div className={cn(cardPreset, 'p-6 mb-8')}>
          <div className="flex items-center gap-4">
            <Skeleton className="bg-muted h-10 w-48 rounded-lg" />
            <Skeleton className="bg-muted h-8 w-40 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={cn(cardPreset)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Skeleton className="bg-muted h-6 w-48 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="bg-muted h-6 w-20 rounded-lg" />
                  <Skeleton className="bg-muted h-6 w-24 rounded-lg" />
                  <Skeleton className="bg-muted h-6 w-28 rounded-lg" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="bg-muted h-4 w-12 rounded" />
                <Skeleton className="bg-muted h-6 w-3/4 rounded" />
              </div>

              <div className="space-y-2">
                <Skeleton className="bg-muted h-4 w-20 rounded" />
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-full rounded" />
                  <Skeleton className="bg-muted h-4 w-5/6 rounded" />
                  <Skeleton className="bg-muted h-4 w-3/4 rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="bg-muted h-4 w-20 rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton className="bg-muted h-4 w-4 rounded" />
                      <Skeleton className="bg-muted h-4 w-32 rounded" />
                      <Skeleton className="bg-muted h-4 w-24 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="bg-muted h-4 w-16 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="bg-muted h-4 w-4 rounded" />
                  <Skeleton className="bg-muted h-4 w-64 rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="bg-muted h-4 w-12 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="bg-muted h-4 w-4 rounded" />
                  <Skeleton className="bg-muted h-4 w-20 rounded" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="bg-muted h-5 w-10 rounded-full" />
                  <Skeleton className="bg-muted h-4 w-32 rounded" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="bg-muted h-5 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="bg-muted h-4 w-40 rounded" />
                    <Skeleton className="bg-muted h-3 w-56 rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="bg-muted h-4 w-20 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="bg-muted h-4 w-4 rounded" />
                  <Skeleton className="bg-muted h-4 w-24 rounded" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="bg-muted h-4 w-36 rounded" />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="bg-muted h-4 w-16 rounded" />
                    <Skeleton className="bg-muted h-4 w-40 rounded ml-2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="bg-muted h-4 w-16 rounded" />
                    <Skeleton className="bg-muted h-4 w-32 rounded ml-2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="bg-muted h-4 w-16 rounded" />
                    <Skeleton className="bg-muted h-4 w-48 rounded ml-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="bg-muted h-4 w-24 rounded" />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="bg-muted h-4 w-20 rounded" />
                    <Skeleton className="bg-muted h-4 w-32 rounded ml-2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="bg-muted h-4 w-20 rounded" />
                    <Skeleton className="bg-muted h-4 w-36 rounded ml-2" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="bg-muted h-4 w-20 rounded" />
                    <Skeleton className="bg-muted h-4 w-28 rounded ml-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(cardPreset)}>
            <CardHeader>
              <Skeleton className="bg-muted h-6 w-16 rounded" />
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Skeleton className="bg-muted h-4 w-20 rounded mb-2" />
                <Skeleton className="bg-muted h-48 w-48 rounded-lg mx-auto" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="bg-muted h-48 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Skeleton className="bg-muted h-10 w-20 rounded-lg" />
          <Skeleton className="bg-muted h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
