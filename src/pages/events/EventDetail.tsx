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
  Star,
  Trash2,
  Upload,
  Plus
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [selectedTitleImage, setSelectedTitleImage] = useState<File | null>(null);
  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(null);
  const [isUploadingTitleImage, setIsUploadingTitleImage] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      console.log('Selected files:', files);
      setSelectedFiles(files);
      
      // Erstelle Vorschau-URLs für die ausgewählten Bilder
      const urls: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          urls.push(reader.result as string);
          if (urls.length === files.length) {
            setPreviewUrls(urls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleTitleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedTitleImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTitleImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadTitleImage = async () => {
    if (!selectedTitleImage || !event) return;

    try {
      setIsUploadingTitleImage(true);
      const imageUrl = await eventService.uploadEventTitleImage(event.id, selectedTitleImage);
      
      const updatedEvent = {
        ...event,
        titleImageUrl: imageUrl
      };
      await eventService.updateEvent(event.id, updatedEvent);
      setEvent(updatedEvent);
      setSelectedTitleImage(null);
      setTitleImagePreview(null);
      toast.success("Titelbild erfolgreich aktualisiert");
    } catch (error) {
      console.error('Fehler beim Hochladen des Titelbildes:', error);
      toast.error("Fehler beim Hochladen des Titelbildes");
    } finally {
      setIsUploadingTitleImage(false);
    }
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0 || !event) return;

    try {
      setIsUploading(true);
      const imageUrls = await eventService.uploadEventImages(event.id, selectedFiles);
      
      // Die Backend-API aktualisiert automatisch die imageUrls des Events
      const updatedEvent = await eventService.getEvent(event.id);
      setEvent(updatedEvent);
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      toast.success(`${imageUrls.length} Bilder erfolgreich hochgeladen`);
    } catch (error) {
      console.error('Fehler beim Hochladen der Bilder:', error);
      toast.error("Fehler beim Hochladen der Bilder");
    } finally {
      setIsUploading(false);
    }
  };

  const removePreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageUrl: string) => {
    setImageToDelete(imageUrl);
  };

  const confirmDeleteImage = async () => {
    if (!event || !event.imageUrls || !imageToDelete) return;

    try {
      setIsDeletingImage(true);
      await eventService.removeEventImage(event.id, imageToDelete);
      
      // Nach dem Löschen das aktualisierte Event vom Server holen
      const updatedEvent = await eventService.getEvent(event.id);
      setEvent(updatedEvent);
      
      toast.success("Bild erfolgreich entfernt");
    } catch (error) {
      console.error('Fehler beim Entfernen des Bildes:', error);
      toast.error("Fehler beim Entfernen des Bildes");
    } finally {
      setIsDeletingImage(false);
      setImageToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Event...</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event nicht gefunden.</div>;
  }

  const getEventStatus = (event: Event) => {
    const now = new Date();
    
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    
    const firstDate = new Date(firstSlot.date);
    const lastDate = new Date(lastSlot.date);

    if (isPast(lastDate)) {
      return {
        label: 'Beendet',
        icon: <CheckCircle2 className="h-4 w-4" />,
        variant: 'secondary' as const
      };
    }

    if (isWithinInterval(now, { start: firstDate, end: lastDate })) {
      return {
        label: 'Läuft jetzt',
        icon: <Clock className="h-4 w-4" />,
        variant: 'default' as const
      };
    }

    if (isFuture(firstDate)) {
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

  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), 'dd. MMMM yyyy HH:mm', { locale: de });
    } catch (error) {
      return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const getEventDateTime = (event: Event) => {
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    
    if (firstSlot.from && lastSlot.to) {
      return `${formatDate(firstSlot.date)} ${firstSlot.from} - ${lastSlot.to}`;
    }
    return formatDate(firstSlot.date);
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
              <Label>Zeitfenster</Label>
              {isEditing ? (
                <div className="space-y-4">
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
                        <Plus className="mr-2 h-4 w-4" />
                        Zeitfenster hinzufügen
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {event.dailyTimeSlots && event.dailyTimeSlots.length > 0 && (
                    <div className="space-y-2">
                      {event.dailyTimeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(slot.date)}</span>
                          {slot.from && slot.to && (
                            <span className="ml-2">
                              {slot.from} - {slot.to}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
            {event.titleImageUrl && (
              <div className="mb-6">
                <Label className="mb-2 block">Titelbild</Label>
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border mx-auto">
                  <img
                    src={event.titleImageUrl}
                    alt="Titelbild"
                    className="object-cover w-full h-full"
                  />
                  {isEditing && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(event.titleImageUrl!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {event.imageUrls && event.imageUrls.length > 0 && (
              <div className="mb-2">
                <Label className="mb-2 block">Weitere Bilder</Label>
              </div>
            )}
            {isEditing && (
              <div className="mb-8 space-y-4">
                <div className="space-y-4">
                  <Label>Titelbild</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleTitleImageChange}
                      className="max-w-xs"
                    />
                    <Button
                      onClick={handleUploadTitleImage}
                      disabled={!selectedTitleImage || isUploadingTitleImage}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploadingTitleImage ? "Wird hochgeladen..." : "Titelbild hochladen"}
                    </Button>
                  </div>
                  {titleImagePreview && (
                    <div className="relative w-48 aspect-video border rounded-lg overflow-hidden">
                      <img
                        src={titleImagePreview}
                        alt="Titelbild Vorschau"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedTitleImage(null);
                          setTitleImagePreview(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Weitere Bilder</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="max-w-xs"
                      multiple
                    />
                    <Button
                      onClick={handleUploadImages}
                      disabled={selectedFiles.length === 0 || isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Wird hochgeladen..." : "Bilder hochladen"}
                    </Button>
                  </div>
                  
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative w-full aspect-square border rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Vorschau ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removePreview(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {event.imageUrls && event.imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {event.imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Event Bild ${index + 1}`}
                      className="object-cover w-full h-48 rounded-lg"
                    />
                    {isEditing && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Keine weiteren Bilder vorhanden
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

      <Dialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bild entfernen</DialogTitle>
            <DialogDescription>
              Möchten Sie dieses Bild wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImageToDelete(null)}
              disabled={isDeletingImage}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteImage}
              disabled={isDeletingImage}
            >
              {isDeletingImage ? "Wird entfernt..." : "Entfernen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 