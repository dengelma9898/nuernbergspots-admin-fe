import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Business, BusinessStatus } from '@/models/business';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface BusinessStatusHighlightCardProps {
  business: Business;
  onStatusChange: (value: BusinessStatus) => void;
  onPromotedChange: (checked: boolean) => void;
}

export const BusinessStatusHighlightCard: React.FC<BusinessStatusHighlightCardProps> = ({
  business,
  onStatusChange,
  onPromotedChange,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Status & Highlight</CardTitle>
        <CardDescription className="text-muted-foreground">
          Partner-Status und Sichtbarkeit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Status</Label>
            <Select
              value={business.status}
              onValueChange={(value: BusinessStatus) => onStatusChange(value)}
            >
              <SelectTrigger
                className={cn(inputPreset, 'w-full cursor-pointer hover:bg-secondary/5')}
              >
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BusinessStatus.ACTIVE}>Aktiv</SelectItem>
                <SelectItem value={BusinessStatus.PENDING}>Ausstehend</SelectItem>
                <SelectItem value={BusinessStatus.INACTIVE}>Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isPromoted"
              checked={business.isPromoted}
              onCheckedChange={onPromotedChange}
            />
            <div className="space-y-1">
              <Label htmlFor="isPromoted" className="text-foreground">
                Als "Highlight" markieren
              </Label>
              <p className="text-sm text-muted-foreground">
                {business.isPromoted
                  ? 'Dieser Partner wird als Highlight angezeigt ✨'
                  : 'Markiere diesen Partner als Highlight'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
