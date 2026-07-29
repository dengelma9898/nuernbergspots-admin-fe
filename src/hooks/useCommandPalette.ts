import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterCommandPaletteItems } from '@/utils/commandPaletteConfig';

const RECENT_STORAGE_KEY = 'admin-command-palette-recent';
const MAX_RECENT = 5;

function readRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecentId(id: string) {
  const current = readRecentIds().filter(existing => existing !== id);
  const next = [id, ...current].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
}

export function useCommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setRecentIds(readRecentIds());
    }
  }, [open]);

  const items = filterCommandPaletteItems(query);

  const selectItem = useCallback(
    (id: string, href: string) => {
      writeRecentId(id);
      setOpen(false);
      setQuery('');
      navigate(href);
    },
    [navigate]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(current => !current);
        return;
      }

      if (isEditable) return;

      if (event.key.toLowerCase() === 'g') {
        const handleSecondKey = (secondEvent: KeyboardEvent) => {
          if (secondEvent.key.toLowerCase() === 'e') {
            secondEvent.preventDefault();
            navigate('/events');
          }
          window.removeEventListener('keydown', handleSecondKey);
        };
        window.addEventListener('keydown', handleSecondKey);
        window.setTimeout(() => window.removeEventListener('keydown', handleSecondKey), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return {
    open,
    setOpen,
    query,
    setQuery,
    items,
    recentIds,
    selectItem,
  };
}
