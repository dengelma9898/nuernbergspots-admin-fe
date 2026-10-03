import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { EventListEmptyState } from '@/components/events/EventListEmptyState';
import { EventListEmptyStateData } from '@/utils/eventListUtils';

describe('EventListEmptyState Component', () => {
  it('rendert den Empty-State für Auswahlmodus und ruft onExitSelectionMode auf', () => {
    const onExitSelectionMode = vi.fn();
    const state: EventListEmptyStateData = {
      variant: 'selection-no-selectable',
      title: 'Keine auswählbaren Events',
      description: 'Im Auswahlmodus werden vergangene Events automatisch ausgeblendet.',
      actions: ['exit-selection-mode'],
    };

    render(<EventListEmptyState emptyState={state} onExitSelectionMode={onExitSelectionMode} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Keine auswählbaren Events')).toBeInTheDocument();
    expect(
      screen.getByText('Im Auswahlmodus werden vergangene Events automatisch ausgeblendet.')
    ).toBeInTheDocument();

    const exitBtn = screen.getByRole('button', { name: /Auswahlmodus beenden/i });
    fireEvent.click(exitBtn);
    expect(onExitSelectionMode).toHaveBeenCalledTimes(1);
  });

  it('rendert den Empty-State für Seite außerhalb des Bereichs und ruft onGoToFirstPage auf', () => {
    const onGoToFirstPage = vi.fn();
    const state: EventListEmptyStateData = {
      variant: 'page-out-of-range',
      title: 'Seite nicht gefunden',
      description: 'Die Seite 5 existiert nicht.',
      actions: ['go-to-first-page'],
    };

    render(<EventListEmptyState emptyState={state} onGoToFirstPage={onGoToFirstPage} />);

    expect(screen.getByText('Seite nicht gefunden')).toBeInTheDocument();
    const pageBtn = screen.getByRole('button', { name: /Zu Seite 1/i });
    fireEvent.click(pageBtn);
    expect(onGoToFirstPage).toHaveBeenCalledTimes(1);
  });

  it('rendert den Empty-State für Moderation und ruft onShowAllEvents auf', () => {
    const onShowAllEvents = vi.fn();
    const state: EventListEmptyStateData = {
      variant: 'pending-clear',
      title: 'Keine ausstehenden Events',
      description: 'Alles moderiert!',
      actions: ['show-all-events'],
    };

    render(<EventListEmptyState emptyState={state} onShowAllEvents={onShowAllEvents} />);

    expect(screen.getByText('Keine ausstehenden Events')).toBeInTheDocument();
    const allBtn = screen.getByRole('button', { name: /Alle Events anzeigen/i });
    fireEvent.click(allBtn);
    expect(onShowAllEvents).toHaveBeenCalledTimes(1);
  });

  it('rendert den Empty-State für Zeitraum und ruft onClearTimeFilter und onCreateEvent auf', () => {
    const onClearTimeFilter = vi.fn();
    const onCreateEvent = vi.fn();
    const state: EventListEmptyStateData = {
      variant: 'period',
      title: 'Keine Events in KW 46',
      description: 'Für diesen Zeitraum wurden bisher keine Events eingetragen.',
      actions: ['clear-time-filter', 'create-event'],
    };

    render(
      <EventListEmptyState
        emptyState={state}
        onClearTimeFilter={onClearTimeFilter}
        onCreateEvent={onCreateEvent}
      />
    );

    expect(screen.getByText('Keine Events in KW 46')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Anderen Zeitraum wählen/i }));
    expect(onClearTimeFilter).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Event hinzufügen/i }));
    expect(onCreateEvent).toHaveBeenCalledTimes(1);
  });

  it('rendert leere Events-Liste mit CSV-Import-Aktion', () => {
    const onImportCsv = vi.fn();
    const state: EventListEmptyStateData = {
      variant: 'empty',
      title: 'Keine Events vorhanden.',
      actions: ['create-event', 'import-csv'],
    };

    render(<EventListEmptyState emptyState={state} onImportCsv={onImportCsv} />);

    fireEvent.click(screen.getByRole('button', { name: /CSV Import/i }));
    expect(onImportCsv).toHaveBeenCalledTimes(1);
  });
});
