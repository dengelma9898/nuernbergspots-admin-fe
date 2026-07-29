import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function AdventCalendarEntrySkeleton() {
  return (
    <Card className={cn(cardPreset, 'p-2 sm:p-4 flex flex-col justify-between h-full')}>
      <div className="relative h-48 w-full mb-4">
        <Skeleton className="w-full h-full rounded-t-lg" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4 rounded" />
            </CardTitle>
            <CardDescription className="mt-1">
              <Skeleton className="h-4 w-32 rounded" />
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-3 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function AdventCalendarEntryMobileSkeleton() {
  return (
    <Card className={cn(cardPreset, 'p-4')}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-20 rounded-full mb-2" />
        <Skeleton className="w-full h-40 rounded mb-2" />
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-3/4 rounded" />
        </div>
        <div className="space-y-1 mb-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <Skeleton className="h-3 w-32 rounded mb-2" />
        <Skeleton className="h-3 w-40 rounded mb-2" />
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

export function AdventCalendarManagementPageSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
        <Card className={cn(cardPreset, 'p-6 mb-6')}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            <Skeleton className="h-10 w-44 rounded-xl" />
            <Skeleton className="h-8 w-48 rounded" />
            <div className="w-full sm:w-auto sm:ml-auto">
              <Skeleton className="h-10 w-56 rounded-xl" />
            </div>
          </div>
        </Card>
        <Card className={cn(cardPreset, 'p-6 mb-6')}>
          <Skeleton className="h-10 w-full rounded-lg" />
        </Card>
        <div className="block md:hidden space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdventCalendarEntryMobileSkeleton key={index} />
          ))}
        </div>
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <AdventCalendarEntrySkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdventCalendarFormSkeleton() {
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
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
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
