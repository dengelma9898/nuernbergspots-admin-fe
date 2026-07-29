import React from 'react';
import { UserCircle, BarChart2, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem } from '@/models/news';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface NewsBubbleProps {
  item: NewsItem;
  onEdit: (item: NewsItem) => void;
  onDelete: (item: NewsItem) => void;
}

export function NewsBubble({ item, onEdit, onDelete }: NewsBubbleProps) {
  return (
    <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} className="px-1">
      <Card className={cn(cardPreset, 'w-full !py-2')}>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {item.authorImageUrl ? (
                <img
                  src={item.authorImageUrl}
                  alt={item.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-secondary"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="font-semibold text-sm text-foreground">
                {item.authorName || 'Unbekannt'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(item.type === 'text' || item.type === 'image') && (
                <>
                  <LoadingButton
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(item)}
                    className={cn(buttonPreset, 'h-8 w-8')}
                    title="Bearbeiten"
                  >
                    <Edit className="w-4 h-4" />
                  </LoadingButton>
                  <LoadingButton
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(item)}
                    className={cn(
                      buttonPreset,
                      'h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 border-destructive/20'
                    )}
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </LoadingButton>
                </>
              )}
              {item.type === 'poll' && (
                <LoadingButton
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(item)}
                  className={cn(
                    buttonPreset,
                    'h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 border-destructive/20'
                  )}
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </LoadingButton>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: de })}
              </span>
            </div>
          </div>

          {item.type === 'text' && (
            <div className="text-base leading-relaxed text-foreground">
              {(item as TextNewsItem).content}
            </div>
          )}

          {item.type === 'image' && (
            <div>
              <div className="flex gap-3 flex-wrap">
                {(item as ImageNewsItem).imageUrls.map((url, idx) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Bild ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-secondary shadow-lg"
                  />
                ))}
              </div>
              {(item as ImageNewsItem).content && (
                <div className="text-base leading-relaxed mt-2 text-foreground">
                  {(item as ImageNewsItem).content}
                </div>
              )}
            </div>
          )}

          {item.type === 'poll' && (
            <div>
              <div className="font-medium mb-2 flex items-center gap-2 text-foreground">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                {(item as PollNewsItem).question}
              </div>
              <div className="flex flex-col gap-2">
                {(item as PollNewsItem).options.map(opt => (
                  <div
                    key={opt.id}
                    className={cn(cardPreset, 'flex justify-between items-center w-full p-3')}
                  >
                    <span className="text-foreground">{opt.text}</span>
                    <Badge variant="secondary">{opt.voters.length}</Badge>
                  </div>
                ))}
              </div>
              {item.expiresAt && (
                <div className="text-xs text-muted-foreground mt-2">
                  Läuft ab: {new Date(item.expiresAt).toLocaleString('de-DE')}
                </div>
              )}
            </div>
          )}

          {item.reactions && item.reactions.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {Array.from(new Set(item.reactions.map(r => r.type))).map(type => (
                <Badge key={type} variant="outline" className="flex items-center gap-1">
                  <span>{type}</span>
                  <span className="text-xs">
                    {item.reactions?.filter(r => r.type === type).length}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
