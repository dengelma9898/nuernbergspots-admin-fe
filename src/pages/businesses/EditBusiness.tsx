import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fadeInUp, defaultTransition } from '@/lib/animations';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

import { useEditBusiness } from '@/hooks/useEditBusiness';

import { LoadingButton } from '@/components/LoadingButton';
import { Card } from '@/components/ui/card';
import { motion } from '@/components/motion';
import { BusinessBasicInfoForm } from '@/components/businesses/BusinessBasicInfoForm';
import { BusinessCategoriesCard } from '@/components/businesses/BusinessCategoriesCard';
import { BusinessMediaCard } from '@/components/businesses/BusinessMediaCard';
import { BusinessOpeningHoursCard } from '@/components/businesses/BusinessOpeningHoursCard';
import { BusinessReviewCard } from '@/components/businesses/BusinessReviewCard';
import { BusinessSaveConfirmDialog } from '@/components/businesses/BusinessSaveConfirmDialog';
import { BusinessStatusHighlightCard } from '@/components/businesses/BusinessStatusHighlightCard';
import { EditBusinessSkeleton } from '@/components/businesses/EditBusinessSkeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const EditBusiness: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    business,
    setBusiness,
    loading,
    isSaving,
    editReview,
    setEditReview,
    logoPreview,
    existingBusinessImages,
    existingReviewImages,
    businessImageUpload,
    reviewImageUpload,
    categories,
    keywords,
    validationErrors,
    validationErrorsRef,
    searchValue,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    timeSlots,
    newTimeSlot,
    setNewTimeSlot,
    addTimeSlot,
    removeTimeSlot,
    handleTimeSlotChange,
    toggleDayForTimeSlot,
    toggleDayForNewTimeSlot,
    handleStatusChange,
    handlePromotedChange,
    handleLogoUpload,
    handleBusinessImageUpload,
    handleRemoveBusinessImage,
    handleImageUpload,
    handleRemoveImage,
    toggleCategory,
    toggleKeyword,
    handleLocationSelect,
    handleSaveClick,
    handleConfirmSave,
  } = useEditBusiness({ businessId: id });

  if (loading) {
    return <EditBusinessSkeleton />;
  }

  if (!business) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-4 md:p-8">
          <Card className={cn(cardPreset, 'p-8 md:p-12 text-center max-w-lg mx-auto')}>
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
              Partner nicht gefunden
            </h3>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Der angeforderte Partner konnte nicht gefunden werden.
            </p>
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/businesses')}
              className={cn(buttonPreset, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zur Übersicht</span>
            </LoadingButton>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 container mx-auto py-6">
          <motion.div
            className={cn(cardPreset, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                <LoadingButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/businesses')}
                  className={cn(buttonPreset, 'rounded-full')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zur Übersicht</span>
                </LoadingButton>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Partner bearbeiten
                </h1>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={defaultTransition}
              >
                <BusinessBasicInfoForm
                  business={business}
                  onBusinessChange={setBusiness}
                  searchValue={searchValue}
                  onLocationSelect={handleLocationSelect}
                  validationErrors={validationErrors}
                  validationErrorsRef={validationErrorsRef}
                />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                <BusinessStatusHighlightCard
                  business={business}
                  onStatusChange={handleStatusChange}
                  onPromotedChange={handlePromotedChange}
                />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.2 }}
              >
                <BusinessCategoriesCard
                  business={business}
                  categories={categories}
                  keywords={keywords}
                  onToggleCategory={toggleCategory}
                  onToggleKeyword={toggleKeyword}
                />
              </motion.div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.3 }}
              >
                <BusinessMediaCard
                  business={business}
                  logoPreview={logoPreview}
                  existingBusinessImages={existingBusinessImages}
                  businessImageUpload={businessImageUpload}
                  onLogoUpload={handleLogoUpload}
                  onBusinessImageUpload={handleBusinessImageUpload}
                  onRemoveBusinessImage={handleRemoveBusinessImage}
                />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.4 }}
              >
                <BusinessOpeningHoursCard
                  timeSlots={timeSlots}
                  newTimeSlot={newTimeSlot}
                  validationErrors={validationErrors}
                  validationErrorsRef={validationErrorsRef}
                  onNewTimeSlotChange={setNewTimeSlot}
                  onTimeSlotChange={handleTimeSlotChange}
                  onRemoveTimeSlot={removeTimeSlot}
                  onToggleDayForTimeSlot={toggleDayForTimeSlot}
                  onToggleDayForNewTimeSlot={toggleDayForNewTimeSlot}
                  onAddTimeSlot={addTimeSlot}
                />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.5 }}
              >
                <BusinessReviewCard
                  editReview={editReview}
                  existingReviewImages={existingReviewImages}
                  reviewImageUpload={reviewImageUpload}
                  onEditReviewChange={setEditReview}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                />
              </motion.div>

              <div className="flex flex-row items-center justify-end gap-4 pt-4 border-t border-secondary">
                <LoadingButton
                  variant="ghost"
                  onClick={() => navigate('/businesses')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0"
                >
                  Abbrechen
                </LoadingButton>
                <LoadingButton
                  variant="outline"
                  onClick={handleSaveClick}
                  isLoading={isSaving}
                  loadingText="Speichert..."
                  className={cn(buttonPreset, 'flex items-center')}
                  data-testid="edit-business-open-save-dialog"
                >
                  Änderungen speichern
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BusinessSaveConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmSave}
      />
    </>
  );
};
