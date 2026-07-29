import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

import { LoadingButton } from '@/components/LoadingButton';
import { BusinessCategory } from '@/models/business-category';
import { getIconComponent } from '@/utils/iconUtils';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface CategoryListCardProps {
  category: BusinessCategory;
  onEdit: (category: BusinessCategory) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryListCard({ category, onEdit, onDelete }: CategoryListCardProps) {
  return (
    <Card className={cn(cardPreset, 'p-4 sm:p-6')}>
      <div className="flex items-center gap-3 mb-3">
        <div className="font-bold text-lg flex-1 text-foreground">{category.name}</div>
        <div className="text-muted-foreground">{getIconComponent(category.iconName)}</div>
      </div>
      <div className="text-sm text-muted-foreground mb-3">{category.description || '-'}</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {category.keywords && category.keywords.length > 0 ? (
          category.keywords.map(keyword => (
            <Badge key={keyword.name} variant="outline" className="text-xs">
              {keyword.name}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Keine Keywords</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mb-4 space-y-1">
        <div>Erstellt: {new Date(category.createdAt).toLocaleDateString()}</div>
        <div>Aktualisiert: {new Date(category.updatedAt).toLocaleDateString()}</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <LoadingButton
          size="sm"
          variant="outline"
          onClick={() => onEdit(category)}
          className={cn(buttonPreset, 'flex-1')}
        >
          <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
        </LoadingButton>
        <LoadingButton
          size="sm"
          variant="destructive"
          onClick={() => onDelete(category.id)}
          className="flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Löschen
        </LoadingButton>
      </div>
    </Card>
  );
}
