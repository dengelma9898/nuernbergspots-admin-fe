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

      <LoadingOverlay isLoading={loading}>
        <div className="relative z-10 container mx-auto py-4 px-2 sm:px-4 md:py-6">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                onClick={handleNavigateDashboard} 
                className="mb-2 sm:mb-0 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Event-Liste
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Event Scraper
              </h1>
            </div>
          </div>

          {/* Glass Scraper Controls */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 mb-4 sm:mb-6 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Events importieren
              </h2>
              <div className="flex flex-col gap-3 md:flex-row md:gap-4 items-stretch md:items-center w-full">
                <Select value={scraperType} onValueChange={setScraperType}>
                  <SelectTrigger className="w-full md:w-[180px] backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 rounded-xl">
                    <SelectValue placeholder="Scraper auswählen" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20">
                    {SCRAPER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/20">{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-row gap-2 items-center justify-between md:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWeekChange('prev')}
                    className="px-2 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    ←
                  </Button>
                  <div className="text-xs sm:text-sm text-white/90 min-w-[120px] sm:min-w-[200px] text-center backdrop-blur-2xl bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                    {format(weekStart, 'dd.MM.yyyy', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWeekChange('next')}
                    className="px-2 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    →
                  </Button>
                </div>

                <Select value={selectedCategory ?? 'null'} onValueChange={val => setSelectedCategory(val === 'null' ? null : val)}>
                  <SelectTrigger className="w-full md:w-[200px] backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 rounded-xl">
                    <SelectValue placeholder="Kategorie auswählen (optional)" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20">
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value ?? 'null'} value={opt.value ?? 'null'} className="text-white hover:bg-white/20">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-row gap-2 items-center">
                  <label htmlFor="maxResults" className="text-xs sm:text-sm text-white/90">Max. Ergebnisse</label>
                  <input
                    id="maxResults"
                    type="number"
                    min={1}
                    max={10}
                    value={maxResults}
                    onChange={e => setMaxResults(Number(e.target.value))}
                    className="w-14 sm:w-20 backdrop-blur-2xl bg-white/10 border border-white/20 text-white rounded-xl px-2 py-1 text-xs sm:text-sm hover:bg-white/15 focus:bg-white/20 transition-all duration-300"
                  />
                </div>

                <Button 
                  onClick={handleScrape} 
                  disabled={loading} 
                  className="w-full md:w-auto backdrop-blur-2xl bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 text-white hover:from-blue-600/90 hover:to-purple-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Events suchen
                </Button>

                {foundEvents.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={handleClearEvents} 
                    className="w-full md:w-auto backdrop-blur-2xl bg-gradient-to-r from-red-500/80 to-pink-500/80 border border-white/20 text-white hover:from-red-600/90 hover:to-pink-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Alle löschen
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Glass Results Section */}
          {foundEvents.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="backdrop-blur-3xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                  Gefundene Events ({foundEvents.length})
                </h2>
              </div>
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

          {/* Glass Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-white">Vorhandene Events ersetzen?</DialogTitle>
                <DialogDescription className="text-white/80">
                  Es sind bereits {foundEvents.length} Events vorhanden. Möchten Sie diese durch neue Events ersetzen?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmDialog(false)}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  Abbrechen
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={performScrape}
                  className="backdrop-blur-2xl bg-gradient-to-r from-red-500/80 to-pink-500/80 border border-white/20 text-white hover:from-red-600/90 hover:to-pink-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
                >
                  Ersetzen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </LoadingOverlay>
    </div>
  );
}; 