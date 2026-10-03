import { RotateCcw, X } from 'lucide-react';
import { ActiveFilterChip, ActiveFilterType } from '@/utils/eventListUtils';
import { badgePreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export interface EventListActiveFiltersProps {
  chips: ActiveFilterChip[];
  onClearFilter: (type: ActiveFilterType) => void;
  onResetAll: () => void;
  className?: string;
}

export function EventListActiveFilters({
  chips,
  onClearFilter,
  onResetAll,
  className,
}: EventListActiveFiltersProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 pt-1', className)}
      aria-label="Aktive Filter"
    >
      <span className="text-xs text-muted-foreground mr-1">Aktive Filter:</span>
      {chips.map(chip => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onClearFilter(chip.id)}
          className={cn(
            badgePreset,
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs hover:bg-secondary/15 hover:border-secondary transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label={`Filter ${chip.label} entfernen`}
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </button>
      ))}
      <button
        type="button"
        onClick={onResetAll}
        className={cn(
          buttonPreset,
          'text-xs text-muted-foreground hover:text-foreground px-2 py-1 h-auto inline-flex items-center gap-1 cursor-pointer'
        )}
        aria-label="Alle Filter zurücksetzen"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Alle zurücksetzen</span>
      </button>
    </div>
  );
}
