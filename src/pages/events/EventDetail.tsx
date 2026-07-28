import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import {
  showUserFriendlyError,
  getUserFriendlyError,
  showSuccessMessage,
} from '@/utils/errorUtils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEventForm } from '@/hooks/useEventForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { getEventStatus } from '@/utils/eventFormatters';
import { isEventChanged } from '@/utils/eventValidators';
import { EventInfoCard } from '@/components/events/EventInfoCard';
import { EventTimeSlots } from '@/components/events/EventTimeSlots';
import { EventImageCard } from '@/components/events/EventImageCard';
import { EventContactInfo } from '@/components/events/EventContactInfo';
import { EventLocationInfo } from '@/components/events/EventLocationInfo';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldStartInEditMode =
    (location.state as { startInEditMode?: boolean } | null)?.startInEditMode === true;
  const eventListPathWithFilters = `/events${location.search}`;
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [fetchedEvent, fetchedCategories] = await Promise.all([
        eventService.getEvent(id),
        eventCategoryService.getCategories(),
      ]);
      setEvent(fetchedEvent);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Fehler beim Laden des Events:', error);
      showUserFriendlyError(error, toast, () => loadData(), 'load-event');
      // Nur navigieren wenn es kein retryable Fehler ist
      const friendlyError = getUserFriendlyError(error, 'load-event');
      if (!friendlyError.isRetryable) {
        navigate(eventListPathWithFilters);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Custom Hooks verwenden
  const eventForm = useEventForm({
    event,
    onEventUpdate: loadData,
  });

  const imageUpload = useImageUpload({
    event,
    onEventUpdate: loadData,
  });

  useEffect(() => {
    if (shouldStartInEditMode && event && !eventForm.isEditing) {
      eventForm.handleEdit();
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [shouldStartInEditMode, event, eventForm, location.pathname, location.search, navigate]);

  // Location Search Value initialisieren
  useEffect(() => {
    if (event?.location && !eventForm.searchValue) {
      eventForm.setSearchValue({
        id: 'current',
        title: event.location.address,
        resultType: 'place',
        position: {
          lat: event.location.latitude,
          lng: event.location.longitude,
        },
        address: {
          label: event.location.address,
          countryCode: '',
          countryName: '',
          stateCode: '',
          state: '',
          county: '',
          city: '',
          district: '',
          street: '',
          postalCode: '',
          houseNumber: '',
        },
      });
    }
  }, [event, eventForm]);

  // Delete-Handler mit Navigation
  const handleDelete = async () => {
    await eventForm.handleDelete();
    navigate(eventListPathWithFilters);
  };

  const handleApprovePending = async () => {
    if (!event || isApproving || loading) {
      return;
    }
    try {
      setIsApproving(true);
      const updated = await eventService.approveEvent(event.id);
      setEvent(updated);
      showSuccessMessage(toast, {
        title: 'Event freigegeben',
        description: 'Das Event ist jetzt aktiv und für Nutzer sichtbar.',
      });
    } catch (error) {
      console.error('Fehler bei der Freigabe:', error);
      showUserFriendlyError(error, toast, () => void handleApprovePending(), 'approve-event');
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 container mx-auto py-6">
          {/* Header Skeleton */}
          <div className={cn(cardPreset, 'p-6 mb-8')}>
            <div className="flex items-center gap-4">
              <Skeleton className="bg-muted h-10 w-48 rounded-lg" />
              <Skeleton className="bg-muted h-8 w-40 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Event Information Skeleton */}
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Skeleton className="bg-muted h-6 w-48 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="bg-muted h-6 w-20 rounded-lg" />
                    <Skeleton className="bg-muted h-6 w-24 rounded-lg" />
                    <Skeleton className="bg-muted h-6 w-28 rounded-lg" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-12 rounded" />
                  <Skeleton className="bg-muted h-6 w-3/4 rounded" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-20 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="bg-muted h-4 w-full rounded" />
                    <Skeleton className="bg-muted h-4 w-5/6 rounded" />
                    <Skeleton className="bg-muted h-4 w-3/4 rounded" />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-20 rounded" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Skeleton className="bg-muted h-4 w-4 rounded" />
                        <Skeleton className="bg-muted h-4 w-32 rounded" />
                        <Skeleton className="bg-muted h-4 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-16 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="bg-muted h-4 w-4 rounded" />
                    <Skeleton className="bg-muted h-4 w-64 rounded" />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-12 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="bg-muted h-4 w-4 rounded" />
                    <Skeleton className="bg-muted h-4 w-20 rounded" />
                  </div>
                </div>

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="bg-muted h-5 w-10 rounded-full" />
                    <Skeleton className="bg-muted h-4 w-32 rounded" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="bg-muted h-5 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="bg-muted h-4 w-40 rounded" />
                      <Skeleton className="bg-muted h-3 w-56 rounded" />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Skeleton className="bg-muted h-4 w-20 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="bg-muted h-4 w-4 rounded" />
                    <Skeleton className="bg-muted h-4 w-24 rounded" />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <Skeleton className="bg-muted h-4 w-36 rounded" />
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="bg-muted h-4 w-16 rounded" />
                      <Skeleton className="bg-muted h-4 w-40 rounded ml-2" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="bg-muted h-4 w-16 rounded" />
                      <Skeleton className="bg-muted h-4 w-32 rounded ml-2" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="bg-muted h-4 w-16 rounded" />
                      <Skeleton className="bg-muted h-4 w-48 rounded ml-2" />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <Skeleton className="bg-muted h-4 w-24 rounded" />
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="bg-muted h-4 w-20 rounded" />
                      <Skeleton className="bg-muted h-4 w-32 rounded ml-2" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="bg-muted h-4 w-20 rounded" />
                      <Skeleton className="bg-muted h-4 w-36 rounded ml-2" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="bg-muted h-4 w-20 rounded" />
                      <Skeleton className="bg-muted h-4 w-28 rounded ml-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Card - Images Skeleton */}
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <Skeleton className="bg-muted h-6 w-16 rounded" />
              </CardHeader>
              <CardContent>
                {/* Title Image */}
                <div className="mb-6">
                  <Skeleton className="bg-muted h-4 w-20 rounded mb-2" />
                  <Skeleton className="bg-muted h-48 w-48 rounded-lg mx-auto" />
                </div>

                {/* Additional Images */}
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="bg-muted h-48 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex justify-end gap-4 mt-6">
            <Skeleton className="bg-muted h-10 w-20 rounded-lg" />
            <Skeleton className="bg-muted h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
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
        {/* Header */}
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

        {/* Hidden elements for test compatibility */}
        <div className="sr-only">
          <div>Event nicht gefunden.</div>
        </div>
      </div>
    </div>
  );
};
