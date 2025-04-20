import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
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

interface NewEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number | null;
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
      tiktok: null
    }
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
          categoryId: fetchedCategories[0].id
        }));
      }
    } catch (error) {
      toast.error("Fehler beim Laden der Kategorien", {
        description: "Die Kategorien konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleInputChange = (field: keyof typeof newEvent, value: any) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;
    
    setNewEvent(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng
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
          longitude: newEvent.longitude
        }
      };
      
      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      await eventService.createEvent(eventToCreate);
      toast.success("Event erstellt", {
        description: "Das Event wurde erfolgreich erstellt.",
      });
      navigate('/events');
    } catch (error) {
      toast.error("Fehler beim Erstellen", {
        description: "Das Event konnte nicht erstellt werden. Bitte überprüfen Sie Ihre Eingaben.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-2xl font-bold">Neues Event erstellen</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Füllen Sie alle notwendigen Informationen aus, um ein neues Event zu erstellen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="z.B. Sommerfest 2024"
            />
            <p className="text-sm text-muted-foreground">
              Ein prägnanter Titel, der das Event gut beschreibt.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschreiben Sie das Event im Detail..."
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Eine ausführliche Beschreibung des Events. Nennen Sie wichtige Details wie Programm, Highlights oder besondere Hinweise.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum und -zeit</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={newEvent.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Wann beginnt das Event?
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum und -zeit</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={newEvent.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Wann endet das Event?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <LocationSearch
              value={searchValue}
              onChange={handleLocationSelect}
              placeholder="Adresse suchen..."
              debounce={1000}
            />
            <p className="text-sm text-muted-foreground">
              Der genaue Veranstaltungsort. Suchen Sie nach einer Adresse und wählen Sie den passenden Eintrag aus.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preis (in €)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={newEvent.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground">
              Der Eintrittspreis in Euro. Lassen Sie das Feld leer oder geben Sie 0 ein für kostenlose Events.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select
              value={newEvent.categoryId || ''}
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
            <p className="text-sm text-muted-foreground">
              Wählen Sie eine passende Kategorie für Ihr Event aus.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ticketsNeeded"
              checked={newEvent.ticketsNeeded}
              onCheckedChange={(checked) => handleInputChange('ticketsNeeded', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="ticketsNeeded">Tickets erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Aktivieren Sie diese Option, wenn Besucher Tickets im Voraus erwerben müssen.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPromoted"
              checked={newEvent.isPromoted}
              onCheckedChange={(checked) => handleInputChange('isPromoted', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="isPromoted">Als "Highlight" markieren</Label>
              <p className="text-sm text-muted-foreground">
                Aktiviere diese Option, um das Event als "Highlight" zu kennzeichnen.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate('/events')}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Wird erstellt...' : 'Event erstellen'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 