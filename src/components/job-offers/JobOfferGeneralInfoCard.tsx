import React from 'react';
import { ImagePlus, X } from 'lucide-react';
import { JobOfferCreation } from '@/models/job-offer';
import { JobCategory } from '@/models/job-category';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/utils/iconUtils';
import { JobOfferListField } from '@/components/job-offers/JobOfferListField';

interface JobOfferGeneralInfoCardProps {
  formData: JobOfferCreation;
  categories: JobCategory[];
  companyLogoPreview: string;
  onFormDataChange: (updater: (prev: JobOfferCreation) => JobOfferCreation) => void;
  onCompanyLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCompanyLogo: () => void;
  onAddArrayItem: (field: 'tasks' | 'benefits') => void;
  onRemoveArrayItem: (field: 'tasks' | 'benefits', index: number) => void;
  onUpdateArrayItem: (field: 'tasks' | 'benefits', index: number, value: string) => void;
}

export function JobOfferGeneralInfoCard({
  formData,
  categories,
  companyLogoPreview,
  onFormDataChange,
  onCompanyLogoSelect,
  onRemoveCompanyLogo,
  onAddArrayItem,
  onRemoveArrayItem,
  onUpdateArrayItem,
}: JobOfferGeneralInfoCardProps) {
  const setFormData = onFormDataChange;

  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(cardPreset, 'overflow-hidden')}>
        <div className="p-4 sm:p-6 border-b border-secondary">
          <h2 className="text-xl font-bold text-foreground">Allgemeine Informationen</h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Titel
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className={cn(inputPreset)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isHighlight"
              checked={formData.isHighlight}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, isHighlight: checked }))}
            />
            <Label htmlFor="isHighlight" className="text-foreground">
              Als Highlight markieren
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Firmenlogo</Label>
            <div className="grid grid-cols-1 gap-4">
              {companyLogoPreview ? (
                <div className="relative group">
                  <img
                    src={companyLogoPreview}
                    alt="Firmenlogo Vorschau"
                    className={cn(cardPreset, 'w-full h-32 object-contain p-4')}
                  />
                  <LoadingButton
                    type="button"
                    size="icon"
                    onClick={onRemoveCompanyLogo}
                    className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </LoadingButton>
                </div>
              ) : (
                <label
                  className={cn(
                    cardPreset,
                    'flex items-center justify-center h-32 border-2 border-dashed cursor-pointer hover:border-secondary/50 transition-all duration-300'
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onCompanyLogoSelect}
                    className="hidden"
                  />
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="generalDescription" className="text-foreground">
              Allgemeine Beschreibung
            </Label>
            <Textarea
              id="generalDescription"
              value={formData.generalDescription}
              onChange={e => setFormData(prev => ({ ...prev, generalDescription: e.target.value }))}
              required
              className={cn(inputPreset)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neededProfile" className="text-foreground">
              Benötigtes Profil
            </Label>
            <Textarea
              id="neededProfile"
              value={formData.neededProfile}
              onChange={e => setFormData(prev => ({ ...prev, neededProfile: e.target.value }))}
              required
              className={cn(inputPreset)}
            />
          </div>

          <JobOfferListField
            label="Aufgaben"
            items={formData.tasks}
            addButtonLabel="Aufgabe hinzufügen"
            onAdd={() => onAddArrayItem('tasks')}
            onRemove={index => onRemoveArrayItem('tasks', index)}
            onUpdate={(index, value) => onUpdateArrayItem('tasks', index, value)}
          />

          <JobOfferListField
            label="Vorteile"
            items={formData.benefits}
            addButtonLabel="Vorteil hinzufügen"
            onAdd={() => onAddArrayItem('benefits')}
            onRemove={index => onRemoveArrayItem('benefits', index)}
            onUpdate={(index, value) => onUpdateArrayItem('benefits', index, value)}
          />

          <div className="space-y-2">
            <Label htmlFor="jobOfferCategoryId" className="text-foreground">
              Kategorie
            </Label>
            <Select
              value={formData.jobOfferCategoryId}
              onValueChange={value => setFormData(prev => ({ ...prev, jobOfferCategoryId: value }))}
              required
            >
              <SelectTrigger className={cn(inputPreset)}>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent className={cn(cardPreset)}>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      {getIconComponent?.(cat.iconName)}
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
