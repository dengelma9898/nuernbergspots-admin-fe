import {
  CheckSquare,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  MoreVertical,
  Plus,
  RefreshCw,
  Square,
  Tags,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingButton } from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import { buttonPreset, moderationPendingBadgeClass } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventListHeaderProps {
  pendingAccess: boolean;
  pendingModerationCount: number;
  onFilterPending?: () => void;
  isSelectionMode: boolean;
  isAdminOrSuperAdmin: boolean;
  selectedCount: number;
  loading: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onOpenBulkCategory: () => void;
  onGenerateImage: () => void;
  onToggleSelectionMode: () => void;
  onManualRefresh: () => void;
  onNavigateCsvImport: () => void;
  onNavigateCreateEvent: () => void;
  onExportCsv: () => void;
}

export function EventListHeader({
  pendingAccess,
  pendingModerationCount,
  onFilterPending,
  isSelectionMode,
  isAdminOrSuperAdmin,
  selectedCount,
  loading,
  onSelectAll,
  onDeselectAll,
  onOpenBulkCategory,
  onGenerateImage,
  onToggleSelectionMode,
  onManualRefresh,
  onNavigateCsvImport,
  onNavigateCreateEvent,
  onExportCsv,
}: EventListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Events</h1>
      {pendingAccess && pendingModerationCount > 0 ? (
        onFilterPending ? (
          <Badge
            variant="outline"
            asChild
            className={cn(
              moderationPendingBadgeClass,
              'hover:bg-tertiary/20 cursor-pointer shrink-0 transition-colors'
            )}
          >
            <button
              type="button"
              onClick={onFilterPending}
              aria-label={`${pendingModerationCount} ausstehende Events filtern`}
            >
              {pendingModerationCount} ausstehend
            </button>
          </Badge>
        ) : (
          <Badge variant="outline" className={cn(moderationPendingBadgeClass, 'shrink-0')}>
            {pendingModerationCount} ausstehend
          </Badge>
        )
      ) : null}
      <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
        {isSelectionMode ? (
          <>
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
              <LoadingButton
                variant="outline"
                onClick={onSelectAll}
                className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
              >
                <CheckSquare className="h-4 w-4" />
                Alle auswählen
              </LoadingButton>
              <LoadingButton
                variant="outline"
                onClick={onDeselectAll}
                className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
              >
                <Square className="h-4 w-4" />
                Auswahl aufheben
              </LoadingButton>
              {isAdminOrSuperAdmin ? (
                <LoadingButton
                  variant="outline"
                  onClick={onOpenBulkCategory}
                  disabled={selectedCount === 0}
                  className={cn(buttonPreset, 'col-span-2 sm:col-auto w-full sm:w-auto gap-2')}
                >
                  <Tags className="h-4 w-4" />
                  Kategorie setzen ({selectedCount})
                </LoadingButton>
              ) : null}
            </div>
            <LoadingButton
              onClick={onGenerateImage}
              disabled={selectedCount === 0}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              title="Ausgewählte Events im Bild-Editor öffnen"
            >
              <ImageIcon className="h-4 w-4" />
              Social-Bild erstellen ({selectedCount})
            </LoadingButton>
            <LoadingButton
              variant="outline"
              onClick={onToggleSelectionMode}
              className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
            >
              <X className="h-4 w-4" />
              Abbrechen
            </LoadingButton>
          </>
        ) : (
          <>
            <LoadingButton
              variant="outline"
              onClick={onToggleSelectionMode}
              className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
              title="Mehrere Events für Bulk-Aktionen auswählen"
            >
              <CheckSquare className="h-4 w-4" />
              Mehrfachauswahl
            </LoadingButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <LoadingButton
                  variant="outline"
                  className={cn(buttonPreset, 'w-full sm:w-auto gap-2 min-h-[44px] sm:min-h-0')}
                  aria-label="Weitere Aktionen"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span>Mehr</span>
                </LoadingButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={onManualRefresh}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
                  <span>Aktualisieren</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportCsv} className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  <span>CSV Export (gefiltert)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onNavigateCsvImport} className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>CSV Import</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <LoadingButton
              onClick={onNavigateCreateEvent}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Event hinzufügen
            </LoadingButton>
          </>
        )}
      </div>
    </div>
  );
}
