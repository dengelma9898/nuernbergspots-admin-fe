import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SelectableBadge } from '@/components/ui/SelectableBadge';
import { Business } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface BusinessCategoriesCardProps {
  business: Business;
  categories: BusinessCategory[];
  keywords: Keyword[];
  onToggleCategory: (categoryId: string) => void;
  onToggleKeyword: (keywordId: string) => void;
}

export const BusinessCategoriesCard: React.FC<BusinessCategoriesCardProps> = ({
  business,
  categories,
  keywords,
  onToggleCategory,
  onToggleKeyword,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Kategorien</CardTitle>
        <CardDescription className="text-muted-foreground">Kategorien des Partners</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground">Kategorien (max. 3)</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <SelectableBadge
                key={category.id}
                isSelected={business.categoryIds.includes(category.id)}
                onClick={() => onToggleCategory(category.id)}
              >
                {category.name}
              </SelectableBadge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.
          </p>
        </div>

        {keywords.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground">Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {keywords.map(keyword => (
                <SelectableBadge
                  key={keyword.id}
                  isSelected={business.keywordIds.includes(keyword.id)}
                  onClick={() => onToggleKeyword(keyword.id)}
                >
                  {keyword.name}
                </SelectableBadge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Wählen Sie passende Keywords aus, um das Geschäft besser auffindbar zu machen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
