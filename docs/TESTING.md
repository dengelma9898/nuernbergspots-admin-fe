# Test-Dokumentation

## Übersicht

Diese Dokumentation beschreibt die Test-Strategie, -Struktur und -Richtlinien für das Nürnbergspots Admin Frontend.

## Test-Architektur

### Test-Pyramide

Unser Test-Ansatz folgt der klassischen Test-Pyramide:

```
    /\
   /  \     E2E Tests (wenige, kritische User Flows)
  /____\
 /      \   Integration Tests (Component + Service)
/________\
          \  Unit Tests (Services, Utils, Hooks)
```

### Test-Kategorien

#### 1. Unit Tests

- **Zweck**: Testen einzelner Funktionen, Services und Hooks isoliert
- **Ort**: `src/**/__tests__/*.test.ts`
- **Tools**: Jest, @testing-library/react-hooks
- **Coverage-Ziel**: 90%+

**Beispiele:**

- Service-Methoden (API-Aufrufe, Datenverarbeitung)
- Utility-Funktionen
- Custom Hooks
- Business Logic

#### 2. Component Tests

- **Zweck**: Testen von React-Komponenten mit Benutzerinteraktionen
- **Ort**: `src/**/__tests__/*.test.tsx`
- **Tools**: Jest, @testing-library/react, @testing-library/user-event
- **Coverage-Ziel**: 80%+

**Beispiele:**

- Rendering-Verhalten
- Benutzerinteraktionen (Clicks, Form-Eingaben)
- State-Änderungen
- Conditional Rendering

#### 3. Integration Tests

- **Zweck**: Testen des Zusammenspiels zwischen Komponenten und Services
- **Ort**: `src/**/__tests__/*.integration.test.tsx`
- **Tools**: Jest, @testing-library/react, MSW (Mock Service Worker)
- **Coverage-Ziel**: 70%+

**Beispiele:**

- Komplette User Flows
- API-Integration
- Router-Navigation
- Context-Provider-Interaktionen

#### 4. E2E-Tests (Playwright)

- **Zweck**: Wenige Smoke-Flows im echten Browser (inkl. Firebase Auth gegen das Dev-Projekt).
- **Ort**: `e2e/*.spec.ts`, gemeinsame Hilfen unter `e2e/helpers/`
- **Beispiele:** Login-Smoke (`auth-login.spec.ts`), Partner-Liste (`partner-verwalten.spec.ts`), Logout (`auth-logout.spec.ts`)
- **Tools**: `@playwright/test`, Konfiguration [`playwright.config.ts`](../playwright.config.ts)
- **Hinweis**: E2E ergänzen Jest/jsdom-Tests (echter Browser, Firebase Auth gegen das Dev-Projekt); keine dedizierte BDD/Gherkin-Suite.

**Voraussetzungen**

- Wie für `npm run start:dev`: `VITE_FIREBASE_*`, `VITE_API_URL` etc. (z. B. über `.env` / `.env.dev` — `playwright.config` lädt Vite-`dev`-Env analog).
- Für den Login-Flow: `E2E_ADMIN_EMAIL` und `E2E_ADMIN_PASSWORD` (Firebase-Testuser im Dev-Projekt). Optional in `.env.e2e.local` (wird von der Playwright-Config eingelesen; nicht committen). Vorlage: [`.env.e2e.example`](../.env.e2e.example).

**Befehle**

```bash
npx playwright install chromium   # einmalig Browser-Binary
npm run test:e2e                  # Headless
npm run test:e2e:ui               # UI-Modus zum Debuggen
```

Ohne gesetzte E2E-Credentials wird der Login-Test **übersprungen** (`test.skip`), damit `npm run validate` ohne Secrets weiterlaufen kann.

**CI**

- E2E **nicht** in `npm run validate` (nur Jest/Lint/Types); eigener GitHub-Actions-Job **nur vor dem Dev-Deploy**, siehe [`.github/workflows/firebase-deploy-dev.yml`](../.github/workflows/firebase-deploy-dev.yml) (`e2e-dev`). Der **Production-Deploy-Job** startet kein Playwright.
- GitHub setzt in Actions automatisch `CI=true` — damit startet Playwright den Dev-Server frisch (`reuseExistingServer: false` in der Config).
- **Sinnvolle CI-Abdeckung:** Im Environment **dev** die Secrets `E2E_ADMIN_EMAIL` und `E2E_ADMIN_PASSWORD` setzen (Firebase-Testuser im Dev-Projekt). Ohne diese Variablen werden Login-abhängige Specs **übersprungen** (`test.skip`) — der Job bleibt grün, testet aber weniger.
- **Vite/Dev-URLs:** Wie beim Deploy dieselbe `.env`-Quelle — Secret **`ENV`** (kompletter Inhalt der Dev-`.env`, inkl. `VITE_*`), Schritt „Write .env file“ vor `npm run test:e2e`. Alternativ können fehlende Werte über zusätzliche Environment-Secrets ergänzt werden, sofern der Workflow sie exportiert.
- Vor dem Testlauf: `npx playwright install --with-deps chromium` (im Workflow), damit Browser und System-Abhängigkeiten auf `ubuntu-latest` vorhanden sind.

## Test-Setup

### Konfiguration

- **Jest Config**: `jest.config.js`
- **Playwright Config**: `playwright.config.ts` (E2E, siehe Abschnitt „E2E-Tests (Playwright)“)
- **Setup File**: `src/setupTests.ts` (ehemals in der Doku: `src/shared/__tests__/jest.setup.ts` — bitte `jest.config.js` `setupFilesAfterEnv` als Quelle nutzen)
- **Test Utils**: `src/shared/__tests__/test-utils.tsx`

**jsdom / Radix:** In `src/setupTests.ts` ist `Element.prototype.scrollIntoView` als No-Op gemockt, damit Komponenten mit Radix Select (u. a.) nicht mit `scrollIntoView is not a function` abbrechen.

**UI-Module teilweise mocken:** Wird `@/components/ui/button` nur mit einem eigenen `Button`-Mock überschrieben, fehlt oft `buttonVariants` — echte `AlertDialogAction`/`AlertDialogCancel` importieren das weiterhin und werfen dann `buttonVariants is not a function`. Entweder `buttonVariants` im gleichen Mock exportieren (wie in `src/components/ui/__tests__/alert-dialog.test.tsx`) oder den echten Button per `jest.requireActual` erweitern.

**Doppelte Texte:** Rendert eine Seite dieselbe Meldung an mehreren Stellen (z. B. zwei `Alert`-Blöcke mit derselben `validationErrors`-Liste), schlägt `getByText`/`findByText` mit „Found multiple elements“ fehl — dann `getAllByText`/`findAllByText` oder gezielt `within(...)` nutzen.

**Temporär ausgeschlossene Suites:** In `jest.config.js` ist `src/pages/businesses/__tests__/CreateBusiness.test.tsx` über `testPathIgnorePatterns` vom Standard-`npm test` ausgenommen, bis die Suite repariert ist (siehe Kommentar in der Jest-Konfiguration).

### Zeitlimits (max. 10 Sekunden)

- **Jest:** `testTimeout: 10000` in `jest.config.js`; die npm-Skripte `test`, `test:watch` und `test:coverage` setzen zusätzlich `--testTimeout=10000`.
- **Testing Library:** In `src/setupTests.ts` ist `configure({ asyncUtilTimeout: 10000 })` gesetzt, damit `waitFor` und asynchrone Queries nicht länger als 10 Sekunden pollen.

### Globale Mocks

Automatisch verfügbare Mocks für alle Tests:

```typescript
// Browser APIs
- IntersectionObserver
- ResizeObserver
- matchMedia
- localStorage/sessionStorage
- File API
- URL.createObjectURL

// React Router
- useNavigate
- useLocation

// Firebase Auth
- AuthContext
```

### Test Utilities

Zentrale Test-Hilfsfunktionen in `test-utils.tsx`:

```typescript
// Custom render mit Providern
render(component, { authContext, routerEntries });

// Mock-Daten
mockBusinessData;
mockUserData;
mockEventData;

// Service Mocks
createMockApiService<T>(methods);

// Loading-Helpers
waitForLoadingToFinish();
```

## Test-Richtlinien

### Naming Conventions

```typescript
// Test-Datei-Namen
ComponentName.test.tsx;
serviceName.test.ts;
hookName.test.ts;

// Test-Beschreibungen
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('sollte alle erforderlichen Elemente rendern', () => {});
  });

  describe('User Interactions', () => {
    it('sollte Form-Submit korrekt verarbeiten', () => {});
  });

  describe('Error Handling', () => {
    it('sollte Fehler-Toast bei API-Fehler anzeigen', () => {});
  });
});
```

### Test-Struktur

Jeder Test sollte folgende Struktur haben:

```typescript
it('sollte erwartetes Verhalten zeigen', async () => {
  // Arrange - Test-Setup
  const mockData = { ... };
  const mockFn = jest.fn().mockResolvedValue(mockData);

  // Act - Aktion ausführen
  render(<Component />);
  await userEvent.click(screen.getByRole('button'));

  // Assert - Ergebnis prüfen
  expect(mockFn).toHaveBeenCalledWith(expectedArgs);
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Best Practices

#### 1. Realistische Tests

```typescript
// ✅ Gut: Testet wie Benutzer interagieren
await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
await userEvent.click(screen.getByRole('button', { name: /submit/i }));

// ❌ Schlecht: Testet Implementierungsdetails
fireEvent.change(getByTestId('email-input'), { target: { value: 'user@example.com' } });
```

#### 2. Accessibility-First

```typescript
// ✅ Gut: Nutzt semantische Selektoren
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email address/i);

// ❌ Schlecht: Nutzt Implementierungsdetails
screen.getByTestId('submit-btn');
screen.getByClassName('email-input');
```

#### 3. Async Testing

```typescript
// ✅ Gut: Wartet auf asynchrone Änderungen
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// ❌ Schlecht: Synchrone Assertions für async Operationen
expect(screen.getByText('Success')).toBeInTheDocument();
```

#### 4. Error Boundaries

```typescript
// ✅ Gut: Testet Error-Handling
it('sollte Fehler korrekt behandeln', async () => {
  mockApi.post.mockRejectedValue(new Error('Network error'));

  // ... render component, trigger action

  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
  });
});
```

## Spezifische Test-Patterns

### 1. Service Tests

```typescript
describe('useBusinessService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sollte Geschäfte abrufen', async () => {
    const mockBusinesses = [mockBusinessData];
    mockApi.get.mockResolvedValue({ data: mockBusinesses });

    const { result } = renderHook(() => useBusinessService());
    const businesses = await result.current.getBusinesses();

    expect(mockApi.get).toHaveBeenCalledWith('/businesses');
    expect(businesses).toEqual(mockBusinesses);
  });
});
```

### 2. Component Tests mit Context

```typescript
const renderWithAuth = (authProps = {}) => {
  return render(<Login />, {
    authContext: {
      login: jest.fn(),
      user: null,
      ...authProps
    }
  });
};

it('sollte erfolgreich einloggen', async () => {
  const mockLogin = jest.fn().mockResolvedValue(undefined);
  renderWithAuth({ login: mockLogin });

  // ... test implementation
});
```

### 3. Form Tests

```typescript
it('sollte Formular-Validierung zeigen', async () => {
  const user = userEvent.setup();
  render(<CreateBusinessForm />);

  // Submit ohne Daten
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Validierungsfehler prüfen
  expect(screen.getByText(/name ist erforderlich/i)).toBeInTheDocument();
});
```

### 4. Router Tests

```typescript
it('sollte zur Dashboard-Seite navigieren', async () => {
  const mockNavigate = jest.fn();
  jest.mocked(useNavigate).mockReturnValue(mockNavigate);

  // ... test implementation

  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
```

## Coverage-Richtlinien

### Minimum Requirements

- **Services**: 90% Coverage (kritisch für Business Logic)
- **Components**: 80% Coverage (wichtig für UI)
- **Pages**: 70% Coverage (Integration wichtiger als Details)
- **Utils**: 95% Coverage (reine Funktionen, einfach zu testen)

### Jest Baseline (enforced)

Jest enforced aktuell einen **globalen Coverage-Floor** in `jest.config.js`
(~54 % Lines / ~53 % Statements). Das schützt vor Regressionen, ohne den
Build sofort zu blockieren. Das Ziel laut `.cursorrules` und dieser Doku bleibt
**80–90 %** — die Erhöhung erfolgt schrittweise.

### Ausschlüsse

Folgende Dateien/Patterns sind von Coverage ausgeschlossen:

- `*.d.ts` - Type Definitions
- `main.tsx` - App Entry Point
- `index.ts` - Re-exports
- Test-Dateien selbst

## Debugging Tests

### Häufige Probleme

#### 1. Async/Await Issues

```typescript
// Problem: Test endet bevor async Operation abgeschlossen
// Lösung: Warten auf DOM-Änderungen
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

#### 2. Missing Mocks

```typescript
// Problem: "ReferenceError: fetch is not defined"
// Lösung: Mock in jest.setup.ts oder Test-Datei
global.fetch = jest.fn();
```

#### 3. Timer Issues

```typescript
// Problem: setTimeout/setInterval in Components
// Lösung: Jest Fake Timers
jest.useFakeTimers();
act(() => {
  jest.advanceTimersByTime(1000);
});
jest.useRealTimers();
```

### Debug Commands

```bash
# Einzelnen Test ausführen
npm test -- --testNamePattern="sollte erfolgreich einloggen"

# Test mit Debug-Output
npm test -- --verbose --no-coverage

# Test-Coverage für spezifische Datei
npm test -- --collectCoverageFrom="src/services/businessService.ts"

# Watch-Mode für Development
npm test -- --watch
```

## Test-Maintenance

### Regelmäßige Aufgaben

1. **Coverage Reports überprüfen** - Wöchentlich
2. **Veraltete Tests aktualisieren** - Bei Feature-Änderungen
3. **Mock-Aktualisierungen** - Bei API-Änderungen
4. **Performance-Tests** - Monatlich

### CI/CD Integration

Tests werden automatisch ausgeführt:

- **Pre-commit**: Linting und Type-Checking
- **Pull Request**: Vollständige Test-Suite + Coverage
- **Main Branch**: Deployment-Tests + E2E Tests

## Beispiel-Test-Suite

Siehe vollständige Beispiele in:

- `src/pages/__tests__/Login.test.tsx`
- `src/services/__tests__/businessService.test.ts`
- `src/components/__tests__/CustomerScansAnalysis.test.tsx`

## Ressourcen

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
