# Dependency-Updates: Major & Migrationswege (admin-fe)

Dieses Dokument fasst **Major-Upgrades** zusammen, die über die in `package.json` definierten Caret-Ranges (`^`) hinausgehen. Es ergänzt [README.md](./README.md) und [TESTING.md](./TESTING.md). Für semver-konforme Aktualisierungen ohne Major-Sprung genügt regelmäßig `npm install` / `npx npm-check-updates -t minor` und anschließend `npm run validate`. Nach jedem Major-Schritt: `npm run validate` und manuelle Smoke-Tests; Code-Konventionen: [`../.cursorrules`](../.cursorrules).

## Stand der Analyse

- **Datum**: 2026-04-20
- **Quelle**: `npx npm-check-updates` im Verzeichnis `admin-fe` (vergleicht `package.json`-Ranges mit **Latest** auf der Registry)

## Abgeschlossene Major-Schritte (kurz)

Nach jedem Paket bzw. gemeinsamen Schritt wurde **`npm run type-check`**, **`npm run build`** und ein kurzer **Vite-Dev-Server** (HTTP 200) ausgeführt.

| Thema | Stand | Verifiziert |
|-------|--------|-------------|
| **MUI 7 → 9** | `@mui/material` / `@mui/icons-material` **^9.0.0** | wie zuvor dokumentiert |
| **@types/node** | **^25.6.0** | type-check, build, Dev-Start |
| **simple-icons** | **^16.17.0** | type-check, build, Dev-Start |
| **postcss-nesting** | **^14.0.0** (Peer `postcss ^8.4` erfüllt) | type-check, build, Dev-Start |
| **jsdom** | **^29.0.2** | type-check, build, Dev-Start |
| **lucide-react 1.x** | **^1.8.0**; Marken-Icons aus Lucide entfernt: Anpassung in [`JobOfferForm.tsx`](../src/pages/job-offers/JobOfferForm.tsx) (`Facebook`/`Instagram` über **simple-icons**, LinkedIn-Zeile mit **`LinkIcon`** statt entferntem Lucide-`Linkedin`, da kein passender Export in simple-icons v16 genutzt wurde) | type-check, build, Dev-Start |
| **Vite 8 + @vitejs/plugin-react 6** | `vite` **^8.0.8**, `@vitejs/plugin-react` **^6.0.1** (ein gemeinsamer Schritt wegen `peer: vite ^8`) | type-check, build, Dev-Start |
| **TypeScript 6** | **^6.0.3**; **`baseUrl`** in [`tsconfig.json`](../tsconfig.json) und [`tsconfig.app.json`](../tsconfig.app.json) entfernt (TS 6 Deprecation **TS5101**), `paths` für `@/*` unverändert | type-check, build, Dev-Start |
| **ESLint 10** | **zurückgestellt** auf **^9.39.4** | `npm install` schlägt mit harten Peer-Konflikten fehl: u. a. `eslint-plugin-import@2.32.0` erlaubt nur `eslint` ^2–^9. Siehe Abschnitt *ESLint (9 → 10)*. |
| **Jest / Gesamtsuite** | bewusst **nicht** Teil dieser Runde | Nachgang wie in [TESTING.md](./TESTING.md) |

## Übersicht: Major-Sprünge (Rest offen / blockiert)

| Paket | Spezifikation (aktuell) | Bemerkung |
|-------|-------------------------|-----------|
| `eslint` | ^9.39.4 | Upgrade auf 10.x blockiert durch Plugin-Peers (s. unten) |
| `typescript-eslint` | ^8.58.2 | passt zu TS 6.x laut Peer (`typescript <6.1`); bei Major-Bump mit ESLint 10 koordinieren |

**Erledigt (nicht mehr in der Tabelle):** `@mui/*`, `vite`, `@vitejs/plugin-react`, `typescript`, `@types/node`, `jsdom`, `lucide-react`, `postcss-nesting`, `simple-icons` – jeweils auf den in `package.json` gesetzten Major-Stand angehoben und wie oben verifiziert.

---

## @mui/material & @mui/icons-material (7 → 9)

**Kontext:** MUI v9 ist ein abgestimmter Major-Sprung im Ökosystem; von v7 aus sind die offiziellen Upgrade-Guides der Reihe nach relevant.

### Stand Migration (admin-fe, 2026-04-20)

- **Codeumfang:** MUI wird nur für **Material Icons** und die **`Icon`-Wrapper-Komponente** genutzt (`src/utils/iconUtils.tsx`, `src/components/ui/icon-picker.tsx` sowie zugehöriger Test-Mock). Keine `Dialog`/`ThemeProvider`-Nutzung aus `@mui/material` im App-Tree.
- **Durchgeführt:** Versionen auf **^9.0.0** angehoben, `npm install`, ohne zusätzliche Code-Anpassungen (TypeScript blieb grün).
- **Verifiziert:** `npm run type-check`, `npm run build`, kurzer **Dev-Start** (Vite, HTTP 200).
- **Nachgang:** Vollständige **`npm run test`** / `validate`-Runde separat (siehe Abschnitt *Abgeschlossene Major-Schritte* und [TESTING.md](./TESTING.md)); visuelle Smoke-Tests der Icon-Picker-Flows im Browser.

### Migrationsweg (Referenz für andere Projekte / erweiterte Nutzung)

1. **Release Notes / Guides** (Reihenfolge beachten):
   - [Upgrade to v9](https://mui.com/material-ui/migration/upgrade-to-v9/) (bzw. aktuelle URLs auf [mui.com](https://mui.com))
   - Zwischenversionen (v8) und Deprecation-Warnungen in v7-Builds abarbeiten, falls dokumentiert.
2. **Icons:** `@mui/icons-material` – u. a. Umbenennungen/Entfernung duplizierter `*Outline`-Exports zugunsten von `*Outlined` (siehe MUI v9-Migrationsseite).
3. **Komponenten-APIs:** z. B. `Dialog`/`Modal`-Props (`disableEscapeKeyDown` → Handling über `onClose`-`reason`), `ButtonBase`-Tastatur- und Klick-Semantik, Backdrop-ARIA – alle betroffenen Stellen per Suche (`grep`/`rg`) im `src/`-Tree finden.
4. **Browser-Unterstützung:** Mindestversionen steigen (siehe MUI-Blog/Migration); prüfen, ob eure Zielgruppe in Admin/Embedded WebViews noch ältere Browser braucht.
5. **Tests:** nach stabiler Jest-Ausführung `npm run test` bzw. `npm run validate`; visuelle Regression der wichtigsten Formulare und Tabellen.

---

## Vite (7 → 8)

**Offizieller Einstieg:** [Migration from v7 | Vite](https://vitejs.dev/guide/migration.html)

### Stand Migration (admin-fe, 2026-04-20)

- **Durchgeführt:** `vite` **^8.0.8** zusammen mit `@vitejs/plugin-react` **^6.0.1**; [`vite.config.ts`](../vite.config.ts) zunächst unverändert (Rollup-Warnung weist optional auf `build.rolldownOptions` hin).
- **Verifiziert:** `npm run type-check`, `npm run build`, Dev-Server.

### Wesentliche Punkte

- **Rolldown & Oxc:** Produktions-Build und Dep-Optimierung nutzen Rolldown/Oxc statt Rollup/esbuild-Kombination wie zuvor; Performance und Verhalten können sich ändern.
- **Konfiguration:** `optimizeDeps.esbuildOptions` ist deprecated → langfristig `optimizeDeps.rolldownOptions`; `esbuild`-Config → `oxc`. Vite wandelt vieles **automatisch** um – dennoch `vite.config.*` reviewen.
- **Minifier:** JS/CSS-Minification wechselt (Oxc / Lightning CSS); bei Minify-Problemen temporär dokumentierte Fallback-Flags prüfen.
- **CJS-Interop & Auflösung:** konsistentere `default`-Imports aus CJS; entferntes „Format Sniffing“ bei `browser`/`module`-Feldern – betroffene Dependencies ggf. aliassen.
- **Gradueller Pfad:** optional zuerst [Rolldown-Integration in Vite 7](https://v7.vite.dev/guide/rolldown) evaluieren, dann auf Vite 8.

### Migrationsweg

1. Vite 8 + passendes `@vitejs/plugin-react` gemäß Peer-Angaben installieren.
2. `vite.config.ts` gegen Migration Guide abgleichen; Plugins (Firebase, Tailwind) auf Kompatibilität prüfen.
3. `npm run build` / `npm run build:dev` und E2E-Smoke im Browser.

---

## @vitejs/plugin-react (5 → 6)

1. **Peer-Dependencies** zu `vite` in der README des Plugins auf [npm](https://www.npmjs.com/package/@vitejs/plugin-react) prüfen.
2. Gemeinsam mit dem **Vite-Major** planen (siehe oben), um Doppel-Migration zu vermeiden.
3. Nach Upgrade: HMR, Fast Refresh, JSX-Runtime (automatic) in einer Beispielseite testen.

---

## TypeScript (5 → 6)

### Stand Migration (admin-fe, 2026-04-20)

- **Durchgeführt:** `typescript` **^6.0.3**; `baseUrl` aus [`tsconfig.json`](../tsconfig.json) und [`tsconfig.app.json`](../tsconfig.app.json) entfernt (Fehler **TS5101** in TS 6), Alias `@/*` über `paths` beibehalten.
- **Verifiziert:** `npm run type-check`, `npm run build`, Dev-Server.

### Migrationsweg (Referenz)

1. **Offizielle v6-Migrationsseite** der TypeScript-Dokumentation lesen ([typescriptlang.org](https://www.typescriptlang.org/docs/)).
2. **Strengere oder geänderte Checks** können neue Fehler in `strict`-Projekten auslösen (admin-fe: siehe [`../.cursorrules`](../.cursorrules)).
3. **ts-jest** und `typescript-eslint` bei Bedarf anheben; `typescript-eslint@8.58.2` deklariert u. a. `typescript` unter 6.1.0 (aktueller Stand **6.0.3** ist kompatibel).
4. `npm run type-check` und nach Jest-Fix `npm run test`.

---

## ESLint (9 → 10)

### Stand (admin-fe, 2026-04-20) – blockiert

Ein Versuch mit `eslint@^10.2.1` scheiterte an **`npm install` (ERESOLVE)**: mindestens **`eslint-plugin-import@2.32.0`** deklariert `peer eslint` nur bis **^9**; ähnlich **`eslint-plugin-jsx-a11y`**, **`eslint-plugin-react`**. Ohne `--legacy-peer-deps` oder ohne neuere Plugin-Versionen mit ESLint-10-Peer ist das Upgrade **nicht sauber** installierbar.

**Nächste Schritte (wenn ESLint 10 ansteht):** Plugin-Releases prüfen (`eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, ggf. weitere), dann erneut `eslint` + explizites **`@eslint/js`** (für [`eslint.config.js`](../eslint.config.js)) anheben und `npm run lint` ausführen.

### Migrationsweg (Referenz)

1. **Offizielle Migration:** [Migrate to v10.x](https://eslint.org/docs/latest/use/migrate-to-10.0.0) (eslint.org).
2. **Node-Version:** ESLint 10 setzt neuere Node-Mindestversionen voraus (siehe Release Blog); `engines` in `package.json` von admin-fe ist bereits `>=22` – dennoch CI-Images prüfen.
3. **Flat Config:** `ESLINT_USE_FLAT_CONFIG=false` entfällt; nur noch `eslint.config.*`. Falls noch Altreste: `@eslint/migrate-config` nutzen.
4. **Plugins:** alle auf mit ESLint 10 kompatible Peers anheben; danach `npm run lint`.

---

## jsdom (27 → 29)

Betrifft vor allem **Jest** (`jest-environment-jsdom`).

1. [jsdom Changelog](https://github.com/jsdom/jsdom/releases) für Breaking Changes zwischen 27 → 29 lesen.
2. `jest-environment-jsdom` auf passende Major-Version anheben (Peer zu Jest 30 beachten).
3. Tests mit DOM-Manipulation (Modal, Router) erneut ausführen: `npm run test`.

---

## lucide-react (0.x → 1.x)

**Offizielle Hinweise:** [Version 1](https://lucide.dev/guide/version-1), [React migration](https://lucide.dev/guide/react/migration)

### Stand Migration (admin-fe, 2026-04-20)

- **Durchgeführt:** `lucide-react` **^1.8.0**; einzige betroffene Marken-Imports waren in **`JobOfferForm`** (`Linkedin`, `Facebook`, `Instagram` von Lucide). Umsetzung siehe Tabelle *Abgeschlossene Major-Schritte*.
- **Verifiziert:** `npm run type-check`, `npm run build`, Dev-Server.

### Wesentliche Punkte

- **Brand-Icons** wurden entfernt; betroffene Imports durch **eigene SVGs** oder z. B. **simple-icons** ersetzen.
- **A11y:** `aria-hidden` standardmäßig `true` – prüfen, ob ihr bewusst `aria-label` setzen müsst.
- **Build:** kein UMD mehr; für Vite/ESM i. d. R. unkritisch.

### Migrationsweg

1. `rg "lucide-react"` im `src/`-Tree; Brand-Icons identifizieren und ersetzen.
2. Smoke-Test der Navigations- und Formular-Icons.

---

## @types/node (24 → 25)

1. Abgleich mit der **lokalen und CI-Node-Version** (22 LTS vs. 25 – nur Typen „25“ bedeutet nicht zwingend Runtime 25).
2. Nach Upgrade `npm run type-check`: Node-API-Typen (`fs`, `path`, `Buffer`) in ggf. vorhandenen Server-Skripten oder Tooling-Dateien anpassen.

---

## postcss-nesting (13 → 14)

1. **Release Notes** des Pakets und **Peer-Dependency** zu `postcss` prüfen.
2. Build-Pipeline (`postcss.config`, Vite/Tailwind 4) testen; visuelle Prüfung verschachtelter Styles.

---

## simple-icons (15 → 16)

1. **Slugs / Icon-Namen** können sich ändern – Suche nach `simple-icons` / dynamischen Slugs im Code.
2. Kein Laufzeit-Risiko wie bei React; dennoch `npm run validate`.

---

## Empfohlene Reihenfolge (pragmatisch)

1. **Build-Cluster:** ~~Vite 8 + `@vitejs/plugin-react` 6~~ **erledigt**; optional `vite.config.ts` an Rolldown-Migration anpassen (siehe Vite-Migrationsguide).
2. **Tooling-Cluster:** ~~TypeScript 6~~ **erledigt**; **ESLint 10** erst wenn Import/React/JSX-A11y-Plugins offiziell `eslint@^10` peeren.
3. **UI/Libs:** ~~MUI 9, lucide 1, simple-icons 16~~ **erledigt**; `@types/node`, `postcss-nesting`, `jsdom` **erledigt**.
4. **Tests:** Jest-Suite stabilisieren (Nachgang), dann erneut `npm run test` / `validate`.

## Nicht genutzte Dependencies (Audit 2026-04-20)

Folgende Pakete waren in `package.json` eingetragen, wurden im Quellbaum (`src/`, Konfiguration) aber **nicht referenziert** und wurden entfernt: `react-cool-onclickoutside`, `recharts`, `react-icons`, `tw-animate-css`, `@types/lodash` (es gibt keinen `lodash`-Import).

**Ergänzung:** `typescript-eslint` wurde als `devDependency` ergänzt, weil [`eslint.config.js`](../eslint.config.js) `import tseslint from 'typescript-eslint'` nutzt – ohne Eintrag schlägt `npm run lint` mit `ERR_MODULE_NOT_FOUND` fehl. Die separaten Einträge `@typescript-eslint/eslint-plugin` und `@typescript-eslint/parser` entfallen, sie kommen transitiv über `typescript-eslint` mit.

## Verweise

- Qualitätssicherung: [TESTING.md](./TESTING.md)
