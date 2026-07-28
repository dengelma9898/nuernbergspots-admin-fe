import React, { RefObject } from 'react';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LoadingButton } from '@/components/LoadingButton';
import { EventImagePreviewCanvas } from '@/components/events/image-editor/EventImagePreviewCanvas';
import { DesignSettings, GroupedEvent } from '@/components/events/image-editor/types';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventImagePreviewPanelProps {
  elementRef: RefObject<HTMLDivElement | null>;
  settings: DesignSettings;
  groupedEvents: GroupedEvent[];
  customTitle: string;
  categoryName: string;
  customEventTexts: Record<string, string>;
  backgroundImage: string | null;
  onDownload: () => void;
}

export const EventImagePreviewPanel: React.FC<EventImagePreviewPanelProps> = ({
  elementRef,
  settings,
  groupedEvents,
  customTitle,
  categoryName,
  customEventTexts,
  backgroundImage,
  onDownload,
}) => {
  return (
    <motion.div
      className="lg:col-span-2 lg:sticky lg:top-6 self-start"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <Card className={cn(cardPreset, 'p-6 mb-6')}>
        <div className="mb-4 p-3 bg-background border-2 border-foreground rounded-xl dark:bg-card dark:border-foreground">
          <p className="text-sm text-foreground">
            <strong>Export-Format:</strong> 1080 × 1920 px
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Die Vorschau wird skaliert angezeigt, damit der gesamte Content sichtbar ist.
          </p>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-300px)] flex justify-center items-start p-4">
          <div
            style={{
              transform: 'scale(0.4)',
              transformOrigin: 'top center',
            }}
          >
            <EventImagePreviewCanvas
              elementRef={elementRef}
              settings={settings}
              groupedEvents={groupedEvents}
              customTitle={customTitle}
              categoryName={categoryName}
              customEventTexts={customEventTexts}
              backgroundImage={backgroundImage}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <LoadingButton
          onClick={onDownload}
          className={cn(
            cardPreset,
            'bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 gap-2 dark:bg-card dark:border-foreground dark:text-foreground'
          )}
        >
          <Download className="h-4 w-4" />
          Als Bild herunterladen
        </LoadingButton>
      </div>
    </motion.div>
  );
};
