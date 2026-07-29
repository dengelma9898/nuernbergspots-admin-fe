import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function ChatroomSkeleton() {
  return (
    <Card className={cn(cardPreset, 'rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full')}>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-3/4 rounded" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 mt-1 rounded" />
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Skeleton className="aspect-video rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-5/6 rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-secondary mt-2">
        <Skeleton className="h-3 w-32 rounded mx-auto" />
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}
