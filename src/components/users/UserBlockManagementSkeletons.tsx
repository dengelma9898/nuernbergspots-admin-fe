import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function UserBlockManagementCardSkeleton() {
  return (
    <Card className={cn(cardPreset, 'p-4 md:p-6')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded-xl" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>
    </Card>
  );
}

export function UserBlockManagementTableSkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={`skeleton-desktop-${i}`} className="border-border hover:bg-muted/50">
          <TableCell>
            <Skeleton className="h-4 w-48 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-24 rounded-xl" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-28 rounded-xl" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function UserBlockManagementTableHeaderSkeleton() {
  return <Skeleton className="h-6 w-48 rounded" />;
}
