import { RefObject } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { DesignSettings } from '@/components/events/image-editor/types';

interface UseEventImageExportOptions {
  elementRef: RefObject<HTMLDivElement | null>;
  settings: DesignSettings;
  categoryName: string;
}

export function useEventImageExport({
  elementRef,
  settings,
  categoryName,
}: UseEventImageExportOptions) {
  const handleDownload = async () => {
    if (elementRef.current) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const backgroundColor =
          settings.content.backgroundType === 'color' ? settings.content.backgroundColor : 'white';

        const dataUrl = await toPng(elementRef.current, {
          quality: 1.0,
          backgroundColor: backgroundColor,
          width: 1080,
          height: 1920,
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `${categoryName.toLowerCase()}-events.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Fehler beim Generieren des Bildes:', err);
        toast.error('Fehler beim Exportieren des Bildes');
      }
    }
  };

  return { handleDownload };
}
