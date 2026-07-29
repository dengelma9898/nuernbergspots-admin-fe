import React from 'react';

import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { getEventStatus } from '@/utils/eventFormatters';
import { isEventChanged } from '@/utils/eventValidators';
import { EventInfoCard } from '@/components/events/EventInfoCard';
import { EventTimeSlots } from '@/components/events/EventTimeSlots';
import { EventImageCard } from '@/components/events/EventImageCard';
import { EventContactInfo } from '@/components/events/EventContactInfo';
import { EventLocationInfo } from '@/components/events/EventLocationInfo';

import { useEventDetail } from '@/hooks/useEventDetail';
import { EventDetailSkeleton } from '@/components/events/EventDetailSkeletons';

export type EventDetailContentProps = ReturnType<typeof useEventDetail>;

export const EventDetailContent: React.FC<EventDetailContentProps> = ({
  navigate,
  eventListPathWithFilters,
  event,
  categories,
  loading,
  isApproving,
  eventForm,
  imageUpload,
  handleDelete,
  handleApprovePending,
}) => {
  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 flex justify-center items-center h-screen">
          <motion.div
            className={cn(cardPreset, 'p-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="text-muted-foreground text-lg">Event nicht gefunden.</div>
          </motion.div>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);
  const hasChanges = isEventChanged(event, eventForm.editedEvent);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <motion.div
          className={cn(cardPreset, 'p-6 mb-8')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex items-center gap-4">
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={() => navigate(eventListPathWithFilters)}
              className={cn(buttonPreset, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zur Übersicht</span>
            </LoadingButton>
            <h1 className="text-3xl font-bold text-foreground">Event Details</h1>
          </div>
        </motion.div>

        {event.status === 'PENDING' ? (
          <motion.div
            className={cn(
              cardPreset,
              'p-6 mb-8 border-amber-400/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center gap-4'
            )}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="text-foreground flex-1 space-y-1">
              <p className="font-semibold">Ausstehende Freigabe</p>
              <p className="text-sm text-muted-foreground">
                Dieses Event ist noch nicht öffentlich. Nach der Freigabe wird es sichtbar und es
                kann eine Benachrichtigung an Nutzer gesendet werden.
              </p>
            </div>
            <LoadingButton
              onClick={() => void handleApprovePending()}
              isLoading={isApproving}
              disabled={loading || eventForm.isEditing}
              loadingText="Wird freigegeben..."
              className="bg-emerald-600 text-white hover:bg-emerald-600/90 shrink-0 gap-2"
            >
              <BadgeCheck className="h-4 w-4" />
              Freigeben
            </LoadingButton>
          </motion.div>
        ) : null}

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp} className="space-y-4">
            <EventInfoCard
              event={event}
              categories={categories}
              status={status}
              isEditing={eventForm.isEditing}
              editedEvent={eventForm.editedEvent}
              onInputChange={eventForm.handleInputChange}
              onCancel={eventForm.handleCancel}
              onSave={eventForm.handleSave}
              isEventChanged={hasChanges}
            />
            <EventTimeSlots
              event={event}
              isEditing={eventForm.isEditing}
              editedEvent={eventForm.editedEvent}
              onInputChange={eventForm.handleInputChange}
            />
            <EventLocationInfo
              event={event}
              isEditing={eventForm.isEditing}
              editedEvent={eventForm.editedEvent}
              searchValue={eventForm.searchValue}
              onLocationSelect={eventForm.handleLocationSelect}
            />
            <EventContactInfo
              event={event}
              isEditing={eventForm.isEditing}
              editedEvent={eventForm.editedEvent}
              onInputChange={eventForm.handleInputChange}
              onSocialMediaChange={eventForm.handleSocialMediaChange}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <EventImageCard
              event={event}
              isEditing={eventForm.isEditing}
              isUploading={imageUpload.isUploading}
              isUploadingTitleImage={imageUpload.isUploadingTitleImage}
              previewUrls={imageUpload.previewUrls}
              imageLimitError={imageUpload.imageLimitError}
              imagesChanged={imageUpload.imagesChanged}
              onFileChange={imageUpload.handleFileChange}
              onTitleImageChange={imageUpload.handleTitleImageChange}
              onDeleteImage={imageUpload.handleDeleteImage}
              onRemovePreview={imageUpload.removePreview}
              onConfirmImages={imageUpload.handleConfirmImages}
            />
          </motion.div>
        </motion.div>

        {!eventForm.isEditing && (
          <motion.div
            className="flex justify-end gap-4 mt-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <LoadingButton variant="destructive" onClick={handleDelete}>
              Löschen
            </LoadingButton>
            <LoadingButton
              onClick={eventForm.handleEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Bearbeiten
            </LoadingButton>
          </motion.div>
        )}

        <Dialog
          open={!!imageUpload.imageToDelete}
          onOpenChange={() => imageUpload.setImageToDelete(null)}
        >
          <DialogContent className={cn(cardPreset)}>
            <DialogHeader>
              <DialogTitle className="text-foreground">Bild entfernen</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Möchten Sie dieses Bild wirklich entfernen? Diese Aktion kann nicht rückgängig
                gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <LoadingButton
                variant="outline"
                onClick={() => imageUpload.setImageToDelete(null)}
                disabled={imageUpload.isDeletingImage}
                className={cn(buttonPreset)}
              >
                Abbrechen
              </LoadingButton>
              <LoadingButton
                variant="destructive"
                onClick={imageUpload.confirmDeleteImage}
                isLoading={imageUpload.isDeletingImage}
                loadingText="Wird entfernt..."
              >
                Entfernen
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="sr-only">
          <div>Event nicht gefunden.</div>
        </div>
      </div>
    </div>
  );
};
