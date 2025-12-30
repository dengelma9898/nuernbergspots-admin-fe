import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessStatus } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { useBusinessService } from '@/services/businessService';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { useKeywordService } from '@/services/keywordService';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const WEEKDAYS = {
  Montag: 'Montag',
  Dienstag: 'Dienstag',
  Mittwoch: 'Mittwoch',
  Donnerstag: 'Donnerstag',
  Freitag: 'Freitag',
  Samstag: 'Samstag',
  Sonntag: 'Sonntag',
} as const;

type WeekdayKey = keyof typeof WEEKDAYS;

interface TimeSlot {
  id: string;
  openTime: string;
  closeTime: string;
  days: WeekdayKey[];
}


export const CreateBusiness: React.FC = () => {
  const navigate = useNavigate();
  const businessService = useBusinessService();
  const categoryService = useBusinessCategoryService();
  const keywordService = useKeywordService();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    categoryIds: [] as string[],
    address: '',
    benefit: '',
    latitude: 0,
    longitude: 0,
    contact: {
      phoneNumber: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
    },
    openingHours: {} as Record<string, string>,
    status: BusinessStatus.PENDING,
    imageUrls: [] as string[],
    keywordIds: [] as string[],
    isPromoted: false,
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      openTime: '09:00',
      closeTime: '18:00',
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
    },
  ]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    openTime: '09:00',
    closeTime: '18:00',
    days: [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (newBusiness.categoryIds.length > 0) {
      loadKeywordsForCategories(newBusiness.categoryIds);
    } else {
      setKeywords([]);
    }
  }, [newBusiness.categoryIds]);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const loadKeywordsForCategories = async (categoryIds: string[]) => {
    try {
      // Lade die ausgewählten Kategorien
      const selectedCategories = categories.filter(category => categoryIds.includes(category.id));

      // Sammle alle Keyword-IDs aus den ausgewählten Kategorien
      const keywordIds = selectedCategories
        .flatMap(category => category.keywords || [])
        .map(keyword => keyword.id);

      // Entferne Duplikate
      const uniqueKeywordIds = [...new Set(keywordIds)];

      // Lade die Keywords
      const keywordPromises = uniqueKeywordIds.map(id => keywordService.getKeyword(id));

      const fetchedKeywords = await Promise.all(keywordPromises);
      setKeywords(fetchedKeywords);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const handleInputChange = (field: keyof typeof newBusiness, value: any) => {
    setNewBusiness(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setNewBusiness(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng,
    }));
    setSearchValue(location);
  };

  const toggleKeyword = (keywordId: string) => {
    setSelectedKeywords(prev => {
      const isSelected = prev.includes(keywordId);
      if (isSelected) {
        return prev.filter(id => id !== keywordId);
      } else {
        return [...prev, keywordId];
      }
    });
  };

  const toggleCategory = (categoryId: string) => {
    setNewBusiness(prev => {
      const isSelected = prev.categoryIds.includes(categoryId);
      if (isSelected) {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter(id => id !== categoryId),
        };
      } else {
        if (prev.categoryIds.length >= 3) {
          toast.error('Maximale Anzahl an Kategorien erreicht', {
            description: 'Sie können maximal 3 Kategorien auswählen.',
          });
          return prev;
        }
        return {
          ...prev,
          categoryIds: [...prev.categoryIds, categoryId],
        };
      }
    });
  };

  const handleTimeSlotChange = (id: string, field: keyof Omit<TimeSlot, 'id'>, value: any) => {
    setTimeSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, [field]: value } : slot)));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.days.length === 0) {
      setValidationErrors(['Bitte wählen Sie mindestens einen Tag aus. Ein Zeitraum muss für mindestens einen Tag gelten.']);
      return;
    }
    
    setValidationErrors([]);

    const id = Date.now().toString();
    setTimeSlots(prev => [...prev, { ...newTimeSlot, id }]);
    setNewTimeSlot({ openTime: '09:00', closeTime: '18:00', days: [] });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const toggleDayForTimeSlot = (day: WeekdayKey, slotId: string) => {
    setTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          const days = slot.days.includes(day)
            ? slot.days.filter(d => d !== day)
            : [...slot.days, day];
          return { ...slot, days };
        }
        return slot;
      })
    );
  };

  const toggleDayForNewTimeSlot = (day: WeekdayKey) => {
    setNewTimeSlot(prev => {
      const days = prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day];
      return { ...prev, days };
    });
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);
      const addressParts = newBusiness.address.split(',');
      const streetWithNumber = addressParts[0].trim();
      const [street, houseNumber] = streetWithNumber.split(' ').reduce(
        ([str, num], part) => {
          if (/\d/.test(part)) {
            return [str, (num + ' ' + part).trim()];
          }
          return [(str + ' ' + part).trim(), num];
        },
        ['', '']
      );

      const postalAndCity = addressParts[1]?.trim().split(' ') || [];
      const postalCode = postalAndCity[0] || '';

      // Formatiere detaillierte Öffnungszeiten
      const formattedDetailedOpeningHours: Record<string, Array<{ from: string; to: string }>> = {};

      // Setze die Öffnungszeiten basierend auf den Zeiträumen
      timeSlots.forEach(slot => {
        slot.days.forEach(day => {
          if (!formattedDetailedOpeningHours[day]) {
            formattedDetailedOpeningHours[day] = [];
          }
          formattedDetailedOpeningHours[day].push({
            from: slot.openTime,
            to: slot.closeTime,
          });
        });
      });

      // Bereinige die Kontaktdaten - leere Strings werden zu undefined
      const cleanedContact = {
        email: newBusiness.contact.email || undefined,
        phoneNumber: newBusiness.contact.phoneNumber || undefined,
        website: newBusiness.contact.website || undefined,
        instagram: newBusiness.contact.instagram || undefined,
        facebook: newBusiness.contact.facebook || undefined,
        tiktok: newBusiness.contact.tiktok || undefined,
      };

      const businessToCreate = {
        ...newBusiness,
        hasAccount: false,
        isAdmin: true,
        address: {
          street,
          houseNumber,
          postalCode,
          city: 'Nürnberg',
          latitude: newBusiness.latitude,
          longitude: newBusiness.longitude,
        },
        contact: cleanedContact,
        detailedOpeningHours: formattedDetailedOpeningHours,
        keywordIds: selectedKeywords,
      };

      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      await businessService.createBusiness(businessToCreate);
      toast.success('Geschäft erstellt', {
        description: 'Das Geschäft wurde erfolgreich erstellt.',
      });
      navigate('/businesses');
    } catch (error) {
      console.error('Fehler beim Erstellen des Geschäfts:', error);
      showUserFriendlyError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              className={cn(glassCard, 'p-6')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex items-center gap-4">
                <AnimatedButton
                  variant="ghost"
                  onClick={() => navigate('/businesses')}
                  className={cn(glassButton)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zur Übersicht
                </AnimatedButton>
                <h1 className="text-2xl font-bold text-foreground">
                  Neues Geschäft erstellen
                </h1>
              </div>
            </motion.div>

            {/* Main Form Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Geschäftsdetails</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Füllen Sie alle notwendigen Informationen aus, um ein neues Geschäft zu erstellen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Business Name */}
                  <motion.div
                    className={cn(glassCard, 'p-4 space-y-3')}
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
                      className={cn(glassInput)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Der offizielle Name des Geschäfts, wie er angezeigt werden soll.
                    </p>
                  </motion.div>

              {/* Description */}
              <motion.div
                className={cn(glassCard, 'p-4 space-y-3')}
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
                  className={cn(glassInput, 'min-h-[100px]')}
                />
                <p className="text-sm text-muted-foreground">
                  Eine ausführliche Beschreibung des Geschäfts. Nennen Sie wichtige Details wie
                  Angebot, Besonderheiten oder Geschichte.
                </p>
              </motion.div>

              {/* Categories */}
              <motion.div
                className={cn(glassCard, 'p-4 space-y-3')}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.3 }}
              >
                <Label className="text-foreground">Kategorien (max. 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      variant={newBusiness.categoryIds.includes(category.id) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.
                </p>
              </motion.div>

              {/* Keywords */}
              {keywords.length > 0 && (
                <motion.div
                  className={cn(glassCard, 'p-4 space-y-3')}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.4 }}
                >
                  <Label className="text-foreground">Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(keyword => (
                      <Badge
                        key={keyword.id}
                        onClick={() => toggleKeyword(keyword.id)}
                        variant={selectedKeywords.includes(keyword.id) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all duration-300 hover:scale-105"
                      >
                        {keyword.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wählen Sie passende Keywords aus, um das Geschäft besser auffindbar zu machen.
                  </p>
                </motion.div>
              )}

              {/* Benefit */}
              <motion.div
                className={cn(glassCard, 'p-4 space-y-3')}
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
                  className={cn(glassInput)}
                />
                <p className="text-sm text-muted-foreground">
                  Beschreiben Sie kurz (max. 100 Zeichen), welchen Vorteil Nutzer in diesem Geschäft
                  erhalten.
                  <span className="ml-2 text-xs">{newBusiness.benefit.length}/100 Zeichen</span>
                </p>
              </motion.div>

              {/* Address */}
              <motion.div
                className={cn(glassCard, 'p-4 space-y-3')}
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
                className={cn(glassCard, 'p-4 space-y-4')}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.7 }}
              >
                <h3 className="text-lg font-medium text-foreground">
                  Kontaktinformationen
                </h3>
                <p className="text-sm text-muted-foreground">
                  Diese Informationen sind optional und können später vom Geschäftsinhaber ergänzt
                  werden.
                </p>

                <div className={cn(glassCard, 'p-3')}>
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
                      className={cn(glassInput)}
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
                      className={cn(glassInput)}
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
                      className={cn(glassInput)}
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
                      className={cn(glassInput)}
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
                      className={cn(glassInput)}
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
                      className={cn(glassInput)}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Opening Hours */}
              <motion.div
                className={cn(glassCard, 'p-4 space-y-4')}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.8 }}
              >
                <div className="mb-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Öffnungszeiten
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fügen Sie Zeiträume hinzu und wählen Sie die Tage aus, an denen diese gelten
                    sollen. Sie können mehrere Zeiträume für den gleichen Tag hinzufügen.
                  </p>
                </div>
                <div className="space-y-4">
                  {timeSlots.map(slot => (
                    <div
                      key={slot.id}
                      className={cn(glassCard, 'p-4 space-y-4')}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-foreground">Zeitraum</h4>
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(slot.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </AnimatedButton>
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
                            className={cn(glassInput)}
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
                            className={cn(glassInput)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Gültig an</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                            <Badge
                              key={day}
                              onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                              variant={slot.days.includes(day as WeekdayKey) ? 'default' : 'outline'}
                              className="cursor-pointer transition-all duration-300 hover:scale-105"
                            >
                              {dayName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className={cn(glassCard, 'p-4 space-y-4')}>
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
                          className={cn(glassInput)}
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
                          className={cn(glassInput)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Gültig an</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                          <Badge
                            key={day}
                            onClick={() => toggleDayForNewTimeSlot(day as WeekdayKey)}
                            variant={newTimeSlot.days.includes(day as WeekdayKey) ? 'default' : 'outline'}
                            className="cursor-pointer transition-all duration-300 hover:scale-105"
                          >
                            {dayName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <AnimatedButton
                      onClick={addTimeSlot}
                      disabled={newTimeSlot.days.length === 0}
                      className="w-full"
                    >
                      Zeitraum hinzufügen
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary">
                <AnimatedButton
                  variant="outline"
                  onClick={() => navigate('/businesses')}
                  className={cn(glassButton, 'w-full sm:w-auto')}
                >
                  Abbrechen
                </AnimatedButton>
                <LoadingButton
                  onClick={handleSubmit}
                  isLoading={loading}
                  loadingText="Wird erstellt..."
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
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
    </PageTransition>
  );
};
