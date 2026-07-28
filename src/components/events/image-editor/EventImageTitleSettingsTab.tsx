import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DesignSettings, DesignSettingsSection } from '@/components/events/image-editor/types';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

const selectItemClass =
  'text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent';

const selectTriggerClass =
  'bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground';

interface EventImageTitleSettingsTabProps {
  settings: DesignSettings;
  customTitle: string;
  onCustomTitleChange: (value: string) => void;
  updateSetting: (section: DesignSettingsSection, field: string, value: unknown) => void;
}

export const EventImageTitleSettingsTab: React.FC<EventImageTitleSettingsTabProps> = ({
  settings,
  customTitle,
  onCustomTitleChange,
  updateSetting,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="custom-title" className="text-foreground">
          Titel Text
        </Label>
        <Textarea
          id="custom-title"
          value={customTitle}
          onChange={e => onCustomTitleChange(e.target.value)}
          placeholder="Titel eingeben..."
          className={cn(inputPreset, 'font-mono min-h-[100px] resize-y')}
        />
        <p className="text-sm text-white/70">Leer lassen, um den Kategorienamen zu verwenden</p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Schriftgröße</Label>
        <Slider
          value={[settings.title.fontSize]}
          onValueChange={([value]) => updateSetting('title', 'fontSize', value)}
          min={50}
          max={200}
          step={1}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">{settings.title.fontSize}px</div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Textfarbe</Label>
        <ColorPicker
          value={settings.title.color}
          onChange={value => updateSetting('title', 'color', value)}
        />
        <p className="text-sm text-muted-foreground">Textfarbe des Titels</p>
        <div
          className="h-12 rounded-lg border-2 border-foreground flex items-center justify-center"
          style={{ backgroundColor: settings.title.color }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color:
                settings.title.color === '#000000' ||
                settings.title.color === '#FFFFFF' ||
                parseInt(settings.title.color.slice(1, 3), 16) +
                  parseInt(settings.title.color.slice(3, 5), 16) +
                  parseInt(settings.title.color.slice(5, 7), 16) <
                  400
                  ? '#FFFFFF'
                  : '#000000',
            }}
          >
            Beispieltext
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Hintergrundfarbe</Label>
        <ColorPicker
          value={settings.title.backgroundColor}
          onChange={value => updateSetting('title', 'backgroundColor', value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Rahmenfarbe</Label>
        <ColorPicker
          value={settings.title.borderColor}
          onChange={value => updateSetting('title', 'borderColor', value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Schattenfarbe</Label>
        <ColorPicker
          value={settings.title.shadowColor}
          onChange={value => updateSetting('title', 'shadowColor', value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Schriftart</Label>
        <Select
          value={settings.title.fontFamily}
          onValueChange={value => updateSetting('title', 'fontFamily', value)}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Schriftart wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            <SelectItem value="more-sugar" className={selectItemClass}>
              More Sugar
            </SelectItem>
            <SelectItem value="league-spartan" className={selectItemClass}>
              League Spartan
            </SelectItem>
            <SelectItem value="montserrat" className={selectItemClass}>
              Montserrat
            </SelectItem>
            <SelectItem value="system-ui" className={selectItemClass}>
              System
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Schriftschnitt</Label>
        <Select
          value={settings.title.fontWeight.toString()}
          onValueChange={value => updateSetting('title', 'fontWeight', parseInt(value))}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Schriftschnitt wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map(weight => (
              <SelectItem key={weight} value={weight} className={selectItemClass}>
                {weight}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
        <Label className="text-foreground font-medium cursor-pointer dark:text-foreground">
          Hintergrund transparent
        </Label>
        <input
          type="checkbox"
          checked={settings.title.backgroundTransparent}
          onChange={e => updateSetting('title', 'backgroundTransparent', e.target.checked)}
          className="ml-auto accent-blue-500"
        />
      </div>

      <div className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
        <Label className="text-foreground font-medium cursor-pointer dark:text-foreground">
          Rahmen anzeigen
        </Label>
        <input
          type="checkbox"
          checked={settings.title.showBorder}
          onChange={e => updateSetting('title', 'showBorder', e.target.checked)}
          className="ml-auto accent-blue-500"
        />
      </div>

      <div className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
        <Label className="text-foreground font-medium cursor-pointer dark:text-foreground">
          Container anzeigen
        </Label>
        <input
          type="checkbox"
          checked={settings.title.showContainer}
          onChange={e => updateSetting('title', 'showContainer', e.target.checked)}
          className="ml-auto accent-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Ausrichtung (Rotation)</Label>
        <Slider
          value={[settings.title.rotation]}
          onValueChange={([value]) => updateSetting('title', 'rotation', value)}
          min={-45}
          max={45}
          step={1}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">{settings.title.rotation}°</div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Textausrichtung</Label>
        <Select
          value={settings.title.textAlign}
          onValueChange={value =>
            updateSetting('title', 'textAlign', value as 'left' | 'center' | 'right')
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Textausrichtung wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            <SelectItem value="left" className={selectItemClass}>
              Links
            </SelectItem>
            <SelectItem value="center" className={selectItemClass}>
              Zentriert
            </SelectItem>
            <SelectItem value="right" className={selectItemClass}>
              Rechts
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
