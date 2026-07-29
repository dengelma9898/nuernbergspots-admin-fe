import React from 'react';
import { Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { EventCategory } from '@/models/event-category';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/utils/iconUtils';
import { NewEventFormState } from '@/components/events/event-form/types';

interface EventFormFieldsProps {
  newEvent: NewEventFormState;
  categories: EventCategory[];
  searchValue: LocationResult | null;
  onInputChange: (field: keyof NewEventFormState, value: unknown) => void;
  onSocialMediaChange: (field: keyof NewEventFormState['socialMedia'], value: string) => void;
  onLocationSelect: (location: LocationResult | null) => void;
  onUpdateTimeSlot: (date: string, field: 'from' | 'to', value: string) => void;
  showLocationWarning?: boolean;
  showLocationDetails?: boolean;
}

export function EventFormFields({
  newEvent,
  categories,
  searchValue,
  onInputChange,
  onSocialMediaChange,
  onLocationSelect,
  onUpdateTimeSlot,
  showLocationWarning = false,
  showLocationDetails = false,
}: EventFormFieldsProps) {
  return (
    <>
      <motion.div
        className="space-y-2"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.1 }}
      >
        <Label htmlFor="title" className="text-foreground">
          Titel
        </Label>
        <Input
          id="title"
          value={newEvent.title}
          onChange={e => onInputChange('title', e.target.value)}
          placeholder="z.B. Sommerfest 2024"
          className={cn(inputPreset)}
        />
        <p className="text-xs text-muted-foreground">
          Ein prägnanter Titel, der das Event gut beschreibt.
        </p>
      </motion.div>

      <motion.div
        className="space-y-2"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.2 }}
      >
        <Label htmlFor="description" className="text-foreground">
          Beschreibung
        </Label>
        <Textarea
          id="description"
          value={newEvent.description}
          onChange={e => onInputChange('description', e.target.value)}
          placeholder="Beschreiben Sie das Event im Detail..."
          className={cn(inputPreset, 'min-h-[100px]')}
        />
        <p className="text-xs text-muted-foreground">
          Eine ausführliche Beschreibung des Events. Nennen Sie wichtige Details wie Programm,
          Highlights oder besondere Hinweise.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-foreground">
            Startdatum
          </Label>
          <Input
            id="startDate"
            type="date"
            value={newEvent.startDate.split('T')[0]}
            onChange={e => onInputChange('startDate', e.target.value)}
            className={cn(inputPreset)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-foreground">
            Enddatum
          </Label>
          <Input
            id="endDate"
            type="date"
            value={newEvent.endDate.split('T')[0]}
            onChange={e => onInputChange('endDate', e.target.value)}
            className={cn(inputPreset)}
          />
        </div>
      </div>

      {newEvent.dailyTimeSlots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-foreground">Tägliche Zeitangaben (optional)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Beide Felder (Zeitfenster und Monat/Jahr) können gleichzeitig gesetzt sein. Bei
                    der Anzeige hat &apos;Zeitfenster&apos; Priorität vor &apos;Monat/Jahr&apos;.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            {newEvent.dailyTimeSlots.map(slot => (
              <div key={slot.date} className={cn(cardPreset, 'p-4')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="font-medium text-foreground">
                    {format(parseISO(slot.date), 'EEEE, dd.MM.yyyy', { locale: de })}
                  </div>
                  <Input
                    type="time"
                    value={slot.from || ''}
                    onChange={e => onUpdateTimeSlot(slot.date, 'from', e.target.value)}
                    placeholder="Von"
                    className={cn(inputPreset)}
                  />
                  <Input
                    type="time"
                    value={slot.to || ''}
                    onChange={e => onUpdateTimeSlot(slot.date, 'to', e.target.value)}
                    placeholder="Bis"
                    className={cn(inputPreset)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="monthYear" className="text-foreground">
            Monat/Jahr (optional)
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Du kannst zuerst Monat/Jahr setzen und später Zeitfenster hinzufügen, ohne
                  Monat/Jahr löschen zu müssen. Beide Felder können gleichzeitig existieren.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <MonthYearPicker
          id="monthYear"
          value={newEvent.monthYear}
          onChange={value => onInputChange('monthYear', value || null)}
          className={cn(inputPreset)}
        />
        <p className="text-xs text-muted-foreground">
          Verwende dieses Feld, wenn das genaue Datum noch nicht feststeht. Sobald Start- und
          Enddatum bekannt sind, werden automatisch Zeitfenster generiert.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Adresse</Label>
        {showLocationWarning && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-2">
            <div className="text-sm text-destructive font-semibold mb-1">
              ⚠️ Adresse muss neu gesetzt werden
            </div>
            <p className="text-xs text-destructive/80">
              Die Adresse des kopierten Events ist nicht vollständig oder konnte nicht korrekt
              übertragen werden. Bitte suchen Sie die Adresse erneut über das Suchfeld und wählen
              Sie den passenden Eintrag aus.
            </p>
          </div>
        )}
        <LocationSearch
          value={searchValue}
          onChange={onLocationSelect}
          placeholder="Adresse suchen..."
          debounce={1000}
        />
        {showLocationDetails && newEvent.address && (
          <div className={cn(cardPreset, 'p-4')}>
            <div className="font-semibold mb-2 flex items-center gap-2 text-foreground">
              <span>📍</span>
              {newEvent.address}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                Latitude:
                <br />
                {newEvent.latitude}
              </div>
              <div>
                Longitude:
                <br />
                {newEvent.longitude}
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Der genaue Veranstaltungsort. Suchen Sie nach einer Adresse und wählen Sie den passenden
          Eintrag aus.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceString" className="text-foreground">
          Preis
        </Label>
        <Input
          id="priceString"
          type="text"
          value={newEvent.priceString || ''}
          onChange={e => onInputChange('priceString', e.target.value || null)}
          placeholder="z.B. 15€, Kostenlos, Spende, etc."
          className={cn(inputPreset)}
        />
        <p className="text-xs text-muted-foreground">
          Der Eintrittspreis als Text. Lassen Sie das Feld leer für kostenlose Events.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-foreground">
          Kategorie
        </Label>
        <Select
          value={newEvent.categoryId || ''}
          onValueChange={value => onInputChange('categoryId', value)}
        >
          <SelectTrigger className={cn(inputPreset)}>
            <SelectValue placeholder="Kategorie auswählen" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <span className="flex items-center">{getIconComponent(category.iconName)}</span>
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Wählen Sie eine passende Kategorie für Ihr Event aus.
        </p>
      </div>

      <div className="space-y-4">
        <div className={cn(cardPreset, 'p-4')}>
          <div className="flex items-center space-x-3">
            <Switch
              id="ticketsNeeded"
              checked={newEvent.ticketsNeeded}
              onCheckedChange={checked => onInputChange('ticketsNeeded', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="ticketsNeeded" className="text-foreground">
                Tickets erforderlich
              </Label>
              <p className="text-xs text-muted-foreground">
                Aktivieren Sie diese Option, wenn Besucher Tickets im Voraus erwerben müssen.
              </p>
            </div>
          </div>
        </div>

        <div className={cn(cardPreset, 'p-4')}>
          <div className="flex items-center space-x-3">
            <Switch
              id="isPromoted"
              checked={newEvent.isPromoted}
              onCheckedChange={checked => onInputChange('isPromoted', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="isPromoted" className="text-foreground">
                Als &quot;Highlight&quot; markieren
              </Label>
              <p className="text-xs text-muted-foreground">
                Aktiviere diese Option, um das Event als &quot;Highlight&quot; zu kennzeichnen.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-foreground text-lg">Kontaktinformationen</Label>

        <div className={cn(cardPreset, 'p-4 space-y-4')}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-muted-foreground">
                E-Mail
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={newEvent.contactEmail || ''}
                onChange={e => onInputChange('contactEmail', e.target.value)}
                placeholder="kontakt@beispiel.de"
                className={cn(inputPreset)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-muted-foreground">
                Telefon
              </Label>
              <Input
                id="contactPhone"
                type="tel"
                value={newEvent.contactPhone || ''}
                onChange={e => onInputChange('contactPhone', e.target.value)}
                placeholder="+49 123 4567890"
                className={cn(inputPreset)}
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="website" className="text-muted-foreground">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={newEvent.website || ''}
                onChange={e => onInputChange('website', e.target.value)}
                placeholder="https://www.beispiel.de"
                className={cn(inputPreset)}
              />
            </div>
          </div>

          <div className="mt-6">
            <Label className="text-muted-foreground text-base">Social Media</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-muted-foreground text-sm">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={newEvent.socialMedia.instagram || ''}
                  onChange={e => onSocialMediaChange('instagram', e.target.value)}
                  placeholder="@benutzername"
                  className={cn(inputPreset)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-muted-foreground text-sm">
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={newEvent.socialMedia.facebook || ''}
                  onChange={e => onSocialMediaChange('facebook', e.target.value)}
                  placeholder="@seitename"
                  className={cn(inputPreset)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok" className="text-muted-foreground text-sm">
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  value={newEvent.socialMedia.tiktok || ''}
                  onChange={e => onSocialMediaChange('tiktok', e.target.value)}
                  placeholder="@benutzername"
                  className={cn(inputPreset)}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Alle Kontaktinformationen sind optional. Fügen Sie nur die Informationen hinzu, die Sie
            öffentlich teilen möchten.
          </p>
        </div>
      </div>
    </>
  );
}
