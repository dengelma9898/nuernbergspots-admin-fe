# Major Dependency Migrationsplan

**Projekt:** nuernbergspots-admin-fe  
**Erstellt:** 2026-08-03  
**Abgeschlossen:** 2026-08-10  
**Status:** fertig  
**Regel:** Maximal 1 Major-Upgrade pro Durchlauf  
**Analyse:** Alle `dependencies` + `devDependencies` aus `package.json` (universell)  
**Sperrregel:** Dieser Plan muss vollständig abgearbeitet sein (`fertig`), bevor der Skill erneut analysiert und ein neues Markdown anlegt

## Übersicht

| Paket                       | Current | Target (Latest) | Status | Priorität |
| --------------------------- | ------- | --------------- | ------ | --------- |
| `@testing-library/jest-dom` | 6.9.1   | 7.0.0           | done   | hoch      |
| `@types/node`               | 25.9.5  | 26.2.0          | done   | mittel    |
| `typescript`                | 6.0.3   | 7.0.2           | done   | niedrig   |

**Status-Werte:** `open` | `in-progress` | `done` | `blocked`

## Analyse-Hinweis (2026-08-03)

Universelle Analyse nach Abschluss von `MAJOR-UPDATES-2026-05-29-fertig.md`:

```bash
npm outdated
```

**Ergebnis:** 3 Major-Kandidaten in `devDependencies`. Keine Major-Kandidaten in `dependencies`.

## Durchlauf-Protokoll

### 2026-08-03 — `@testing-library/jest-dom` (Major 6 → 7)

**Status:** done

#### Breaking Changes

- [x] `@testing-library/dom` ist jetzt **required peer dependency** (explizit installieren)
- [x] Mindest-Node.js: **22** (Projekt: `engines.node >= 22` — erfüllt)
- [x] Keine Matcher-API-Änderungen für bestehenden Code nötig

#### Betroffene Bereiche

- [x] `package.json` — Upgrade + `@testing-library/dom` als devDependency
- [x] `src/setupTests.ts` — zentraler Import (unverändert)
- [x] 30+ Test-Dateien mit `import '@testing-library/jest-dom'`

#### Migrationsschritte

- [x] `npm install @testing-library/jest-dom@7 @testing-library/dom`
- [x] `rm -rf node_modules && npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Preview Smoke (`curl` → HTTP 200)

#### Validierung

- [x] `npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Dev-Server / Preview Smoke

#### Notizen

- `@testing-library/dom` war bereits transitiv über `@testing-library/react` vorhanden; jetzt explizit in `devDependencies`
- Keine Code-Änderungen nötig — nur `package.json` / `package-lock.json`

---

### 2026-08-10 — `@types/node` (Major 25 → 26)

**Status:** done

#### Breaking Changes

- [x] Typdefinitionen für **Node.js 26 APIs** (entspricht Major-Version der Pakete)
- [x] Erfordert **TypeScript 5.6+** (Projekt: TS 6.0.3 — erfüllt)
- [x] Entfernte verwaiste Interfaces in buffer, fs, perf_hooks, util, worker_threads
- [x] Crypto-Typen bereinigt (`BinaryLike`, `BufferEncoding` statt crypto-spezifischer Unions)
- [x] `undici-types` Major-Bump auf v8.x (transitiv)

#### Betroffene Bereiche

- [x] `package.json` / `package-lock.json` — Upgrade auf `^26.2.0`
- [x] `playwright.config.ts` — `node:fs`, `node:path` (keine Anpassung nötig)
- [x] `e2e/csv-import-smoke.spec.ts` — `node:path`, `node:url` (keine Anpassung nötig)
- [x] `tsconfig.node.json` — Vite/Playwright-Config (keine Anpassung nötig)

#### Migrationsschritte

- [x] `npm install @types/node@26`
- [x] `rm -rf node_modules && npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Preview Smoke (`curl` → HTTP 200)

#### Validierung

- [x] `npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Dev-Server / Preview Smoke

#### Notizen

- Keine Code-Änderungen nötig — reines Typdefinitions-Upgrade
- Projekt `engines.node >= 22` — Node-26-Typen decken APIs ab, die ggf. erst in neueren Node-Versionen verfügbar sind; direkte Nutzung im Projekt beschränkt auf stabile `node:fs`/`path`/`url`-Imports

---

### 2026-08-10 — `typescript` (Major 6 → 7)

**Status:** done

#### Breaking Changes

- [x] **Native Go-Compiler** — kein programmatisches Compiler-API in 7.0 (typescript-eslint, ts-jest benötigen TS 6 API)
- [x] `ignoreDeprecations: "6.0"` in TS 7 nicht mehr akzeptiert (entfernt aus `jest.config.js`)
- [x] Entfernte tsconfig-Optionen: `baseUrl`, `moduleResolution: node/node10`, `target: es5`, `downlevelIteration` — Projekt bereits kompatibel (`moduleResolution: bundler`)
- [x] `types` default `[]` in TS 7 — Projekt nutzt keine globalen `@types` ohne Import; keine Anpassung nötig
- [x] Template-Literal-Typen: Unicode-Codepoints statt UTF-16-Surrogatpaare — kein betroffener Code im Projekt

#### Betroffene Bereiche

- [x] `package.json` — Side-by-Side-Setup (Microsoft-Empfehlung):
  - `typescript`: `npm:@typescript/typescript6@^6.0.2` (ESLint, ts-jest Peer)
  - `@typescript/native`: `npm:typescript@^7.0.2` (Compiler `tsc` für Build/Type-Check)
- [x] `jest.config.js` — `ignoreDeprecations: '6.0'` entfernt
- [x] `tsconfig.app.json`, `tsconfig.node.json` — bereits TS-7-kompatibel (bundler, kein baseUrl)

#### Migrationsschritte

- [x] `npm uninstall typescript`
- [x] `npm install -D typescript@npm:@typescript/typescript6@^6.0.2 @typescript/native@npm:typescript@^7.0.2`
- [x] `ignoreDeprecations` aus `jest.config.js` entfernen
- [x] `rm -rf node_modules && npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Preview Smoke (`curl` → HTTP 200)

#### Validierung

- [x] `npm ci`
- [x] `npm run validate` (2058 Tests bestanden)
- [x] `npm run build`
- [x] Dev-Server / Preview Smoke (HTTP 200)

#### Notizen

- **Side-by-Side erforderlich:** `typescript-eslint@8.x` und `ts-jest@29.x` unterstützen TS 7 nicht (kein Compiler-API). Direktes Upgrade auf `typescript@7` führt zu ESLint-Crash.
- Binaries: `tsc` → TS 7.0.2 (`@typescript/native`), `tsc6` → TS 6.0.3 (`typescript`-Alias)
- Bestehende Scripts (`type-check`, `build`) nutzen `tsc` unverändert — zeigt auf TS 7
- Follow-up: Wenn `typescript-eslint` TS 7.1+ API unterstützt, Side-by-Side-Setup vereinfachen

---

## Abgeschlossen

- **2026-08-03** — `@testing-library/jest-dom` 6.9.1 → 7.0.0 (+ `@testing-library/dom` als Peer)
- **2026-08-10** — `@types/node` 25.9.5 → 26.2.0
- **2026-08-10** — `typescript` 6.0.3 → 7.0.2 (Side-by-Side mit `@typescript/typescript6` für Tooling)

## Blockiert

Keine blockierten Pakete.

## Abschluss

Alle 3 Major-Kandidaten aus der universellen Analyse (2026-08-03) sind migriert. Der Migrationsplan ist vollständig abgearbeitet. Eine neue universelle Analyse ist ab sofort wieder erlaubt.
