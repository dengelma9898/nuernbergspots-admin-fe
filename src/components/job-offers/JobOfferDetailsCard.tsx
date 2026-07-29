import React from 'react';
import { JobOfferCreation } from '@/models/job-offer';
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
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface JobOfferDetailsCardProps {
  formData: JobOfferCreation;
  searchValue: LocationResult | null;
  onFormDataChange: (updater: (prev: JobOfferCreation) => JobOfferCreation) => void;
  onLocationSelect: (location: LocationResult | null) => void;
}

export function JobOfferDetailsCard({
  formData,
  searchValue,
  onFormDataChange,
  onLocationSelect,
}: JobOfferDetailsCardProps) {
  const setFormData = onFormDataChange;

  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(cardPreset, 'overflow-hidden')}>
        <div className="p-4 sm:p-6 border-b border-secondary">
          <h2 className="text-xl font-bold text-foreground">Details</h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Adresse</Label>
            <LocationSearch
              value={searchValue}
              onChange={onLocationSelect}
              placeholder="Adresse suchen..."
              debounce={1000}
            />
            {formData.location.address && (
              <div className="text-sm text-muted-foreground">
                Ausgewählte Adresse: {formData.location.address}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeOfEmployment" className="text-foreground">
              Beschäftigungsart
            </Label>
            <Select
              value={formData.typeOfEmployment}
              onValueChange={value => setFormData(prev => ({ ...prev, typeOfEmployment: value }))}
            >
              <SelectTrigger className={cn(inputPreset)}>
                <SelectValue placeholder="Beschäftigungsart auswählen" />
              </SelectTrigger>
              <SelectContent className={cn(cardPreset)}>
                <SelectItem value="Vollzeit" className="cursor-pointer">
                  Vollzeit
                </SelectItem>
                <SelectItem value="Teilzeit" className="cursor-pointer">
                  Teilzeit
                </SelectItem>
                <SelectItem value="Ausbildung" className="cursor-pointer">
                  Ausbildung
                </SelectItem>
                <SelectItem value="Praktikum" className="cursor-pointer">
                  Praktikum
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotesForTypeOfEmployment" className="text-foreground">
              Zusätzliche Notizen zur Beschäftigungsart
            </Label>
            <Textarea
              id="additionalNotesForTypeOfEmployment"
              value={formData.additionalNotesForTypeOfEmployment || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  additionalNotesForTypeOfEmployment: e.target.value || null,
                }))
              }
              className={cn(inputPreset)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="homeOffice"
              checked={formData.homeOffice}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, homeOffice: checked }))}
            />
            <Label htmlFor="homeOffice" className="text-foreground">
              Home Office möglich
            </Label>
          </div>

          {formData.homeOffice && (
            <div className="space-y-2">
              <Label htmlFor="additionalNotesHomeOffice" className="text-foreground">
                Zusätzliche Notizen zum Home Office
              </Label>
              <Textarea
                id="additionalNotesHomeOffice"
                value={formData.additionalNotesHomeOffice || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    additionalNotesHomeOffice: e.target.value || null,
                  }))
                }
                className={cn(inputPreset)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="wage" className="text-foreground">
              Gehalt
            </Label>
            <Input
              id="wage"
              value={formData.wage || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  wage: e.target.value || null,
                }))
              }
              className={cn(inputPreset)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-foreground">
              Startdatum
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
              className={cn(inputPreset)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
