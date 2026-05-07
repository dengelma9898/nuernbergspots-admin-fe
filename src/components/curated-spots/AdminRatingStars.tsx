import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5] as const;

type AdminRatingStarsProps = {
  /** Aktuelle oder read-only Anzeige (null = noch keine Bewertung). */
  value: number | null;
  /** Wenn gesetzt und nicht readOnly, Klick setzt 1–5. */
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * Redaktionsbewertung 1–5 Sterne (kuratierte Spots).
 * Siehe Backend-Doku curated-spots-ratings-web-integration.md.
 */
export function AdminRatingStars({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  className,
}: AdminRatingStarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = Boolean(onChange) && !readOnly && !disabled;

  const effective =
    interactive && hover != null ? hover : value != null && value >= 1 && value <= 5 ? value : 0;

  return (
    <div
      role={interactive ? 'radiogroup' : undefined}
      aria-label={
        interactive
          ? 'Redaktionsbewertung, 1 bis 5 Sterne'
          : `Redaktionsbewertung${value != null && value >= 1 && value <= 5 ? `, ${value} von 5 Sternen` : ', noch nicht vergeben'}`
      }
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={interactive ? () => setHover(null) : undefined}
    >
      {STARS.map(n => {
        const filled = n <= effective;
        const commonIcon = (
          <Star
            className={cn(
              'h-8 w-8 sm:h-9 sm:w-9 shrink-0 transition-colors',
              filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/70'
            )}
            aria-hidden
          />
        );

        if (!interactive) {
          return (
            <span key={n} className="inline-flex" aria-hidden>
              {commonIcon}
            </span>
          );
        }

        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} von 5 Sternen`}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'hover:opacity-90 active:scale-95'
            )}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange?.(n)}
          >
            {commonIcon}
          </button>
        );
      })}
    </div>
  );
}
