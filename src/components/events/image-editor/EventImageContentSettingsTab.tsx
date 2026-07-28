import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingButton } from '@/components/LoadingButton';
import {
  DesignSettings,
  DesignSettingsSection,
  GroupedEvent,
} from '@/components/events/image-editor/types';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { formatDate, formatEventTitle, getEventDisplayText } from '@/utils/eventImageEditorUtils';

const selectItemClass =
  'text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent';

const selectTriggerClass =
  'bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground';

interface EventImageContentSettingsTabProps {
  settings: DesignSettings;
  groupedEvents: GroupedEvent[];
  customEventTexts: Record<string, string>;
  backgroundImage: string | null;
  onCustomEventTextChange: (eventId: string, value: string) => void;
  updateSetting: (section: DesignSettingsSection, field: string, value: unknown) => void;
  onBackgroundImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackgroundImage: () => void;
}

export const EventImageContentSettingsTab: React.FC<EventImageContentSettingsTabProps> = ({
  settings,
  groupedEvents,
  customEventTexts,
  backgroundImage,
  onCustomEventTextChange,
  updateSetting,
  onBackgroundImageChange,
  onRemoveBackgroundImage,
}) => {
  return (
    <div className="space-y-4">
      {settings.content.backgroundType === 'color' && (
        <div className="space-y-2">
          <Label className="text-foreground">Hintergrundfarbe</Label>
          <ColorPicker
            value={settings.content.backgroundColor}
            onChange={value => updateSetting('content', 'backgroundColor', value)}
          />
          <p className="text-sm text-white/70">Vollfächiger Hintergrund</p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-foreground">Inhaltsfarbe</Label>
        <ColorPicker
          value={settings.content.backgroundColor}
          onChange={value => updateSetting('content', 'backgroundColor', value)}
        />
        <p className="text-sm text-muted-foreground">Hintergrundfarbe des Event-Containers</p>
        <div
          className="h-12 rounded-lg border-2 border-foreground"
          style={{ backgroundColor: settings.content.backgroundColor }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Textfarbe des Inhalts</Label>
        <ColorPicker
          value={settings.content.textColor}
          onChange={value => updateSetting('content', 'textColor', value)}
        />
        <p className="text-sm text-muted-foreground">Textfarbe für alle Event-Texte</p>
        <div
          className="h-12 rounded-lg border-2 border-foreground flex items-center justify-center"
          style={{ backgroundColor: settings.content.textColor }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color:
                settings.content.textColor === '#000000' ||
                settings.content.textColor === '#FFFFFF' ||
                parseInt(settings.content.textColor.slice(1, 3), 16) +
                  parseInt(settings.content.textColor.slice(3, 5), 16) +
                  parseInt(settings.content.textColor.slice(5, 7), 16) <
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
        <Label className="text-foreground">Container Transparenz</Label>
        <Slider
          value={[Math.round(settings.content.containerOpacity * 100)]}
          onValueChange={([value]) => updateSetting('content', 'containerOpacity', value / 100)}
          min={0}
          max={100}
          step={1}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">
          {Math.round(settings.content.containerOpacity * 100)}%
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Horizontaler Abstand</Label>
        <Slider
          value={[settings.content.horizontalMargin]}
          onValueChange={([value]) => updateSetting('content', 'horizontalMargin', value)}
          min={0.5}
          max={5}
          step={0.1}
          className={cn(cardPreset, 'p-2')}
        />
        <p className="text-sm text-muted-foreground">
          Abstand links und rechts vom Rand des Bildes
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Content-Start-Abstand</Label>
        <Slider
          value={[settings.content.contentStartMargin]}
          onValueChange={([value]) => updateSetting('content', 'contentStartMargin', value)}
          min={3}
          max={8}
          step={0.1}
          className={cn(cardPreset, 'p-2')}
        />
        <p className="text-sm text-muted-foreground">
          Horizontaler Abstand des Contents zum Container-Rand
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Content-Padding</Label>
        <Slider
          value={[settings.content.contentPadding]}
          onValueChange={([value]) => updateSetting('content', 'contentPadding', value)}
          min={0}
          max={3}
          step={0.1}
          className={cn(cardPreset, 'p-2')}
        />
        <p className="text-sm text-muted-foreground">Innenabstand des Event-Containers</p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Textgröße</Label>
        <Slider
          value={[settings.event.fontSize]}
          onValueChange={([value]) => {
            updateSetting('event', 'fontSize', value);
            updateSetting('date', 'fontSize', value);
            updateSetting('time', 'fontSize', value);
            updateSetting('location', 'fontSize', value);
          }}
          min={10}
          max={24}
          step={1}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">{settings.event.fontSize}px</div>
        <p className="text-sm text-muted-foreground">
          Gilt für alle Texte (Datum, Event, Uhrzeit, Ort)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Datum Schriftart</Label>
        <Select
          value={settings.date.fontFamily}
          onValueChange={value =>
            updateSetting(
              'date',
              'fontFamily',
              value as 'league-spartan' | 'montserrat' | 'more-sugar' | 'system-ui'
            )
          }
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
              System UI
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Datum Schriftstärke</Label>
        <Select
          value={settings.date.fontWeight.toString()}
          onValueChange={value =>
            updateSetting('date', 'fontWeight', parseInt(value) as 400 | 500 | 600 | 700)
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Schriftstärke wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            <SelectItem value="400" className={selectItemClass}>
              Normal (400)
            </SelectItem>
            <SelectItem value="500" className={selectItemClass}>
              Medium (500)
            </SelectItem>
            <SelectItem value="600" className={selectItemClass}>
              Semi-Bold (600)
            </SelectItem>
            <SelectItem value="700" className={selectItemClass}>
              Bold (700)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
        <Label className="text-foreground text-lg font-semibold">Event-Texte</Label>
      </div>

      {groupedEvents.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">
              {formatDate(group.date.toISOString()).dayDate}
            </Label>
            {group.events.map(event => {
              const eventTitle = formatEventTitle(event);
              const defaultText = getEventDisplayText(event);

              return (
                <div key={event.id} className="space-y-1">
                  <Label htmlFor={`event-${event.id}`} className="text-foreground text-sm">
                    {eventTitle || 'Event'}
                  </Label>
                  <Input
                    id={`event-${event.id}`}
                    value={customEventTexts[event.id] ?? defaultText}
                    onChange={e => onCustomEventTextChange(event.id, e.target.value)}
                    placeholder={defaultText}
                    className={cn(inputPreset, 'font-mono text-sm')}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <Label className="text-foreground">Event Schriftart</Label>
        <Select
          value={settings.event.fontFamily}
          onValueChange={value =>
            updateSetting(
              'event',
              'fontFamily',
              value as 'league-spartan' | 'montserrat' | 'system-ui'
            )
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Schriftart wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            <SelectItem value="montserrat" className={selectItemClass}>
              Montserrat
            </SelectItem>
            <SelectItem value="league-spartan" className={selectItemClass}>
              League Spartan
            </SelectItem>
            <SelectItem value="system-ui" className={selectItemClass}>
              System UI
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Event Schriftstärke</Label>
        <Select
          value={settings.event.fontWeight.toString()}
          onValueChange={value =>
            updateSetting('event', 'fontWeight', parseInt(value) as 400 | 500 | 600 | 700)
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Schriftstärke wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            <SelectItem value="400" className={selectItemClass}>
              Normal (400)
            </SelectItem>
            <SelectItem value="500" className={selectItemClass}>
              Medium (500)
            </SelectItem>
            <SelectItem value="600" className={selectItemClass}>
              Semi-Bold (600)
            </SelectItem>
            <SelectItem value="700" className={selectItemClass}>
              Bold (700)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Abstand zwischen Datumsblöcken</Label>
        <Slider
          value={[settings.content.dateBlockSpacing]}
          onValueChange={([value]) => updateSetting('content', 'dateBlockSpacing', value)}
          min={0}
          max={8}
          step={0.5}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">{settings.content.dateBlockSpacing}rem</div>
        <p className="text-sm text-muted-foreground">Abstand zwischen verschiedenen Tagen</p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Abstand zwischen Events</Label>
        <Slider
          value={[settings.content.eventSpacing]}
          onValueChange={([value]) => updateSetting('content', 'eventSpacing', value)}
          min={0}
          max={8}
          step={0.5}
          className={cn(cardPreset, 'p-2')}
        />
        <div className="text-sm text-muted-foreground">{settings.content.eventSpacing}rem</div>
        <p className="text-sm text-muted-foreground">Abstand zwischen Events desselben Tages</p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Hintergrund-Typ</Label>
        <Select
          value={settings.content.backgroundType}
          onValueChange={value =>
            updateSetting('content', 'backgroundType', value as 'image' | 'color')
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Hintergrund-Typ wählen" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
            <SelectItem value="color" className={selectItemClass}>
              Vollfarbe
            </SelectItem>
            <SelectItem value="image" className={selectItemClass}>
              Hintergrundbild
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {settings.content.backgroundType === 'image' && (
        <>
          <div className="space-y-2">
            <Label className="text-foreground">Hintergrundbild</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={onBackgroundImageChange}
              className="bg-background border-2 border-foreground text-foreground file:text-foreground file:bg-accent file:border-foreground file:font-semibold hover:bg-accent hover:border-foreground/80 focus:bg-accent focus:border-foreground/80 transition-all duration-300 rounded-xl dark:bg-card dark:border-foreground dark:text-foreground dark:file:text-foreground dark:file:bg-accent"
            />
            {backgroundImage && (
              <div className={cn(cardPreset, 'mt-2 flex items-center gap-4 p-3')}>
                <img src={backgroundImage} alt="Vorschau" className="h-16 rounded shadow" />
                <LoadingButton
                  variant="outline"
                  onClick={onRemoveBackgroundImage}
                  className={cn(
                    buttonPreset,
                    'border-2 border-foreground bg-background text-foreground hover:bg-accent hover:border-foreground/80 font-semibold dark:bg-card dark:border-foreground dark:text-foreground'
                  )}
                >
                  Entfernen
                </LoadingButton>
              </div>
            )}
          </div>

          {backgroundImage && (
            <>
              <div className="space-y-2">
                <Label className="text-foreground">Bild-Transparenz</Label>
                <Slider
                  value={[Math.round(settings.content.backgroundImageOpacity * 100)]}
                  onValueChange={([value]) =>
                    updateSetting('content', 'backgroundImageOpacity', value / 100)
                  }
                  min={0}
                  max={100}
                  step={1}
                  className={cn(cardPreset, 'p-2')}
                />
                <div className="text-sm text-muted-foreground">
                  {Math.round(settings.content.backgroundImageOpacity * 100)}%
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Blend-Mode</Label>
                <Select
                  value={settings.content.backgroundBlendMode}
                  onValueChange={value =>
                    updateSetting(
                      'content',
                      'backgroundBlendMode',
                      value as 'normal' | 'multiply' | 'overlay' | 'screen'
                    )
                  }
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Blend-Mode wählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                    <SelectItem value="normal" className={selectItemClass}>
                      Normal
                    </SelectItem>
                    <SelectItem value="multiply" className={selectItemClass}>
                      Multiply
                    </SelectItem>
                    <SelectItem value="overlay" className={selectItemClass}>
                      Overlay
                    </SelectItem>
                    <SelectItem value="screen" className={selectItemClass}>
                      Screen
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
