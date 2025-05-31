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

      // Kategorie prüfen
      if (!editedEvent.categoryId) {
        toast.error("Bitte wählen Sie eine Kategorie aus.");
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
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/events/scraper')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-2xl font-bold">Event bearbeiten</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={editedEvent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={editedEvent.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <LocationSearch
              value={null}
              onChange={handleLocationSelect}
              placeholder="Adresse suchen..."
              debounce={1000}
            />
            {editedEvent.location && (
              <div className="border rounded-lg p-4 bg-muted mb-2">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <span>📍</span>
                  {editedEvent.location.address || 'Keine Adresse ausgewählt'}
                </div>
                {(!editedEvent.location.latitude || !editedEvent.location.longitude || editedEvent.location.latitude === 0 || editedEvent.location.longitude === 0) ? (
                  <div className="text-sm text-red-600 font-semibold">
                    Es ist noch keine vollständige Adresse gesetzt. Bitte suchen Sie die Adresse manuell über das Suchfeld.<br />
                    (Tipp: Kopieren Sie den Namen und suchen Sie ihn oben!)
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
            <Label htmlFor="price">Preis</Label>
            <Input
              type="number"
              step="0.01"
              value={editedEvent.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ticketsNeeded"
              checked={editedEvent.ticketsNeeded}
              onCheckedChange={(checked) => handleInputChange('ticketsNeeded', checked)}
            />
            <Label htmlFor="ticketsNeeded">Tickets erforderlich</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPromoted"
              checked={editedEvent.isPromoted}
              onCheckedChange={(checked) => handleInputChange('isPromoted', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="isPromoted">Als "Highlight" markieren</Label>
              <p className="text-sm text-muted-foreground">
                Markiere dieses Event als Highlight
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select
              value={editedEvent.categoryId || categories[0]?.id}
              onValueChange={(value) => handleInputChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
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
          </div>

          <div className="space-y-2">
            <Label>Zeitfenster</Label>
            {editedEvent.dailyTimeSlots && editedEvent.dailyTimeSlots.length > 0 && (
              <div className="space-y-2">
                {editedEvent.dailyTimeSlots.map((slot, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <Label>Datum</Label>
                      <Input
                        type="date"
                        value={slot.date}
                        onChange={(e) => {
                          const newSlots = [...editedEvent.dailyTimeSlots!];
                          newSlots[index] = { ...slot, date: e.target.value };
                          handleInputChange('dailyTimeSlots', newSlots);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Von</Label>
                      <Input
                        type="time"
                        value={slot.from || ''}
                        onChange={(e) => {
                          const newSlots = [...editedEvent.dailyTimeSlots!];
                          newSlots[index] = { ...slot, from: e.target.value };
                          handleInputChange('dailyTimeSlots', newSlots);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Bis</Label>
                      <Input
                        type="time"
                        value={slot.to || ''}
                        onChange={(e) => {
                          const newSlots = [...editedEvent.dailyTimeSlots!];
                          newSlots[index] = { ...slot, to: e.target.value };
                          handleInputChange('dailyTimeSlots', newSlots);
                        }}
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
                >
                  Zeitfenster hinzufügen
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Social Media</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="z.B. @eventname oder eventname"
                    value={editedEvent.socialMedia?.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia', { instagram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="z.B. eventname oder https://facebook.com/eventname"
                    value={editedEvent.socialMedia?.facebook || ''}
                    onChange={(e) => handleInputChange('socialMedia', { facebook: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    placeholder="z.B. @eventname oder eventname"
                    value={editedEvent.socialMedia?.tiktok || ''}
                    onChange={(e) => handleInputChange('socialMedia', { tiktok: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={() => navigate('/events/scraper')}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Wird gespeichert..." : "Event speichern"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 