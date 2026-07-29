import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function EasterEggFormSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className={cn(cardPreset)}>
            <CardHeader>
              <Skeleton className="h-10 w-44 rounded-xl mb-2" />
              <Skeleton className="h-6 w-64 rounded" />
            </CardHeader>
          </Card>
          <Card className={cn(cardPreset)}>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
