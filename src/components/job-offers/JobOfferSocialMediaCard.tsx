import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { siFacebook, siInstagram } from 'simple-icons';
import { JobOfferCreation } from '@/models/job-offer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { BrandIcon } from '@/components/job-offers/BrandIcon';

interface JobOfferSocialMediaCardProps {
  formData: JobOfferCreation;
  onFormDataChange: (updater: (prev: JobOfferCreation) => JobOfferCreation) => void;
}

export function JobOfferSocialMediaCard({
  formData,
  onFormDataChange,
}: JobOfferSocialMediaCardProps) {
  const setFormData = onFormDataChange;

  const updateSocial = (field: 'linkedin' | 'xing' | 'instagram' | 'facebook', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [field]: value || null,
      },
    }));
  };

  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(cardPreset, 'overflow-hidden')}>
        <div className="p-4 sm:p-6 border-b border-secondary">
          <h2 className="text-xl font-bold text-foreground">Social Media</h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-foreground">
              LinkedIn
            </Label>
            <div className="flex gap-2">
              <LinkIcon className="h-4 w-4 mt-2 shrink-0 text-muted-foreground" />
              <Input
                id="linkedin"
                type="url"
                value={formData.socialMedia?.linkedin || ''}
                onChange={e => updateSocial('linkedin', e.target.value)}
                className={cn(inputPreset)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="xing" className="text-foreground">
              Xing
            </Label>
            <div className="flex gap-2">
              <LinkIcon className="h-4 w-4 mt-2 text-muted-foreground" />
              <Input
                id="xing"
                type="url"
                value={formData.socialMedia?.xing || ''}
                onChange={e => updateSocial('xing', e.target.value)}
                className={cn(inputPreset)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-foreground">
              Instagram
            </Label>
            <div className="flex gap-2">
              <BrandIcon path={siInstagram.path} className="mt-2 text-muted-foreground" />
              <Input
                id="instagram"
                type="url"
                value={formData.socialMedia?.instagram || ''}
                onChange={e => updateSocial('instagram', e.target.value)}
                className={cn(inputPreset)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-foreground">
              Facebook
            </Label>
            <div className="flex gap-2">
              <BrandIcon path={siFacebook.path} className="mt-2 text-muted-foreground" />
              <Input
                id="facebook"
                type="url"
                value={formData.socialMedia?.facebook || ''}
                onChange={e => updateSocial('facebook', e.target.value)}
                className={cn(inputPreset)}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
