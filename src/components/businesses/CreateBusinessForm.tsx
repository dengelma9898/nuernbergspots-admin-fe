import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { LocationSearch } from '@/components/ui/LocationSearch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SelectableBadge } from '@/components/ui/SelectableBadge';
import { Switch } from '@/components/ui/switch';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { WEEKDAYS, WeekdayKey, useCreateBusiness } from '@/hooks/useCreateBusiness';

export type CreateBusinessFormProps = ReturnType<typeof useCreateBusiness>;

export function CreateBusinessForm({
  navigate,
  loading,
  categories,
  keywords,
  validationErrors,
  validationErrorsRef,
  selectedKeywords,
  newBusiness,
  setNewBusiness,
  searchValue,
  timeSlots,
  newTimeSlot,
  setNewTimeSlot,
  handleInputChange,
  handleLocationSelect,
  toggleKeyword,
  toggleCategory,
  handleTimeSlotChange,
  addTimeSlot,
  removeTimeSlot,
  toggleDayForTimeSlot,
  toggleDayForNewTimeSlot,
  handleSubmit,
}: CreateBusinessFormProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            className={cn(cardPreset, 'p-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex items-center gap-4">
              <LoadingButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/businesses')}
                className={cn(buttonPreset, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zur Übersicht</span>
              </LoadingButton>
              <h1 className="text-2xl font-bold text-foreground">Neues Geschäft erstellen</h1>
            </div>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground">Geschäftsdetails</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Füllen Sie alle notwendigen Informationen aus, um ein neues Geschäft zu erstellen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Validierungsfehler */}
                {validationErrors.length > 0 && (
                  <Alert
                    ref={validationErrorsRef}
                    variant="destructive"
                    className={cn(cardPreset, 'border-destructive/50')}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
                    <AlertDescription className="mt-2">
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Business Name */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-3')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.1 }}
                >
                  <Label htmlFor="name" className="text-foreground">
                    Name des Geschäfts
                  </Label>
                  <Input
                    id="name"
                    value={newBusiness.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="z.B. Café Sonnenschein"
                    className={cn(inputPreset)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Der offizielle Name des Geschäfts, wie er angezeigt werden soll.
                  </p>
                </motion.div>

                {/* Description */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-3')}
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
                    value={newBusiness.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Beschreiben Sie das Geschäft im Detail..."
                    className={cn(inputPreset, 'min-h-[100px]')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Eine ausführliche Beschreibung des Geschäfts. Nennen Sie wichtige Details wie
                    Angebot, Besonderheiten oder Geschichte.
                  </p>
                </motion.div>

                {/* Categories */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-3')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.3 }}
                >
                  <Label className="text-foreground">Kategorien (max. 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <SelectableBadge
                        key={category.id}
                        isSelected={newBusiness.categoryIds.includes(category.id)}
                        onClick={() => toggleCategory(category.id)}
                      >
                        {category.name}
                      </SelectableBadge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.
                  </p>
                </motion.div>

                {/* Keywords */}
                {keywords.length > 0 && (
                  <motion.div
                    className={cn(cardPreset, 'p-4 space-y-3')}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: 0.4 }}
                  >
                    <Label className="text-foreground">Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map(keyword => (
                        <SelectableBadge
                          key={keyword.id}
                          isSelected={selectedKeywords.includes(keyword.id)}
                          onClick={() => toggleKeyword(keyword.id)}
                        >
                          {keyword.name}
                        </SelectableBadge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Wählen Sie passende Keywords aus, um das Geschäft besser auffindbar zu machen.
                    </p>
                  </motion.div>
                )}

                {/* Benefit */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-3')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.5 }}
                >
                  <Label htmlFor="benefit" className="text-foreground">
                    Benefit für Nutzer
                  </Label>
                  <Input
                    id="benefit"
                    value={newBusiness.benefit}
                    onChange={e => {
                      const value = e.target.value.slice(0, 100);
                      handleInputChange('benefit', value);
                    }}
                    placeholder="z.B. 10% Rabatt auf alle Getränke"
                    maxLength={100}
                    className={cn(inputPreset)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Beschreiben Sie kurz (max. 100 Zeichen), welchen Vorteil Nutzer in diesem
                    Geschäft erhalten.
                    <span className="ml-2 text-xs">{newBusiness.benefit.length}/100 Zeichen</span>
                  </p>
                </motion.div>

                {/* Address */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-3')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.6 }}
                >
                  <Label className="text-foreground">Adresse</Label>
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                  />
                  {newBusiness.address && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Ausgewählte Adresse: {newBusiness.address}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Suchen Sie die Adresse. Die Koordinaten werden automatisch ermittelt.
                  </p>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-4')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.7 }}
                >
                  <h3 className="text-lg font-medium text-foreground">Kontaktinformationen</h3>
                  <p className="text-sm text-muted-foreground">
                    Diese Informationen sind optional und können später vom Geschäftsinhaber ergänzt
                    werden.
                  </p>

                  <div className={cn(cardPreset, 'p-3')}>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="isPromoted"
                        checked={newBusiness.isPromoted}
                        onCheckedChange={checked => handleInputChange('isPromoted', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="isPromoted" className="text-foreground">
                          Als "Highlight" markieren
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {newBusiness.isPromoted
                            ? 'Dieser Partner wird als Highlight angezeigt ✨'
                            : 'Markiere diesen Partner als Highlight'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        E-Mail (optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newBusiness.contact.email}
                        onChange={e =>
                          setNewBusiness({
                            ...newBusiness,
                            contact: { ...newBusiness.contact, email: e.target.value },
                          })
                        }
                        placeholder="kontakt@beispiel.de"
                        className={cn(inputPreset)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">
                        Telefon (optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newBusiness.contact.phoneNumber}
                        onChange={e =>
                          setNewBusiness({
                            ...newBusiness,
                            contact: { ...newBusiness.contact, phoneNumber: e.target.value },
                          })
                        }
                        placeholder="+49 123 456789"
                        className={cn(inputPreset)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-foreground">
                        Website (optional)
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={newBusiness.contact.website}
                        onChange={e =>
                          setNewBusiness({
                            ...newBusiness,
                            contact: { ...newBusiness.contact, website: e.target.value },
                          })
                        }
                        placeholder="https://www.beispiel.de"
                        className={cn(inputPreset)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-foreground">
                        Instagram (optional)
                      </Label>
                      <Input
                        id="instagram"
                        value={newBusiness.contact.instagram}
                        onChange={e =>
                          setNewBusiness({
                            ...newBusiness,
                            contact: { ...newBusiness.contact, instagram: e.target.value },
                          })
                        }
                        placeholder="@beispiel"
                        className={cn(inputPreset)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-foreground">
                        Facebook (optional)
                      </Label>
                      <Input
                        id="facebook"
                        value={newBusiness.contact.facebook}
                        onChange={e =>
                          setNewBusiness({
                            ...newBusiness,
                            contact: { ...newBusiness.contact, facebook: e.target.value },
                          })
                        }
                        placeholder="beispiel"
                        className={cn(inputPreset)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="text-foreground">
                        TikTok (optional)
                      </Label>
                      <Input
                        id="tiktok"
                        value={newBusiness.contact.tiktok}
                        onChange={e =>
                          setNewBusiness({
                            ...newBusiness,
                            contact: { ...newBusiness.contact, tiktok: e.target.value },
                          })
                        }
                        placeholder="@beispiel"
                        className={cn(inputPreset)}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Opening Hours */}
                <motion.div
                  className={cn(cardPreset, 'p-4 space-y-4')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.8 }}
                >
                  <div className="mb-2">
                    <h3 className="text-lg font-medium text-foreground">Öffnungszeiten</h3>
                    <p className="text-sm text-muted-foreground">
                      Fügen Sie Zeiträume hinzu und wählen Sie die Tage aus, an denen diese gelten
                      sollen. Sie können mehrere Zeiträume für den gleichen Tag hinzufügen.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {timeSlots.map(slot => (
                      <div key={slot.id} className={cn(cardPreset, 'p-4 space-y-4')}>
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-foreground">Zeitraum</h4>
                          <LoadingButton
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(slot.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </LoadingButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">Von</Label>
                            <Input
                              type="time"
                              value={slot.openTime}
                              onChange={e =>
                                handleTimeSlotChange(slot.id, 'openTime', e.target.value)
                              }
                              className={cn(inputPreset)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Bis</Label>
                            <Input
                              type="time"
                              value={slot.closeTime}
                              onChange={e =>
                                handleTimeSlotChange(slot.id, 'closeTime', e.target.value)
                              }
                              className={cn(inputPreset)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Gültig an</Label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                              <SelectableBadge
                                key={day}
                                isSelected={slot.days.includes(day as WeekdayKey)}
                                onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                              >
                                {dayName}
                              </SelectableBadge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className={cn(cardPreset, 'p-4 space-y-4')}>
                      <h4 className="font-medium text-foreground">Neuer Zeitraum</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Von</Label>
                          <Input
                            type="time"
                            value={newTimeSlot.openTime}
                            onChange={e =>
                              setNewTimeSlot({ ...newTimeSlot, openTime: e.target.value })
                            }
                            className={cn(inputPreset)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Bis</Label>
                          <Input
                            type="time"
                            value={newTimeSlot.closeTime}
                            onChange={e =>
                              setNewTimeSlot({ ...newTimeSlot, closeTime: e.target.value })
                            }
                            className={cn(inputPreset)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Gültig an</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                            <SelectableBadge
                              key={day}
                              isSelected={newTimeSlot.days.includes(day as WeekdayKey)}
                              onClick={() => toggleDayForNewTimeSlot(day as WeekdayKey)}
                            >
                              {dayName}
                            </SelectableBadge>
                          ))}
                        </div>
                      </div>
                      <LoadingButton
                        onClick={addTimeSlot}
                        disabled={newTimeSlot.days.length === 0}
                        className="w-full"
                      >
                        Zeitraum hinzufügen
                      </LoadingButton>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
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
                    onClick={handleSubmit}
                    isLoading={loading}
                    loadingText="Wird erstellt..."
                    className={cn(buttonPreset, 'flex items-center')}
                  >
                    Geschäft erstellen
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
