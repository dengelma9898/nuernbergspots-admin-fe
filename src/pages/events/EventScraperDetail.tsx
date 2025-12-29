import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import { getIconComponent } from '@/utils/iconUtils';
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

// Hilfsfunktion zum Parsen von Scraper-Datum
function parseScraperDateTime(scraperDate: string): { date: string; from?: string } {
  // Beispiel: "02.06.202519:00" => "2025-06-02", "19:00"
  const match = scraperDate.match(/(\d{2})\.(\d{2})\.(\d{4})(\d{2}:\d{2})?/);
  if (!match) return { date: '', from: undefined };
  const [_, day, month, year, time] = match;
  const date = `${year}-${month}-${day}`;
  return { date, from: time };
}

/**
 * @deprecated Verwende dailyTimeSlots!
 */
// startDate?: string;

export const EventScraperDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event>(location.state?.event);
  const [editedEvent, setEditedEvent] = useState<Event>(location.state?.event);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!event) {
      navigate('/events/scraper');
      return;
    }
    loadCategories();
  }, []);

  React.useEffect(() => {
    console.log('event', event);
    if (event) {
      let dailyTimeSlots = event.dailyTimeSlots || [];
      // Falls startDate vorhanden und dailyTimeSlots leer oder nicht vorhanden
      if (event.startDate && (!Array.isArray(dailyTimeSlots) || dailyTimeSlots.length === 0)) {
        const parsed = parseScraperDateTime(event.startDate);
        dailyTimeSlots = [{ date: parsed.date, from: parsed.from, to: '' }];
      }
      setEditedEvent(prev => ({
        ...prev,
        dailyTimeSlots,
        // startDate als deprecated ignorieren
      }));
    }
  }, [event]);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await eventCategoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const handleInputChange = (field: keyof Event, value: any) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setEditedEvent(prev => ({
      ...prev,
      location: {
        address: location.address.label,
        latitude: location.position.lat,
        longitude: location.position.lng,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setCategoryError(null);
      // Kategorie prüfen
      if (!editedEvent.categoryId) {
        setCategoryError('Bitte wählen Sie eine Kategorie aus.');
        toast.error('Bitte wählen Sie eine Kategorie aus.');
        setLoading(false);
        return;
      }

      // Location prüfen
      const lat = editedEvent.location?.latitude;
      const lng = editedEvent.location?.longitude;
      if (!lat || !lng || lat === 0 || lng === 0) {
        toast.error('Bitte wählen Sie eine vollständige Adresse mit Koordinaten aus.');
        setLoading(false);
        return;
      }

      // Location und Social Media flatten, Default-Flags setzen
      const { location, socialMedia, ...rest } = editedEvent;
      const payload: any = {
        ...rest,
        address: location?.address,
        latitude: location?.latitude,
        longitude: location?.longitude,
        instagram: socialMedia?.instagram,
        facebook: socialMedia?.facebook,
        tiktok: socialMedia?.tiktok,
        dailyTimeSlots: Array.isArray(editedEvent.dailyTimeSlots) ? editedEvent.dailyTimeSlots : [],
        ticketsNeeded:
          typeof editedEvent.ticketsNeeded === 'boolean' ? editedEvent.ticketsNeeded : false,
        isPromoted: typeof editedEvent.isPromoted === 'boolean' ? editedEvent.isPromoted : false,
      };

      await eventService.createEvent(payload);
      toast.success('Event erfolgreich erstellt');
      navigate('/events/scraper');
    } catch (error) {
      console.error('Fehler beim Speichern des Events:', error);
      showUserFriendlyError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return null;
  }

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/events/scraper')}
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Event bearbeiten
              </h1>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(glassCard)}>
              <CardHeader>
                <CardTitle className="text-foreground">Event Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Titel
                  </Label>
                  <Input
                    id="title"
                    value={editedEvent.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    className={cn(glassInput)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Beschreibung
                  </Label>
                  <Textarea
                    id="description"
                    value={editedEvent.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    className={cn(glassInput, 'min-h-[100px]')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Adresse</Label>
                  <LocationSearch
                    value={null}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                  />
                  {editedEvent.location && (
                    <div className={cn(glassCard, 'p-4 mb-2')}>
                      <div className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <span>📍</span>
                        {editedEvent.location.address || 'Keine Adresse ausgewählt'}
                      </div>
                      {!editedEvent.location.latitude ||
                      !editedEvent.location.longitude ||
                      editedEvent.location.latitude === 0 ||
                      editedEvent.location.longitude === 0 ? (
                        <div className="text-sm text-destructive font-semibold">
                          Es ist noch keine vollständige Adresse gesetzt. Bitte suchen Sie die Adresse
                          manuell über das Suchfeld.
                          <br />
                          (Tipp: Kopieren Sie den Namen und suchen Sie ihn oben!)
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>
                            Straße:
                            <br />
                            {editedEvent.location.address || '-'}
                          </div>
                          <div>
                            PLZ/Ort:
                            <br />-
                          </div>
                          <div>
                            Latitude:
                            <br />
                            {editedEvent.location.latitude}
                          </div>
                          <div>
                            Longitude:
                            <br />
                            {editedEvent.location.longitude}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceString" className="text-foreground">
                    Preis
                  </Label>
                  <Input
                    id="priceString"
                    type="text"
                    value={editedEvent.priceString || ''}
                    onChange={e => handleInputChange('priceString', e.target.value || undefined)}
                    placeholder="z.B. 15€, Kostenlos, Spende, etc."
                    className={cn(glassInput)}
                  />
                </div>

                <div className={cn(glassCard, 'p-4')}>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="ticketsNeeded"
                      checked={editedEvent.ticketsNeeded}
                      onCheckedChange={checked => handleInputChange('ticketsNeeded', checked)}
                    />
                    <Label htmlFor="ticketsNeeded" className="text-foreground cursor-pointer">
                      Tickets erforderlich
                    </Label>
                  </div>
                </div>

                <div className={cn(glassCard, 'p-4')}>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isPromoted"
                      checked={editedEvent.isPromoted}
                      onCheckedChange={checked => handleInputChange('isPromoted', checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isPromoted" className="text-foreground cursor-pointer">
                        Als "Highlight" markieren
                      </Label>
                      <p className="text-sm text-muted-foreground">Markiere dieses Event als Highlight</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">
                    Kategorie
                  </Label>
                  <Select
                    value={editedEvent.categoryId || ''}
                    onValueChange={value => {
                      setCategoryError(null);
                      handleInputChange('categoryId', value);
                    }}
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
                  {categoryError && (
                    <p className="text-sm text-destructive font-semibold">{categoryError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Zeitfenster</Label>
                  {editedEvent.dailyTimeSlots && editedEvent.dailyTimeSlots.length > 0 && (
                    <div className="space-y-3">
                      {editedEvent.dailyTimeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className={cn(glassCard, 'grid grid-cols-1 sm:grid-cols-3 gap-3 p-4')}
                        >
                          <div>
                            <Label className="text-muted-foreground text-sm">Datum</Label>
                            <Input
                              type="date"
                              value={slot.date}
                              onChange={e => {
                                const newSlots = [...editedEvent.dailyTimeSlots!];
                                newSlots[index] = { ...slot, date: e.target.value };
                                handleInputChange('dailyTimeSlots', newSlots);
                              }}
                              className={cn(glassInput, 'mt-1')}
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-sm">Von</Label>
                            <Input
                              type="time"
                              value={slot.from || ''}
                              onChange={e => {
                                const newSlots = [...editedEvent.dailyTimeSlots!];
                                newSlots[index] = { ...slot, from: e.target.value };
                                handleInputChange('dailyTimeSlots', newSlots);
                              }}
                              className={cn(glassInput, 'mt-1')}
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-sm">Bis</Label>
                            <Input
                              type="time"
                              value={slot.to || ''}
                              onChange={e => {
                                const newSlots = [...editedEvent.dailyTimeSlots!];
                                newSlots[index] = { ...slot, to: e.target.value };
                                handleInputChange('dailyTimeSlots', newSlots);
                              }}
                              className={cn(glassInput, 'mt-1')}
                            />
                          </div>
                        </div>
                      ))}
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSlots = [
                            ...editedEvent.dailyTimeSlots!,
                            { date: '', from: '', to: '' },
                          ];
                          handleInputChange('dailyTimeSlots', newSlots);
                        }}
                        className={cn(glassButton)}
                      >
                        Zeitfenster hinzufügen
                      </AnimatedButton>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-foreground">Social Media</Label>
                  <div className={cn(glassCard, 'space-y-4 p-4')}>
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-muted-foreground">
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="z.B. @eventname oder eventname"
                        value={editedEvent.socialMedia?.instagram || ''}
                        onChange={e =>
                          handleInputChange('socialMedia', { instagram: e.target.value })
                        }
                        className={cn(glassInput)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-muted-foreground">
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        placeholder="z.B. eventname oder https://facebook.com/eventname"
                        value={editedEvent.socialMedia?.facebook || ''}
                        onChange={e => handleInputChange('socialMedia', { facebook: e.target.value })}
                        className={cn(glassInput)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="text-muted-foreground">
                        TikTok
                      </Label>
                      <Input
                        id="tiktok"
                        placeholder="z.B. @eventname oder eventname"
                        value={editedEvent.socialMedia?.tiktok || ''}
                        onChange={e => handleInputChange('socialMedia', { tiktok: e.target.value })}
                        className={cn(glassInput)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-4 border-t border-secondary">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => navigate('/events/scraper')}
                    className={cn(glassButton, 'w-full sm:w-auto')}
                  >
                    Abbrechen
                  </AnimatedButton>
                  <LoadingButton
                    onClick={handleSave}
                    isLoading={loading}
                    loadingText="Wird gespeichert..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                  >
                    Event speichern
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
