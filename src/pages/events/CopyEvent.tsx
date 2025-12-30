import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [hasValidLocation, setHasValidLocation] = useState(false);
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

      // Migriere price zu priceString beim Kopieren
      let priceString: string | null = null;
      if (fetchedEvent.priceString) {
        // Wenn priceString vorhanden ist, verwende es
        priceString = fetchedEvent.priceString;
      } else if (fetchedEvent.price !== undefined && fetchedEvent.price !== null) {
        // Wenn nur price vorhanden ist, konvertiere es zu priceString
        priceString = new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(fetchedEvent.price);
      }

      // Validiere Location-Daten
      const isValidLocation =
        fetchedEvent.location?.address &&
        fetchedEvent.location.address.trim() !== '' &&
        fetchedEvent.location.latitude !== undefined &&
        fetchedEvent.location.latitude !== null &&
        fetchedEvent.location.latitude !== 0 &&
        fetchedEvent.location.longitude !== undefined &&
        fetchedEvent.location.longitude !== null &&
        fetchedEvent.location.longitude !== 0;

      setHasValidLocation(isValidLocation);

      setNewEvent({
        title: `${fetchedEvent.title} (Kopie)`,
        description: fetchedEvent.description,
        startDate,
        endDate,
        address: isValidLocation ? fetchedEvent.location.address : '',
        latitude: isValidLocation ? fetchedEvent.location.latitude : 0,
        longitude: isValidLocation ? fetchedEvent.location.longitude : 0,
        price: null, // Beim Kopieren setzen wir price nicht mehr, nur priceString
        priceString: priceString,
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

      // Setze Location für LocationSearch nur wenn gültig
      if (isValidLocation && fetchedEvent.location) {
        setSearchValue({
          address: {
            label: fetchedEvent.location.address,
          },
          position: {
            lat: fetchedEvent.location.latitude,
            lng: fetchedEvent.location.longitude,
          },
        });
      } else {
        setSearchValue(null);
      }

      // Lade Bilder herunter, wenn copyImages aktiviert ist
      if (copyImages) {
        await loadImagesForCopy(fetchedEvent);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Events:', error);
      showUserFriendlyError(error, toast);
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
    if (!location) {
      setHasValidLocation(false);
      return;
    }

    const isValid =
      location.address?.label &&
      location.address.label.trim() !== '' &&
      location.position?.lat !== undefined &&
      location.position.lat !== null &&
      location.position.lat !== 0 &&
      location.position?.lng !== undefined &&
      location.position.lng !== null &&
      location.position.lng !== 0;

    setHasValidLocation(isValid);

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

      // Validiere Location-Daten vor dem Speichern
      if (!newEvent.address || !newEvent.address.trim() || newEvent.latitude === 0 || newEvent.longitude === 0) {
        showUserFriendlyError(new Error('Bitte wählen Sie eine vollständige Adresse mit Koordinaten aus.'), toast, undefined, 'save-event');
        setLoading(false);
        return;
      }

      // Entferne Felder, die nicht im Event-Interface sind und erstelle flache Location-Daten
      const { startDate, endDate, price, ...eventData } = newEvent;
      
      // Stelle sicher, dass nur priceString gesendet wird, nicht price, und Location-Daten flach sind
      const finalEventData = {
        ...eventData,
        address: newEvent.address,
        latitude: newEvent.latitude,
        longitude: newEvent.longitude,
        priceString: newEvent.priceString || undefined,
      };

      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      const createdEvent = await eventService.createEvent(finalEventData);

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
      console.error('Fehler beim Kopieren des Events:', error);
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
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <div className="relative z-10 container mx-auto py-6">
            <div className={cn(glassCard, 'p-6')}>
              <Skeleton className="bg-muted h-10 w-64 mb-4 rounded-lg" />
              <Skeleton className="bg-muted h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
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
                Event kopieren
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
                  Passe die Daten an und erstelle eine Kopie des Events.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Bilder kopieren Option */}
                <div className={cn(glassCard, 'p-4')}>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="copyImages"
                      checked={copyImages}
                      onCheckedChange={setCopyImages}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="copyImages" className="text-foreground">
                        Bilder mitkopieren
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Wenn aktiviert, werden alle Bilder des ursprünglichen Events mitkopiert.
                        {imageUrlsToCopy.length > 0 || titleImageUrlToCopy ? (
                          <span className="block mt-1 text-destructive">
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
                    <Label className="text-foreground">Titelbild (kopiert)</Label>
                    <div className="relative inline-block">
                      <img
                        src={titleImagePreview}
                        alt="Titelbild Vorschau"
                        className="h-48 w-full object-cover rounded-lg border border-secondary bg-card"
                      />
                      <AnimatedButton
                        variant="destructive"
                        size="sm"
                        onClick={removeTitleImagePreview}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                )}

                {/* Bilder Vorschau */}
                {copyImages && imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-foreground">Bilder (kopiert)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Bild ${index + 1}`}
                            className="h-32 w-full object-cover rounded-lg border border-secondary bg-card"
                          />
                          <AnimatedButton
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImagePreview(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </AnimatedButton>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
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
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Beschreibung
                  </Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Beschreibe das Event im Detail..."
                    className={cn(glassInput, 'min-h-[100px]')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Eine ausführliche Beschreibung des Events. Nenne wichtige Details wie
                    Programm, Highlights oder besondere Hinweise.
                  </p>
                </div>

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
                        <div key={slot.date} className={cn(glassCard, 'p-4')}>
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
                  {!hasValidLocation && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-2">
                      <div className="text-sm text-destructive font-semibold mb-1">
                        ⚠️ Adresse muss neu gesetzt werden
                      </div>
                      <p className="text-xs text-destructive/80">
                        Die Adresse des kopierten Events ist nicht vollständig oder konnte nicht korrekt übertragen werden. Bitte suchen Sie die Adresse erneut über das Suchfeld und wählen Sie den passenden Eintrag aus.
                      </p>
                    </div>
                  )}
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                  />
                  {hasValidLocation && newEvent.address && (
                    <div className={cn(glassCard, 'p-4')}>
                      <div className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <span>📍</span>
                        {newEvent.address}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          Latitude:
                          <br />
                          {newEvent.latitude}
                        </div>
                        <div>
                          Longitude:
                          <br />
                          {newEvent.longitude}
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Der genaue Veranstaltungsort. Suche nach einer Adresse und wähle den
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
                    Der Eintrittspreis als Text. Lass das Feld leer für kostenlose Events.
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
                    Wähle eine passende Kategorie für dein Event aus.
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
                          Aktiviere diese Option, wenn Besucher Tickets im Voraus erwerben
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
                      Alle Kontaktinformationen sind optional. Füge nur die Informationen hinzu,
                      die du öffentlich teilen möchtest.
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
                    loadingText="Wird kopiert..."
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                  >
                    Event kopieren
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
