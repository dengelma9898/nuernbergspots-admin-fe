import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from '@/components/motion';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, cardPresetHover } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AnalyticsOverviewCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  trendDescription?: string;
  isLoading?: boolean;
}

export function AnalyticsOverviewCard({
  icon: Icon,
  title,
  value,
  trend,
  description,
  trendDescription,
  isLoading,
}: AnalyticsOverviewCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(cardPresetHover, 'gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardHeader className="!px-4 !pt-4 !pb-2 border-b border-secondary gap-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn(cardPreset, 'p-2')}>
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
            </div>
            {trend !== undefined && !isLoading && (
              <div
                className={`flex items-center ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="!px-4 !py-4 gap-0">
          <div className="space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 rounded" />
                {description && <Skeleton className="h-4 w-32 rounded" />}
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
                {trendDescription && (
                  <p className="text-xs text-muted-foreground">{trendDescription}</p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
