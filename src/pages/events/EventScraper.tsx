import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { toast } from 'sonner';
import { ScraperEventCard } from '@/components/events/ScraperEventCard';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
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
  { value: 'parks', label: 'Parks' },
  { value: 'eventbrite', label: 'Eventbrite' },
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
      setShowConfirmDialog(false);
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
    <LoadingOverlay isLoading={loading}>
      <div className="container mx-auto py-4 px-2 sm:px-4 md:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" onClick={handleNavigateDashboard} className="mb-2 sm:mb-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Event-Liste
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Event Scraper</h1>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle>Events importieren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:gap-4 items-stretch md:items-center w-full">
              <Select value={scraperType} onValueChange={setScraperType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Scraper auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {SCRAPER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-row gap-2 items-center justify-between md:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange('prev')}
                  className="px-2"
                >
                  ←
                </Button>
                <div className="text-xs sm:text-sm text-muted-foreground min-w-[120px] sm:min-w-[200px] text-center">
                  {format(weekStart, 'dd.MM.yyyy', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange('next')}
                  className="px-2"
                >
                  →
                </Button>
              </div>

              <Select value={selectedCategory ?? 'null'} onValueChange={val => setSelectedCategory(val === 'null' ? null : val)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Kategorie auswählen (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value ?? 'null'} value={opt.value ?? 'null'}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-row gap-2 items-center">
                <label htmlFor="maxResults" className="text-xs sm:text-sm">Max. Ergebnisse</label>
                <input
                  id="maxResults"
                  type="number"
                  min={1}
                  max={10}
                  value={maxResults}
                  onChange={e => setMaxResults(Number(e.target.value))}
                  className="w-14 sm:w-20 border rounded px-2 py-1 text-xs sm:text-sm"
                />
              </div>

              <Button onClick={handleScrape} disabled={loading} className="w-full md:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Events suchen
              </Button>

              {foundEvents.length > 0 && (
                <Button variant="destructive" onClick={handleClearEvents} className="w-full md:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Alle löschen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {foundEvents.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold">Gefundene Events ({foundEvents.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {foundEvents.map((event) => {
                const handleDelete = () => {
                  const updated = foundEvents.filter(e => e.id !== event.id);
                  setFoundEvents(updated);
                  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
                };
                const handleEdit = () => {
                  navigate(`/events/scraper/${event.id}`, {
                    state: {
                      event: selectedCategory ? { ...event, categoryId: selectedCategory } : event
                    }
                  });
                };
                return (
                  <ScraperEventCard
                    key={event.id}
                    event={selectedCategory ? { ...event, categoryId: selectedCategory } : event}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
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
    </LoadingOverlay>
  );
}; 