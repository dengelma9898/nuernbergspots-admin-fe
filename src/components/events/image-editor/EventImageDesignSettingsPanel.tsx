import React from 'react';
import { Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventImageContentSettingsTab } from '@/components/events/image-editor/EventImageContentSettingsTab';
import { EventImageLogoSettingsTab } from '@/components/events/image-editor/EventImageLogoSettingsTab';
import { EventImageTitleSettingsTab } from '@/components/events/image-editor/EventImageTitleSettingsTab';
import {
  DesignSettings,
  DesignSettingsSection,
  GroupedEvent,
} from '@/components/events/image-editor/types';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventImageDesignSettingsPanelProps {
  settings: DesignSettings;
  groupedEvents: GroupedEvent[];
  customTitle: string;
  customEventTexts: Record<string, string>;
  backgroundImage: string | null;
  onCustomTitleChange: (value: string) => void;
  onCustomEventTextChange: (eventId: string, value: string) => void;
  updateSetting: (section: DesignSettingsSection, field: string, value: unknown) => void;
  onBackgroundImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackgroundImage: () => void;
}

export const EventImageDesignSettingsPanel: React.FC<EventImageDesignSettingsPanelProps> = ({
  settings,
  groupedEvents,
  customTitle,
  customEventTexts,
  backgroundImage,
  onCustomTitleChange,
  onCustomEventTextChange,
  updateSetting,
  onBackgroundImageChange,
  onRemoveBackgroundImage,
}) => {
  return (
    <Card className={cn(cardPreset)}>
      <CardHeader>
        <CardTitle className="text-foreground">Design-Einstellungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="title">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="title">
              <Type className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Titel</span>
            </TabsTrigger>
            <TabsTrigger value="content">
              <Palette className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Inhalt</span>
            </TabsTrigger>
            <TabsTrigger value="logo">
              <ImageIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="title" className="space-y-4">
            <EventImageTitleSettingsTab
              settings={settings}
              customTitle={customTitle}
              onCustomTitleChange={onCustomTitleChange}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <EventImageContentSettingsTab
              settings={settings}
              groupedEvents={groupedEvents}
              customEventTexts={customEventTexts}
              backgroundImage={backgroundImage}
              onCustomEventTextChange={onCustomEventTextChange}
              updateSetting={updateSetting}
              onBackgroundImageChange={onBackgroundImageChange}
              onRemoveBackgroundImage={onRemoveBackgroundImage}
            />
          </TabsContent>

          <TabsContent value="logo" className="space-y-4">
            <EventImageLogoSettingsTab settings={settings} updateSetting={updateSetting} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
