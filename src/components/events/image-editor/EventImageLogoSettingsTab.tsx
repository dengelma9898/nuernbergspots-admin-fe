import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DesignSettings, DesignSettingsSection } from '@/components/events/image-editor/types';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventImageLogoSettingsTabProps {
  settings: DesignSettings;
  updateSetting: (section: DesignSettingsSection, field: string, value: unknown) => void;
}

export const EventImageLogoSettingsTab: React.FC<EventImageLogoSettingsTabProps> = ({
  settings,
  updateSetting,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-foreground">Logo-Größe</Label>
        <Slider
          value={[settings.logo.size]}
          onValueChange={([value]) => updateSetting('logo', 'size', value)}
          min={1}
          max={15}
          step={1}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">{settings.logo.size}rem</div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Transparenz</Label>
        <Slider
          value={[settings.logo.opacity * 100]}
          onValueChange={([value]) => updateSetting('logo', 'opacity', value / 100)}
          min={0}
          max={100}
          step={1}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">
          {Math.round(settings.logo.opacity * 100)}%
        </div>
      </div>
    </div>
  );
};
