import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function CategoryListMobileSkeleton() {
  return (
    <Card className={cn(cardPreset, 'p-4 sm:p-6')}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-6 w-32 rounded flex-1" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-4 w-3/4 rounded mb-3" />
      <div className="flex flex-wrap gap-1 mb-3">
        {[...Array(3)].map((_, j) => (
          <Skeleton key={j} className="h-6 w-16 rounded-xl" />
        ))}
      </div>
      <div className="mb-4 space-y-1">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-28 rounded" />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Skeleton className="h-8 w-full sm:flex-1 rounded-xl" />
        <Skeleton className="h-8 w-full sm:flex-1 rounded-xl" />
      </div>
    </Card>
  );
}

export function CategoryListMobileSkeletons() {
  return (
    <motion.div
      className="block md:hidden space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {[...Array(4)].map((_, i) => (
        <motion.div key={i} variants={fadeInUp}>
          <CategoryListMobileSkeleton />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CategoryListTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className="border-secondary hover:bg-muted/50">
          <TableCell>
            <Skeleton className="h-4 w-24 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-6 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32 rounded" />
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {[...Array(2)].map((_, j) => (
                <Skeleton key={j} className="h-5 w-12 rounded-xl" />
              ))}
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function CategoryListTableSkeletonWrapper() {
  return (
    <Card className={cn(cardPreset, 'overflow-hidden')}>
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow className="border-secondary hover:bg-muted/50">
            <TableHead className="text-foreground font-semibold">Name</TableHead>
            <TableHead className="text-foreground font-semibold">Icon</TableHead>
            <TableHead className="text-foreground font-semibold">Beschreibung</TableHead>
            <TableHead className="text-foreground font-semibold">Keywords</TableHead>
            <TableHead className="text-foreground font-semibold">Erstellt am</TableHead>
            <TableHead className="text-foreground font-semibold">Aktualisiert am</TableHead>
            <TableHead className="text-foreground font-semibold w-[100px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <CategoryListTableSkeleton />
        </TableBody>
      </Table>
    </Card>
  );
}
