import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function SpecialPollDetailSkeleton() {
  return (
    <motion.div
      className="space-y-4"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <Card className={cn(cardPreset)}>
        <CardHeader>
          <div className="flex justify-between gap-3">
            <Skeleton className="h-7 flex-1 max-w-md rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40 rounded mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
