import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Event, DailyTimeSlot } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, X } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

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
  dailyTimeSlots: DailyTimeSlot[];
  titleImageUrl?: string;
}

// Hilfsfunktion zum Herunterladen und Konvertieren von Bildern zu Files
// Versucht zuerst über Backend-Proxy, falls verfügbar, sonst direkt
const urlToFile = async (url: string, filename: string): Promise<File> => {
  try {
    // Versuche direktes Laden (funktioniert nur wenn CORS konfiguriert ist)
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  } catch (error) {
    // Falls direkter Zugriff fehlschlägt (CORS), verwende einen Proxy-Ansatz
    // TODO: Backend-Endpoint implementieren: GET /api/images/proxy?url=<encoded-url>
    // Für jetzt: Wir kopieren die URLs direkt
    throw new Error('CORS_ERROR: Image cannot be loaded directly. Backend proxy needed.');
  }
};

export const CopyEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [copiedImages, setCopiedImages] = useState<File[]>([]);
  const [copiedTitleImage, setCopiedTitleImage] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(null);
  const [copyImages, setCopyImages] = useState(true);
  const [imageUrlsToCopy, setImageUrlsToCopy] = useState<string[]>([]);
  const [titleImageUrlToCopy, setTitleImageUrlToCopy] = useState<string | null>(null);
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
      tiktok: null,
    },
    dailyTimeSlots: [],
    titleImageUrl: undefined,
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  useEffect(() => {
    if (id) {
      loadEventAndCategories();
    }
  }, [id]);

  const loadEventAndCategories = async () => {
    try {
      setLoadingEvent(true);
      const [fetchedEvent, fetchedCategories] = await Promise.all([
        eventService.getEvent(id!),
        eventCategoryService.getCategories(),
      ]);

      setCategories(fetchedCategories);

      // Kopiere Event-Daten
      const firstSlot = fetchedEvent.dailyTimeSlots[0];
      const lastSlot = fetchedEvent.dailyTimeSlots[fetchedEvent.dailyTimeSlots.length - 1];
      const startDate = firstSlot ? format(parseISO(firstSlot.date), 'yyyy-MM-dd') : '';
      const endDate = lastSlot ? format(parseISO(lastSlot.date), 'yyyy-MM-dd') : '';

      setNewEvent({
        title: `${fetchedEvent.title} (Kopie)`,
        description: fetchedEvent.description,
        startDate,
        endDate,
        address: fetchedEvent.location.address,
        latitude: fetchedEvent.location.latitude,
        longitude: fetchedEvent.location.longitude,
        price: fetchedEvent.price ?? null,
        ticketsNeeded: fetchedEvent.ticketsNeeded ?? false,
        imageUrls: [],
        favoriteCount: 0,
        isPromoted: fetchedEvent.isPromoted ?? false,
        categoryId: fetchedEvent.categoryId ?? null,
        contactEmail: fetchedEvent.contactEmail ?? null,
        contactPhone: fetchedEvent.contactPhone ?? null,
        website: fetchedEvent.website ?? null,
        socialMedia: {
          instagram: fetchedEvent.socialMedia?.instagram ?? null,
          facebook: fetchedEvent.socialMedia?.facebook ?? null,
          tiktok: fetchedEvent.socialMedia?.tiktok ?? null,
        },
        dailyTimeSlots: fetchedEvent.dailyTimeSlots.map(slot => ({ ...slot })),
        titleImageUrl: undefined,
      });

      // Setze Location für LocationSearch
      if (fetchedEvent.location) {
        setSearchValue({
          address: {
            label: fetchedEvent.location.address,
          },
          position: {
            lat: fetchedEvent.location.latitude,
            lng: fetchedEvent.location.longitude,
          },
        });
      }

      // Lade Bilder herunter, wenn copyImages aktiviert ist
      if (copyImages) {
        await loadImagesForCopy(fetchedEvent);
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Events', {
        description: 'Das Event konnte nicht geladen werden. Bitte versuche es später erneut.',
      });
      navigate('/events');
    } finally {
      setLoadingEvent(false);
    }
  };

  const loadImagesForCopy = async (event: Event) => {
    try {
      const imageFiles: File[] = [];
      const previews: string[] = [];
      const urlsToCopy: string[] = [];

      // Titelbild kopieren
      if (event.titleImageUrl) {
        try {
          const titleFile = await urlToFile(event.titleImageUrl, `title-${Date.now()}.jpg`);
          setCopiedTitleImage(titleFile);
          const preview = URL.createObjectURL(titleFile);
          setTitleImagePreview(preview);
          setTitleImageUrlToCopy(null); // Erfolgreich als File geladen
        } catch (error) {
          console.warn('Titelbild kann nicht direkt geladen werden (CORS), verwende URL-Kopie:', error);
          // Fallback: URL direkt kopieren
          setTitleImageUrlToCopy(event.titleImageUrl);
          setTitleImagePreview(event.titleImageUrl);
          setCopiedTitleImage(null);
        }
      }

      // Weitere Bilder kopieren
      if (event.imageUrls && event.imageUrls.length > 0) {
        for (let i = 0; i < event.imageUrls.length; i++) {
          try {
            const imageFile = await urlToFile(event.imageUrls[i], `image-${i}-${Date.now()}.jpg`);
            imageFiles.push(imageFile);
            previews.push(URL.createObjectURL(imageFile));
          } catch (error) {
            console.warn(`Bild ${i} kann nicht direkt geladen werden (CORS), verwende URL-Kopie:`, error);
            // Fallback: URL direkt kopieren
            urlsToCopy.push(event.imageUrls[i]);
            previews.push(event.imageUrls[i]);
          }
        }
        setCopiedImages(imageFiles);
        setImagePreviews(previews);
        setImageUrlsToCopy(urlsToCopy);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Bilder:', error);
      toast.info('Die Bilder werden mit dem kopierten Event verknüpft. Beide Events zeigen die gleichen Bilder.');
    }
  };

  useEffect(() => {
    if (copyImages && id) {
      eventService
        .getEvent(id)
        .then(event => loadImagesForCopy(event))
        .catch(console.error);
    } else {
      setCopiedImages([]);
      setCopiedTitleImage(null);
      setImagePreviews([]);
      setTitleImagePreview(null);
      setImageUrlsToCopy([]);
      setTitleImageUrlToCopy(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyImages]);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await eventCategoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error('Fehler beim Laden der Kategorien', {
        description:
          'Die Kategorien konnten nicht geladen werden. Bitte versuche es später erneut.',
      });
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

      // Erstelle das Event zuerst
      const eventToCreate = {
        ...newEvent,
        location: {
          address: newEvent.address,
          latitude: newEvent.latitude,
          longitude: newEvent.longitude,
        },
      };

      // Entferne Felder, die nicht im Event-Interface sind
      const { startDate, endDate, address, latitude, longitude, ...eventData } = eventToCreate;

      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      const createdEvent = await eventService.createEvent(eventData);

      // Lade Bilder hoch, wenn sie kopiert wurden
      if (copyImages) {
        // Lade Titelbild hoch (entweder als File oder als URL)
        if (copiedTitleImage) {
          await eventService.uploadEventTitleImage(createdEvent.id, copiedTitleImage);
        } else if (titleImageUrlToCopy) {
          // Fallback: URL direkt setzen
          await eventService.setEventTitleImage(createdEvent.id, titleImageUrlToCopy);
        }

        // Lade weitere Bilder hoch (entweder als Files oder als URLs)
        if (copiedImages.length > 0) {
          await eventService.uploadEventImages(createdEvent.id, copiedImages);
        }
        if (imageUrlsToCopy.length > 0) {
          // Fallback: URLs direkt setzen
          const currentEvent = await eventService.getEvent(createdEvent.id);
          const existingUrls = currentEvent.imageUrls || [];
          await eventService.updateEventImages(createdEvent.id, [
            ...existingUrls,
            ...imageUrlsToCopy,
          ]);
        }
      }

      toast.success('Event kopiert', {
        description: 'Das Event wurde erfolgreich kopiert.',
      });
      navigate('/events');
    } catch (error) {
      toast.error('Fehler beim Kopieren', {
        description: 'Das Event konnte nicht kopiert werden. Bitte überprüfe deine Eingaben.',
      });
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

  const removeImagePreview = (index: number) => {
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newFiles = [...copiedImages];
    newFiles.splice(index, 1);
    setCopiedImages(newFiles);
  };

  const removeTitleImagePreview = () => {
    if (titleImagePreview) {
      URL.revokeObjectURL(titleImagePreview);
      setTitleImagePreview(null);
      setCopiedTitleImage(null);
    }
  };

  if (loadingEvent) {
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

        <div className="relative z-10 min-h-screen bg-muted !bg-transparent">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6">
              <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-64 mb-4 rounded-xl" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
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

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/events')}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl p-2 border w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Event kopieren
              </h1>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Event Details</h2>
              <p className="text-white/70 text-sm mt-1">
                Passe die Daten an und erstelle eine Kopie des Events.
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Bilder kopieren Option */}
              <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="copyImages"
                    checked={copyImages}
                    onCheckedChange={setCopyImages}
                    className="data-[state=checked]:bg-white/30"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="copyImages" className="text-white font-medium">
                      Bilder mitkopieren
                    </Label>
                    <p className="text-xs text-white/60">
                      Wenn aktiviert, werden alle Bilder des ursprünglichen Events mitkopiert.
                      {imageUrlsToCopy.length > 0 || titleImageUrlToCopy ? (
                        <span className="block mt-1 text-yellow-400">
                          Hinweis: Die Bilder werden mit dem kopierten Event verknüpft. Wenn du das ursprüngliche Event oder dessen Bilder später löschst, sind die Bilder auch im kopierten Event nicht mehr verfügbar.
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
              </div>

              {/* Titelbild Vorschau */}
              {copyImages && titleImagePreview && (
                <div className="space-y-2">
                  <Label className="text-white font-medium">Titelbild (kopiert)</Label>
                  <div className="relative inline-block">
                    <img
                      src={titleImagePreview}
                      alt="Titelbild Vorschau"
                      className="h-48 w-full object-cover rounded-xl backdrop-blur-2xl bg-white/10 border border-white/20"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeTitleImagePreview}
                      className="absolute top-2 right-2 backdrop-blur-2xl bg-red-500/80 border-red-400/30 text-white hover:bg-red-500/90"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Bilder Vorschau */}
              {copyImages && imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white font-medium">Bilder (kopiert)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Bild ${index + 1}`}
                          className="h-32 w-full object-cover rounded-xl backdrop-blur-2xl bg-white/10 border border-white/20"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImagePreview(index)}
                          className="absolute top-1 right-1 backdrop-blur-2xl bg-red-500/80 border-red-400/30 text-white hover:bg-red-500/90 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">
                  Titel
                </Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="z.B. Sommerfest 2024"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                />
                <p className="text-xs text-white/60">
                  Ein prägnanter Titel, der das Event gut beschreibt.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">
                  Beschreibung
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Beschreibe das Event im Detail..."
                  className="min-h-[100px] backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                />
                <p className="text-xs text-white/60">
                  Eine ausführliche Beschreibung des Events. Nenne wichtige Details wie
                  Programm, Highlights oder besondere Hinweise.
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white font-medium">
                    Startdatum
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newEvent.startDate.split('T')[0]}
                    onChange={e => handleInputChange('startDate', e.target.value)}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white font-medium">
                    Enddatum
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.endDate.split('T')[0]}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Daily Time Slots */}
              {newEvent.dailyTimeSlots.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white font-medium">
                      Tägliche Zeitangaben (optional)
                    </Label>
                  </div>

                  <div className="space-y-4">
                    {newEvent.dailyTimeSlots.map(slot => (
                      <div
                        key={slot.date}
                        className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="font-medium text-white">
                            {format(parseISO(slot.date), 'EEEE, dd.MM.yyyy', { locale: de })}
                          </div>
                          <Input
                            type="time"
                            value={slot.from || ''}
                            onChange={e => updateTimeSlot(slot.date, 'from', e.target.value)}
                            placeholder="Von"
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                          />
                          <Input
                            type="time"
                            value={slot.to || ''}
                            onChange={e => updateTimeSlot(slot.date, 'to', e.target.value)}
                            placeholder="Bis"
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Adresse</Label>
                <div className="backdrop-blur-2xl bg-white/10 border-white/20 rounded-xl">
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                    className="border-0 bg-transparent text-white placeholder:text-white/60 focus:ring-white/20"
                  />
                </div>
                <p className="text-xs text-white/60">
                  Der genaue Veranstaltungsort. Suche nach einer Adresse und wähle den
                  passenden Eintrag aus.
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white font-medium">
                  Preis (in €)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newEvent.price || ''}
                  onChange={e => handleInputChange('price', parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                />
                <p className="text-xs text-white/60">
                  Der Eintrittspreis in Euro. Lass das Feld leer oder gib 0 ein für
                  kostenlose Events.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white font-medium">
                  Kategorie
                </Label>
                <Select
                  value={newEvent.categoryId || ''}
                  onValueChange={value => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl">
                    <SelectValue placeholder="Kategorie auswählen" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-3xl bg-white/10 border border-white/20 rounded-xl">
                    {categories.map(category => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-white hover:bg-white/20 focus:bg-white/20"
                      >
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
                <p className="text-xs text-white/60">
                  Wähle eine passende Kategorie für dein Event aus.
                </p>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="ticketsNeeded"
                      checked={newEvent.ticketsNeeded}
                      onCheckedChange={checked => handleInputChange('ticketsNeeded', checked)}
                      className="data-[state=checked]:bg-white/30"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="ticketsNeeded" className="text-white font-medium">
                        Tickets erforderlich
                      </Label>
                      <p className="text-xs text-white/60">
                        Aktiviere diese Option, wenn Besucher Tickets im Voraus erwerben
                        müssen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isPromoted"
                      checked={newEvent.isPromoted}
                      onCheckedChange={checked => handleInputChange('isPromoted', checked)}
                      className="data-[state=checked]:bg-white/30"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isPromoted" className="text-white font-medium">
                        Als "Highlight" markieren
                      </Label>
                      <p className="text-xs text-white/60">
                        Aktiviere diese Option, um das Event als "Highlight" zu kennzeichnen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-white font-medium text-lg">Kontaktinformationen</Label>

                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-white/90">
                        E-Mail
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={newEvent.contactEmail || ''}
                        onChange={e => handleInputChange('contactEmail', e.target.value)}
                        placeholder="kontakt@beispiel.de"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-white/90">
                        Telefon
                      </Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={newEvent.contactPhone || ''}
                        onChange={e => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+49 123 4567890"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="website" className="text-white/90">
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={newEvent.website || ''}
                        onChange={e => handleInputChange('website', e.target.value)}
                        placeholder="https://www.beispiel.de"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-white/90 text-base">Social Media</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-white/80 text-sm">
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
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-white/80 text-sm">
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
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tiktok" className="text-white/80 text-sm">
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
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 mt-4">
                    Alle Kontaktinformationen sind optional. Füge nur die Informationen hinzu,
                    die du öffentlich teilen möchtest.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => navigate('/events')}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl w-full sm:w-auto"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-green-400/30 text-white hover:from-green-400/90 hover:to-emerald-400/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg w-full sm:w-auto"
                >
                  {loading ? 'Wird kopiert...' : 'Event kopieren'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
