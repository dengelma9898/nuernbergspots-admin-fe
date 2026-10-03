import {
  buildActiveFilterChips,
  getBadgeColorStyle,
  getContrastTextColor,
  getEventListEmptyState,
  groupEventsFlat,
  sortMonthKeys,
  type EventMonthGroup,
} from '@/utils/eventListUtils';
import type { Event } from '@/models/events';

describe('getContrastTextColor', () => {
  it('returns dunkle Schrift auf hellen Hintergründen', () => {
    expect(getContrastTextColor('#ffffff')).toBe('#1f2937');
    expect(getContrastTextColor('#fef08a')).toBe('#1f2937');
    expect(getContrastTextColor('#fff7ed')).toBe('#1f2937');
    expect(getContrastTextColor('#e7e5e4')).toBe('#1f2937');
  });

  it('returns helle Schrift auf dunklen Hintergründen', () => {
    expect(getContrastTextColor('#000000')).toBe('#fff');
    expect(getContrastTextColor('#1f2937')).toBe('#fff');
    expect(getContrastTextColor('#0f172a')).toBe('#fff');
    expect(getContrastTextColor('#7f1d1d')).toBe('#fff');
  });

  it('toleriert hex ohne führendes #', () => {
    expect(getContrastTextColor('ffffff')).toBe('#1f2937');
    expect(getContrastTextColor('000000')).toBe('#fff');
  });

  it('fällt auf helle Schrift bei ungültigen Werten zurück', () => {
    expect(getContrastTextColor('#zzzzzz')).toBe('#fff');
    expect(getContrastTextColor('nope')).toBe('#fff');
  });
});

describe('getBadgeColorStyle', () => {
  it('verwendet Outline-Fallback mit Farbpunkten bei Mid-Tone-Farben (z. B. #3B82F6, #ef4444) für WCAG AA', () => {
    const blueStyle = getBadgeColorStyle('#3B82F6');
    expect(blueStyle.isFilled).toBe(false);
    expect(blueStyle.style.borderColor).toBe('#3B82F6');
    expect(blueStyle.dotColor).toBe('#3B82F6');

    const redStyle = getBadgeColorStyle('#ef4444');
    expect(redStyle.isFilled).toBe(false);
    expect(redStyle.style.borderColor).toBe('#ef4444');
    expect(redStyle.dotColor).toBe('#ef4444');
  });

  it('verwendet Vollfläche mit weißem Text bei sehr dunklen Farben', () => {
    const blackStyle = getBadgeColorStyle('#000000');
    expect(blackStyle.isFilled).toBe(true);
    expect(blackStyle.style.backgroundColor).toBe('#000000');
    expect(blackStyle.style.color).toBe('#fff');
    expect(blackStyle.dotColor).toBeUndefined();

    const darkBlueStyle = getBadgeColorStyle('#1e1b4b');
    expect(darkBlueStyle.isFilled).toBe(true);
    expect(darkBlueStyle.style.color).toBe('#fff');
  });

  it('verwendet Vollfläche mit dunklem Text bei sehr hellen Farben', () => {
    const whiteStyle = getBadgeColorStyle('#ffffff');
    expect(whiteStyle.isFilled).toBe(true);
    expect(whiteStyle.style.backgroundColor).toBe('#ffffff');
    expect(whiteStyle.style.color).toBe('#1f2937');
    expect(whiteStyle.dotColor).toBeUndefined();

    const lightGreenStyle = getBadgeColorStyle('#dcfce7');
    expect(lightGreenStyle.isFilled).toBe(true);
    expect(lightGreenStyle.style.color).toBe('#1f2937');
  });

  it('toleriert 0x-Präfixe und ungültige Farben sicher', () => {
    const ffStyle = getBadgeColorStyle('0xff3B82F6');
    expect(ffStyle.isFilled).toBe(false);
    expect(ffStyle.dotColor).toBe('#3B82F6');

    const invalidStyle = getBadgeColorStyle('#invalid');
    expect(invalidStyle.isFilled).toBe(false);
    expect(invalidStyle.dotColor).toBeUndefined();

    const emptyStyle = getBadgeColorStyle(undefined);
    expect(emptyStyle.isFilled).toBe(false);
  });
});

describe('buildActiveFilterChips', () => {
  it('erzeugt keine Chips bei Standard-Filterwerten', () => {
    const chips = buildActiveFilterChips({
      searchQuery: '',
      statusFilter: 'all',
      approvalFilter: 'all',
      categoryFilter: 'all',
      timeFilter: 'all',
      dateFilter: 'all',
    });
    expect(chips).toEqual([]);
  });

  it('erzeugt lesbare Chips für Suche, Status, Moderation, Datum', () => {
    const chips = buildActiveFilterChips({
      searchQuery: 'Park',
      statusFilter: 'future',
      approvalFilter: 'pending',
      dateFilter: 'with-date',
    });

    expect(chips).toEqual([
      { id: 'search', label: 'Suche: „Park“' },
      { id: 'status', label: 'Status: Kommend' },
      { id: 'approval', label: 'Moderation: Ausstehend' },
      { id: 'date', label: 'Datum: Mit Datum' },
    ]);
  });

  it('erzeugt Kategorie-Chips mit Aufloesung des Kategorienamens', () => {
    const categoryById = new Map([['cat-1', { name: 'Kultur' }]]);
    const chips = buildActiveFilterChips({
      categoryFilter: 'cat-1',
      categoryById,
    });
    expect(chips).toEqual([{ id: 'category', label: 'Kategorie: Kultur' }]);

    const noCategoryChips = buildActiveFilterChips({
      categoryFilter: 'no-category',
      categoryById,
    });
    expect(noCategoryChips).toEqual([{ id: 'category', label: 'Kategorie: Ohne Kategorie' }]);
  });

  it('erzeugt Zeitraum-Chips fuer Kalenderwoche und Monat', () => {
    const weekChips = buildActiveFilterChips({
      timeFilter: 'week',
      selectedWeek: '42',
    });
    expect(weekChips).toEqual([{ id: 'time', label: 'Zeitraum: KW 42' }]);

    const monthChips = buildActiveFilterChips({
      timeFilter: 'month',
      selectedMonth: '2024-06',
      monthOptions: [{ key: '2024-06', label: 'Juni 2024' }],
    });
    expect(monthChips).toEqual([{ id: 'time', label: 'Zeitraum: Juni 2024' }]);
  });
});

describe('getEventListEmptyState', () => {
  it('erkennt Auswahlmodus ohne auswählbare Events (nur vergangene)', () => {
    const res = getEventListEmptyState({
      totalCount: 5,
      displayCount: 0,
      isSelectionMode: true,
      hasActiveFilters: false,
    });
    expect(res.variant).toBe('selection-no-selectable');
    expect(res.title).toBe('Keine auswählbaren Events');
    expect(res.actions).toEqual(['exit-selection-mode']);
  });

  it('erkennt ungültige Seitennummer (page > totalPages)', () => {
    const res = getEventListEmptyState({
      totalCount: 20,
      displayCount: 0,
      page: 5,
      totalPages: 2,
      hasActiveFilters: false,
    });
    expect(res.variant).toBe('page-out-of-range');
    expect(res.title).toBe('Seite nicht gefunden');
    expect(res.description).toContain('5');
    expect(res.actions).toEqual(['go-to-first-page']);
  });

  it('erkennt leeren Moderations-Filter (alles moderiert)', () => {
    const res = getEventListEmptyState({
      totalCount: 0,
      displayCount: 0,
      approvalFilter: 'pending',
      hasActiveFilters: true,
    });
    expect(res.variant).toBe('pending-clear');
    expect(res.title).toBe('Keine ausstehenden Events');
    expect(res.actions).toEqual(['show-all-events']);
  });

  it('erkennt reinen Zeitraum-Filter nach Kalenderwoche', () => {
    const res = getEventListEmptyState({
      totalCount: 0,
      displayCount: 0,
      timeFilter: 'week',
      selectedWeek: '46',
      hasActiveFilters: true,
    });
    expect(res.variant).toBe('period');
    expect(res.title).toBe('Keine Events in KW 46');
    expect(res.actions).toContain('clear-time-filter');
    expect(res.actions).toContain('create-event');
  });

  it('erkennt reinen Zeitraum-Filter nach Monat', () => {
    const res = getEventListEmptyState({
      totalCount: 0,
      displayCount: 0,
      timeFilter: 'month',
      selectedMonth: '2026-11',
      monthOptions: [{ key: '2026-11', label: 'November 2026' }],
      hasActiveFilters: true,
    });
    expect(res.variant).toBe('period');
    expect(res.title).toBe('Keine Events im November 2026');
    expect(res.actions).toContain('clear-time-filter');
    expect(res.actions).toContain('create-event');
  });

  it('erkennt aktive Filterung mit Suche und Filtern', () => {
    const res = getEventListEmptyState({
      totalCount: 0,
      displayCount: 0,
      searchQuery: 'Jazz',
      statusFilter: 'future',
      hasActiveFilters: true,
    });
    expect(res.variant).toBe('filtered');
    expect(res.title).toBe('Keine Events für die aktuelle Suche und Filter.');
    expect(res.description).toContain('Suche: „Jazz“');
    expect(res.description).toContain('Status: Kommend');
    expect(res.actions).toContain('reset-all-filters');
    expect(res.actions).toContain('clear-search');
  });

  it('erkennt komplett leere Event-Liste ohne Filter', () => {
    const res = getEventListEmptyState({
      totalCount: 0,
      displayCount: 0,
      hasActiveFilters: false,
    });
    expect(res.variant).toBe('empty');
    expect(res.title).toBe('Keine Events vorhanden.');
    expect(res.actions).toEqual(['create-event', 'import-csv']);
  });
});

describe('sortMonthKeys & groupEventsFlat', () => {
  const groups: Record<string, EventMonthGroup> = {
    '2026-01': { label: 'Januar 2026', date: new Date(2026, 0, 1), events: [] },
    '2026-03': { label: 'März 2026', date: new Date(2026, 2, 1), events: [] },
    'no-date': { label: 'Ohne Datum', date: new Date(0), events: [] },
    '2026-02': { label: 'Februar 2026', date: new Date(2026, 1, 1), events: [] },
  };

  it('sortiert Monate absteigend (Standard) mit "Ohne Datum" am Ende', () => {
    expect(sortMonthKeys(groups)).toEqual(['2026-03', '2026-02', '2026-01', 'no-date']);
  });

  it('sortiert Monate aufsteigend mit "Ohne Datum" am Ende', () => {
    expect(sortMonthKeys(groups, 'asc')).toEqual(['2026-01', '2026-02', '2026-03', 'no-date']);
  });

  it('erzeugt eine einzelne flache Gruppe bzw. leeres Objekt', () => {
    const events = [{ id: 'a' }, { id: 'b' }] as Event[];
    const flat = groupEventsFlat(events);
    expect(Object.keys(flat)).toHaveLength(1);
    expect(Object.values(flat)[0].label).toBe('Zuletzt geändert');
    expect(Object.values(flat)[0].events).toEqual(events);
    expect(groupEventsFlat([])).toEqual({});
  });
});
