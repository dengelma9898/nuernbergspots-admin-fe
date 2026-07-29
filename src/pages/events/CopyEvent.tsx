import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { EventFormHeader } from '@/components/events/event-form/EventFormHeader';
import { EventFormFields } from '@/components/events/event-form/EventFormFields';
import { EventFormActions } from '@/components/events/event-form/EventFormActions';
import { CopyEventImageSection } from '@/components/events/event-form/CopyEventImageSection';
import { useCopyEventData } from '@/hooks/useCopyEventData';

export const CopyEvent: React.FC = () => {
  const {
    loading,
    loadingEvent,
    categories,
    copyImages,
    setCopyImages,
    titleImagePreview,
    imagePreviews,
    titleImageUrlToCopy,
    imageUrlsToCopy,
    hasValidLocation,
    newEvent,
    searchValue,
    handleInputChange,
    handleSocialMediaChange,
    handleLocationSelect,
    handleUpdateTimeSlot,
    removeImagePreview,
    removeTitleImagePreview,
    handleSubmit,
    navigate,
  } = useCopyEventData();

  if (loadingEvent) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 container mx-auto py-6">
          <div className={cn(cardPreset, 'p-6')}>
            <Skeleton className="bg-muted h-10 w-64 mb-4 rounded-lg" />
            <Skeleton className="bg-muted h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <EventFormHeader title="Event kopieren" onBack={() => navigate('/events')} />

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <Card className={cn(cardPreset)}>
            <CardHeader>
              <CardTitle className="text-foreground">Event Details</CardTitle>
              <CardDescription className="text-muted-foreground">
                Passe die Daten an und erstelle eine Kopie des Events.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <CopyEventImageSection
                copyImages={copyImages}
                onCopyImagesChange={setCopyImages}
                titleImagePreview={titleImagePreview}
                imagePreviews={imagePreviews}
                titleImageUrlToCopy={titleImageUrlToCopy}
                imageUrlsToCopy={imageUrlsToCopy}
                onRemoveTitleImage={removeTitleImagePreview}
                onRemoveImage={removeImagePreview}
              />

              <EventFormFields
                newEvent={newEvent}
                categories={categories}
                searchValue={searchValue}
                onInputChange={handleInputChange}
                onSocialMediaChange={handleSocialMediaChange}
                onLocationSelect={handleLocationSelect}
                onUpdateTimeSlot={handleUpdateTimeSlot}
                showLocationWarning={!hasValidLocation}
                showLocationDetails={hasValidLocation}
              />

              <EventFormActions
                onCancel={() => navigate('/events')}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Event kopieren"
                loadingText="Wird kopiert..."
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
