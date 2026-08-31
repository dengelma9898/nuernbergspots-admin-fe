import { ChevronLeft, ChevronRight } from 'lucide-react';

import { LoadingButton } from '@/components/LoadingButton';
import { PaginationMeta } from '@/models/events-list';
import { buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventListPaginationProps {
  meta: PaginationMeta;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function EventListPagination({
  meta,
  loading = false,
  onPageChange,
}: EventListPaginationProps) {
  if (meta.totalPages <= 1) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        {meta.total} Event{meta.total === 1 ? '' : 's'}
      </div>
    );
  }

  const rangeStart = (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4"
      data-testid="event-list-pagination"
    >
      <p className="text-sm text-muted-foreground">
        {rangeStart}–{rangeEnd} von {meta.total} Events
      </p>
      <div className="flex items-center gap-2">
        <LoadingButton
          variant="outline"
          size="sm"
          disabled={!meta.hasPreviousPage || loading}
          onClick={() => onPageChange(meta.page - 1)}
          className={cn(buttonPreset, 'gap-1')}
          aria-label="Vorherige Seite"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </LoadingButton>
        <span className="text-sm text-muted-foreground min-w-[5rem] text-center">
          Seite {meta.page} / {meta.totalPages}
        </span>
        <LoadingButton
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage || loading}
          onClick={() => onPageChange(meta.page + 1)}
          className={cn(buttonPreset, 'gap-1')}
          aria-label="Nächste Seite"
        >
          Weiter
          <ChevronRight className="h-4 w-4" />
        </LoadingButton>
      </div>
    </div>
  );
}
