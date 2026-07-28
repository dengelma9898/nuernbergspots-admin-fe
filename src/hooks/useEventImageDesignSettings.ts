import { useState } from 'react';
import { defaultSettings } from '@/components/events/image-editor/defaults';
import { DesignSettings, DesignSettingsSection } from '@/components/events/image-editor/types';

export function useEventImageDesignSettings() {
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [customEventTexts, setCustomEventTexts] = useState<Record<string, string>>({});

  const updateSetting = (section: DesignSettingsSection, field: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setBackgroundImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => setBackgroundImage(null);

  return {
    settings,
    backgroundImage,
    customEventTexts,
    setCustomEventTexts,
    updateSetting,
    handleBackgroundImageChange,
    removeBackgroundImage,
  };
}
