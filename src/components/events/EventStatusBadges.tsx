import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { badgePreset, moderationPendingBadgeClass } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { EventStatus } from '@/utils/eventFormatters';

export interface ModerationBadgeProps {
  status?: string;
  className?: string;
}

export const ModerationBadge: React.FC<ModerationBadgeProps> = ({
  status = 'PENDING',
  className,
}) => {
  if (status !== 'PENDING') {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(moderationPendingBadgeClass, className)}
      data-testid="moderation-pending-badge"
    >
      <AlertCircle className="h-3 w-3 shrink-0 text-tertiary" aria-hidden="true" />
      <span>Ausstehend</span>
    </Badge>
  );
};

export interface EventTimeStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export const EventTimeStatusBadge: React.FC<EventTimeStatusBadgeProps> = ({
  status,
  className,
}) => {
  let variantClass: string;
  switch (status.label) {
    case 'Läuft jetzt':
    case 'Diesen Monat':
      variantClass = 'bg-primary text-primary-foreground border-transparent';
      break;
    case 'Beendet':
    case 'Ohne Datum':
      variantClass = 'bg-muted text-muted-foreground border-secondary';
      break;
    case 'Kommend':
    default:
      variantClass = 'bg-background text-foreground border-secondary';
      break;
  }

  return (
    <Badge
      variant={status.variant}
      className={cn(badgePreset, 'gap-1 border-secondary', variantClass, className)}
      data-testid="event-time-status-badge"
    >
      {status.icon}
      <span>{status.label}</span>
    </Badge>
  );
};
