import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LocationSearch, LocationResult } from "@/components/ui/LocationSearch";
import { getIconComponent } from '@/utils/iconUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Hilfsfunktion zum Parsen von Scraper-Datum
function parseScraperDateTime(scraperDate: string): { date: string, from?: string } {
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
      toast.error("Fehler beim Laden der Kategorien");
    }
  };

  const handleInputChange = (field: keyof Event, value: any) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;
    
    setEditedEvent(prev => ({
      ...prev,
      location: {
        address: location.address.label,
        latitude: location.position.lat,
        longitude: location.position.lng
      }
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
        toast.error("Bitte wählen Sie eine vollständige Adresse mit Koordinaten aus.");
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
        ticketsNeeded: typeof editedEvent.ticketsNeeded === 'boolean' ? editedEvent.ticketsNeeded : false,
        isPromoted: typeof editedEvent.isPromoted === 'boolean' ? editedEvent.isPromoted : false,
      };

      await eventService.createEvent(payload);
      toast.success("Event erfolgreich erstellt");
      navigate('/events/scraper');
    } catch (error) {
      toast.error("Fehler beim Speichern des Events");
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      
      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

      <div className="relative z-10 container mx-auto py-4 px-2 sm:px-4 md:py-6">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/events/scraper')}
              className="mb-2 sm:mb-0 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl border"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Event bearbeiten
            </h1>
          </div>
        </div>

        {/* Glass Form Card */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 hover:shadow-3xl transition-all duration-500">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Event Informationen
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/90 font-medium">Titel</Label>
                <Input
                  id="title"
                  value={editedEvent.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/90 font-medium">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={editedEvent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/90 font-medium">Adresse</Label>
                <LocationSearch
                  value={null}
                  onChange={handleLocationSelect}
                  placeholder="Adresse suchen..."
                  debounce={1000}
                />
                {editedEvent.location && (
                  <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4 mb-2">
                    <div className="font-semibold mb-2 flex items-center gap-2 text-white">
                      <span>📍</span>
                      {editedEvent.location.address || 'Keine Adresse ausgewählt'}
                    </div>
                    {(!editedEvent.location.latitude || !editedEvent.location.longitude || editedEvent.location.latitude === 0 || editedEvent.location.longitude === 0) ? (
                      <div className="text-sm text-red-300 font-semibold">
                        Es ist noch keine vollständige Adresse gesetzt. Bitte suchen Sie die Adresse manuell über das Suchfeld.<br />
                        (Tipp: Kopieren Sie den Namen und suchen Sie ihn oben!)
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                        <div>Straße:<br />{editedEvent.location.address || '-'}</div>
                        <div>PLZ/Ort:<br />-</div>
                        <div>Latitude:<br />{editedEvent.location.latitude}</div>
                        <div>Longitude:<br />{editedEvent.location.longitude}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-white/90 font-medium">Preis</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedEvent.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-3 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4">
                <Switch
                  id="ticketsNeeded"
                  checked={editedEvent.ticketsNeeded}
                  onCheckedChange={(checked) => handleInputChange('ticketsNeeded', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                />
                <Label htmlFor="ticketsNeeded" className="text-white/90 font-medium cursor-pointer">Tickets erforderlich</Label>
              </div>

              <div className="flex items-center space-x-3 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4">
                <Switch
                  id="isPromoted"
                  checked={editedEvent.isPromoted}
                  onCheckedChange={(checked) => handleInputChange('isPromoted', checked)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                />
                <div className="space-y-1">
                  <Label htmlFor="isPromoted" className="text-white/90 font-medium cursor-pointer">Als "Highlight" markieren</Label>
                  <p className="text-sm text-white/70">
                    Markiere dieses Event als Highlight
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white/90 font-medium">Kategorie</Label>
                <Select
                  value={editedEvent.categoryId || ''}
                  onValueChange={(value) => {
                    setCategoryError(null);
                    handleInputChange('categoryId', value);
                  }}
                >
                  <SelectTrigger className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 rounded-xl">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-white/20">
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
                  <p className="text-sm text-red-300 font-semibold">{categoryError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white/90 font-medium">Zeitfenster</Label>
                {editedEvent.dailyTimeSlots && editedEvent.dailyTimeSlots.length > 0 && (
                  <div className="space-y-3">
                    {editedEvent.dailyTimeSlots.map((slot, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4">
                        <div>
                          <Label className="text-white/80 text-sm">Datum</Label>
                          <Input
                            type="date"
                            value={slot.date}
                            onChange={(e) => {
                              const newSlots = [...editedEvent.dailyTimeSlots!];
                              newSlots[index] = { ...slot, date: e.target.value };
                              handleInputChange('dailyTimeSlots', newSlots);
                            }}
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 text-sm">Von</Label>
                          <Input
                            type="time"
                            value={slot.from || ''}
                            onChange={(e) => {
                              const newSlots = [...editedEvent.dailyTimeSlots!];
                              newSlots[index] = { ...slot, from: e.target.value };
                              handleInputChange('dailyTimeSlots', newSlots);
                            }}
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 text-sm">Bis</Label>
                          <Input
                            type="time"
                            value={slot.to || ''}
                            onChange={(e) => {
                              const newSlots = [...editedEvent.dailyTimeSlots!];
                              newSlots[index] = { ...slot, to: e.target.value };
                              handleInputChange('dailyTimeSlots', newSlots);
                            }}
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl mt-1"
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSlots = [...editedEvent.dailyTimeSlots!, { date: '', from: '', to: '' }];
                        handleInputChange('dailyTimeSlots', newSlots);
                      }}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                    >
                      Zeitfenster hinzufügen
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-white/90 font-medium">Social Media</Label>
                <div className="space-y-4 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-white/80">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="z.B. @eventname oder eventname"
                      value={editedEvent.socialMedia?.instagram || ''}
                      onChange={(e) => handleInputChange('socialMedia', { instagram: e.target.value })}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-white/80">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="z.B. eventname oder https://facebook.com/eventname"
                      value={editedEvent.socialMedia?.facebook || ''}
                      onChange={(e) => handleInputChange('socialMedia', { facebook: e.target.value })}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-white/80">TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="z.B. @eventname oder eventname"
                      value={editedEvent.socialMedia?.tiktok || ''}
                      onChange={(e) => handleInputChange('socialMedia', { tiktok: e.target.value })}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-4 border-t border-white/10">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/events/scraper')}
                  className="w-full sm:w-auto backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full sm:w-auto backdrop-blur-2xl bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 text-white hover:from-blue-600/90 hover:to-purple-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
                >
                  {loading ? "Wird gespeichert..." : "Event speichern"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 