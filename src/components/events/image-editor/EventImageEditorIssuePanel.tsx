import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CalendarDays, ListFilter } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  EventImageEditorSkippedEvent,
  getEventImageSkipReasonLabel,
} from '@/utils/eventImageEditorUtils';
import { buttonPreset, cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventImageEditorIssuePanelProps {
  variant: 'no_events' | 'no_usable_events';
  skippedEvents?: EventImageEditorSkippedEvent[];
}

export const EventImageEditorIssuePanel: React.FC<EventImageEditorIssuePanelProps> = ({
  variant,
  skippedEvents = [],
}) => {
  const navigate = useNavigate();

  const title =
    variant === 'no_events'
      ? 'Keine Events für die Bildgenerierung'
      : 'Events können nicht als Bild dargestellt werden';

  const description =
    variant === 'no_events'
      ? 'Es wurden keine Events an den Editor übergeben. Wähle in der Event-Liste Events aus oder öffne den Editor über ein einzelnes Event.'
      : 'Für Social-Media-Bilder braucht jedes Event mindestens ein gültiges Tagesdatum (dailyTimeSlots mit Datum). Events nur mit Monat/Jahr oder ohne Datum können hier nicht gruppiert werden.';

  return (
    <div
      className={cn(cardPreset, 'p-6 sm:p-8 max-w-3xl mx-auto')}
      data-testid="event-image-editor-issue"
    >
      <Alert variant="destructive" className="border-secondary bg-card">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-foreground">{title}</AlertTitle>
        <AlertDescription className="text-muted-foreground">{description}</AlertDescription>
      </Alert>

      {skippedEvents.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Betroffene Events ({skippedEvents.length})
          </h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {skippedEvents.map(({ event, reason }) => (
              <li
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 rounded-lg border border-secondary bg-muted/30"
              >
                <span className="font-medium text-foreground truncate">{event.title}</span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {getEventImageSkipReasonLabel(reason)}
                  {event.monthYear ? ` · Monat/Jahr: ${event.monthYear}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Was du tun kannst</h2>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>
            In der Event-Liste nur Events mit konkretem Tagesdatum auswählen (Mehrfachauswahl oder
            Filter „Mit Datum“).
          </li>
          <li>
            Betroffene Events bearbeiten und unter Zeitslots mindestens ein Datum mit Uhrzeit
            ergänzen.
          </li>
          <li>Events nur mit Monat/Jahr sind für diesen Generator nicht geeignet.</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <LoadingButton
          onClick={() => navigate('/events')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Event-Liste
        </LoadingButton>
        <LoadingButton
          variant="outline"
          onClick={() => navigate('/events')}
          className={cn(buttonPreset, 'gap-2')}
        >
          <ListFilter className="h-4 w-4" />
          Events filtern und neu auswählen
        </LoadingButton>
      </div>
    </div>
  );
};

interface EventImageEditorSkippedBannerProps {
  skippedEvents: EventImageEditorSkippedEvent[];
  usableCount: number;
}

export const EventImageEditorSkippedBanner: React.FC<EventImageEditorSkippedBannerProps> = ({
  skippedEvents,
  usableCount,
}) => {
  return (
    <Alert
      className="mb-6 border-amber-400/60 bg-amber-500/10"
      data-testid="event-image-editor-skipped-banner"
    >
      <CalendarDays className="h-5 w-5" />
      <AlertTitle className="text-foreground">
        {skippedEvents.length} Event{skippedEvents.length === 1 ? '' : 's'} übersprungen
      </AlertTitle>
      <AlertDescription className="text-muted-foreground space-y-2">
        <p>
          {usableCount} Event{usableCount === 1 ? '' : 's'} mit gültigem Tagesdatum werden im Bild
          angezeigt. Folgende Events fehlen, weil kein gültiges Tagesdatum vorhanden ist:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          {skippedEvents.slice(0, 5).map(({ event, reason }) => (
            <li key={event.id}>
              <span className="text-foreground">{event.title}</span>
              {' — '}
              {getEventImageSkipReasonLabel(reason)}
            </li>
          ))}
          {skippedEvents.length > 5 ? <li>… und {skippedEvents.length - 5} weitere</li> : null}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
