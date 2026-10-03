import React from 'react';
import {
  BadgeCheck,
  Calendar,
  CalendarPlus,
  CalendarX2,
  CheckSquare,
  FileQuestion,
  FileSpreadsheet,
  FilterX,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import {
  EventListEmptyStateAction,
  EventListEmptyStateData,
  EventListEmptyStateVariant,
} from '@/utils/eventListUtils';

export interface EventListEmptyStateProps {
  emptyState: EventListEmptyStateData;
  onResetAllFilters?: () => void;
  onClearSearch?: () => void;
  onClearTimeFilter?: () => void;
  onShowAllEvents?: () => void;
  onExitSelectionMode?: () => void;
  onGoToFirstPage?: () => void;
  onCreateEvent?: () => void;
  onImportCsv?: () => void;
  className?: string;
}

function getEmptyStateIcon(variant: EventListEmptyStateVariant) {
  const iconClasses = 'h-10 w-10 text-muted-foreground mx-auto';
  switch (variant) {
    case 'selection-no-selectable':
      return <CheckSquare className={iconClasses} aria-hidden="true" />;
    case 'page-out-of-range':
      return <FileQuestion className={iconClasses} aria-hidden="true" />;
    case 'pending-clear':
      return <BadgeCheck className={cn(iconClasses, 'text-emerald-500')} aria-hidden="true" />;
    case 'period':
      return <CalendarX2 className={iconClasses} aria-hidden="true" />;
    case 'filtered':
      return <FilterX className={iconClasses} aria-hidden="true" />;
    case 'empty':
    default:
      return <CalendarPlus className={iconClasses} aria-hidden="true" />;
  }
}

export const EventListEmptyState: React.FC<EventListEmptyStateProps> = ({
  emptyState,
  onResetAllFilters,
  onClearSearch,
  onClearTimeFilter,
  onShowAllEvents,
  onExitSelectionMode,
  onGoToFirstPage,
  onCreateEvent,
  onImportCsv,
  className,
}) => {
  const renderAction = (action: EventListEmptyStateAction) => {
    switch (action) {
      case 'reset-all-filters':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onResetAllFilters}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px] gap-2')}
          >
            <RotateCcw className="h-4 w-4" />
            Filter zurücksetzen
          </LoadingButton>
        );
      case 'clear-search':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onClearSearch}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px]')}
          >
            Suche löschen
          </LoadingButton>
        );
      case 'clear-time-filter':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onClearTimeFilter}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px] gap-2')}
          >
            <Calendar className="h-4 w-4" />
            Anderen Zeitraum wählen
          </LoadingButton>
        );
      case 'show-all-events':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onShowAllEvents}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px]')}
          >
            Alle Events anzeigen
          </LoadingButton>
        );
      case 'exit-selection-mode':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onExitSelectionMode}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px]')}
          >
            Auswahlmodus beenden
          </LoadingButton>
        );
      case 'go-to-first-page':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onGoToFirstPage}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px]')}
          >
            Zu Seite 1
          </LoadingButton>
        );
      case 'create-event':
        return (
          <LoadingButton
            key={action}
            onClick={onCreateEvent}
            className="w-full sm:w-auto min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Event hinzufügen
          </LoadingButton>
        );
      case 'import-csv':
        return (
          <LoadingButton
            key={action}
            variant="outline"
            onClick={onImportCsv}
            className={cn(buttonPreset, 'w-full sm:w-auto min-h-[44px] gap-2')}
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV Import
          </LoadingButton>
        );
      default:
        return null;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(cardPreset, 'p-8 text-center space-y-4', className)}
    >
      <div className="flex justify-center">{getEmptyStateIcon(emptyState.variant)}</div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{emptyState.title}</h2>
        {emptyState.description ? (
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">{emptyState.description}</p>
        ) : null}
      </div>
      {emptyState.actions.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          {emptyState.actions.map(action => renderAction(action))}
        </div>
      ) : null}
    </div>
  );
};
