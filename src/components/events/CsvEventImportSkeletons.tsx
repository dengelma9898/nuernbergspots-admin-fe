import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function CsvEventImportingSkeleton() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <Card className={cn(cardPreset, 'mb-6')}>
        <CardHeader>
          <Skeleton className="bg-muted h-6 w-48 rounded" />
          <Skeleton className="bg-muted h-4 w-64 mt-2 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="bg-muted h-24 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3 mt-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="bg-muted h-14 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
