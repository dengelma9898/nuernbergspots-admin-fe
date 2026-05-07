/**
 * Siehe Backend: docs/special-polls-admin-integration.md
 * PATCH …/status erlaubt nur PENDING | ACTIVE (kein CLOSED in der API-Rückgabe).
 */
export enum SpecialPollStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
}

/** UI-Label: API liefert PENDING, wir zeigen überall „ACTIVE“ (Admin-Oberfläche). */
export function getSpecialPollStatusDisplayLabel(status: SpecialPollStatus): string {
  return status === SpecialPollStatus.PENDING ? SpecialPollStatus.ACTIVE : status;
}

export function getSpecialPollStatusBadgeVariant(
  status: SpecialPollStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const effective =
    status === SpecialPollStatus.PENDING ? SpecialPollStatus.ACTIVE : status;
  switch (effective) {
    case SpecialPollStatus.ACTIVE:
      return 'default';
    default:
      return 'secondary';
  }
}

/** Kontrastreiches Highlight-Badge (outline war im Dark Mode weiß/weiß). */
export const specialPollHighlightBadgeClassName =
  'gap-1 border-amber-500/60 bg-amber-500/15 text-amber-950 shadow-none dark:bg-amber-950/55 dark:text-amber-50 dark:border-amber-400/55';

export interface SpecialPollResponse {
  id: string;
  userId: string;
  userName: string;
  response: string;
  createdAt: string;
  upvotedUserIds: string[];
}

export interface SpecialPoll {
  id: string;
  title: string;
  responses: SpecialPollResponse[];
  status: SpecialPollStatus;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialPollDto {
  title: string;
  isHighlighted?: boolean;
}

export interface UpdateSpecialPollStatusDto {
  status: SpecialPollStatus;
}

export interface UpdateSpecialPollHighlightDto {
  isHighlighted: boolean;
}

export interface UpdateSpecialPollResponsesDto {
  responses: SpecialPollResponse[];
}
