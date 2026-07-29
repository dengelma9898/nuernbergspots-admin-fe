import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ban, CheckCircle2 } from 'lucide-react';

import { LoadingButton } from '@/components/LoadingButton';
import { User } from '@/services/userService';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface UserBlockManagementCardProps {
  user: User;
  onBlockClick: (user: User) => void;
}

export function UserBlockManagementCard({ user, onBlockClick }: UserBlockManagementCardProps) {
  return (
    <Card className={cn(cardPreset, 'p-4 overflow-hidden')}>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground break-all whitespace-normal">
            {user.email}
          </span>
        </div>
        {user.name && (
          <span className="text-xs text-foreground/70 break-all whitespace-normal">
            {user.name}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          {user.isBlocked ? (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 text-xs bg-red-600/20 text-red-400 border-red-600"
            >
              <Ban className="h-3 w-3" />
              Blockiert
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="flex items-center gap-1 text-xs bg-green-600/20 text-green-400 border-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              Aktiv
            </Badge>
          )}
        </div>
      </div>
      {user.isBlocked && user.blockReason && (
        <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-foreground/80">
          <strong>Grund:</strong> {user.blockReason}
        </div>
      )}
      <div className="flex justify-end">
        <LoadingButton
          variant={user.isBlocked ? 'default' : 'destructive'}
          size="sm"
          onClick={() => onBlockClick(user)}
          className={cn(buttonPreset, 'min-w-[120px]')}
        >
          {user.isBlocked ? (
            <>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Entsperren
            </>
          ) : (
            <>
              <Ban className="mr-1 h-4 w-4" /> Blockieren
            </>
          )}
        </LoadingButton>
      </div>
    </Card>
  );
}

export function UserBlockStatusBadge({ user }: { user: User }) {
  if (user.isBlocked) {
    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1 bg-red-600/20 text-red-600 dark:text-red-400 border-red-600"
      >
        <Ban className="h-3 w-3" />
        Blockiert
      </Badge>
    );
  }

  return (
    <Badge
      variant="default"
      className="flex items-center gap-1 bg-green-600/20 text-green-600 dark:text-green-400 border-green-600"
    >
      <CheckCircle2 className="h-3 w-3" />
      Aktiv
    </Badge>
  );
}
