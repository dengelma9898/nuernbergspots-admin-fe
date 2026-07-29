import { Skeleton } from '@/components/ui/skeleton';

import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function ChatMessageSkeleton({ isOwnMessage = false }: { isOwnMessage?: boolean }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-[70%]">
        <div className={cn(cardPreset, 'rounded-lg p-3')}>
          {!isOwnMessage && <Skeleton className="h-4 w-20 mb-1 rounded" />}
          <div className="space-y-1">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-6 w-6 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessagesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ChatMessageSkeleton key={index} isOwnMessage={index % 3 === 0} />
      ))}
    </div>
  );
}
