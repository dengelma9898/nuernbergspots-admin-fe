# Nürnbergspots Admin Frontend - Projekt-Übersicht

## 🎯 Projektbeschreibung

Das Nürnbergspots Admin Frontend ist eine moderne React-basierte Webanwendung zur Verwaltung der Nürnbergspots-Plattform. Es ermöglicht Administratoren, Geschäfte, Veranstaltungen, Benutzer und weitere Inhalte effizient zu verwalten.

## 📋 Hauptfunktionen

### 🏢 Geschäftsverwaltung

- **CRUD-Operationen** für Geschäfte und Partner
- **Genehmigungsprozess** für neue Geschäftsanmeldungen
- **Bildverwaltung** (Logo, Galerie-Bilder)
- **Öffnungszeiten-Management**
- **Kategorie-Zuordnung**
- **Nürnbergspots-Reviews** erstellen und bearbeiten

### 🎉 Veranstaltungsmanagement

- **Event-Lifecycle-Management** (Erstellen, Bearbeiten, Löschen)
- **Event-Kategorisierung**
- **Automatisiertes Event-Scraping**
- **Bildbearbeitung** für Veranstaltungen
- **Terminplanung** und -verwaltung

### 👥 Benutzerverwaltung

- **Business-User-Überprüfung** und Freischaltung
- **Rollenverwaltung** (Admin, Business Owner, User)
- **Benutzer-Status-Management**
- **Profilverwaltung**

### 📊 Analytics & Reporting

- **Scan-Statistiken** für Geschäftspartner
- **Performance-Analysen**
- **Detaillierte Berichte** mit Filtermöglichkeiten
- **Export-Funktionen**

### 💬 Kommunikation

- **Kontaktanfragen-Management**
- **Chatroom-Verwaltung**
- **News-Management**
- **Mittmach-Mittwoch** Sonderaktionen

## 🛠 Technologie-Stack

### Frontend

- **React 19** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** mit shadcn/ui Komponenten
- **React Router** für Navigation
- **React Context API** für Auth/State (AuthContext)

### Entwicklungstools

- **ESLint** für Code-Qualität
- **Prettier** für Code-Formatierung
- **Jest** & **React Testing Library** für Tests
- **TypeScript** für Type Safety

### Deployment

- **Firebase Hosting** für Staging und Production
- **GitHub Actions** für CI/CD
- **Environment-basierte Konfiguration**

## 📁 Projektstruktur

```
src/
├── components/           # Wiederverwendbare UI-Komponenten
│   ├── ui/              # shadcn/ui Basis-Komponenten
│   ├── events/          # Event-spezifische Komponenten
│   └── user/            # Benutzer-spezifische Komponenten
│
├── pages/               # Seiten-Komponenten (Routes)
│   ├── businesses/      # Geschäftsverwaltung
│   ├── events/          # Veranstaltungsmanagement
│   ├── users/           # Benutzerverwaltung
│   └── ...              # Weitere Bereiche
│
├── services/            # API Service Layer
│   ├── businessService.ts
│   ├── userService.ts
│   ├── eventService.ts
│   └── ...              # Weitere Services
│
├── models/              # TypeScript Typen und Interfaces
├── contexts/            # React Context Provider
├── hooks/               # Custom React Hooks
├── lib/                 # Utility Bibliotheken
├── utils/               # Helper Funktionen
└── shared/              # Geteilte Ressourcen
    └── __tests__/       # Test-Utilities
```

## 🧪 Test-Abdeckung

### Implementierte Tests

- ✅ **Login-Komponente** - Vollständige Abdeckung aller User Flows
- ✅ **Business Service** - API-Integration und Fehlerbehandlung
- ✅ **User Service** - CRUD-Operationen und Rollenverwaltung
- ✅ **CustomerScansAnalysis** - Datenanalyse und UI-Interaktionen

### Test-Kategorien

- **Unit Tests** (Services, Utils, Hooks) - Ziel: 90%+
- **Component Tests** (UI-Komponenten) - Ziel: 80%+
- **Integration Tests** (User Flows) - Ziel: 70%+

### Test-Tools

- **Jest** als Test-Runner
- **React Testing Library** für Component-Tests
- **@testing-library/user-event** für Benutzerinteraktionen
- **Custom Test-Utilities** für einheitliche Tests

## 📚 Dokumentation

### Verfügbare Dokumentationen

- **README.md** - Projekt-Überblick und Technologie-Stack
- **API.md** - Vollständige API-Dokumentation
- **TESTING.md** - Test-Strategie und -Richtlinien
- **OVERVIEW.md** - Diese Projekt-Übersicht

### Code-Dokumentation

- **JSDoc-Kommentare** für wichtige Funktionen
- **TypeScript-Interfaces** für Datenstrukturen
- **Inline-Kommentare** für komplexe Logik

## 🔧 Entwicklungs-Workflow

### Setup

```bash
npm install          # Dependencies installieren
npm run dev         # Development Server starten
npm test           # Tests ausführen
npm run build      # Production Build
```

### Code-Standards

- **TypeScript strict mode** aktiviert
- **ESLint-Konfiguration** durchgesetzt
- **Prettier** für einheitliche Formatierung
- **Funktionale Komponenten** mit Hooks bevorzugt

### Git-Workflow

- **Feature Branches** für neue Entwicklungen
- **Pull Request Reviews** vor Merge
- **Automatische Tests** bei jeder PR
- **Semantic Commit Messages**

## 🚀 Deployment

### Umgebungen

- **Development** - Lokale Entwicklung mit Hot Reload
- **Staging** - Firebase Hosting (dev environment)
- **Production** - Firebase Hosting (prod environment)

### CI/CD Pipeline

1. **Code Push** zu GitHub
2. **Automatische Tests** ausführen
3. **Build Process** bei erfolgreichen Tests
4. **Deployment** zu entsprechender Umgebung
5. **Smoke Tests** nach Deployment

## 📈 Monitoring & Wartung

### Performance

- **Bundle-Größe-Optimierung** durch Code-Splitting
- **Lazy Loading** für Routen
- **Memoization** für teure Berechnungen
- **Optimistic Updates** für bessere UX

### Fehlerbehandlung

- **Zentrale Error Boundaries**
- **Toast-Benachrichtigungen** für Benutzer-Feedback
- **Retry-Mechanismen** für API-Aufrufe
- **Fallback-UIs** bei Fehlern

### Wartung

- **Regelmäßige Dependency-Updates**
- **Security-Patches** zeitnah anwenden
- **Performance-Monitoring**
- **Test-Coverage** überwachen

## 🔐 Sicherheit

### Authentifizierung

- **Firebase Authentication** als Basis
- **Token-basierte API-Aufrufe**
- **Automatische Token-Erneuerung**
- **Route-Protection** für Admin-Bereiche

### Datenschutz

- **DSGVO-konforme** Datenverarbeitung
- **Minimale Datensammlung**
- **Sichere Datenübertragung** (HTTPS)
- **Lokale Datenspeicherung** minimiert

## 🤝 Beitrag & Entwicklung

### Für neue Entwickler

1. **Repository klonen** und Setup durchführen
2. **Dokumentation lesen** (besonders TESTING.md)
3. **Lokale Entwicklungsumgebung** einrichten
4. **Erste Tests ausführen** zur Verifikation
5. **Feature-Branch** für neue Entwicklungen erstellen

### Best Practices

- **Test-driven Development** für neue Features
- **Code Reviews** vor dem Merge
- **Dokumentation aktualisieren** bei Änderungen
- **Performance-Impact** bei neuen Features beachten

## 📞 Support & Kontakt

### Dokumentation

- Detaillierte Anleitungen in `/docs`
- Code-Kommentare für komplexe Bereiche
- Test-Beispiele als Referenz

### Entwicklung

- Issues für Bug-Reports und Feature-Requests
- Pull Requests für Code-Beiträge
- Diskussionen für architektonische Fragen

---

**Stand**: Feature-Branch `feature/documentation-and-tests`
**Letzte Aktualisierung**: Dezember 2024
**Version**: Admin Frontend v2.0
