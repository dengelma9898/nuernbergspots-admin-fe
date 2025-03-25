import { useEffect, useState, useMemo, useCallback } from 'react';
import { Keyword } from '@/models/keyword';
import { useKeywordService } from '@/services/keywordService';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface KeywordSelectorProps {
  selectedIds?: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

// Cache für die Keywords außerhalb der Komponente
let cachedKeywords: Keyword[] | null = null;

export function KeywordSelector({ selectedIds = [], onChange, className }: KeywordSelectorProps) {
  const keywordService = useKeywordService();
  const [keywords, setKeywords] = useState<Keyword[]>(() => cachedKeywords || []);
  const [isLoading, setIsLoading] = useState(!cachedKeywords);

  // Memoize loadKeywords function
  const loadKeywords = useCallback(async () => {
    if (cachedKeywords) {
      setKeywords(cachedKeywords);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await keywordService.getKeywords();
      cachedKeywords = data;
      setKeywords(data);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
    } finally {
      setIsLoading(false);
    }
  }, [keywordService]);

  useEffect(() => {
    loadKeywords();
  }, []); // Nur beim ersten Rendern laden

  // Memoize toggleKeyword function
  const toggleKeyword = useCallback((keywordId: string) => {
    onChange(
      selectedIds.includes(keywordId)
        ? selectedIds.filter(id => id !== keywordId)
        : [...selectedIds, keywordId]
    );
  }, [selectedIds, onChange]);

  // Memoize sorted keywords
  const sortedKeywords = useMemo(() => {
    return [...keywords].sort((a, b) => a.name.localeCompare(b.name));
  }, [keywords]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Lade Keywords...</div>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {sortedKeywords.map((keyword) => (
          <Badge
            key={keyword.id}
            variant={selectedIds.includes(keyword.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => toggleKeyword(keyword.id)}
          >
            {keyword.name}
          </Badge>
        ))}
      </div>
    </div>
  );
} 