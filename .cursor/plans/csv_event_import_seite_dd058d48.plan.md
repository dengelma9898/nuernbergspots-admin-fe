---
name: CSV Event Import Seite
overview: Erstelle eine neue Seite für den CSV-Upload von Events unter `/events/import/csv` mit Upload-Funktionalität, Ergebnisanzeige und Fehlerbehandlung gemäß dem Backend Integration Guide.
todos:
  - id: "1"
    content: TypeScript-Interfaces für CSV-Import-Response in eventService.ts definieren
    status: completed
  - id: "2"
    content: importEventsFromCsv Methode in eventService.ts implementieren
    status: completed
  - id: "3"
    content: CsvEventImport.tsx Seite erstellen mit Upload-Funktionalität
    status: completed
  - id: "4"
    content: Ergebnisanzeige mit Zusammenfassung und detaillierter Liste implementieren
    status: completed
  - id: "5"
    content: Fehlerbehandlung für HTTP 400 und Validierungsfehler hinzufügen
    status: completed
  - id: "6"
    content: Route /events/import/csv in routes.tsx hinzufügen
    status: completed
  - id: "7"
    content: "Optional: Link zur CSV-Import-Seite in EventList.tsx hinzufügen"
    status: completed
isProject: false
---

# CSV Event Import Seite

## Übersicht

Implementierung einer neuen Seite für den CSV-Upload von Events. Die Seite ermöglicht es Benutzern, CSV-Dateien hochzuladen, zeigt detaillierte Import-Ergebnisse an und behandelt Fehler entsprechend der Backend-API-Spezifikation.

## Backend API Spezifikation

- **Endpunkt**: `POST /events/import/csv`
- **Request**: `multipart/form-data` mit `file` Parameter (CSV, max. 5 MB)
- **Response**: HTTP 200 mit `{ totalRows, successful, failed, skipped, results[] }`
- **Fehler**: HTTP 400 bei ungültigem Dateiformat

## Implementierung

### 1. Service-Methode hinzufügen

**Datei**: `src/services/eventService.ts`

Neue Methode `importEventsFromCsv` hinzufügen:

- Erstellt FormData mit CSV-Datei
- Ruft `POST /events/import/csv` auf mit `{ isFormData: true }`
- Gibt Response mit Import-Ergebnissen zurück

**TypeScript-Interfaces** für Response-Struktur:

```typescript
interface CsvImportResult {
  totalRows: number;
  successful: number;
  failed: number;
  skipped: number;
  results: CsvImportRowResult[];
}

interface CsvImportRowResult {
  rowIndex: number;
  success: boolean;
  eventId?: string;
  skipped?: boolean;
  duplicateEventId?: string;
  errors: CsvImportError[];
}

interface CsvImportError {
  rowIndex: number;
  field?: string;
  message: string;
  value?: any;
}
```

### 2. Neue Seite erstellen

**Datei**: `src/pages/events/CsvEventImport.tsx`

**Funktionalität**:

- File-Input für CSV-Dateien (.csv, max. 5 MB)
- Upload-Button mit Loading-State
- Validierung: Dateityp (.csv), Dateigröße (max. 5 MB)
- Ergebnisanzeige nach Upload:
  - Zusammenfassung (successful/totalRows, failed, skipped)
  - Detaillierte Liste der Ergebnisse pro Zeile
  - Fehleranzeige für fehlgeschlagene Zeilen
  - Duplikat-Hinweise für übersprungene Zeilen
- Fehlerbehandlung für HTTP 400 (Datei-Validierung)
- Glassmorphism-Design mit Background-Komponente
- Mobile-first responsive Layout
- Skeleton Loading während Upload

**UI-Komponenten**:

- File-Input mit Drag & Drop (optional)
- Upload-Button mit Loading-State
- Ergebnis-Karten für Zusammenfassung
- Ergebnistabelle/Liste für detaillierte Zeilen-Ergebnisse
- Fehler-Alerts für Validierungsfehler
- Success/Error/Info Badges für verschiedene Ergebnis-Typen

### 3. Route hinzufügen

**Datei**: `src/routes.tsx`

- Import der neuen Komponente `CsvEventImport`
- Route hinzufügen: `/events/import/csv` → `<CsvEventImport />`

### 4. Navigation-Link (optional)

**Option A**: Link in EventList-Seite

- Button/Link in der EventList-Seite hinzufügen, der zur CSV-Import-Seite navigiert

**Option B**: Link im Dashboard

- NavigationCard im Events-Bereich des Dashboards hinzufügen

## Design-Anforderungen

- Glassmorphism-Design mit rainbow background (gemäß .cursorrules)
- Skeleton Loading statt Spinner
- Mobile-first responsive Design
- White text mit verschiedenen Opacities
- Verwendung von shadcn/ui Komponenten
- Loading Guards zur Vermeidung von Duplicate Requests

## Fehlerbehandlung

- HTTP 400: Datei-Validierungsfehler (falscher Typ, zu groß, keine Datei)
- Netzwerkfehler: Retry-Mechanismus mit showUserFriendlyError
- Upload während laufendem Upload verhindern (Loading Guard)
- Fehlerdetails pro Zeile anzeigen

## CSV-Format Hinweise

Die Seite sollte dem Benutzer das erwartete CSV-Format anzeigen:

- Header-Zeile mit Spaltennamen
- Format-Hinweise für Datum (YYYY-MM-DD), Zeit (HH:mm)
- Beispiel-CSV oder Link zur Dokumentation

## Dateien

- `src/services/eventService.ts` - Service-Methode hinzufügen
- `src/pages/events/CsvEventImport.tsx` - Neue Seite (neu)
- `src/routes.tsx` - Route hinzufügen
- `src/pages/events/EventList.tsx` - Optional: Link hinzufügen
- `src/pages/Dashboard.tsx` - Optional: NavigationCard hinzufügen

