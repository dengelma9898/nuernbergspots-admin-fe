import React from 'react';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingButton } from '@/components/LoadingButton';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/utils/iconUtils';
import { EventStatus } from '@/utils/eventFormatters';
import { convertFFToHex, getContrastTextColor } from '@/utils/eventListUtils';
import { Euro, Star, Tag, AlertCircle } from 'lucide-react';

interface EventInfoCardProps {
  event: Event;
  categories: EventCategory[];
  status: EventStatus;
  isEditing: boolean;
  editedEvent: Partial<Event>;
  onInputChange: (field: keyof Event, value: any) => void;
  onCancel: () => void;
  onSave: () => void;
  isEventChanged: boolean;
}

export const EventInfoCard: React.FC<EventInfoCardProps> = ({
  event,
  categories,
  status,
  isEditing,
  editedEvent,
  onInputChange,
  onCancel,
  onSave,
  isEventChanged,
}) => {
  const selectedCategory = categories.find(cat => cat.id === event.categoryId);

  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-foreground">Event Informationen</CardTitle>
          <div className="flex items-center gap-2">
            {event.status === 'PENDING' ? (
              <Badge
                variant="outline"
                className="border-amber-400/70 text-amber-100 bg-amber-500/15 border-secondary"
              >
                <AlertCircle className="mr-1 h-3 w-3" />
                Ausstehend
              </Badge>
            ) : null}
            <Badge variant={status.variant} className="border-secondary">
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
            {event.isPromoted && (
              <Badge className="bg-tertiary text-tertiary-foreground border-secondary">
                <Star className="mr-1 h-4 w-4 fill-current" />
                Highlight
              </Badge>
            )}
            {selectedCategory ? (
              <Badge
                className="text-xs flex items-center border-secondary"
                style={{
                  backgroundColor: convertFFToHex(selectedCategory.colorCode),
                  color: getContrastTextColor(convertFFToHex(selectedCategory.colorCode)),
                }}
              >
                <span className="mr-1 flex items-center">
                  {getIconComponent(selectedCategory.iconName)}
                </span>
                {selectedCategory.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs flex items-center border-secondary">
                <Tag className="mr-1 h-3 w-3" />
                Keine Kategorie
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground">
            Titel
          </Label>
          {isEditing ? (
            <Input
              id="title"
              value={editedEvent.title || ''}
              onChange={e => onInputChange('title', e.target.value)}
              className={cn(inputPreset)}
            />
          ) : (
            <div className="text-lg font-semibold text-foreground">{event.title}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">
            Beschreibung
          </Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={editedEvent.description || ''}
              onChange={e => onInputChange('description', e.target.value)}
              className={cn(inputPreset)}
            />
          ) : (
            <div className="text-muted-foreground">{event.description}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Preis</Label>
          {isEditing ? (
            <Input
              type="text"
              value={editedEvent.priceString || ''}
              onChange={e => onInputChange('priceString', e.target.value || undefined)}
              placeholder="z.B. 15€, Kostenlos, Spende, etc."
              className={cn(inputPreset)}
            />
          ) : (
            <div className="flex items-center text-muted-foreground">
              <Euro className="mr-2 h-4 w-4" />
              {event.priceString ||
                (event.price
                  ? new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(event.price)
                  : 'Kostenlos')}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ticketsNeeded"
            checked={isEditing ? editedEvent.ticketsNeeded : event.ticketsNeeded}
            onCheckedChange={checked => onInputChange('ticketsNeeded', checked)}
          />
          <Label htmlFor="ticketsNeeded" className="text-foreground">
            Tickets erforderlich
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPromoted"
            checked={isEditing ? editedEvent.isPromoted : event.isPromoted}
            onCheckedChange={checked => onInputChange('isPromoted', checked)}
            disabled={!isEditing}
          />
          <div className="space-y-1">
            <Label htmlFor="isPromoted" className="text-foreground">
              Als "Highlight" markieren
            </Label>
            <p className="text-sm text-muted-foreground">
              {event.isPromoted
                ? 'Dieses Event wird als Highlight angezeigt ✨'
                : 'Markiere dieses Event als Highlight'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Kategorie</Label>
          {isEditing ? (
            <Select
              value={editedEvent.categoryId ?? undefined}
              onValueChange={value => onInputChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Keine Kategorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center">
                        {getIconComponent(category.iconName)}
                      </span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant="outline"
              className="w-fit text-xs flex items-center gap-1 border-secondary text-muted-foreground"
            >
              <span className="flex items-center">
                {selectedCategory ? (
                  getIconComponent(selectedCategory.iconName)
                ) : (
                  <Tag className="h-3 w-3" />
                )}
              </span>
              {selectedCategory?.name || 'Keine Kategorie'}
            </Badge>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-4 mt-8">
            <LoadingButton variant="outline" onClick={onCancel} className={cn(buttonPreset)}>
              Abbrechen
            </LoadingButton>
            <LoadingButton
              onClick={onSave}
              disabled={!isEventChanged}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Speichern
            </LoadingButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
