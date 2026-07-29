import React from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/LoadingButton';
import { inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface JobOfferListFieldProps {
  label: string;
  items: string[];
  addButtonLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}

export function JobOfferListField({
  label,
  items,
  addButtonLabel,
  onAdd,
  onRemove,
  onUpdate,
}: JobOfferListFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={e => onUpdate(index, e.target.value)}
            required
            className={cn(inputPreset)}
          />
          <LoadingButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </LoadingButton>
        </div>
      ))}
      <LoadingButton type="button" variant="outline" onClick={onAdd} className={cn(buttonPreset)}>
        <Plus className="mr-2 h-4 w-4" />
        {addButtonLabel}
      </LoadingButton>
    </div>
  );
}
