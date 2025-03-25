# NürnbergSpots Admin Frontend

Das Admin-Dashboard für NürnbergSpots, entwickelt mit React, Vite und TypeScript.

## 🚀 Features

- 🔐 Firebase Authentication
- 🎨 Chakra UI für moderne und responsive Designs
- 📱 Mobile-First Ansatz
- 🔄 TypeScript für typsichere Entwicklung
- 🧪 Jest und React Testing Library für Tests
- 📦 Vite für schnelle Entwicklung und Builds

## 🛠️ Technologie-Stack

- React 18
- Vite 5
- TypeScript 5
- Chakra UI 3
- Firebase 10
- React Router 6
- Jest & React Testing Library

## 📋 Voraussetzungen

- Node.js >= 18
- npm >= 9

## 🚀 Installation

1. Repository klonen:
```bash
git clone https://github.com/yourusername/nuernbergspots-admin-fe.git
cd nuernbergspots-admin-fe
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm run dev
```

4. Produktions-Build erstellen:
```bash
npm run build
```

## 📁 Projektstruktur

```
src/
├── assets/          # Statische Assets (Bilder, Fonts, etc.)
├── components/      # Wiederverwendbare UI-Komponenten
├── hooks/          # Custom React Hooks
├── lib/            # Hilfsfunktionen und Konfigurationen
├── models/         # TypeScript Interfaces und Types
├── pages/          # Seiten-Komponenten
├── services/       # API-Services
└── utils/          # Utility-Funktionen
```

## 🧪 Tests

Tests ausführen:
```bash
npm test
```

Coverage-Report generieren:
```bash
npm run test:coverage
```

## 📝 Entwicklungsrichtlinien

### Code-Style

- Verwende TypeScript für alle neuen Dateien
- Nutze Funktionskomponenten mit Hooks
- Folge den ESLint- und Prettier-Regeln
- Schreibe aussagekräftige Commit-Nachrichten

### Komponenten

- Eine Komponente pro Datei
- Verwende TypeScript Interfaces für Props
- Dokumentiere Komponenten mit JSDoc
- Teste Komponenten mit React Testing Library

### State Management

- Nutze React Context für globalen State
- Verwende lokalen State mit useState
- Komplexe State-Logik in Custom Hooks auslagern

### API-Integration

- Nutze die Service-Layer für API-Aufrufe
- Implementiere Error Handling
- Verwende TypeScript für API-Response-Typen

### Performance

- Lazy Loading für Routen
- Memoization wo sinnvoll
- Optimierte Bilder und Assets
- Code-Splitting

## 🔒 Umgebungsvariablen

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.
