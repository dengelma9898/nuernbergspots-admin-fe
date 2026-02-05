---
name: monthYear Event Feld
overview: "Hinzufügen des neuen monthYear Feldes (Format: mm.yyyy) für Events, um Events ohne genaue Datumsangabe zu ermöglichen. Priorität für Anzeige: dailyTimeSlots > monthYear > keine Zeiteinordnung. Events ohne Zeiteinordnung werden in separater Gruppe angezeigt."
todos:
  - id: "1"
    content: "Event Model erweitern: monthYear Feld hinzufügen"
    status: completed
  - id: "2"
    content: Format-Konvertierungsfunktionen erstellen (YYYY-MM ↔ mm.yyyy)
    status: completed
  - id: "3"
    content: Monat/Jahr Date-Picker Komponente erstellen oder bestehende erweitern
    status: completed
  - id: "4"
    content: "CreateEvent Formular: monthYear Feld hinzufügen und Logik anpassen"
    status: completed
  - id: "5"
    content: "EventTimeSlots Komponente: monthYear Anzeige und Bearbeitung hinzufügen"
    status: completed
  - id: "6"
    content: "EventList: Gruppierungslogik mit Priorität dailyTimeSlots > monthYear > keine Zeiteinordnung"
    status: completed
  - id: "7"
    content: "EventList: getEventDateTime und getEventStatus für monthYear anpassen"
    status: completed
  - id: "8"
    content: "CopyEvent: monthYear Unterstützung hinzufügen"
    status: completed
  - id: "9"
    content: "eventValidators: monthYear zum Vergleich hinzufügen"
    status: completed
  - id: "10"
    content: "EventList: Filter für Events ohne Zeiteinordnung hinzufügen (UI + Logik)"
    status: completed
  - id: "11"
    content: "EventList: Filterlogik anpassen - Events ohne Zeiteinordnung nicht mehr automatisch ausschließen"
    status: completed
  - id: "12"
    content: Tooltip-Komponente von shadcn/ui hinzufügen (falls nicht vorhanden)
    status: completed
  - id: "13"
    content: Info-Icons mit Tooltips zu CreateEvent, EventTimeSlots und CopyEvent hinzufügen
    status: completed
isProject: false
---

# Implementierung des monthYear Feldes für Events

## Übersicht

Das neue `monthYear` Feld ermöglicht es, Events mit nur Monat/Jahr-Angabe zu erstellen, ohne genaue dailyTimeSlots setzen zu müssen. Events können auch komplett ohne Zeiteinordnung erstellt werden.

**Wichtig:** Beide Felder (`dailyTimeSlots` und `monthYear`) können gleichzeitig existieren. Es gibt keine Validierung, die verhindert, dass beide gesetzt sind. Die Priorität ist immer: `dailyTimeSlots` > `monthYear`. Dies ermöglicht einen flexiblen Workflow: Zuerst kann `monthYear` gesetzt werden, und wenn später das genaue Datum bekannt ist, können `dailyTimeSlots` hinzugefügt werden, ohne `monthYear` löschen zu müssen.

## Änderungen

### 1. Model-Erweiterung (`src/models/events.ts`)

- `monthYear?: string` zum `Event` Interface hinzufügen
- Format: `mm.yyyy` (z.B. "02.2026")
- `dailyTimeSlots` bleibt bestehen, wird aber optional behandelt (leeres Array erlaubt)

```typescript
export interface Event {
  // ... bestehende Felder
  dailyTimeSlots: DailyTimeSlot[];
  monthYear?: string; // Format: mm.yyyy
  // ... restliche Felder
}
```

### 2. Event Erstellung (`src/pages/events/CreateEvent.tsx`)

- `monthYear` zum `NewEvent` Interface hinzufügen
- Monat/Jahr Date-Picker Komponente hinzufügen (neben startDate/endDate)
- Logik anpassen: `dailyTimeSlots` nur generieren, wenn `startDate` und `endDate` vorhanden sind
- `monthYear` Feld im Formular hinzufügen (kann parallel zu dailyTimeSlots existieren)
- **KEINE Validierung** - beide Felder können gleichzeitig gesetzt sein
- Transparente Anzeige: Zeige beide Felder an, wenn gesetzt
- Priorität für Anzeige: `dailyTimeSlots` hat Vorrang, aber `monthYear` wird auch angezeigt wenn vorhanden
- **Info-Icon mit Tooltip hinzufügen:**
  - Info-Icon (InfoIcon/HelpCircle von lucide-react) neben Label "Zeitfenster" und "Monat/Jahr"
  - Tooltip erklärt: "Beide Felder können gleichzeitig gesetzt sein. Priorität: Zeitfenster > Monat/Jahr"
  - Tooltip zeigt auch: "Du kannst zuerst Monat/Jahr setzen und später Zeitfenster hinzufügen, ohne Monat/Jahr löschen zu müssen"

### 3. Event Bearbeitung (`src/components/events/EventTimeSlots.tsx`)

- `monthYear` Feld zur Komponente hinzufügen
- **Transparente Anzeige:**
  - Wenn `dailyTimeSlots` vorhanden: Diese anzeigen (Priorität 1)
  - Wenn `monthYear` vorhanden: Auch anzeigen (als zusätzliche Info oder Fallback)
  - Wenn beide vorhanden: Beide anzeigen, aber `dailyTimeSlots` prominent
  - Wenn keines vorhanden: "Keine Zeiteinordnung" anzeigen
- Bearbeitung: Monat/Jahr Picker für `monthYear` hinzufügen
- Beide Felder können gleichzeitig bearbeitet werden
- Keine Validierung die verhindert, dass beide gesetzt sind
- **Info-Icon mit Tooltip hinzufügen:**
  - Info-Icon neben Label "Zeitfenster" und "Monat/Jahr"
  - Tooltip erklärt das Verhalten und die Priorität der Felder
  - Gleicher Tooltip-Text wie bei CreateEvent

### 4. Event Detail (`src/pages/events/EventDetail.tsx`)

- `monthYear` in der Anzeige berücksichtigen
- Bearbeitung über `EventTimeSlots` Komponente

### 5. Event Liste (`src/pages/events/EventList.tsx`)

**Filter erweitern:**

- Neuer Filter für Events ohne Zeiteinordnung hinzufügen
- Optionen: `'all'`, `'with-date'`, `'no-date'` (oder ähnlich)
- Filter-UI neben bestehenden Filtern (statusFilter, categoryFilter, timeFilter) platzieren
- Wenn Filter auf "no-date" gesetzt: Nur Events ohne `dailyTimeSlots` und ohne `monthYear` anzeigen
- Wenn Filter auf "with-date" gesetzt: Nur Events mit `dailyTimeSlots` oder `monthYear` anzeigen
- Wenn Filter auf "all" gesetzt: Alle Events anzeigen

**Filterlogik anpassen:**

- Aktuelle Zeile 143 entfernen: `if (!event.dailyTimeSlots?.length) return false;`
- Stattdessen: Filterlogik für Events ohne Zeiteinordnung hinzufügen
- Status-Filterung nur auf Events mit `dailyTimeSlots` anwenden (Events ohne Zeiteinordnung haben keinen Status)

**Gruppierungslogik anpassen:**

- Priorität für Gruppierung:
  1. `dailyTimeSlots[0].date` (falls vorhanden)
  2. `monthYear` (falls vorhanden, in Date umwandeln: 01.mm.yyyy)
  3. Separate Gruppe "Ohne Datum" am Ende

**Funktionen anpassen:**

- `groupedEventsByMonth`: Logik erweitern um `monthYear` Fallback
- `getEventDateTime`: Priorität `dailyTimeSlots` > `monthYear` > "Kein Datum"
- `getEventStatus`: Anpassen für Events ohne `dailyTimeSlots` aber mit `monthYear`

**Neue Gruppierung:**

```typescript
// Events mit dailyTimeSlots -> nach Monat gruppieren
// Events nur mit monthYear -> nach monthYear gruppieren  
// Events ohne Zeiteinordnung -> Gruppe "Ohne Datum" am Ende
```

**Filter-UI:**

- Select-Komponente für Datums-Filter hinzufügen
- Position: Neben bestehenden Filtern (statusFilter, categoryFilter, timeFilter)
- Optionen:
  - "Alle" (all)
  - "Mit Datum" (with-date) - nur Events mit dailyTimeSlots oder monthYear
  - "Ohne Datum" (no-date) - nur Events ohne Zeiteinordnung

### 6. Copy Event (`src/pages/events/CopyEvent.tsx`)

- `monthYear` zum `NewEvent` Interface hinzufügen
- `monthYear` beim Kopieren übernehmen
- Monat/Jahr Picker im Formular hinzufügen
- **Info-Icon mit Tooltip hinzufügen:** (wie bei CreateEvent)
  - Info-Icon neben Label "Zeitfenster" und "Monat/Jahr"
  - Gleicher Tooltip-Text wie bei CreateEvent

### 7. Event Scraper Detail (`src/pages/events/EventScraperDetail.tsx`)

- `monthYear` Feld hinzufügen falls Events hier bearbeitet werden

### 8. Validator (`src/utils/eventValidators.ts`)

- `monthYear` zum Vergleich hinzufügen (für `isEventChanged`)

### 9. Monat/Jahr Date-Picker Komponente

- Neue Komponente erstellen oder bestehende Date-Picker erweitern
- Format: mm.yyyy
- Validierung: Korrektes Format prüfen

### 10. Tooltip-Komponente (falls nicht vorhanden)

- Prüfen ob shadcn/ui Tooltip-Komponente vorhanden ist
- Falls nicht: Tooltip-Komponente von shadcn/ui hinzufügen (`npx shadcn@latest add tooltip`)
- Tooltip für Info-Icons verwenden

## Technische Details

### Date-Picker für Monat/Jahr

- Option 1: Native HTML5 `<input type="month">` verwenden (format: YYYY-MM)
- Option 2: Shadcn/ui Date-Picker erweitern mit Monat/Jahr Modus
- Konvertierung: `YYYY-MM` (HTML5) → `mm.yyyy` (Backend Format)

### Format-Konvertierung

- UI: `YYYY-MM` (z.B. "2026-02")
- Backend: `mm.yyyy` (z.B. "02.2026")
- Konvertierungsfunktionen in `src/utils/eventFormatters.ts` oder neue Datei

### Transparente Anzeige in UI

**CreateEvent / EventTimeSlots Komponente:**

- Beide Felder (`dailyTimeSlots` und `monthYear`) werden gleichzeitig angezeigt, wenn gesetzt
- Layout-Beispiel:
  ```
  Zeitfenster (dailyTimeSlots) [ℹ️]
  [Info-Icon mit Tooltip: "Beide Felder können gleichzeitig gesetzt sein. Priorität: Zeitfenster > Monat/Jahr"]
  [Liste der dailyTimeSlots wenn vorhanden]
  
  Monat/Jahr (monthYear) - Optional [ℹ️]
  [Info-Icon mit Tooltip: "Du kannst zuerst Monat/Jahr setzen und später Zeitfenster hinzufügen"]
  [Monat/Jahr Picker wenn vorhanden oder leer]
  ```
- Visuelle Hierarchie: `dailyTimeSlots` prominent, `monthYear` als sekundäre Info
- Beide Felder können unabhängig voneinander bearbeitet werden
- Keine Warnung oder Validierung wenn beide gesetzt sind

**Info-Icon mit Tooltip:**

- Icon: `InfoIcon` oder `HelpCircle` von `lucide-react`
- Position: Neben dem Label (z.B. `<Label>Zeitfenster <InfoIcon /></Label>`)
- Tooltip-Text für "Zeitfenster":
  - "Beide Felder können gleichzeitig gesetzt sein. Bei der Anzeige hat 'Zeitfenster' Priorität vor 'Monat/Jahr'."
- Tooltip-Text für "Monat/Jahr":
  - "Du kannst zuerst Monat/Jahr setzen und später Zeitfenster hinzufügen, ohne Monat/Jahr löschen zu müssen. Beide Felder können gleichzeitig existieren."

**Anzeige-Logik:**

```typescript
// In EventTimeSlots Komponente
const displayInfo = () => {
  const hasDailySlots = event.dailyTimeSlots?.length > 0;
  const hasMonthYear = !!event.monthYear;
  
  if (hasDailySlots) {
    // Zeige dailyTimeSlots prominent
    // Wenn auch monthYear vorhanden, zeige es als zusätzliche Info
  } else if (hasMonthYear) {
    // Zeige nur monthYear
  } else {
    // Zeige "Keine Zeiteinordnung"
  }
};
```

**Tooltip-Implementierung:**

```typescript
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <div className="flex items-center gap-2">
    <Label>Zeitfenster</Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p>Beide Felder können gleichzeitig gesetzt sein. Bei der Anzeige hat 'Zeitfenster' Priorität vor 'Monat/Jahr'.</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
```

### Gruppierung in EventList

```typescript
const getEventGroupKey = (event: Event): string => {
  // Priorität 1: dailyTimeSlots
  if (event.dailyTimeSlots?.length > 0) {
    const firstDate = new Date(event.dailyTimeSlots[0].date);
    return format(startOfMonth(firstDate), 'yyyy-MM');
  }
  
  // Priorität 2: monthYear
  if (event.monthYear) {
    const [month, year] = event.monthYear.split('.');
    return `${year}-${month.padStart(2, '0')}`;
  }
  
  // Priorität 3: Keine Zeiteinordnung
  return 'no-date';
};
```

### Filter-Logik in EventList

```typescript
// Neuer State
const [dateFilter, setDateFilter] = useState<string>('all'); // 'all' | 'with-date' | 'no-date'

// Helper-Funktion
const hasDateInfo = (event: Event): boolean => {
  return (event.dailyTimeSlots?.length > 0) || !!event.monthYear;
};

// Filterlogik in filteredEvents
const filteredEvents = events.filter(event => {
  const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Datums-Filter
  const hasDate = hasDateInfo(event);
  const matchesDateFilter =
    dateFilter === 'all' ||
    (dateFilter === 'with-date' && hasDate) ||
    (dateFilter === 'no-date' && !hasDate);
  
  if (!matchesDateFilter) return false;
  
  // Status-Filterung nur für Events mit dailyTimeSlots
  let matchesStatus = true;
  if (event.dailyTimeSlots?.length > 0) {
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    const firstDate = new Date(firstSlot.date);
    const lastDate = new Date(lastSlot.date);
    
    matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'past' && isPast(lastDate)) ||
      (statusFilter === 'running' &&
        isWithinInterval(new Date(), {
          start: firstDate,
          end: lastDate,
        })) ||
      (statusFilter === 'future' && isFuture(firstDate));
  } else if (statusFilter !== 'all') {
    // Events ohne dailyTimeSlots können keinen Status haben
    matchesStatus = false;
  }
  
  const matchesCategory = categoryFilter === 'all' || event.categoryId === categoryFilter;
  
  // Zeitfilter nur für Events mit dailyTimeSlots
  let matchesTime = true;
  if (event.dailyTimeSlots?.length > 0) {
    const firstDate = new Date(event.dailyTimeSlots[0].date);
    const eventWeek = format(firstDate, 'w', { locale: de });
    matchesTime = timeFilter === 'all' || (timeFilter === 'week' && selectedWeek === eventWeek);
  } else if (timeFilter !== 'all') {
    // Events ohne dailyTimeSlots können keinen Zeitfilter haben
    matchesTime = false;
  }
  
  return matchesSearch && matchesStatus && matchesCategory && matchesTime;
});
```

## Dateien die geändert werden müssen

1. `src/models/events.ts` - Interface erweitern
2. `src/pages/events/CreateEvent.tsx` - Formular erweitern + Info-Icons mit Tooltips
3. `src/components/events/EventTimeSlots.tsx` - monthYear hinzufügen + Info-Icons mit Tooltips
4. `src/pages/events/EventList.tsx` - Gruppierungslogik anpassen
5. `src/pages/events/CopyEvent.tsx` - monthYear unterstützen + Info-Icons mit Tooltips
6. `src/utils/eventValidators.ts` - monthYear zum Vergleich hinzufügen
7. `src/utils/eventFormatters.ts` (oder neue Datei) - Format-Konvertierung
8. Eventuell neue Komponente für Monat/Jahr Picker
9. `src/components/ui/tooltip.tsx` - Falls nicht vorhanden, von shadcn/ui hinzufügen

## Tests

- Event mit nur `monthYear` erstellen
- Event mit `dailyTimeSlots` und `monthYear` gleichzeitig erstellen (beide gesetzt)
- Event ohne Zeiteinordnung erstellen
- Workflow testen: Erst `monthYear` setzen, dann `dailyTimeSlots` hinzufügen (ohne `monthYear` löschen zu müssen)
- Gruppierung in Liste prüfen (Priorität: dailyTimeSlots > monthYear)
- Bearbeitung aller Varianten testen
- Transparente Anzeige prüfen: Beide Felder werden angezeigt wenn gesetzt
- Filter "Ohne Datum" testen - sollte nur Events ohne Zeiteinordnung zeigen
- Filter "Mit Datum" testen - sollte nur Events mit dailyTimeSlots oder monthYear zeigen
- Filter "Alle" testen - sollte alle Events zeigen

