import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Calendar, 
  Image as ImageIcon,
  Heart, 
  Ticket, 
  Euro,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const eventService = useEventService();
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await eventService.getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      toast.error("Fehler beim Laden der Events", {
        description: "Die Events konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      toast.success("Event gelöscht", {
        description: "Das Event wurde erfolgreich gelöscht.",
      });
      loadEvents();
    } catch (error) {
      toast.error("Fehler beim Löschen", {
        description: "Das Event konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy HH:mm', { locale: de });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'past' && isPast(new Date(event.endDate))) ||
      (statusFilter === 'running' && isWithinInterval(new Date(), { 
        start: new Date(event.startDate), 
        end: new Date(event.endDate) })) ||
      (statusFilter === 'future' && isFuture(new Date(event.startDate)));
    
    return matchesSearch && matchesStatus;
  });

  const groupedEvents = {
    past: filteredEvents.filter(event => isPast(new Date(event.endDate))),
    running: filteredEvents.filter(event => isWithinInterval(new Date(), { 
      start: new Date(event.startDate), 
      end: new Date(event.endDate) })),
    future: filteredEvents.filter(event => isFuture(new Date(event.startDate)))
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Events...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Event erstellen
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Event-Namen suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Events</SelectItem>
            <SelectItem value="past">Vergangene Events</SelectItem>
            <SelectItem value="running">Laufende Events</SelectItem>
            <SelectItem value="future">Zukünftige Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">Keine Events gefunden.</div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.running.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Laufende Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedEvents.running.map((event) => (
                  <EventCard key={event.id} event={event} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {groupedEvents.future.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Zukünftige Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedEvents.future.map((event) => (
                  <EventCard key={event.id} event={event} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {groupedEvents.past.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Vergangene Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedEvents.past.map((event) => (
                  <EventCard key={event.id} event={event} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  const navigate = useNavigate();
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
  
  const formatDateTime = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy HH:mm', { locale: de });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  };
  
  return (
    <Card className="flex flex-col">
      {event.imageUrls && event.imageUrls.length > 0 && (
        <div className="relative h-48 w-full">
          <img
            src={event.imageUrls[0]}
            alt={event.title}
            className="object-cover w-full h-full rounded-t-lg"
          />
          {event.imageUrls.length > 1 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              <ImageIcon className="mr-1 h-3 w-3" />
              +{event.imageUrls.length - 1}
            </Badge>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription className="mt-1">
              {formatDateTime(event.startDate)}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {event.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{event.location.address}</span>
          </div>
          <div className="flex items-center text-sm">
            <Heart className="mr-2 h-4 w-4" />
            {event.favoriteCount || 0} Likes
          </div>
          <div className="flex items-center text-sm">
            <Ticket className="mr-2 h-4 w-4" />
            {event.ticketsNeeded ? 'Tickets erforderlich' : 'Keine Tickets erforderlich'}
          </div>
          {event.price && (
            <div className="flex items-center text-sm">
              <Euro className="mr-2 h-4 w-4" />
              {formatPrice(event.price)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Erstellt am {formatDate(event.createdAt)}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            Bearbeiten
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(event.id)}
          >
            Löschen
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 