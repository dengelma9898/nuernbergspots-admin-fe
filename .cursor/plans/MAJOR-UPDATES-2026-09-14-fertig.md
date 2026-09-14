# Major Dependency Migrationsplan

**Projekt:** nuernbergspots-admin-fe  
**Erstellt:** 2026-09-14  
**Abgeschlossen:** 2026-09-14  
**Status:** fertig  
**Regel:** Maximal 1 Major-Upgrade pro Durchlauf  
**Analyse:** Alle `dependencies` + `devDependencies` aus `package.json` (universell)  
**Sperrregel:** Dieser Plan muss vollständig abgearbeitet sein (`fertig`), bevor der Skill erneut analysiert und ein neues Markdown anlegt

## Übersicht

| Paket                 | Current | Target (Latest) | Status | Priorität |
| --------------------- | ------- | --------------- | ------ | --------- |
| `vitest`              | 4.1.11  | 5.0.0           | done   | hoch      |
| `@vitest/coverage-v8` | 4.1.11  | 5.0.0           | done   | hoch      |

_Hinweis:_ `@vitest/coverage-v8` ist das offizielle Coverage-Provider-Paket von Vitest und hat eine strikte Peer-Dependency `vitest: 5.0.0`. Beide Pakete gehören zum selben Monorepo/Release und wurden synchron als ein kohärentes Vitest-5-Upgrade migriert.

**Status-Werte:** `open` | `in-progress` | `done` | `blocked`

## Analyse-Hinweis (2026-09-14)

Universelle Analyse nach Abschluss von `MAJOR-UPDATES-2026-08-10-fertig.md`:

```bash
npm outdated
npx npm-check-updates
```

**Ergebnis:** 2 Major-Kandidaten in `devDependencies` (`vitest` und `@vitest/coverage-v8`). Keine Major-Kandidaten in `dependencies`. Alle anderen Pakete sind auf dem aktuellen Major-Stand (nur Minor/Patch verfügbar).

## Durchlauf-Protokoll

### 2026-09-14 — `vitest` & `@vitest/coverage-v8` (Major 4 → 5)

**Status:** done

#### Breaking Changes

- [x] Node.js Mindestanforderung: `^22.12.0 || >=24` (Projekt: `engines.node: ^22.22.2 || ^24.15.0 || >=26.0.0` — erfüllt)
- [x] Vite Mindestanforderung: `>= 6.4.0` (Projekt: Vite 8.2.0 — erfüllt)
- [x] `clearMocks` ist standardmäßig `true` (`vi.clearAllMocks()` vor jedem Test) — keine negativen Auswirkungen auf Suite
- [x] Gehoistete Mocks (`vi.mock`, `vi.unmock`, `vi.hoisted`) außerhalb des Modul-Top-Levels werfen Fehler statt Warnung — keine Treffer im Projekt
- [x] Entfernung von `test.sequential`, `describe.sequential`, `sequential` zugunsten von `{ concurrent: false }` — keine Treffer im Projekt
- [x] Nicht ge-awaitete asynchrone Assertions (`resolves`, `rejects`) lassen Tests fehlschlagen — alle Treffer im Projekt sind bereits mit `await` versehen
- [x] Generierte Artefakte liegen jetzt im zentralen `.vitest/`-Verzeichnis — `.vitest/` in `.gitignore` aufgenommen
- [x] `@vitest/coverage-v8` v5 erfordert strikt `vitest: 5.0.0` als Peer-Dependency — synchron installiert

#### Betroffene Bereiche

- [x] `package.json` — Upgrade von `vitest` und `@vitest/coverage-v8` auf `^5.0.0`
- [x] `.gitignore` — `.vitest/` Verzeichnis ignoriert
- [x] `vitest.config.ts` — Konfigurationskompatibilität geprüft (Coverage-Thresholds unverändert gültig)
- [x] `src/setupTests.ts` — Globale Setup- und Mock-Logik geprüft (kompatibel)
- [x] Tests (`src/**/__tests__/*`) — 104 Testdateien / 2168 Tests laufen fehlerfrei durch

#### Migrationsschritte

- [x] `npm install -D vitest@^5.0.0 @vitest/coverage-v8@^5.0.0`
- [x] `.vitest/` in `.gitignore` ergänzen
- [x] `rm -rf node_modules && npm ci`
- [x] `npm run validate` (type-check, lint, format:check, vitest)
- [x] `npm run test:coverage` (v8-Coverage gemessen und alle Schwellwerte bestanden)
- [x] `npm run build`
- [x] Dev-Server / Preview Smoke (HTTP 200)

#### Validierung

- [x] `npm ci`
- [x] `npm run validate` (2168 Tests bestanden, 0 Fehler)
- [x] `npm run test:coverage` (Statements 58.45%, Branches 50.15%, Functions 56.33%, Lines 60.46%)
- [x] `npm run build` (tsc && vite build erfolgreich)
- [x] Dev-Server / Preview Smoke (`curl http://localhost:4173/` → HTTP 200)

#### Notizen

- Tightly coupled: `@vitest/coverage-v8` und `vitest` müssen zwingend synchron auf 5.0.0 aktualisiert werden (strikte Peer-Dependency).
- Test-Laufzeit hat sich durch Vitest 5 spürbar verbessert (von ca. 20s auf ca. 12-15s für die gesamte Suite).

---

## Abgeschlossen

- **2026-09-14** — `vitest` 4.1.11 → 5.0.0 & `@vitest/coverage-v8` 4.1.11 → 5.0.0

## Blockiert

Keine blockierten Pakete.

## Abschluss

- **Fertig am:** 2026-09-14
- **Ergebnis:** Alle geplanten Major-Upgrades migriert (2/2). Universelle Analyse ergab nur `vitest` und `@vitest/coverage-v8` als Major-Kandidaten. Der Migrationsplan ist vollständig abgearbeitet. Eine neue universelle Analyse ist ab sofort wieder erlaubt.
