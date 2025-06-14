# Nürnbergspots Admin Frontend

## Übersicht
Das Nürnbergspots Admin Frontend ist eine React-basierte Webanwendung zur Verwaltung der Nürnbergspots-Plattform. Die Anwendung ermöglicht es Administratoren, Geschäfte, Veranstaltungen, Benutzer und weitere Inhalte zu verwalten.

## Technologie-Stack
- **Frontend Framework**: React 18 mit TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS mit shadcn/ui Komponenten
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios über custom API layer
- **Testing**: Jest & React Testing Library
- **Authentication**: Firebase Auth
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Projektstruktur

### Core Directories

```
src/
├── components/          # Wiederverwendbare UI-Komponenten
│   ├── ui/             # shadcn/ui Basis-Komponenten
│   ├── events/         # Event-spezifische Komponenten
│   └── user/           # Benutzer-spezifische Komponenten
├── pages/              # Seiten-Komponenten (Routes)
├── services/           # API Service Layer
├── models/            # TypeScript Typen und Interfaces
├── contexts/          # React Context Provider
├── hooks/             # Custom React Hooks
├── lib/               # Utility Bibliotheken
└── utils/             # Helper Funktionen
```

## Hauptfunktionalitäten

### 1. Dashboard (`src/pages/Dashboard.tsx`)
- **Zweck**: Zentrale Übersichtsseite für Administratoren
- **Features**:
  - Schnelle Navigation zu allen Bereichen
  - Anzeige wichtiger Kennzahlen
  - Anzahl ausstehender Genehmigungen
  - Benutzer in Überprüfung
  - Offene Kontaktanfragen

### 2. Geschäftsverwaltung (`src/pages/businesses/`)
- **BusinessList.tsx**: Übersicht aller Geschäfte
- **CreateBusiness.tsx**: Neue Geschäfte erstellen
- **EditBusiness.tsx**: Bestehende Geschäfte bearbeiten
- **Features**:
  - CRUD-Operationen für Geschäfte
  - Kategorie-Zuordnung
  - Bildverwaltung
  - Öffnungszeiten-Management

### 3. Veranstaltungsverwaltung (`src/pages/events/`)
- **EventList.tsx**: Alle Veranstaltungen
- **CreateEvent.tsx**: Neue Veranstaltungen erstellen
- **EventDetail.tsx**: Detailansicht von Veranstaltungen
- **EventScraper.tsx**: Automatisiertes Event-Scraping
- **Features**:
  - Event-Lifecycle-Management
  - Kategorisierung
  - Bildbearbeitung
  - Scraper-Integration

### 4. Benutzerverwaltung (`src/pages/users/`)
- **BusinessUserList.tsx**: Übersicht aller Business-Benutzer
- **BusinessUserReview.tsx**: Benutzer-Überprüfung
- **EditBusinessUser.tsx**: Benutzer bearbeiten

### 5. Analytics (`src/pages/Analytics.tsx`)
- **Zweck**: Detaillierte Datenanalyse und Berichte
- **Features**:
  - Scan-Statistiken
  - Geschäfts-Performance
  - Benutzer-Engagement

## Services Layer

### Business Service (`src/services/businessService.ts`)
Hauptverantwortlich für alle geschäftsbezogenen API-Operationen:
- Geschäfte laden, erstellen, aktualisieren, löschen
- Kategorie-Management
- Bild- und Logo-Upload
- Genehmigungsprozesse

### User Service (`src/services/userService.ts`)
Benutzer-Management Operationen:
- Benutzer-CRUD
- Rollenverwaltung
- Überprüfungsprozesse

### Event Service (`src/services/eventService.ts`)
Veranstaltungs-Management:
- Event-CRUD
- Kategorie-Zuordnung
- Scraper-Integration

## Authentifizierung
- **Provider**: Firebase Authentication
- **Context**: `src/contexts/AuthContext.tsx`
- **Route Protection**: `src/components/PrivateRoute.tsx`

## UI/UX Konzept
- **Design System**: shadcn/ui mit Tailwind CSS
- **Responsive Design**: Mobile-first Ansatz
- **Accessibility**: WCAG 2.1 konform
- **Theme**: Konsistente Farb- und Typografie-Palette

## Entwicklungsrichtlinien

### Code Standards
- TypeScript strict mode
- ESLint Konfiguration
- Prettier Code Formatting
- Funktionale Komponenten mit Hooks

### Naming Conventions
- Komponenten: PascalCase
- Hooks: use + PascalCase
- Services: camelCase + Service suffix
- Dateien: kebab-case oder PascalCase für Komponenten

### Testing Strategy
- Unit Tests für Services
- Component Tests für UI-Komponenten
- Integration Tests für kritische User Flows
- Minimum 80% Code Coverage

## Deployment
- **Development**: Firebase Hosting (dev environment)
- **Production**: Firebase Hosting (prod environment)
- **CI/CD**: GitHub Actions

## API Integration
- **Base URL**: Konfigurierbar über Environment Variables
- **Authentication**: Token-basiert
- **Error Handling**: Zentrale Fehlerbehandlung
- **Response Wrapping**: Konsistente API Response Struktur

## Umgebungsvariablen
```
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

## Entwicklung starten

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Tests ausführen
npm run test

# Build für Produktion
npm run build
```

## Wichtige Packages
- `@tanstack/react-query`: Server State Management
- `react-hook-form`: Formular-Management
- `zod`: Schema Validation
- `sonner`: Toast Notifications
- `lucide-react`: Icon Library 