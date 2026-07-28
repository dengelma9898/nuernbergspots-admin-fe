import { CheckCircle2, XCircle } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Event, BulkUpdateEventCategoryResult } from '@/models/events';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventBulkPartialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: BulkUpdateEventCategoryResult | null;
  events: Event[];
}

export function EventBulkPartialDialog({
  open,
  onOpenChange,
  result,
  events,
}: EventBulkPartialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(cardPreset, 'max-h-[85vh] overflow-y-auto')}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Teilerfolg bei Kategorie-Zuweisung</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {result
              ? `${result.successful} von ${result.total} Events aktualisiert, ${result.failed} fehlgeschlagen.`
              : null}
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {result.results.map(item => {
              const eventTitle = events.find(e => e.id === item.eventId)?.title ?? item.eventId;
              return (
                <div
                  key={item.eventId}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5"
                >
                  <span className="text-foreground font-medium flex-1 truncate">{eventTitle}</span>
                  {item.success ? (
                    <Badge variant="default" className="bg-green-600 text-white shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Erfolg
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="shrink-0">
                      <XCircle className="h-3 w-3 mr-1" />
                      Fehler
                    </Badge>
                  )}
                  {!item.success && item.message ? (
                    <span className="text-sm text-muted-foreground sm:max-w-[40%]">
                      {item.message}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
        <DialogFooter>
          <LoadingButton
            onClick={() => onOpenChange(false)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Schließen
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
