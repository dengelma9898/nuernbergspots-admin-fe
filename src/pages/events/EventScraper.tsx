import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
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
} from '@/components/ui/dialog';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

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
      } catch {
        // Ignore invalid JSON in localStorage
      }
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
        maxResults,
      };

      const events = await eventService.scrapeEventsFromEventFinder(params);
      setFoundEvents(events);
      toast.success(`${events.length} Events gefunden`);
    } catch (error) {
      console.error('Fehler beim Scrapen der Events:', error);
      showUserFriendlyError(error, toast);
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
    setSelectedWeek(prev => (direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)));
  };

  // Dashboard-Navigation: Cache löschen
  const handleNavigateDashboard = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigate('/events');
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <LoadingOverlay isLoading={loading}>
          <div className="relative z-10 container mx-auto py-6">
            {/* Header */}
            <motion.div
              className={cn(glassCard, 'p-6 mb-8')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <AnimatedButton
                  variant="ghost"
                  onClick={handleNavigateDashboard}
                  className={cn(glassButton, 'w-full sm:w-auto')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zur Event-Liste
                </AnimatedButton>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Event Scraper
                </h1>
              </div>
            </motion.div>

            {/* Scraper Controls */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'mb-8')}>
                <div className="p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
                    Events importieren
                  </h2>
                  <div className="flex flex-col gap-3 md:flex-row md:gap-4 items-stretch md:items-center w-full">
                    <Select value={scraperType} onValueChange={setScraperType}>
                      <SelectTrigger className={cn(glassInput, 'w-full md:w-[180px]')}>
                        <SelectValue placeholder="Scraper auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCRAPER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-row gap-2 items-center justify-between md:justify-start">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleWeekChange('prev')}
                        className={cn(glassButton, 'px-2')}
                      >
                        ←
                      </AnimatedButton>
                      <div className={cn(glassCard, 'text-xs sm:text-sm text-foreground min-w-[120px] sm:min-w-[200px] text-center px-3 py-2')}>
                        {format(weekStart, 'dd.MM.yyyy', { locale: de })} -{' '}
                        {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
                      </div>
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleWeekChange('next')}
                        className={cn(glassButton, 'px-2')}
                      >
                        →
                      </AnimatedButton>
                    </div>

                    <Select
                      value={selectedCategory ?? 'null'}
                      onValueChange={val => setSelectedCategory(val === 'null' ? null : val)}
                    >
                      <SelectTrigger className={cn(glassInput, 'w-full md:w-[200px]')}>
                        <SelectValue placeholder="Kategorie auswählen (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value ?? 'null'} value={opt.value ?? 'null'}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-row gap-2 items-center">
                      <label htmlFor="maxResults" className="text-xs sm:text-sm text-muted-foreground">
                        Max. Ergebnisse
                      </label>
                      <input
                        id="maxResults"
                        type="number"
                        min={1}
                        max={10}
                        value={maxResults}
                        onChange={e => setMaxResults(Number(e.target.value))}
                        className={cn(glassInput, 'w-14 sm:w-20 px-2 py-1 text-xs sm:text-sm')}
                      />
                    </div>

                    <LoadingButton
                      onClick={handleScrape}
                      isLoading={loading}
                      loadingText="Wird gesucht..."
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto"
                    >
                      Events suchen
                    </LoadingButton>

                    {foundEvents.length > 0 && (
                      <AnimatedButton
                        variant="destructive"
                        onClick={handleClearEvents}
                        className="w-full md:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Alle löschen
                      </AnimatedButton>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Results Section */}
            {foundEvents.length > 0 && (
              <motion.div
                className="space-y-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={defaultTransition}
              >
                <Card className={cn(glassCard, 'p-6')}>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Gefundene Events ({foundEvents.length})
                  </h2>
                </Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {foundEvents.map(event => {
                    const handleDelete = () => {
                      const updated = foundEvents.filter(e => e.id !== event.id);
                      setFoundEvents(updated);
                      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
                    };
                    const handleEdit = () => {
                      navigate(`/events/scraper/${event.id}`, {
                        state: {
                          event: selectedCategory
                            ? { ...event, categoryId: selectedCategory }
                            : event,
                        },
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
              </motion.div>
            )}

            {/* Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogContent className={cn(glassCard)}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Vorhandene Events ersetzen?</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Es sind bereits {foundEvents.length} Events vorhanden. Möchten Sie diese durch
                    neue Events ersetzen?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className={cn(glassButton)}
                  >
                    Abbrechen
                  </AnimatedButton>
                  <AnimatedButton variant="destructive" onClick={performScrape}>
                    Ersetzen
                  </AnimatedButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </LoadingOverlay>
      </div>
    </PageTransition>
  );
};
