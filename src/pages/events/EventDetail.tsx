import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MapPin, 
  Calendar, 
  Image as ImageIcon,
  Heart, 
  Ticket, 
  Euro,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Star
} from 'lucide-react';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LocationSearch, LocationResult } from "@/components/ui/LocationSearch";
import { convertFFToHex } from '@/utils/colorUtils';
import { getIconComponent } from '@/utils/iconUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationValue {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  osm_id?: number;
  licence?: string;
  osm_type?: string;
  place_id?: number;
  importance?: number;
  boundingbox?: string[];
}

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [searchAddress, setSearchAddress] = useState('');
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (event?.location) {
      setSearchValue({
        id: 'current',
        title: event.location.address,
        resultType: 'place',
        position: {
          lat: event.location.latitude,
          lng: event.location.longitude
        },
        address: {
          label: event.location.address,
          countryCode: '',
          countryName: '',
          stateCode: '',
          state: '',
          county: '',
          city: '',
          district: '',
          street: '',
          postalCode: '',
          houseNumber: ''
        }
      });
    }
  }, [event]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [fetchedEvent, fetchedCategories] = await Promise.all([
        eventService.getEvent(id),
        eventCategoryService.getCategories()
      ]);
      setEvent(fetchedEvent);
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error("Fehler beim Laden des Events", {
        description: "Das Event konnte nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedEvent(event || {});
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!id || !editedEvent) return;
    try {
      await eventService.updateEvent(id, editedEvent);
      toast.success("Event aktualisiert", {
        description: "Das Event wurde erfolgreich aktualisiert.",
      });
      setIsEditing(false);
      loadData();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren", {
        description: "Das Event konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEvent({});
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await eventService.deleteEvent(id);
      toast.success("Event gelöscht", {
        description: "Das Event wurde erfolgreich gelöscht.",
      });
      navigate('/events');
    } catch (error) {
      toast.error("Fehler beim Löschen", {
        description: "Das Event konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
      });
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
    setSearchValue(location);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Event...</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event nicht gefunden.</div>;
  }

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (isPast(endDate)) {
      return {
        label: 'Beendet',
        icon: <CheckCircle2 className="h-4 w-4" />,
        variant: 'secondary' as const
      };
    }

    if (isWithinInterval(now, { start: startDate, end: endDate })) {
      return {
        label: 'Läuft jetzt',
        icon: <Clock className="h-4 w-4" />,
        variant: 'default' as const
      };
    }

    if (isFuture(startDate)) {
      return {
        label: 'Kommend',
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'outline' as const
      };
    }

    return {
      label: 'Unbekannt',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'secondary' as const
    };
  };

  const status = getEventStatus(event);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-2xl font-bold">Event Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Event Informationen</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={status.variant}>
                  {status.icon}
                  <span className="ml-1">{status.label}</span>
                </Badge>
                {event.isPromoted && (
                  <Badge className="bg-yellow-500/90 text-white border-yellow-600">
                    <Star className="mr-1 h-4 w-4 fill-current" />
                    Highlight
                  </Badge>
                )}
                {event.categoryId && categories.find(cat => cat.id === event.categoryId) && (
                  <Badge 
                    className="text-xs flex items-center"
                    style={{
                      backgroundColor: convertFFToHex(categories.find(cat => cat.id === event.categoryId)!.colorCode),
                      color: '#fff'
                    }}
                  >
                    <span className="mr-1 flex items-center">
                      {getIconComponent(categories.find(cat => cat.id === event.categoryId)!.iconName)}
                    </span>
                    {categories.find(cat => cat.id === event.categoryId)!.name}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={editedEvent.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              ) : (
                <div className="text-lg font-semibold">{event.title}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editedEvent.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              ) : (
                <div className="text-muted-foreground">{event.description}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Zeitraum</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={editedEvent.startDate ? new Date(editedEvent.startDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Ende</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={editedEvent.endDate ? new Date(editedEvent.endDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(event.startDate), 'dd. MMMM yyyy HH:mm', { locale: de })} - {format(new Date(event.endDate), 'dd. MMMM yyyy HH:mm', { locale: de })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                  />
                  {editedEvent.location?.address && (
                    <div className="text-sm text-muted-foreground">
                      Ausgewählte Adresse: {editedEvent.location.address}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {event.location.address}
                  {event.location.latitude && event.location.longitude && (
                    <span className="ml-2 text-xs">
                      ({event.location.latitude}, {event.location.longitude})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preis</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editedEvent.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                />
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Euro className="mr-2 h-4 w-4" />
                  {event.price ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(event.price) : 'Kostenlos'}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ticketsNeeded"
                checked={isEditing ? editedEvent.ticketsNeeded : event.ticketsNeeded}
                onCheckedChange={(checked) => handleInputChange('ticketsNeeded', checked)}
              />
              <Label htmlFor="ticketsNeeded">Tickets erforderlich</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPromoted"
                checked={isEditing ? editedEvent.isPromoted : event.isPromoted}
                onCheckedChange={(checked) => handleInputChange('isPromoted', checked)}
                disabled={!isEditing}
              />
              <div className="space-y-1">
                <Label htmlFor="isPromoted">Als "Highlight" markieren</Label>
                <p className="text-sm text-muted-foreground">
                  {event.isPromoted ? 'Dieses Event wird als Highlight angezeigt ✨' : 'Markiere dieses Event als Highlight'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              {isEditing ? (
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
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="flex items-center">
                    {getIconComponent(categories.find(cat => cat.id === event.categoryId)?.iconName || '')}
                  </span>
                  {categories.find(cat => cat.id === event.categoryId)?.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilder</CardTitle>
          </CardHeader>
          <CardContent>
            {event.imageUrls && event.imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {event.imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-video">
                    <img
                      src={url}
                      alt={`Event Bild ${index + 1}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Keine Bilder vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </>
        ) : (
          <>
            <Button variant="destructive" onClick={handleDelete}>
              Löschen
            </Button>
            <Button onClick={handleEdit}>
              Bearbeiten
            </Button>
          </>
        )}
      </div>
    </div>
  );
}; 