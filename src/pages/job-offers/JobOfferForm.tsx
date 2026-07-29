import React from 'react';
import { motion } from '@/components/motion';
import { staggerContainer } from '@/lib/animations';
import { JobOfferFormSkeleton } from '@/components/job-offers/JobOfferFormSkeleton';
import { JobOfferFormHeader } from '@/components/job-offers/JobOfferFormHeader';
import { JobOfferGeneralInfoCard } from '@/components/job-offers/JobOfferGeneralInfoCard';
import { JobOfferDetailsCard } from '@/components/job-offers/JobOfferDetailsCard';
import { JobOfferContactCard } from '@/components/job-offers/JobOfferContactCard';
import { JobOfferSocialMediaCard } from '@/components/job-offers/JobOfferSocialMediaCard';
import { JobOfferImagesCard } from '@/components/job-offers/JobOfferImagesCard';
import { JobOfferFormActions } from '@/components/job-offers/JobOfferFormActions';
import { useJobOfferForm } from '@/hooks/useJobOfferForm';

export function JobOfferForm() {
  const {
    id,
    navigate,
    isLoading,
    isSaving,
    existingImageUrls,
    companyLogoPreview,
    imageUpload,
    categories,
    formData,
    setFormData,
    searchValue,
    handleCompanyLogoSelect,
    removeCompanyLogo,
    handleSubmit,
    handleImageSelect,
    removeImage,
    addArrayItem,
    removeArrayItem,
    updateArrayItem,
    handleLocationSelect,
  } = useJobOfferForm();

  if (isLoading) {
    return <JobOfferFormSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <JobOfferFormHeader
          title={id ? 'Stellenangebot bearbeiten' : 'Neues Stellenangebot'}
          onBack={() => navigate('/job-offers')}
        />

        <motion.form
          onSubmit={handleSubmit}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <JobOfferGeneralInfoCard
              formData={formData}
              categories={categories}
              companyLogoPreview={companyLogoPreview}
              onFormDataChange={setFormData}
              onCompanyLogoSelect={handleCompanyLogoSelect}
              onRemoveCompanyLogo={removeCompanyLogo}
              onAddArrayItem={addArrayItem}
              onRemoveArrayItem={removeArrayItem}
              onUpdateArrayItem={updateArrayItem}
            />
            <JobOfferDetailsCard
              formData={formData}
              searchValue={searchValue}
              onFormDataChange={setFormData}
              onLocationSelect={handleLocationSelect}
            />
            <JobOfferContactCard formData={formData} onFormDataChange={setFormData} />
            <JobOfferSocialMediaCard formData={formData} onFormDataChange={setFormData} />
            <JobOfferImagesCard
              existingImageUrls={existingImageUrls}
              imageUpload={imageUpload}
              onImageSelect={handleImageSelect}
              onRemoveImage={removeImage}
            />
          </div>

          <JobOfferFormActions
            isEdit={Boolean(id)}
            isSaving={isSaving}
            onCancel={() => navigate('/job-offers')}
          />
        </motion.form>
      </div>
    </div>
  );
}
