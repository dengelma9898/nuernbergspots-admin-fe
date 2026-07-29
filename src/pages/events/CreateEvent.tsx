import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { EventFormHeader } from '@/components/events/event-form/EventFormHeader';
import { EventFormValidationAlert } from '@/components/events/event-form/EventFormValidationAlert';
import { EventFormFields } from '@/components/events/event-form/EventFormFields';
import { EventFormActions } from '@/components/events/event-form/EventFormActions';
import { useEventCreateForm } from '@/hooks/useEventCreateForm';

export const CreateEvent: React.FC = () => {
  const {
    loading,
    categories,
    validationErrors,
    validationErrorsRef,
    newEvent,
    searchValue,
    handleInputChange,
    handleSocialMediaChange,
    handleLocationSelect,
    handleUpdateTimeSlot,
    handleSubmit,
    navigate,
  } = useEventCreateForm();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <EventFormHeader title="Neues Event erstellen" onBack={() => navigate('/events')} />

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
                Füllen Sie alle notwendigen Informationen aus, um ein neues Event zu erstellen.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <EventFormValidationAlert errors={validationErrors} alertRef={validationErrorsRef} />

              <EventFormFields
                newEvent={newEvent}
                categories={categories}
                searchValue={searchValue}
                onInputChange={handleInputChange}
                onSocialMediaChange={handleSocialMediaChange}
                onLocationSelect={handleLocationSelect}
                onUpdateTimeSlot={handleUpdateTimeSlot}
              />

              <EventFormActions
                onCancel={() => navigate('/events')}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Event erstellen"
                loadingText="Wird erstellt..."
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
