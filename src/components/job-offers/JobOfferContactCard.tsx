import React from 'react';
import { JobOfferCreation } from '@/models/job-offer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface JobOfferContactCardProps {
  formData: JobOfferCreation;
  onFormDataChange: (updater: (prev: JobOfferCreation) => JobOfferCreation) => void;
}

export function JobOfferContactCard({ formData, onFormDataChange }: JobOfferContactCardProps) {
  const setFormData = onFormDataChange;

  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(cardPreset, 'overflow-hidden')}>
        <div className="p-4 sm:p-6 border-b border-secondary">
          <h2 className="text-xl font-bold text-foreground">Kontaktdaten</h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="text-foreground">
              Kontaktperson
            </Label>
            <Input
              id="contactPerson"
              value={formData.contactData.person}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  contactData: { ...prev.contactData, person: e.target.value },
                }))
              }
              className={cn(inputPreset)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-foreground">
              E-Mail
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactData.email}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  contactData: { ...prev.contactData, email: e.target.value },
                }))
              }
              required
              className={cn(inputPreset)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-foreground">
              Telefon
            </Label>
            <Input
              id="contactPhone"
              value={formData.contactData.phone}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  contactData: { ...prev.contactData, phone: e.target.value },
                }))
              }
              className={cn(inputPreset)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link" className="text-foreground">
              Bewerbungslink
            </Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
              required
              className={cn(inputPreset)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
