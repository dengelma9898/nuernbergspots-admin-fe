---
name: Changelog Verwaltung App-Versionen
overview: Erweitert die App-Version-Verwaltungsseite um eine Changelog-Verwaltung mit Markdown-Editor. Benutzer können für jede Version (X.Y.Z Format) Changelogs erstellen, bearbeiten, löschen und zwischen allen Versionen wechseln.
todos:
  - id: "1"
    content: "Modelle erweitern: Changelog Interface und DTOs in src/models/app-version.ts hinzufügen"
    status: completed
  - id: "2"
    content: "Service erweitern: Alle Changelog-Methoden (getAll, getByVersion, create, update, delete) in src/services/appVersionService.ts implementieren"
    status: completed
  - id: "3"
    content: "UI-State hinzufügen: State-Variablen für Changelogs, selectedVersion, loading/saving states in AppVersionManagement.tsx"
    status: completed
  - id: "4"
    content: "Changelog-Verwaltungs-Card erstellen: Neue Card mit Select-Dropdown für Version-Auswahl und MarkdownEditor"
    status: completed
  - id: "5"
    content: "CRUD-Funktionen implementieren: loadAllChangelogs, handleVersionSelect, handleChangelogSave, handleChangelogDelete"
    status: completed
  - id: "6"
    content: "Delete-Dialog hinzufügen: AlertDialog für Lösch-Bestätigung mit Loading-State"
    status: completed
  - id: "7"
    content: "Version-Sortierung implementieren: Semantic versioning Sortierung für Select-Dropdown"
    status: completed
  - id: "8"
    content: "Skeleton-Loading erweitern: Loading-States für Changelog-Bereich hinzufügen"
    status: completed
isProject: false
---

# Changelog-Verwaltung für App-Versionen

## Übersicht

Die App-Version-Verwaltungsseite wird um eine Changelog-Verwaltung erweitert. Benutzer können für jede Version (X.Y.Z Format) Changelogs im Markdown-Format erstellen, bearbeiten, löschen und zwischen allen Versionen wechseln.

## Implementierungsschritte

### 1. Modelle erweitern (`src/models/app-version.ts`)

- `Changelog` Interface hinzufügen:
  - `version: string` (Format: X.Y.Z)
  - `content: string` (Markdown)
  - `createdAt: string` (ISO 8601)
  - `updatedAt: string` (ISO 8601)
- DTOs hinzufügen:
  - `CreateChangelogDto`: `{ version: string, content: string }`
  - `UpdateChangelogDto`: `{ content: string }`

### 2. Service erweitern (`src/services/appVersionService.ts`)

Neue Methoden im `useAppVersionService` Hook:

- `getAllChangelogs()`: `GET /app-versions/admin/changelogs`
  - Gibt alle Changelogs sortiert nach Version zurück
- `getChangelogByVersion(version: string)`: `GET /app-versions/admin/changelogs/:version`
  - Gibt Changelog für eine spezifische Version zurück
- `createChangelog(dto: CreateChangelogDto)`: `POST /app-versions/admin/changelogs`
  - Erstellt einen neuen Changelog
- `updateChangelog(version: string, dto: UpdateChangelogDto)`: `PUT /app-versions/admin/changelogs/:version`
  - Aktualisiert einen bestehenden Changelog
- `deleteChangelog(version: string)`: `DELETE /app-versions/admin/changelogs/:version`
  - Löscht einen Changelog

### 3. UI-Komponente erweitern (`src/pages/AppVersionManagement.tsx`)

Neue State-Variablen:

- `changelogs: Changelog[]` - Liste aller Changelogs
- `selectedVersion: string | null` - Aktuell ausgewählte Version für Changelog
- `changelogContent: string` - Inhalt des aktuellen Changelogs
- `isLoadingChangelogs: boolean` - Loading-State für Changelogs
- `isSavingChangelog: boolean` - Loading-State beim Speichern
- `isDeletingChangelog: boolean` - Loading-State beim Löschen
- `deleteDialogOpen: boolean` - Dialog-State für Lösch-Bestätigung

Neue Funktionen:

- `loadAllChangelogs()`: Lädt alle Changelogs beim Mount
- `handleVersionSelect(version: string)`: Lädt Changelog für ausgewählte Version
- `handleChangelogSave()`: Speichert/erstellt Changelog
- `handleChangelogDelete()`: Löscht Changelog mit Bestätigung
- `handleCreateNewChangelog()`: Erstellt neuen Changelog für eine Version

UI-Struktur:

- Neue Card "Changelog-Verwaltung" nach der "Version setzen" Card
- Select-Dropdown zur Auswahl der Version (ähnlich wie in LegalDocumentEdit)
- MarkdownEditor-Komponente für Changelog-Inhalt
- Buttons: "Speichern", "Löschen" (nur wenn Changelog existiert), "Neuer Changelog"
- AlertDialog für Lösch-Bestätigung
- Skeleton-Loading für Changelog-Bereich

### 4. Version-Sortierung

- Changelogs nach Version sortieren (semantic versioning)
- Select-Dropdown zeigt Versionen absteigend (neueste zuerst)
- Option "Neue Version eingeben" für neue Changelogs

### 5. Validierung

- Version-Format-Validierung (X.Y.Z) beim Erstellen
- Changelog-Content darf nicht leer sein beim Speichern
- Loading-Guards gemäß .cursorrules (keine Duplikate)

### 6. Error Handling

- Fehlerbehandlung mit `showUserFriendlyError`
- Success-Messages mit `showSuccessMessage`
- Retry-Funktionalität bei Fehlern

### 7. Mobile-First Design

- Responsive Layout gemäß .cursorrules
- Glassmorphism-Design konsistent mit bestehender Seite
- Touch-freundliche Buttons (min. 44px)

## Technische Details

### Verwendete Komponenten

- `MarkdownEditor` aus `@/components/ui/markdown-editor` für Changelog-Editierung
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` aus `@/components/ui/select` für Version-Auswahl
- `AlertDialog` aus `@/components/ui/alert-dialog` für Lösch-Bestätigung
- `LoadingButton` für async Actions
- `AnimatedButton` für Navigation

### API-Endpunkte

- `GET /app-versions/admin/changelogs` - Alle Changelogs
- `GET /app-versions/admin/changelogs/:version` - Spezifischer Changelog
- `POST /app-versions/admin/changelogs` - Changelog erstellen
- `PUT /app-versions/admin/changelogs/:version` - Changelog aktualisieren
- `DELETE /app-versions/admin/changelogs/:version` - Changelog löschen

### State Management

- Lokaler State mit `useState`
- Loading-States für alle async Operations
- Optimistic Updates wo möglich

## Dateien die geändert werden

1. `src/models/app-version.ts` - Modelle erweitern
2. `src/services/appVersionService.ts` - Service-Methoden hinzufügen
3. `src/pages/AppVersionManagement.tsx` - UI erweitern
4. `src/lib/api.ts` - Optional: Endpoints-Konstanten erweitern

## Testing

- Unit-Tests für Service-Methoden
- Component-Tests für UI-Interaktionen
- Integration-Tests für CRUD-Operations

