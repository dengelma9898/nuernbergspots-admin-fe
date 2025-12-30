import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, DailyTimeSlot } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import { getIconComponent } from '@/utils/iconUtils';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

interface NewEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number | null;
  priceString: string | null;
  ticketsNeeded: boolean;
  imageUrls: string[];
  favoriteCount: number;
  isPromoted: boolean;
  categoryId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  socialMedia: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
  };
  dailyTimeSlots: DailyTimeSlot[];
}

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    address: '',
    latitude: 0,
    longitude: 0,
    price: null,
    priceString: null,
    ticketsNeeded: false,
    imageUrls: [],
    favoriteCount: 0,
    isPromoted: false,
    categoryId: null,
    contactEmail: null,
    contactPhone: null,
    website: null,
    socialMedia: {
      instagram: null,
      facebook: null,
      tiktok: null,
    },
    dailyTimeSlots: [],
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await eventCategoryService.getCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        setNewEvent(prev => ({
          ...prev,
          categoryId: fetchedCategories[0].id,
        }));
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const handleInputChange = (field: keyof typeof newEvent, value: any) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setNewEvent(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng,
    }));
    setSearchValue(location);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const eventToCreate = {
        ...newEvent,
        location: {
          address: newEvent.address,
          latitude: newEvent.latitude,
          longitude: newEvent.longitude,
        },
      };
      console.log('eventToCreate', eventToCreate);
      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      const createdEvent = await eventService.createEvent(eventToCreate);
      showSuccessMessage(toast, {
        title: 'Event erstellt',
        description: `"${newEvent.title}" wurde erfolgreich erstellt.`,
      });
      navigate('/events');
    } catch (error) {
      console.error('Fehler beim Erstellen des Events:', error);
      showUserFriendlyError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTimeSlots = () => {
    if (!newEvent.startDate || !newEvent.endDate) return;

    const days = eachDayOfInterval({
      start: parseISO(newEvent.startDate),
      end: parseISO(newEvent.endDate),
    });

    const newTimeSlots = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      from: undefined,
      to: undefined,
    }));
    console.log('newTimeSlots', newTimeSlots);
    setNewEvent(prev => ({
      ...prev,
      dailyTimeSlots: newTimeSlots,
    }));
  };

  useEffect(() => {
    generateDailyTimeSlots();
  }, [newEvent.startDate, newEvent.endDate]);

  const updateTimeSlot = (date: string, field: 'from' | 'to', value: string) => {
    setNewEvent(prev => ({
      ...prev,
      dailyTimeSlots: prev.dailyTimeSlots.map(slot =>
        slot.date === date ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/events')}
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Neues Event erstellen
              </h1>
            </div>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(glassCard)}>
              <CardHeader>
                <CardTitle className="text-foreground">Event Details</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Füllen Sie alle notwendigen Informationen aus, um ein neues Event zu erstellen.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Title */}
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
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder="z.B. Sommerfest 2024"
                    className={cn(glassInput)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ein prägnanter Titel, der das Event gut beschreibt.
                  </p>
                </motion.div>

                {/* Description */}
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
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Beschreiben Sie das Event im Detail..."
                    className={cn(glassInput, 'min-h-[100px]')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Eine ausführliche Beschreibung des Events. Nennen Sie wichtige Details wie
                    Programm, Highlights oder besondere Hinweise.
                  </p>
                </motion.div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-foreground">
                      Startdatum
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEvent.startDate.split('T')[0]}
                      onChange={e => handleInputChange('startDate', e.target.value)}
                      className={cn(glassInput)}
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
                      onChange={e => handleInputChange('endDate', e.target.value)}
                      className={cn(glassInput)}
                    />
                  </div>
                </div>

                {/* Daily Time Slots */}
                {newEvent.dailyTimeSlots.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground">
                        Tägliche Zeitangaben (optional)
                      </Label>
                    </div>

                    <div className="space-y-4">
                      {newEvent.dailyTimeSlots.map(slot => (
                        <div
                          key={slot.date}
                          className={cn(glassCard, 'p-4')}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="font-medium text-foreground">
                              {format(parseISO(slot.date), 'EEEE, dd.MM.yyyy', { locale: de })}
                            </div>
                            <Input
                              type="time"
                              value={slot.from || ''}
                              onChange={e => updateTimeSlot(slot.date, 'from', e.target.value)}
                              placeholder="Von"
                              className={cn(glassInput)}
                            />
                            <Input
                              type="time"
                              value={slot.to || ''}
                              onChange={e => updateTimeSlot(slot.date, 'to', e.target.value)}
                              placeholder="Bis"
                              className={cn(glassInput)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-foreground">Adresse</Label>
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Der genaue Veranstaltungsort. Suchen Sie nach einer Adresse und wählen Sie den
                    passenden Eintrag aus.
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="priceString" className="text-foreground">
                    Preis
                  </Label>
                  <Input
                    id="priceString"
                    type="text"
                    value={newEvent.priceString || ''}
                    onChange={e => handleInputChange('priceString', e.target.value || null)}
                    placeholder="z.B. 15€, Kostenlos, Spende, etc."
                    className={cn(glassInput)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Der Eintrittspreis als Text. Lassen Sie das Feld leer für kostenlose Events.
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">
                    Kategorie
                  </Label>
                  <Select
                    value={newEvent.categoryId || ''}
                    onValueChange={value => handleInputChange('categoryId', value)}
                  >
                    <SelectTrigger className={cn(glassInput)}>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center">
                              {getIconComponent(category.iconName)}
                            </span>
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

                {/* Switches */}
                <div className="space-y-4">
                  <div className={cn(glassCard, 'p-4')}>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="ticketsNeeded"
                        checked={newEvent.ticketsNeeded}
                        onCheckedChange={checked => handleInputChange('ticketsNeeded', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="ticketsNeeded" className="text-foreground">
                          Tickets erforderlich
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Aktivieren Sie diese Option, wenn Besucher Tickets im Voraus erwerben
                          müssen.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={cn(glassCard, 'p-4')}>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="isPromoted"
                        checked={newEvent.isPromoted}
                        onCheckedChange={checked => handleInputChange('isPromoted', checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="isPromoted" className="text-foreground">
                          Als "Highlight" markieren
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Aktiviere diese Option, um das Event als "Highlight" zu kennzeichnen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <Label className="text-foreground text-lg">Kontaktinformationen</Label>

                  <div className={cn(glassCard, 'p-4 space-y-4')}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-muted-foreground">
                          E-Mail
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={newEvent.contactEmail || ''}
                          onChange={e => handleInputChange('contactEmail', e.target.value)}
                          placeholder="kontakt@beispiel.de"
                          className={cn(glassInput)}
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
                          onChange={e => handleInputChange('contactPhone', e.target.value)}
                          placeholder="+49 123 4567890"
                          className={cn(glassInput)}
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
                          onChange={e => handleInputChange('website', e.target.value)}
                          placeholder="https://www.beispiel.de"
                          className={cn(glassInput)}
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
                            onChange={e =>
                              setNewEvent(prev => ({
                                ...prev,
                                socialMedia: {
                                  ...prev.socialMedia,
                                  instagram: e.target.value,
                                },
                              }))
                            }
                            placeholder="@benutzername"
                            className={cn(glassInput)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facebook" className="text-muted-foreground text-sm">
                            Facebook
                          </Label>
                          <Input
                            id="facebook"
                            value={newEvent.socialMedia.facebook || ''}
                            onChange={e =>
                              setNewEvent(prev => ({
                                ...prev,
                                socialMedia: {
                                  ...prev.socialMedia,
                                  facebook: e.target.value,
                                },
                              }))
                            }
                            placeholder="@seitename"
                            className={cn(glassInput)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tiktok" className="text-muted-foreground text-sm">
                            TikTok
                          </Label>
                          <Input
                            id="tiktok"
                            value={newEvent.socialMedia.tiktok || ''}
                            onChange={e =>
                              setNewEvent(prev => ({
                                ...prev,
                                socialMedia: {
                                  ...prev.socialMedia,
                                  tiktok: e.target.value,
                                },
                              }))
                            }
                            placeholder="@benutzername"
                            className={cn(glassInput)}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Alle Kontaktinformationen sind optional. Fügen Sie nur die Informationen hinzu,
                      die Sie öffentlich teilen möchten.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-secondary">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => navigate('/events')}
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
                    Event erstellen
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
