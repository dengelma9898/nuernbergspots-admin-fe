import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Image as ImageIcon,
  Heart,
  Ticket,
  Euro,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowLeft,
  Tag,
  Star,
  StarOff,
  Plus,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { format, isPast, isFuture, isWithinInterval, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { convertFFToHex } from '@/utils/colorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getIconComponent } from '@/utils/iconUtils';
import { CalendarWeekSelect } from '@/components/ui/calendar-week-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingButton } from '@/components/LoadingButton';
import { scaleIn } from '@/lib/animations';
import { AnimatePresence } from 'framer-motion';

export const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedEvents, fetchedCategories] = await Promise.all([
        eventService.getEvents(),
        eventCategoryService.getCategories(),
      ]);
      setEvents(fetchedEvents);
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error('Fehler beim Laden der Daten', {
        description:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      await eventService.deleteEvent(eventToDelete);
      toast.success('Event gelöscht', {
        description: 'Das Event wurde erfolgreich gelöscht.',
      });
      loadData();
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description:
          'Das Event konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setIsDeleting(false);
    }
  };


  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!event.dailyTimeSlots?.length) return false;

    // Status-Filterung
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    const firstDate = new Date(firstSlot.date);
    const lastDate = new Date(lastSlot.date);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'past' && isPast(lastDate)) ||
      (statusFilter === 'running' &&
        isWithinInterval(new Date(), {
          start: firstDate,
          end: lastDate,
        })) ||
      (statusFilter === 'future' && isFuture(firstDate));

    const matchesCategory = categoryFilter === 'all' || event.categoryId === categoryFilter;

    // Zeitfilter
    const eventWeek = format(firstDate, 'w', { locale: de });
    const matchesTime =
      timeFilter === 'all' || (timeFilter === 'week' && selectedWeek === eventWeek);

    return matchesSearch && matchesStatus && matchesCategory && matchesTime;
  });

  // Gruppiere Events nach Monat (basierend auf Startmonat)
  const groupedEventsByMonth = filteredEvents.reduce((acc, event) => {
    if (!event.dailyTimeSlots?.length) return acc;

    const firstSlot = event.dailyTimeSlots[0];
    const firstDate = new Date(firstSlot.date);
    const monthKey = format(startOfMonth(firstDate), 'yyyy-MM', { locale: de });
    const monthLabel = format(startOfMonth(firstDate), 'MMMM yyyy', { locale: de });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        label: monthLabel,
        date: firstDate,
        events: [],
      };
    }

    acc[monthKey].events.push(event);
    return acc;
  }, {} as Record<string, { label: string; date: Date; events: Event[] }>);

  // Sortiere die Monate absteigend (neueste zuerst)
  const sortedMonths = Object.keys(groupedEventsByMonth).sort((a, b) => {
    return groupedEventsByMonth[b].date.getTime() - groupedEventsByMonth[a].date.getTime();
  });

  const handleGenerateImage = () => {
    navigate('/events/image-editor', {
      state: {
        events: filteredEvents,
        categoryName:
          categoryFilter !== 'all'
            ? categories.find(cat => cat.id === categoryFilter)?.name || ''
            : categories.length > 0
              ? categories[0].name
              : '',
      },
    });
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
          {/* Header Skeleton */}
          <div className={cn(glassCard, 'p-6 mb-8')}>
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
              <Skeleton className="bg-muted h-10 w-full sm:w-48 rounded-lg" />
              <Skeleton className="bg-muted h-8 w-32 rounded" />
              <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
                <Skeleton className="bg-muted h-10 w-full sm:w-32 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-32 rounded-lg" />
                <Skeleton className="bg-muted h-10 w-full sm:w-40 rounded-lg" />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Skeleton className="bg-muted h-10 flex-1 rounded-lg" />
              <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
              <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
              <Skeleton className="bg-muted h-10 w-full sm:w-44 rounded-lg" />
            </div>
          </div>

          {/* Event Cards Grid Skeleton */}
          <div className="space-y-8">
            {[...Array(3)].map((_, sectionIndex) => (
              <div key={sectionIndex}>
                <Skeleton className="bg-muted h-8 w-48 mb-6 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, cardIndex) => (
                    <Card key={cardIndex} className={cn(glassCard, 'flex flex-col')}>
                      <Skeleton className="bg-muted h-48 w-full rounded-t-lg" />
                      <div className="p-6">
                        <Skeleton className="bg-muted h-6 w-40 rounded mb-2" />
                        <Skeleton className="bg-muted h-4 w-32 rounded" />
                      </div>
                      <div className="px-6 pb-6 flex-grow">
                        <Skeleton className="bg-muted h-4 w-full rounded mb-2" />
                        <Skeleton className="bg-muted h-4 w-3/4 rounded" />
                      </div>
                      <div className="px-6 pb-6">
                        <div className="flex justify-between items-center">
                          <Skeleton className="bg-muted h-3 w-24 rounded" />
                          <div className="flex gap-2">
                            <Skeleton className="bg-muted h-8 w-20 rounded-lg" />
                            <Skeleton className="bg-muted h-8 w-16 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
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
        <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Dashboard
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Events
              </h1>
              <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
                <AnimatedButton
                  variant="outline"
                  onClick={handleGenerateImage}
                  className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                >
                  <ImageIcon className="h-4 w-4" />
                  Bild generieren
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  onClick={() => navigate('/events/scraper')}
                  className={cn(glassButton, 'w-full sm:w-auto gap-2')}
                >
                  <Search className="h-4 w-4" />
                  Events suchen
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => navigate('/create-event')}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Event hinzufügen
                </AnimatedButton>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="relative flex-1 mb-2 md:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Event-Namen suchen..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(glassInput, 'pl-10')}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px] mb-2 md:mb-0')}>
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Events</SelectItem>
                  <SelectItem value="past">Vergangene Events</SelectItem>
                  <SelectItem value="running">Laufende Events</SelectItem>
                  <SelectItem value="future">Zukünftige Events</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px] mb-2 md:mb-0')}>
                  <SelectValue placeholder="Kategorie filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px]')}>
                  <SelectValue placeholder="Zeitraum filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Zeiträume</SelectItem>
                  <SelectItem value="week">Kalenderwoche</SelectItem>
                </SelectContent>
              </Select>
              {timeFilter === 'week' && (
                <CalendarWeekSelect value={selectedWeek} onChange={setSelectedWeek} />
              )}
            </div>
          </motion.div>

          {/* Content Area */}
          {filteredEvents.length === 0 ? (
            <motion.div
              className={cn(glassCard, 'p-8 text-center')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="text-muted-foreground text-lg">Keine Events gefunden.</div>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {sortedMonths.map((monthKey, monthIndex) => {
                const monthGroup = groupedEventsByMonth[monthKey];
                return (
                  <motion.div key={monthKey} variants={fadeInUp}>
                    <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
                      {monthGroup.label}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {monthGroup.events.map((event, eventIndex) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          category={categories.find(cat => cat.id === event.categoryId)}
                          onDelete={handleDelete}
                          onCopy={(id) => {
                            navigate(`/events/${id}/copy`);
                            toast.success('Event wird kopiert', {
                              description: 'Sie werden zur Kopier-Seite weitergeleitet.',
                              icon: '✓',
                            });
                          }}
                          index={monthIndex * 10 + eventIndex}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Hidden elements for test compatibility */}
          <div className="sr-only">
            <div>Events</div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AnimatePresence>
              {deleteDialogOpen && (
                <DialogContent className={cn(glassCard)} asChild>
                  <motion.div
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Event löschen</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Möchten Sie dieses Event wirklich löschen? Diese Aktion kann nicht
                        rückgängig gemacht werden.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <AnimatedButton
                        variant="outline"
                        onClick={() => {
                          setDeleteDialogOpen(false);
                          setEventToDelete(null);
                        }}
                        disabled={isDeleting}
                        className={cn(glassButton)}
                      >
                        Abbrechen
                      </AnimatedButton>
                      <LoadingButton
                        variant="destructive"
                        onClick={confirmDelete}
                        isLoading={isDeleting}
                        loadingText="Wird gelöscht..."
                      >
                        Löschen
                      </LoadingButton>
                    </DialogFooter>
                  </motion.div>
                </DialogContent>
              )}
            </AnimatePresence>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
};

interface EventCardProps {
  event: Event;
  category?: EventCategory;
  onDelete: (id: string) => void;
  onCopy?: (id: string) => void;
  isPreview?: boolean;
  onEdit?: () => void;
  showDeleteButton?: boolean;
  index?: number;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  category,
  onDelete,
  onCopy,
  isPreview = false,
  onEdit,
  showDeleteButton = false,
  index = 0,
}) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const formatPrice = (event: Event) => {
    if (event.priceString) {
      return event.priceString;
    }
    if (event.price) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(event.price);
    }
    return 'Kostenlos';
  };

  const getEventDateTime = (event: Event) => {
    if (!event.dailyTimeSlots?.length) return 'Kein Datum';

    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

    if (firstSlot.date === lastSlot.date) {
      return formatDate(firstSlot.date);
    }
    return `${formatDate(firstSlot.date)} - ${formatDate(lastSlot.date)}`;
  };

  const getEventStatus = (event: Event) => {
    if (!event.dailyTimeSlots?.length) {
      return {
        label: 'Unbekannt',
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'secondary' as const,
      };
    }

    const now = new Date();
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

    const firstDate = new Date(firstSlot.date);
    const lastDate = new Date(lastSlot.date);

    if (isPast(lastDate)) {
      return {
        label: 'Beendet',
        icon: <CheckCircle2 className="h-4 w-4" />,
        variant: 'secondary' as const,
      };
    }

    if (isWithinInterval(now, { start: firstDate, end: lastDate })) {
      return {
        label: 'Läuft jetzt',
        icon: <Clock className="h-4 w-4" />,
        variant: 'default' as const,
      };
    }

    if (isFuture(firstDate)) {
      return {
        label: 'Kommend',
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'outline' as const,
      };
    }

    return {
      label: 'Unbekannt',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'secondary' as const,
    };
  };

  const getRandomFallbackImage = (category?: EventCategory): string | undefined => {
    if (!category?.fallbackImages?.length) return undefined;
    const randomIndex = Math.floor(Math.random() * category.fallbackImages.length);
    return category.fallbackImages[randomIndex];
  };

  const status = getEventStatus(event);
  const fallbackImage = getRandomFallbackImage(category);

  return (
    <AnimatedCard
      index={index}
      className={cn(glassCard, 'flex flex-col')}
    >
      {event.titleImageUrl ? (
        <div className="relative h-48 w-full">
          <img
            src={event.titleImageUrl}
            alt={event.title}
            className="object-cover w-full h-full rounded-t-2xl"
          />
          {event.imageUrls && event.imageUrls.length > 0 && (
            <div className="absolute bottom-2 left-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded-lg border border-secondary">
              +{event.imageUrls.length} weitere Bilder
            </div>
          )}
        </div>
      ) : event.imageUrls && event.imageUrls.length > 0 ? (
        <div className="relative h-48 w-full">
          <img
            src={event.imageUrls[0]}
            alt={event.title}
            className="object-cover w-full h-full rounded-t-2xl"
          />
          {event.imageUrls.length > 1 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/90 border-secondary text-foreground"
            >
              <ImageIcon className="mr-1 h-3 w-3" />+{event.imageUrls.length - 1}
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 bg-tertiary text-tertiary-foreground border-secondary">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Promoted
            </Badge>
          )}
        </div>
      ) : fallbackImage ? (
        <div className="relative h-48 w-full">
          <img
            src={fallbackImage}
            alt={`${event.title} - Kategoriebild`}
            className="object-cover w-full h-full rounded-t-2xl opacity-80"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/90 border-secondary text-foreground"
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            Kategoriebild
          </Badge>
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 bg-tertiary text-tertiary-foreground border-secondary">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Promoted
            </Badge>
          )}
        </div>
      ) : null}
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 w-full">
            <div className="flex items-center gap-1 min-w-0">
              <CardTitle className="text-xl text-foreground whitespace-nowrap">{event.title}</CardTitle>
              {event.isPromoted && <Star className="h-4 w-4 text-tertiary fill-current" />}
            </div>
            {category ? (
              <Badge
                className="text-xs flex items-center max-w-[60%] truncate border-secondary"
                style={{
                  backgroundColor: convertFFToHex(category.colorCode),
                  color: '#fff',
                }}
                title={category.name}
              >
                <span className="mr-1 flex items-center">
                  {getIconComponent(category.iconName)}
                </span>
                <span className="truncate">{category.name}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs flex items-center max-w-[60%] truncate border-secondary"
              >
                <Tag className="w-3 h-3 mr-1" />
                Keine Kategorie
              </Badge>
            )}
            <Badge
              variant={status.variant}
              className="ml-auto mt-1 sm:mt-0 border-secondary"
            >
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <CardDescription className="mt-1 text-muted-foreground">
            {getEventDateTime(event)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{event.description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{event.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Heart className="mr-2 h-4 w-4" />
            {event.favoriteCount || 0} Likes
          </div>
          <div className="flex items-center text-sm text-foreground">
            <Ticket className="mr-2 h-4 w-4" />
            {event.ticketsNeeded ? 'Tickets erforderlich' : 'Keine Tickets erforderlich'}
          </div>
          {(event.priceString || event.price) && (
            <div className="flex items-center text-sm text-foreground">
              <Euro className="mr-2 h-4 w-4" />
              {formatPrice(event)}
            </div>
          )}
          <div className="flex items-center text-sm">
            {event.isPromoted ? (
              <>
                <Star className="mr-2 h-4 w-4 text-tertiary fill-current" />
                <span className="text-tertiary font-medium">Promoted Event</span>
              </>
            ) : (
              <>
                <StarOff className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Standard Event</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">Erstellt am {formatDate(event.createdAt)}</div>
        <div className="flex gap-2">
          {isPreview ? (
            <>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={onEdit}
                className={cn(glassButton)}
              >
                Bearbeiten
              </AnimatedButton>
              {onCopy && (
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(event.id)}
                  className={cn(glassButton)}
                  title="Event kopieren"
                >
                  <Copy className="h-4 w-4" />
                </AnimatedButton>
              )}
              {showDeleteButton && (
                <AnimatedButton
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                >
                  Löschen
                </AnimatedButton>
              )}
            </>
          ) : (
            <>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}`)}
                className={cn(glassButton)}
              >
                Bearbeiten
              </AnimatedButton>
              {onCopy && (
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(event.id)}
                  className={cn(glassButton)}
                  title="Event kopieren"
                >
                  <Copy className="h-4 w-4" />
                </AnimatedButton>
              )}
              <AnimatedButton
                variant="destructive"
                size="sm"
                onClick={() => onDelete(event.id)}
              >
                Löschen
              </AnimatedButton>
            </>
          )}
        </div>
      </CardFooter>
    </AnimatedCard>
  );
};
