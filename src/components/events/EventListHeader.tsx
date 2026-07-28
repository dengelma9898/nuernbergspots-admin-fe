import {
  ArrowLeft,
  CheckSquare,
  FileSpreadsheet,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Square,
  Tags,
  X,
} from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import { buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventListHeaderProps {
  pendingAccess: boolean;
  pendingModerationCount: number;
  isSelectionMode: boolean;
  isAdminOrSuperAdmin: boolean;
  selectedCount: number;
  loading: boolean;
  onNavigateDashboard: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onOpenBulkCategory: () => void;
  onGenerateImage: () => void;
  onToggleSelectionMode: () => void;
  onManualRefresh: () => void;
  onNavigateCsvImport: () => void;
  onNavigateCreateEvent: () => void;
}

export function EventListHeader({
  pendingAccess,
  pendingModerationCount,
  isSelectionMode,
  isAdminOrSuperAdmin,
  selectedCount,
  loading,
  onNavigateDashboard,
  onSelectAll,
  onDeselectAll,
  onOpenBulkCategory,
  onGenerateImage,
  onToggleSelectionMode,
  onManualRefresh,
  onNavigateCsvImport,
  onNavigateCreateEvent,
}: EventListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
      <LoadingButton
        variant="ghost"
        size="icon"
        onClick={onNavigateDashboard}
        className={cn(buttonPreset, 'rounded-full')}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Zurück zum Dashboard</span>
      </LoadingButton>
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Events</h1>
      {pendingAccess && pendingModerationCount > 0 ? (
        <Badge
          variant="outline"
          className="border-amber-400/60 text-foreground bg-amber-500/10 shrink-0"
        >
          {pendingModerationCount} ausstehend
        </Badge>
      ) : null}
      <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
        {isSelectionMode ? (
          <>
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
                className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
              >
                <Tags className="h-4 w-4" />
                Kategorie setzen ({selectedCount})
              </LoadingButton>
            ) : null}
            <LoadingButton
              onClick={onGenerateImage}
              disabled={selectedCount === 0}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Bild generieren ({selectedCount})
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
            >
              <ImageIcon className="h-4 w-4" />
              Mehrfachauswahl
            </LoadingButton>
            <LoadingButton
              variant="outline"
              onClick={onManualRefresh}
              disabled={loading}
              className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Aktualisieren
            </LoadingButton>
            <LoadingButton
              variant="outline"
              onClick={onNavigateCsvImport}
              className={cn(buttonPreset, 'w-full sm:w-auto gap-2')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV Import
            </LoadingButton>
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
