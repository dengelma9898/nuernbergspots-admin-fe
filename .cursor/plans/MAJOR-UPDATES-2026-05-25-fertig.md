# Major Dependency Migrationsplan

**Projekt:** nuernbergspots-admin-fe  
**Erstellt:** 2026-05-25  
**Status:** fertig  
**Regel:** Maximal 1 Major-Upgrade pro Durchlauf  
**Analyse:** Alle `dependencies` + `devDependencies` aus `package.json` (universell)  
**Sperrregel:** Dieser Plan muss vollständig abgearbeitet sein (`fertig`), bevor der Skill erneut analysiert und ein neues Markdown anlegt

## Übersicht

| Paket    | Current | Target (Latest) | Status | Priorität |
| -------- | ------- | --------------- | ------ | --------- |
| `eslint` | 9.39.4  | 10.4.0          | done   | hoch      |

**Status-Werte:** `open` | `in-progress` | `done` | `blocked`

**Analyse-Hinweis (2026-05-25):** `npm outdated` und `npx npm-check-updates` listen nur `eslint` als Major-Kandidaten. Alle anderen Pakete sind auf dem jeweiligen Latest-Major.

## Durchlauf-Protokoll

### 2026-05-25 — `eslint` (Major 9 → 10)

**Status:** done

#### Breaking Changes

- [x] Node.js `^20.19.0 \|\| ^22.13.0 \|\| >=24` — Projekt: `engines.node >= 22` ✓
- [x] Altes eslintrc-Format entfernt — Projekt nutzt bereits `eslint.config.js` (Flat Config) ✓
- [x] Neue Config-Lookup-Algorithmus (ab linted file directory) — Standard in v10
- [x] `eslint-env`-Kommentare werden als Fehler gemeldet — keine Treffer im Repo
- [x] JSX-Referenz-Tracking aktiviert — keine neuen Fehler
- [x] `eslint:recommended` aktualisiert — 3 neue Errors (`no-useless-assignment`, `preserve-caught-error`) behoben

#### Betroffene Bereiche

- [x] `eslint.config.js` — Flat Config unverändert funktionsfähig
- [x] `package.json` — `@eslint/js@10` als direkte devDependency ergänzt; ungenutzte Plugins entfernt
- [x] `src/lib/api-client.ts` — `no-useless-assignment`
- [x] `src/pages/events/CopyEvent.tsx` — `preserve-caught-error` mit `{ cause: error }`
- [x] `src/pages/events/CsvEventImport.tsx` — `no-useless-assignment`

#### Migrationsschritte

- [x] `eslint@10.4.0` installieren
- [x] `@eslint/js@10.0.1` als direkte devDependency (ESLint 10 bundelt es nicht mehr)
- [x] Ungenutzte Plugins entfernt (`eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`) — blockierten `npm ci` wegen Peer-Deps auf ESLint ≤9, waren nicht in `eslint.config.js` referenziert
- [x] Lint-Fehler aus v10 Breaking Changes behoben
- [x] `npm ci` (frische Installation)
- [x] `validate` + `build` + Preview Smoke

#### Validierung

- [x] `npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Preview Smoke (`http://localhost:4173/` → 200)

#### Notizen

- `typescript-eslint@8.59.4` peer: `eslint ^8.57.0 || ^9.0.0 || ^10.0.0` — kompatibel
- `eslint-plugin-react-hooks@7.1.1` unterstützt ESLint 10
- Entfernte Plugins können bei Bedarf wieder hinzugefügt werden, sobald sie ESLint-10-Peers haben und in der Flat Config genutzt werden sollen

---

## Abgeschlossen

- **2026-05-25** — `eslint` 9.39.4 → 10.4.0

## Blockiert

<!-- keine -->

## Abschluss

- **Fertig am:** 2026-05-25
- **Ergebnis:** Alle geplanten Major-Upgrades migriert (1/1). Universelle Analyse ergab nur `eslint` als Major-Kandidat.
