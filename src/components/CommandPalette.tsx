import { useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { commandPaletteItems } from '@/utils/commandPaletteConfig';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export function CommandPalette() {
  const { open, setOpen, query, setQuery, items, recentIds, selectItem } = useCommandPalette();

  const recentItems = useMemo(
    () =>
      recentIds
        .map(id => commandPaletteItems.find(item => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [recentIds]
  );

  const displayItems = query.trim() ? items : recentItems.length > 0 ? recentItems : items;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn(cardPreset, 'max-w-xl p-0 gap-0 overflow-hidden')}>
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-foreground">Schnellnavigation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Cmd+K oder Ctrl+K — Tippen zum Filtern, Enter zum Öffnen
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Route suchen…"
              className={cn(inputPreset, 'pl-9')}
              aria-label="Admin-Routen suchen"
            />
          </div>
        </div>

        <div
          className="max-h-80 overflow-y-auto border-t border-secondary"
          role="listbox"
          aria-label="Suchergebnisse"
        >
          {displayItems.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Keine Treffer für diese Suche.</p>
          ) : (
            displayItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                  onClick={() => selectItem(item.id, item.href)}
                >
                  {Icon ? (
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <span className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{item.title}</span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {item.section} · {item.description}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
