import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2, Info } from 'lucide-react';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { EventCategory } from '@/models/event-category';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { ScraperEventCard } from '@/components/events/ScraperEventCard';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY = 'scraperFoundEvents';

/**
 * Validiert eine URL
 */
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const EventScraper: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [foundEvents, setFoundEvents] = useState<Event[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();

  // Kategorien beim Mount laden
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await eventCategoryService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
        // Nicht kritisch, wenn Kategorien nicht geladen werden können
      }
    };
    loadCategories();
  }, [eventCategoryService]);

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

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value && !isValidUrl(value)) {
      setUrlError('Bitte geben Sie eine gültige URL ein (z.B. https://eventfinder.de/nuernberg)');
    } else {
      setUrlError('');
    }
  };

  const handleScrape = async () => {
    // URL-Validierung
    if (!url.trim()) {
      setUrlError('Bitte geben Sie eine URL ein');
      return;
    }

    if (!isValidUrl(url)) {
      setUrlError('Bitte geben Sie eine gültige URL ein (z.B. https://eventfinder.de/nuernberg)');
      return;
    }

    if (foundEvents.length > 0) {
      setShowConfirmDialog(true);
      return;
    }
    await performScrape();
  };

  /**
   * Validiert und bereinigt Events: Entfernt categoryId, wenn sie nicht in den vorhandenen Kategorien existiert
   */
  const validateAndCleanEvents = (events: Event[]): Event[] => {
    const validCategoryIds = new Set(categories.map(cat => cat.id));
    
    return events.map(event => {
      // Wenn categoryId vorhanden ist, aber nicht in den vorhandenen Kategorien existiert, entfernen
      if (event.categoryId && !validCategoryIds.has(event.categoryId)) {
        const { categoryId, ...eventWithoutCategory } = event;
        return { ...eventWithoutCategory, categoryId: undefined };
      }
      return event;
    });
  };

  const performScrape = async () => {
    try {
      setLoading(true);
      setShowConfirmDialog(false);
      setUrlError('');

      // Immer false für useFallback senden
      const events = await eventService.scrapeEventsWithLlm(url.trim(), false);
      
      // Events validieren und bereinigen: categoryId entfernen, wenn nicht vorhanden
      const cleanedEvents = validateAndCleanEvents(events);
      
      setFoundEvents(cleanedEvents);
      showSuccessMessage(toast, {
        title: 'Events gefunden',
        description: `${cleanedEvents.length} Event${cleanedEvents.length !== 1 ? 's' : ''} wurde${cleanedEvents.length !== 1 ? 'n' : ''} erfolgreich gefunden.`,
      });
    } catch (error) {
      console.error('Fehler beim Scrapen der Events:', error);
      showUserFriendlyError(error, toast, () => handleScrape(), 'load-event');
    } finally {
      setLoading(false);
    }
  };

  const handleClearEvents = () => {
    setFoundEvents([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showSuccessMessage(toast, {
      title: 'Events gelöscht',
      description: 'Alle gefundenen Events wurden erfolgreich gelöscht.',
    });
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
              <div className="flex flex-row items-center gap-4">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={handleNavigateDashboard}
                  className={cn(glassButton, 'rounded-full')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zur Event-Liste</span>
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
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      Events importieren
                    </h2>
                    <Alert className={cn(glassCard, 'border-white/20')}>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm text-muted-foreground">
                        Das System erkennt automatisch Events auf der angegebenen Seite und extrahiert alle
                        relevanten Informationen wie Titel, Beschreibung, Termine, Preise und Orte.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-foreground">
                        URL der Event-Seite
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://eventfinder.de/nuernberg"
                        value={url}
                        onChange={e => handleUrlChange(e.target.value)}
                        onBlur={() => {
                          if (url && !isValidUrl(url)) {
                            setUrlError('Bitte geben Sie eine gültige URL ein');
                          }
                        }}
                        className={cn(
                          glassInput,
                          urlError && 'border-destructive focus-visible:ring-destructive'
                        )}
                        disabled={loading}
                      />
                      {urlError && (
                        <p className="text-sm text-destructive">{urlError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Beispiel-URLs: eventfinder.de, curt.de, rausgegangen.de, eventbrite.de
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <LoadingButton
                        onClick={handleScrape}
                        isLoading={loading}
                        loadingText="Wird gesucht..."
                        disabled={!url.trim() || !!urlError || loading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto border-2 border-black dark:border-white"
                      >
                        Events suchen
                      </LoadingButton>

                      {foundEvents.length > 0 && (
                        <AnimatedButton
                          variant="destructive"
                          onClick={handleClearEvents}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Alle löschen
                        </AnimatedButton>
                      )}
                    </div>
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
                <div className="space-y-4">
                  {foundEvents.map(event => {
                    const handleDelete = () => {
                      const updated = foundEvents.filter(e => e.id !== event.id);
                      setFoundEvents(updated);
                      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
                    };
                    const handleEdit = () => {
                      navigate(`/events/scraper/${event.id}`, {
                        state: {
                          event,
                        },
                      });
                    };
                    return (
                      <ScraperEventCard
                        key={event.id}
                        event={event}
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
