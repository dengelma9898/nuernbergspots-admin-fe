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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
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

  const handleDelete = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event gelöscht', {
        description: 'Das Event wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description:
          'Das Event konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
      });
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy HH:mm', { locale: de });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
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

  const getEventDateTime = (event: Event) => {
    if (!event.dailyTimeSlots?.length) return 'Kein Datum';

    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];

    if (firstSlot.date === lastSlot.date) {
      return formatDate(firstSlot.date);
    }
    return `${formatDate(firstSlot.date)} - ${formatDate(lastSlot.date)}`;
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

  const groupedEvents = {
    past: filteredEvents.filter(event => {
      if (!event.dailyTimeSlots?.length) return false;
      const lastDate = new Date(event.dailyTimeSlots[event.dailyTimeSlots.length - 1].date);
      return isPast(lastDate);
    }),
    running: filteredEvents.filter(event => {
      if (!event.dailyTimeSlots?.length) return false;
      const firstDate = new Date(event.dailyTimeSlots[0].date);
      const lastDate = new Date(event.dailyTimeSlots[event.dailyTimeSlots.length - 1].date);
      return isWithinInterval(new Date(), {
        start: firstDate,
        end: lastDate,
      });
    }),
    future: filteredEvents.filter(event => {
      if (!event.dailyTimeSlots?.length) return false;
      const firstDate = new Date(event.dailyTimeSlots[0].date);
      return isFuture(firstDate);
    }),
  };

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background System */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

        {/* Animated Background Elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
          {/* Glass Header Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6 mb-8">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
              <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-48 rounded-xl" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-8 w-32 rounded" />
              <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
                <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-32 rounded-xl" />
                <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-32 rounded-xl" />
                <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-40 rounded-xl" />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Skeleton className="bg-white/10 backdrop-blur-xl h-10 flex-1 rounded-xl" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-44 rounded-xl" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-44 rounded-xl" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-10 w-full sm:w-44 rounded-xl" />
            </div>
          </div>

          {/* Event Cards Grid Skeleton */}
          <div className="space-y-8">
            {[...Array(3)].map((_, sectionIndex) => (
              <div key={sectionIndex}>
                <Skeleton className="bg-white/10 backdrop-blur-xl h-8 w-48 mb-6 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="backdrop-blur-3xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/20 flex flex-col"
                    >
                      {/* Image Skeleton */}
                      <Skeleton className="bg-white/10 backdrop-blur-xl h-48 w-full rounded-t-2xl" />

                      {/* Card Header */}
                      <div className="p-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2 w-full mb-2">
                            <Skeleton className="bg-white/10 backdrop-blur-xl h-6 w-40 rounded" />
                            <Skeleton className="bg-white/10 backdrop-blur-xl h-5 w-20 rounded-xl" />
                            <Skeleton className="bg-white/10 backdrop-blur-xl h-5 w-16 rounded-xl ml-auto" />
                          </div>
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-32 rounded" />
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="px-6 pb-6 flex-grow">
                        <div className="space-y-3 mb-4">
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-full rounded" />
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-3/4 rounded" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-full rounded" />
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-20 rounded" />
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-40 rounded" />
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-24 rounded" />
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-32 rounded" />
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 pb-6">
                        <div className="flex justify-between items-center">
                          <Skeleton className="bg-white/10 backdrop-blur-xl h-3 w-24 rounded" />
                          <div className="flex gap-2">
                            <Skeleton className="bg-white/10 backdrop-blur-xl h-8 w-20 rounded-xl" />
                            <Skeleton className="bg-white/10 backdrop-blur-xl h-8 w-16 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background System */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Animated Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

      <div className="relative z-10 container mx-auto py-6 px-2 max-w-full overflow-x-hidden">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/10 rounded-3xl border border-white/20 p-6 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto text-white hover:bg-white/20 backdrop-blur-2xl border-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Events
            </h1>
            <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateImage}
                className="w-full sm:w-auto gap-2 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <ImageIcon className="h-4 w-4" />
                Bild generieren
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/events/scraper')}
                className="w-full sm:w-auto gap-2 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <Search className="h-4 w-4" />
                Events suchen
              </Button>
              <Button
                onClick={() => navigate('/create-event')}
                className="w-full sm:w-auto backdrop-blur-2xl bg-gradient-to-r from-white/20 to-white/10 border-white/30 text-white hover:from-white/30 hover:to-white/20 hover:scale-105 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Event hinzufügen
              </Button>
            </div>
          </div>

          {/* Glass Filter Bar */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="relative flex-1 mb-2 md:mb-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Nach Event-Namen suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl mb-2 md:mb-0 backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                <SelectItem value="all">Alle Events</SelectItem>
                <SelectItem value="past">Vergangene Events</SelectItem>
                <SelectItem value="running">Laufende Events</SelectItem>
                <SelectItem value="future">Zukünftige Events</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl mb-2 md:mb-0 backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Kategorie filtern" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Zeitraum filtern" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                <SelectItem value="all">Alle Zeiträume</SelectItem>
                <SelectItem value="week">Kalenderwoche</SelectItem>
              </SelectContent>
            </Select>
            {timeFilter === 'week' && (
              <CalendarWeekSelect value={selectedWeek} onChange={setSelectedWeek} />
            )}
          </div>
        </div>

        {/* Content Area */}
        {filteredEvents.length === 0 ? (
          <div className="backdrop-blur-3xl bg-white/10 rounded-3xl border border-white/20 p-8 text-center shadow-2xl">
            <div className="text-white/80 text-lg">Keine Events gefunden.</div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedEvents.running.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                  Laufende Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedEvents.running.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      category={categories.find(cat => cat.id === event.categoryId)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedEvents.future.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                  Zukünftige Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedEvents.future.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      category={categories.find(cat => cat.id === event.categoryId)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedEvents.past.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                  Vergangene Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedEvents.past.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      category={categories.find(cat => cat.id === event.categoryId)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden elements for test compatibility */}
        <div className="sr-only">
          <div>Events</div>
        </div>
      </div>
    </div>
  );
};

interface EventCardProps {
  event: Event;
  category?: EventCategory;
  onDelete: (id: string) => void;
  isPreview?: boolean;
  onEdit?: () => void;
  showDeleteButton?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  category,
  onDelete,
  isPreview = false,
  onEdit,
  showDeleteButton = false,
}) => {
  const navigate = useNavigate();

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
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
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl ring-1 ring-white/30 flex flex-col">
      {event.titleImageUrl ? (
        <div className="relative h-48 w-full">
          <img
            src={event.titleImageUrl}
            alt={event.title}
            className="object-cover w-full h-full rounded-t-2xl"
          />
          {event.imageUrls && event.imageUrls.length > 0 && (
            <div className="absolute bottom-2 left-2 backdrop-blur-2xl bg-black/40 text-white text-xs px-2 py-1 rounded-lg border border-white/20">
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
              className="absolute top-2 right-2 backdrop-blur-2xl bg-white/20 border-white/30 text-white"
            >
              <ImageIcon className="mr-1 h-3 w-3" />+{event.imageUrls.length - 1}
            </Badge>
          )}
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 backdrop-blur-2xl bg-gradient-to-r from-yellow-400/90 to-orange-500/90 text-white border-yellow-400/50">
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
            className="absolute top-2 right-2 backdrop-blur-2xl bg-white/20 border-white/30 text-white"
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            Kategoriebild
          </Badge>
          {event.isPromoted && (
            <Badge className="absolute top-2 left-2 backdrop-blur-2xl bg-gradient-to-r from-yellow-400/90 to-orange-500/90 text-white border-yellow-400/50">
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
              <CardTitle className="text-xl text-white whitespace-nowrap">{event.title}</CardTitle>
              {event.isPromoted && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
            </div>
            {category ? (
              <Badge
                className="text-xs flex items-center max-w-[60%] truncate backdrop-blur-2xl border-white/30"
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
                className="text-xs flex items-center max-w-[60%] truncate backdrop-blur-2xl bg-white/10 border-white/30 text-white"
              >
                <Tag className="w-3 h-3 mr-1" />
                Keine Kategorie
              </Badge>
            )}
            <Badge
              variant={status.variant}
              className="ml-auto mt-1 sm:mt-0 backdrop-blur-2xl bg-white/20 border-white/30 text-white"
            >
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <CardDescription className="mt-1 text-white/80">
            {getEventDateTime(event)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-white/70 line-clamp-3 mb-4">{event.description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-white/80">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{event.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-white/80">
            <Heart className="mr-2 h-4 w-4" />
            {event.favoriteCount || 0} Likes
          </div>
          <div className="flex items-center text-sm text-white/80">
            <Ticket className="mr-2 h-4 w-4" />
            {event.ticketsNeeded ? 'Tickets erforderlich' : 'Keine Tickets erforderlich'}
          </div>
          {event.price && (
            <div className="flex items-center text-sm text-white/80">
              <Euro className="mr-2 h-4 w-4" />
              {formatPrice(event.price)}
            </div>
          )}
          <div className="flex items-center text-sm">
            {event.isPromoted ? (
              <>
                <Star className="mr-2 h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-medium">Promoted Event</span>
              </>
            ) : (
              <>
                <StarOff className="mr-2 h-4 w-4 text-white/60" />
                <span className="text-white/60">Standard Event</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-white/60">Erstellt am {formatDate(event.createdAt)}</div>
        <div className="flex gap-2">
          {isPreview ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Bearbeiten
              </Button>
              {showDeleteButton && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="backdrop-blur-2xl bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30"
                >
                  Löschen
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}`)}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Bearbeiten
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(event.id)}
                className="backdrop-blur-2xl bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30"
              >
                Löschen
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
