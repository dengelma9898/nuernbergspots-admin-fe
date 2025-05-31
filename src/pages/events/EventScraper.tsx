import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { toast } from 'sonner';
import { EventCard } from './EventList';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Kategorien-Enum und Mapping
const CATEGORY_OPTIONS = [
  { value: null, label: 'Alle' },
  { value: 'konzerte', label: 'Konzerte' },
  { value: 'theater-kultur', label: 'Theater & Kultur' },
  { value: 'musicals-shows', label: 'Musicals & Shows' },
  { value: 'comedy-kabarett', label: 'Comedy & Kabarett' },
  { value: 'partys', label: 'Partys' },
  { value: 'sportevents', label: 'Sportevents' },
  { value: 'ausstellungen', label: 'Ausstellungen' },
  { value: 'fuehrungen-rundfahrten', label: 'Führungen & Rundfahrten' },
];

const SCRAPER_TYPES = [
  { value: 'EVENTFINDER', label: 'EventFinder' },
  { value: 'CURT', label: 'CURT' },
  { value: 'RAUSGEGANGEN', label: 'Rausgegangen' },
];

const LOCAL_STORAGE_KEY = 'scraperFoundEvents';

export const EventScraper: React.FC = () => {
  const [scraperType, setScraperType] = useState<string>('EVENTFINDER');
  const [loading, setLoading] = useState(false);
  const [foundEvents, setFoundEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState<number>(5);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const eventService = useEventService();

  // Berechne Start- und Enddatum der ausgewählten Woche
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Montag als Wochenstart
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }); // Sonntag als Wochenende

  // Events aus localStorage laden
  React.useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        setFoundEvents(JSON.parse(cached));
      } catch {}
    }
  }, []);

  // Events in localStorage speichern, wenn sie sich ändern
  React.useEffect(() => {
    if (foundEvents.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(foundEvents));
    }
  }, [foundEvents]);

  const handleScrape = async () => {
    if (foundEvents.length > 0) {
      setShowConfirmDialog(true);
      return;
    }
    await performScrape();
  };

  const performScrape = async () => {
    try {
      setLoading(true);
      const params = {
        type: scraperType,
        category: selectedCategory,
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
        maxResults
      };
      
      const events = await eventService.scrapeEventsFromEventFinder(params);
      setFoundEvents(events);
      toast.success(`${events.length} Events gefunden`);
    } catch (error) {
      toast.error('Fehler beim Scrapen der Events');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleClearEvents = () => {
    setFoundEvents([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.success('Alle Events wurden gelöscht');
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  // Dashboard-Navigation: Cache löschen
  const handleNavigateDashboard = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigate('/events');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={handleNavigateDashboard}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Event-Liste
        </Button>
        <h1 className="text-2xl font-bold">Event Scraper</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Events importieren</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-col md:flex-row items-center">
            <Select value={scraperType} onValueChange={setScraperType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Scraper auswählen" />
              </SelectTrigger>
              <SelectContent>
                {SCRAPER_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange('prev')}
              >
                ←
              </Button>
              <div className="text-sm text-muted-foreground min-w-[200px] text-center">
                {format(weekStart, 'dd.MM.yyyy', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWeekChange('next')}
              >
                →
              </Button>
            </div>

            <Select value={selectedCategory ?? 'null'} onValueChange={val => setSelectedCategory(val === 'null' ? null : val)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Kategorie auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value ?? 'null'} value={opt.value ?? 'null'}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <label htmlFor="maxResults" className="text-sm">Max. Ergebnisse</label>
              <input
                id="maxResults"
                type="number"
                min={1}
                max={10}
                value={maxResults}
                onChange={e => setMaxResults(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </div>

            <Button onClick={handleScrape} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Events suchen
            </Button>

            {foundEvents.length > 0 && (
              <Button variant="destructive" onClick={handleClearEvents}>
                <Trash2 className="mr-2 h-4 w-4" />
                Alle löschen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {foundEvents.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Gefundene Events ({foundEvents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundEvents.map((event) => {
              const handleDelete = () => {
                const updated = foundEvents.filter(e => e.id !== event.id);
                setFoundEvents(updated);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
              };
              return (
                <EventCard
                  key={event.id}
                  event={selectedCategory ? { ...event, categoryId: selectedCategory } : event}
                  onDelete={handleDelete}
                  isPreview={true}
                  onEdit={() => navigate(`/events/scraper/${event.id}`, { state: { event: selectedCategory ? { ...event, categoryId: selectedCategory } : event } })}
                  showDeleteButton
                />
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorhandene Events ersetzen?</DialogTitle>
            <DialogDescription>
              Es sind bereits {foundEvents.length} Events vorhanden. Möchten Sie diese durch neue Events ersetzen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={performScrape}>
              Ersetzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 