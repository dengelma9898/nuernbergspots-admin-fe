---
name: Business Events Feature Flag
overview: Implementierung eines Feature Flags für Business Partner Events im Dashboard. Das Feature Flag zeigt an, ob Business Partner Events für ihre Unternehmen erstellen können, und ermöglicht Super Admins die Verwaltung dieser Einstellung.
todos:
  - id: create-model
    content: Model für BusinessEventsSettings erstellen (src/models/business-events-settings.ts)
    status: completed
  - id: create-service
    content: Service für Business Events Settings erstellen (src/services/businessEventsSettingsService.ts) mit getBusinessEventsSettings() und updateBusinessEventsSettings()
    status: completed
  - id: add-endpoint
    content: API Endpoint zu src/lib/api.ts hinzufügen
    status: completed
  - id: add-dashboard-card
    content: Neue Kachel im Dashboard unter Partner-Sektion hinzufügen mit Status-Anzeige und Toggle
    status: completed
  - id: implement-toggle
    content: Toggle-Funktionalität mit Rollenprüfung (nur Super Admin) implementieren
    status: completed
  - id: add-loading-states
    content: Loading States und Error Handling hinzufügen
    status: completed
---

# Business Events Feature Flag Implementierung

## Übersicht

Implementierung eines Feature Flags, das steuert, ob Business Partner Events für ihre Unternehmen erstellen können. Das Feature Flag wird als Kachel im Dashboard unter dem Abschnitt "Partner" angezeigt und kann nur von Super Admins verwaltet werden.

## Backend-Endpunkte

- `GET /businesses/events/settings` - Lädt die aktuellen Einstellungen
- `PATCH /businesses/events/settings` - Aktualisiert die Einstellungen (nur Super Admin)

Response-Struktur:

```typescript
{
  id: string;
  isEnabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}
```

## Implementierungsschritte

### 1. Model erstellen

**Datei:** `src/models/business-events-settings.ts`

- Interface `BusinessEventsSettings` mit den Feldern: `id`, `isEnabled`, `updatedAt`, `updatedBy?`
- Export des Interfaces

### 2. Service erstellen

**Datei:** `src/services/businessEventsSettingsService.ts`

- Hook `useBusinessEventsSettingsService()` erstellen
- Methode `getBusinessEventsSettings()`: GET Request zu `/businesses/events/settings`
- Methode `updateBusinessEventsSettings(isEnabled: boolean)`: PATCH Request zu `/businesses/events/settings` mit `{ isEnabled }`
- Verwendung von `useApi()` und `unwrapData()` wie in anderen Services
- Behandlung von `null` Response (initial = false)

### 3. API Endpoint hinzufügen

**Datei:** `src/lib/api.ts`

- Endpoint `businessEventsSettings: '/businesses/events/settings'` zum `endpoints` Objekt hinzufügen

### 4. Dashboard-Kachel erstellen

**Datei:** `src/pages/Dashboard.tsx`

- Neue Kachel in der Partner-Sektion (nach Zeile 588) hinzufügen
- Verwendung von `AnimatedCard` Komponente (wie andere Kacheln)
- Icon: `Calendar` von lucide-react
- Anzeige des aktuellen Status:
  - Wenn `isEnabled === true`: "Aktiviert ✅" mit grünem Badge
  - Wenn `isEnabled === false` oder `null`: "Deaktiviert ❌" mit rotem Badge
- Toggle Switch für Super Admins (nur für Super Admin bearbeitbar)
- Loading State mit Skeleton während des Ladens
- Fehlerbehandlung mit `showUserFriendlyError`
- Success-Message nach erfolgreichem Update

### 5. State Management im Dashboard

- State für `businessEventsEnabled` (boolean | null)
- State für `isLoadingBusinessEventsSettings` (boolean)
- State für `isUpdatingBusinessEventsSettings` (boolean)
- State für `userRole` (UserType | null) zur Rollenprüfung
- `useEffect` zum Laden der Einstellungen beim Mount
- `useEffect` zum Laden der User-Rolle (über `userService.getUserProfile()`)

### 6. Toggle-Funktionalität

- Handler `handleBusinessEventsToggle(newValue: boolean)`:
  - Prüfung ob User Super Admin ist
  - Setzen des `isUpdatingBusinessEventsSettings` States
  - API-Call über Service
  - Update des lokalen States
  - Success-Message anzeigen
  - Fehlerbehandlung

### 7. UI-Komponenten

- Switch-Komponente von `@/components/ui/switch` verwenden
- Badge-Komponente für Status-Anzeige (aktiviert/deaktiviert)
- Glassmorphism-Styling konsistent mit anderen Kacheln
- Mobile-first responsive Design
- Skeleton Loading während des Ladens

## Technische Details

### Null-Handling

- Wenn die API `null` zurückgibt, wird `isEnabled` als `false` behandelt
- Initial State: `null` (wird als `false` angezeigt)

### Rollenprüfung

- Nur Super Admins können den Toggle ändern
- Andere Rollen sehen nur den Status (read-only)
- Rollenprüfung über `userService.getUserProfile()` und Vergleich mit `UserType.SUPER_ADMIN`

### Error Handling

- Verwendung von `showUserFriendlyError` für Fehlerbehandlung
- Retry-Funktionalität bei Fehlern
- Loading Guards zur Vermeidung von Duplicate Requests

### API-Integration

- Verwendung von `useApi()` Hook
- Verwendung von `unwrapData()` für Response-Parsing
- PATCH Request mit `{ isEnabled: boolean }` Body

## Dateien die geändert/erstellt werden

1. **Neu:** `src/models/business-events-settings.ts`
2. **Neu:** `src/services/businessEventsSettingsService.ts`
3. **Geändert:** `src/lib/api.ts` - Endpoint hinzufügen
4. **Geändert:** `src/pages/Dashboard.tsx` - Neue Kachel hinzufügen

## Design-Überlegungen

- Kachel folgt dem Design-Pattern der anderen Dashboard-Kacheln
- Konsistente Verwendung von Glassmorphism-Styling
- Mobile-first responsive Layout
- Klare visuelle Unterscheidung zwischen aktiviert/deaktiviert
- Intuitive Toggle-Funktionalität für Super Admins