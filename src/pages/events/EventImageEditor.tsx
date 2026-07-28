import React, { useMemo, useRef } from 'react';
import { EventImageDesignSettingsPanel } from '@/components/events/image-editor/EventImageDesignSettingsPanel';
import { EventImageEditorHeader } from '@/components/events/image-editor/EventImageEditorHeader';
import {
  EventImageEditorIssuePanel,
  EventImageEditorSkippedBanner,
} from '@/components/events/image-editor/EventImageEditorIssuePanel';
import { EventImagePreviewPanel } from '@/components/events/image-editor/EventImagePreviewPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventImageDesignSettings } from '@/hooks/useEventImageDesignSettings';
import { useEventImageEditorData } from '@/hooks/useEventImageEditorData';
import { useEventImageExport } from '@/hooks/useEventImageExport';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { groupEventsByDate, validateEventsForImageEditor } from '@/utils/eventImageEditorUtils';

export const EventImageEditor: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const { events, categoryName, customTitle, setCustomTitle, isInitialized } =
    useEventImageEditorData();
  const {
    settings,
    backgroundImage,
    customEventTexts,
    setCustomEventTexts,
    updateSetting,
    handleBackgroundImageChange,
    removeBackgroundImage,
  } = useEventImageDesignSettings();
  const { handleDownload } = useEventImageExport({
    elementRef,
    settings,
    categoryName,
  });

  const validation = useMemo(() => validateEventsForImageEditor(events), [events]);
  const groupedEvents = useMemo(
    () => groupEventsByDate(validation.usableEvents),
    [validation.usableEvents]
  );

  const handleCustomEventTextChange = (eventId: string, value: string) => {
    setCustomEventTexts(prev => ({
      ...prev,
      [eventId]: value,
    }));
  };

  const showNoEvents = isInitialized && events.length === 0;
  const showNoUsableEvents =
    isInitialized && events.length > 0 && validation.usableEvents.length === 0;
  const showEditor = isInitialized && validation.usableEvents.length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <EventImageEditorHeader />

        {!isInitialized ? (
          <div className={cn(cardPreset, 'p-6 space-y-4')} data-testid="event-image-editor-loading">
            <Skeleton className="bg-muted h-8 w-64 rounded" />
            <Skeleton className="bg-muted h-48 w-full rounded-lg" />
            <Skeleton className="bg-muted h-48 w-full rounded-lg" />
          </div>
        ) : null}

        {showNoEvents ? <EventImageEditorIssuePanel variant="no_events" /> : null}

        {showNoUsableEvents ? (
          <EventImageEditorIssuePanel
            variant="no_usable_events"
            skippedEvents={validation.skippedEvents}
          />
        ) : null}

        {showEditor ? (
          <>
            {validation.skippedEvents.length > 0 ? (
              <EventImageEditorSkippedBanner
                skippedEvents={validation.skippedEvents}
                usableCount={validation.usableEvents.length}
              />
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 lg:items-start">
              <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
                <EventImageDesignSettingsPanel
                  settings={settings}
                  groupedEvents={groupedEvents}
                  customTitle={customTitle}
                  customEventTexts={customEventTexts}
                  backgroundImage={backgroundImage}
                  onCustomTitleChange={setCustomTitle}
                  onCustomEventTextChange={handleCustomEventTextChange}
                  updateSetting={updateSetting}
                  onBackgroundImageChange={handleBackgroundImageChange}
                  onRemoveBackgroundImage={removeBackgroundImage}
                />
              </div>

              <EventImagePreviewPanel
                elementRef={elementRef}
                settings={settings}
                groupedEvents={groupedEvents}
                customTitle={customTitle}
                categoryName={categoryName}
                customEventTexts={customEventTexts}
                backgroundImage={backgroundImage}
                onDownload={handleDownload}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
