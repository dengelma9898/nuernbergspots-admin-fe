# CONSTITUTION — Nürnbergspots Admin Frontend

Kanonische Regeln und Architektur für dieses Repository. Für Review, Roadmap und Checklisten siehe [`docs/app_review.html`](docs/app_review.html).

**Stand:** August 2026 · **Stack:** React 19, TypeScript, Vite, Tailwind, shadcn/ui, Firebase Auth

---

## 1. Kanonische Dokumentation

| Dokument                          | Inhalt                                                     |
| --------------------------------- | ---------------------------------------------------------- |
| **CONSTITUTION.md** (dieses File) | Regeln, Architektur, Design, Tests, API-Muster             |
| **docs/app_review.html**          | App-Review, Metriken, Roadmap, Prioritäten, Checklisten    |
| **.cursorrules**                  | Maschinenlesbare Spiegelung zentraler Regeln für Cursor/CI |

Fachliche API-Details für Backend-Features liegen im Backend-Repo (`backend/docs/`). Endpunkt-Implementierung im Frontend: `src/services/*` und `src/models/*`.

---

## 2. Projekt & Architektur

### 2.1 Beschreibung

React-Admin-Dashboard zur Verwaltung der Nürnbergspots-Plattform: Geschäfte, Events, Benutzer, Analytics, Kontaktanfragen, Jobs, News u. a. Nur Administratoren — höhere Informationsdichte und Power-User-Features sind erwünscht.

### 2.2 Technologie-Stack

- **Frontend:** React 19, TypeScript (strict), Vite
- **UI:** Tailwind CSS, shadcn/ui, Lucide + MaterialIcon (Google Font, snake_case)
- **Routing:** React Router
- **State:** React Context (AuthContext)
- **HTTP:** Axios über `ApiClient` mit Token-Caching
- **Auth:** Firebase Authentication
- **Tests:** Vitest + React Testing Library; E2E mit Playwright
- **Deploy:** Firebase Hosting, GitHub Actions

### 2.3 Projektstruktur

```
src/
├── components/       # UI-Komponenten (ui/ = shadcn)
├── pages/            # Route-Seiten (Orchestrierung, dünn)
├── services/         # Hook-basierte API-Schicht
├── models/           # TypeScript-Typen
├── contexts/         # React Context Provider
├── hooks/            # Custom Hooks (Page-Logik)
├── lib/              # Utilities, designTokens, ApiClient
├── utils/            # Helper (errorUtils, csvExport)
├── test-utils/       # Test-Hilfen, Mocks
└── assets/
```

### 2.4 Schichten

1. **Pages** — dünn: Hooks + domain components, Ziel &lt; ~50 LOC Orchestrierung
2. **Hooks** — Daten laden, Form-State, Bulk-Selection
3. **Services** — `useXService()` mit `getData`/`postData`/`patchData`/`deleteData`
4. **ApiClient** — Auth-Token (50 min Cache, dedupliziert), unwrap `{ data }`
5. **AdminLayout** — Sidebar, Breadcrumbs, Command Palette, ThemeToggle für geschützte Routen

### 2.5 Umgebungsvariablen

```env
VITE_API_BASE_URL=          # bzw. VITE_API_URL in manchen Env-Dateien
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

E2E optional: `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` (`.env.e2e.local`, Vorlage `.env.e2e.example`).

### 2.6 NPM-Skripte

```bash
npm run dev              # vite (default)
npm run start:dev        # vite --mode dev
npm run build            # tsc && vite build
npm run test             # vitest run (testTimeout=10000 in vitest.config)
npm run test:coverage    # vitest run --coverage
npm run test:e2e         # playwright (nicht in validate)
npm run validate         # type-check + lint + format:check + test
```

---

## 3. Code-Standards

### 3.1 TypeScript

- `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
- `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `forceConsistentCasingInFileNames`

### 3.2 React

- Funktionskomponenten mit Hooks
- Keine PropTypes
- JSX: doppelte Anführungszeichen

### 3.3 Import-Reihenfolge

1. `react`
2. `@/components/ui/*`
3. `@/lib/*`
4. `@/services/*`
5. `@/models/*`
6. `@/components/*`
7. `@/pages/*`
8. relative Imports

Leerzeile zwischen Gruppen.

### 3.4 Naming

| Art         | Pattern             | Beispiel           |
| ----------- | ------------------- | ------------------ |
| Komponenten | PascalCase          | `EventList`        |
| Hooks       | use + PascalCase    | `useEventListData` |
| Services    | camelCase + Service | `businessService`  |
| Types       | PascalCase          | `Business`         |
| Interfaces  | I + PascalCase      | `IBusiness`        |

### 3.5 Git

- Commits: `^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+$`
- Branches: `^(feature|bugfix|hotfix|release)/.+$`

---

## 4. Design System

**Philosophie:** Minimalismus — klare Borders, keine Schatten, kein Glassmorphism, kein `backdrop-blur`.

### 4.1 Farben

| Mode  | Primary                   | Secondary         | Tertiary  |
| ----- | ------------------------- | ----------------- | --------- |
| Light | Weiß (Hintergrund)        | Schwarz (Borders) | `red-500` |
| Dark  | Vertauscht für Lesbarkeit | —                 | `red-500` |

### 4.2 Typografie

JetBrains Mono (`font-mono`), responsive: `text-sm sm:text-base md:text-lg`.

### 4.3 Design-Tokens (`src/lib/designTokens.ts`)

| Export              | Verwendung                        |
| ------------------- | --------------------------------- |
| `cardPreset`        | Cards, Container                  |
| `cardPresetHover`   | Klickbare Cards                   |
| `inputPreset`       | Inputs, SelectTrigger             |
| `buttonPreset`      | Outline-Buttons                   |
| `badgePreset`       | Labels, Icon-Badges               |
| `listSectionPreset` | Listen-Header/Filter (`p-4 mb-6`) |

```tsx
import { cardPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

<Card className={cn(cardPreset, 'p-4')}>…</Card>
<div className={listSectionPreset}>…</div>
```

### 4.4 Komponenten & Layout

- Basis: shadcn/ui (`Card`, `Button`, `Input`, `Badge`, `Dialog`, `Select`, `Skeleton`, `Table`)
- Cards: `bg-card border border-secondary rounded-lg` — keine Shadow
- `Background`: Theme-Gradient + dekorativer Blur-Kreis (`blur-3xl`, kein `backdrop-blur`)
- `AdminLayout` für alle geschützten Routen
- Listen: `listSectionPreset`, Grids `gap-4`, Tabellen Defaults aus `table.tsx`
- Touch-Targets: mindestens 44px

### 4.5 Animation

CSS `@keyframes` + `motion`-Shim (`src/components/motion.tsx`):

- `.animate-fade-in-up` — Page-Transitions (0.2s)
- `.motion-stagger-item` — Listen-Stagger (0.2s)
- `prefers-reduced-motion` deaktiviert Animationen in `index.css`

### 4.6 Loading States

**Skeleton statt Spinner** (`@/components/ui/skeleton`):

- Klassen: `bg-muted rounded animate-pulse`
- 3–5 Skeleton-Items bei Listen, Struktur an echten Content anpassen
- Action-Feedback (Refresh-Button) darf Spinner nutzen

### 4.7 DO / DON'T

**DO:** Presets, `AdminLayout`, `LoadingButton`, Skeleton, Empty/Error States  
**DON'T:** Glassmorphism, `shadow-*` auf Custom-UI, hardcodierte Farben, lange Animation-Delays

---

## 5. UX-Regeln

### 5.1 Mobile-First

Breakpoints: base (320px+), `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px.

Typografie: `text-sm sm:text-base md:text-lg lg:text-xl`  
Spacing: `p-4 md:p-6 lg:p-8`  
Layout: `flex-col sm:flex-row`  
Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### 5.2 Page-Fallbacks (Pflicht)

Jede Page muss explizit rendern für:

| Zustand         | Verhalten                                        |
| --------------- | ------------------------------------------------ |
| Laden           | Skeleton passend zum Layout                      |
| Leer            | Empty-State mit Erklärung + CTA                  |
| Fehler          | Alert/Issue-Panel mit Handlungsempfehlung        |
| Ungültige Daten | Teilnutzung + Hinweis auf übersprungene Einträge |
| Async-Init      | `isInitialized` → Skeleton bis bereit            |

**Verboten:** leere `div`, `null` ohne Erklärung, unbehandelte Exceptions die Route weiß/schwarz lassen.

### 5.3 Power-User

- Command Palette: Cmd/Ctrl+K
- Shortcuts: `g+e` Events, `g+b` Partner, `g+u` Users, `g+d` Dashboard
- Skip-Link, Landmarks (`nav`/`banner`/`main`)

### 5.4 KI-Verifikation geänderter UI (Pflicht)

Nach jeder Änderung an UI-Komponenten (Copy, Labels, Klassen, A11y-Attribute, Empty-/Error-States, neue/entfernte Controls) muss eine **KI die Änderung selbst verifizieren** — beschränkt auf die **tatsächlich geänderten Stellen**:

1. **Nur das Geänderte prüfen** — kein Voll-App-Audit bei einer kleinen Änderung. Umfang = die diff-eigenen Komponenten/Surfaces.
2. **DOM-Ebene nachweisen** — die neue Erwartung asserten (Text, `aria-label`, Klassen wie `size-11`/`h-11`, Empty-State, ausgeführter Back-Arrow entfernt) über Vitest + React Testing Library.
3. **Gegenprobe bei a11y-Attributen** — Icon-only-Buttons ohne sichtbaren Text benötigen `aria-label`/`sr-only`.
4. **Kontrast-/Farbänderungen** sichtbar (nicht nur via Unit-Test) plausibilisieren; Farbto­ken statt Hardcode.
5. **Playwright-Pflege** — bei geänderten UI-Flows E2E-Spec (**Playwright**) anpassen: neue/interaktive Elemente abdecken, überholte Assertions entfernen. Ziel: gute E2E-Abdeckung der Kern-Flows, keine veralteten Specs.
6. `npm run validate` green — danach Ergebnis berichten (welche Tests für die Änderung geschrieben/geändert wurden).

---

## 6. API-Integration

### 6.1 Request-Handling

- Loading-Guards: `if (loading) return;` vor API-Calls
- Buttons/Inputs während Requests deaktivieren
- `useEffect` für einmaliges Laden: leere Dependency-Array `[]`
- **Nie** Service-Objekte in `useEffect`-Dependencies (neue Instanz pro Render)
- Pro User-Aktion nur **ein** Request
- Token-Requests deduplizieren

### 6.2 Token-Management

- `getIdToken()` **ohne** `forceRefresh` (Firebase cached)
- `getIdToken(true)` nur bei explizitem Token-Refresh
- ApiClient: Token-Cache 50 min, shared Promise für parallele Requests

### 6.3 Response-Layer

```typescript
// ApiClient unwrapt automatisch
getData<T>(url); // → T aus { data: T }
postData<T>(url, body);
patchData<T>(url, body);
putData<T>(url, body);
deleteData(url);
```

### 6.4 Error-Handling

- Kein automatisches Retry in `useEffect` ohne User-Interaktion
- Retry nur in Error-Handlers (`showUserFriendlyError`)
- `errorUtils.ts`: `getUserFriendlyError`, HTTP-Status-Hilfsfunktionen

### 6.5 API-Basis

- Base URL: `VITE_API_BASE_URL` / `VITE_API_URL`
- Auth: `Authorization: Bearer <firebase-token>`
- Content-Type: `application/json` (Uploads: `multipart/form-data`)
- Response-Wrapper: `{ data, success, message?, error? }`

Domänen-Endpunkte (Auszug — vollständig in Services):

| Bereich    | Beispiel-Pfade                                                                               |
| ---------- | -------------------------------------------------------------------------------------------- |
| Businesses | `GET/POST/PATCH/DELETE /businesses`, `/businesses/pending-approvals/count`, Bild/Logo-Upload |
| Users      | `GET /users/business-users`, `PATCH /users/:id`                                              |
| Events     | `GET/POST/PATCH/DELETE /events`, `/events/categories`, Bild-Upload                           |
| Analytics  | `/analytics/business-performance`, `/analytics/scan-statistics`                              |
| Contacts   | `/contacts/requests`, `/contacts/requests/open/count`                                        |
| Jobs       | `/jobs/offers`, `/jobs/categories`                                                           |
| Keywords   | `GET/POST/DELETE /keywords`                                                                  |

---

## 7. Testing

### 7.1 Pflicht

- Alle Tests müssen vor Commit grün sein
- Nach Code-Änderungen: `npm run validate` (type-check, lint, format:check, test)
- E2E-Änderungen zusätzlich: `npm run test:e2e` (nicht in validate)
- CI-Parität: `.github/workflows/firebase-deploy-dev.yml` — Job `validate` blockiert Deploy

### 7.2 Test-Pyramide

| Kategorie                     | Ort                       | Ziel-Coverage |
| ----------------------------- | ------------------------- | ------------- |
| Unit (Services, Utils, Hooks) | `**/__tests__/*.test.ts`  | 90%+          |
| Component                     | `**/__tests__/*.test.tsx` | 80%+          |
| Integration                   | `*.integration.test.tsx`  | 70%+          |
| E2E (Playwright)              | `e2e/*.spec.ts`           | Smoke-Flows   |

### 7.3 Konfiguration

- Vitest: `vitest.config.ts` — `testTimeout: 10000`, jsdom, `globals: true`
- Playwright: `playwright.config.ts`
- Setup: `src/setupTests.ts` — `asyncUtilTimeout: 10000`, `scrollIntoView`-Mock für Radix, RTL-FakeTimer-Shim (`global.jest.advanceTimersByTime`)
- Test-Utils: `src/shared/__tests__/test-utils.tsx`, `src/test-utils/sonnerAssertions.ts`

**Temporär ausgeschlossen:** `src/pages/businesses/__tests__/CreateBusiness.test.tsx` via `test.exclude` in `vitest.config.ts`.

### 7.4 E2E

- Specs: Login, Partner, Events, CSV-Import, User-Block, Logout
- Credentials: `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — ohne Secrets werden Login-Specs übersprungen
- CI: Job `e2e-dev` nur vor Dev-Deploy auf `main`; Production-Deploy ohne Playwright

### 7.5 Best Practices

- Accessibility-First: `getByRole`, `getByLabelText` statt `getByTestId`
- Async: `await waitFor(...)` / `findBy*`
- Realistische Interaktion: `userEvent` statt `fireEvent`
- Doppelte Texte: `getAllByText` / `within(...)` wenn gleicher Text mehrfach
- UI-Partial-Mocks: `buttonVariants` mit exportieren wenn Button gemockt wird

### 7.6 Coverage

- **Ziel:** 80–90% (`.cursorrules`)
- **Coverage-Floor (enforced):** Statements 54 / Branches 47 / Functions 50 / Lines 56 via `thresholds` in `vitest.config.ts` (Provider `v8`; misst ~1-2 Punkte niedriger als das frühere Istanbul+Jest) — schrittweise erhöhen
- Ausgeschlossen: `*.d.ts`, `main.tsx`, Re-exports, Test-Dateien, `src/test-utils/**`

### 7.7 ESM-Stubs

- `src/test-utils/mocks/react-markdown.tsx`
- `src/test-utils/mocks/remark-gfm.ts`
- `sonnerAssertions.ts` für Toast-Tests

---

## 8. Task Completion

Vor Abschluss jeder Aufgabe mit Dateiänderungen:

1. `npm run validate` ausführen — nicht nur einzelne Schritte
2. Bei `format:check`-Fehlern: `npm run format`, dann validate erneut
3. Fehler beheben — kein Abschluss mit rotem validate
4. Ergebnis kurz bestätigen (validate grün, betroffene Tests)
5. Entfällt bei reinen Lese-/Review-/Erklär-Aufgaben ohne Dateiänderungen

Page-Split-Verifikation: Checkliste in [`docs/app_review.html`](docs/app_review.html#checklists).

---

## 9. Weitere Ressourcen

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
