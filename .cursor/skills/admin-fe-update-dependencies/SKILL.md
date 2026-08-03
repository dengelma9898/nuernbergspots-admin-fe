---
name: admin-fe-update-dependencies
description: Aktualisiert npm-Dependencies im admin-fe-Projekt ausschließlich auf Minor- und Patch-Versionen, validiert danach Build und Tests. Nutze diesen Skill bei Dependency-Updates, npm outdated, Sicherheits-Patches oder wenn der User Minor/Patch-Upgrades im Nürnbergspots Admin Frontend anfordert. Major-Upgrades sind ausdrücklich ausgeschlossen.
---

# Admin-FE Dependency Updates (Minor/Patch)

Skill für das **nuernbergspots-admin-fe** Repository. Folgt `.cursorrules`, `CONSTITUTION.md` und `package.json`.

## Scope

| Erlaubt                                              | Verboten                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| Patch-Updates (`x.y.Z`)                              | Major-Updates (`X.y.z`)                                               |
| Minor-Updates (`x.Y.z`)                              | Neue/geänderte `overrides` oder `resolutions`                         |
| Lockfile-Updates via `npm update` / `--target minor` | `--force`, `--legacy-peer-deps`, manuelle Version-Pinning-Workarounds |
| Bestehende `overrides` unverändert lassen            | E2E-Tests in diesem Skill (nur `validate` + Build)                    |
| Lint-/Test-Fixes für grünes `validate`               | React-Compiler-ESLint-Regeln aktivieren ohne Migration                |

## Pflicht: Tests und validate müssen grün sein

**Kein Dependency-Update abschließen, solange `npm run validate` fehlschlägt.**

Reihenfolge in `validate`: `type-check` → `lint` → `format:check` → `test` (Jest).

| Schritt                         | Pflicht        | Bei Fehler                                                         |
| ------------------------------- | -------------- | ------------------------------------------------------------------ |
| `npm test` / `validate` (Tests) | **Ja — immer** | Tests fixen (nicht aussetzen), ggf. betroffenes Paket zurücksetzen |
| `npm run lint` (Errors)         | **Ja**         | Code oder ESLint-Config anpassen                                   |
| `npm run format:check`          | **Ja**         | `npm run format` ausführen                                         |
| `npm run build`                 | **Ja**         | TypeScript-/Build-Fehler beheben                                   |

Lint-Warnungen (`warn`-Level) blockieren `validate` nicht. ESLint-**Errors** müssen behoben werden — nicht pauschal per `ignore` aushebeln.

## Voraussetzungen

- Node.js **>= 22** (`engines` in `package.json`, CI nutzt Node 22)
- Dependencies installiert: `npm ci`
- Keine parallelen lokalen Dev-Server auf Port 5173 (Vite-Default)

## Workflow

Kopiere und verfolge den Fortschritt:

```
Dependency-Update:
- [ ] Schritt 1: Analyse (outdated, Major ausschließen)
- [ ] Schritt 2: Update (nur Minor/Patch)
- [ ] Schritt 3: Frische Installation
- [ ] Schritt 4: Validierung (validate + build + dev smoke)
- [ ] Schritt 5: Bericht
```

### Schritt 1: Analyse

```bash
npm outdated
```

Für jedes Paket prüfen:

- **Current** vs **Wanted** vs **Latest**
- **Wanted** innerhalb der `^`-Range in `package.json` → Patch/Minor, erlaubt
- **Latest** mit anderer **Major** als Current → **ausklammern**, nicht updaten
- Bei Unsicherheit: `npm view <pkg> version` und semver vergleichen

Major-Kandidaten separat dokumentieren (siehe Bericht-Template), aber **nicht** anfassen.

Optional zur Vorschau:

```bash
npx npm-check-updates --target minor
```

Nur zur Analyse — noch nicht `-u` ausführen.

### Schritt 2: Update (nur Minor/Patch)

**Bevorzugter Weg** — respektiert semver-Ranges, keine Overrides:

```bash
npm update
```

Wenn `package.json`-Ranges auf neuere Minor gehoben werden sollen:

```bash
npx npm-check-updates -u --target minor
npm install
```

**Regeln:**

- Niemals `npx npm-check-updates -u` ohne `--target minor`
- Niemals einzelne Pakete auf eine neue Major-Version setzen
- `package.json` **nicht** um `overrides`/`resolutions` erweitern oder ändern
- Bestehendes `overrides.protobufjs` unangetastet lassen

### Schritt 3: Frische Installation

Lockfile-Konsistenz sicherstellen (wie CI):

```bash
rm -rf node_modules
npm ci
```

### Schritt 4: Validierung

Reihenfolge strikt einhalten. Bei Fehler: **stoppen**, Ursache beheben (Tests, Lint-Errors, Format) oder Update rückgängig machen — nicht mit Overrides „fixen“.

**4a — Vollständige Qualitätsprüfung** (Pflicht — muss grün sein):

```bash
npm run validate
```

Führt aus: `type-check` → `lint` → `format:check` → `test` (Jest). **Alle vier Schritte müssen bestehen**, bevor das Update als abgeschlossen gilt.

Bei `format:check`-Fehler: `npm run format` ausführen und erneut prüfen.

Bei Test-Fehlern: Tests anpassen oder Code fixen — Tests dürfen nicht übersprungen werden.

Bei Lint-Errors: zuerst prüfen, ob `eslint-plugin-react-hooks` v7 React-Compiler-Regeln auslöst (siehe Fehlerbehebung). Compiler-Regeln nicht pauschal aktivieren.

**4b — Production Build** (CI-relevant):

```bash
npm run build
```

Entspricht `tsc && vite build`. Optional zusätzlich:

```bash
npm run build:dev
npm run build:prd
```

**4c — Dev-Server Smoke** (Run-Check):

```bash
npm run start:dev
```

Dev-Server starten, kurz warten, HTTP-Response prüfen, dann beenden:

```bash
# In separatem Terminal oder Hintergrund starten, dann:
curl -sf -o /dev/null http://localhost:5173/ || echo "Dev server check failed"
# Prozess wieder beenden (PID aus ps/kill)
```

Alternativ: `npm run preview` nach Build testen:

```bash
npm run build && npm run preview
# curl http://localhost:4173/
```

**Nicht** in diesem Skill: `npm run test:e2e` (Playwright — separate Credentials/Umgebung).

### Schritt 5: Bericht

Antwort an den User in diesem Format:

```markdown
## Dependency-Update Bericht

### Aktualisiert (Minor/Patch)

- `paket`: `alt` → `neu`

### Ausgeklammert (Major — nicht aktualisiert)

- `paket`: current `x.y.z`, latest `X.y.z` — Grund: Major-Upgrade

### Validierung

- [x] npm ci
- [x] npm run validate
- [x] npm run build
- [x] Dev-Server / Preview Smoke

### Hinweise

- [Breaking changes, Peer-Dependency-Warnungen, manuelle Schritte]
```

## Projekt-Referenz

| Bereich          | Pfad / Befehl                                                       |
| ---------------- | ------------------------------------------------------------------- |
| Scripts          | `package.json` → `validate`, `build`, `start:dev`                   |
| Tests            | `src/**/__tests__/*`, `npm test`                                    |
| Lint/Format      | `eslint.config.js`, Prettier                                        |
| CI               | `.github/workflows/firebase-deploy-dev.yml` → `npm ci`, E2E separat |
| Coding-Standards | `.cursorrules`                                                      |
| Test-Doku        | `CONSTITUTION.md`                                                   |

## Fehlerbehebung (ohne Overrides)

1. **Peer-Dependency-Konflikt** → Paket auf Minor/Patch-Kombination prüfen; Major-Upgrade **nicht** als Workaround
2. **Test-Failure nach Update** → Betroffenes Paket identifizieren; Tests oder Anwendungscode fixen (nicht Tests deaktivieren)
3. **Build-Failure (TypeScript)** → `@types/*`-Updates prüfen; nur Minor/Patch
4. **Format-Check failed** → `npm run format`, dann `validate` erneut
5. **Lint-Errors durch React-Compiler-Regeln** (`eslint-plugin-react-hooks` v7) → In `eslint.config.js` nur klassische Regeln aktivieren: `rules-of-hooks` (error) + `exhaustive-deps` (warn). **Nicht** `reactHooks.configs.recommended.rules` spreaden — enthält Compiler-Regeln, die eine vollständige Codebase-Migration erfordern (~60+ Fehler). Compiler-Regeln bewusst deaktiviert lassen, bis Migration geplant ist.
6. **Lint-Warnungen** (`no-console`, `no-explicit-any`, …) → Blockieren `validate` nicht. Zeitboxed: nicht alle 300+ Warnungen in einem Dependency-Update abarbeiten; bei Bedarf als separates Refactoring-Ticket.

## Beispiel-Aufruf

User: „Bitte alle Dependencies im admin-fe auf den neuesten Stand bringen."

Agent:

1. Skill lesen und Scope prüfen (Minor/Patch only)
2. `npm outdated` → Major-Kandidaten listen
3. `npm update` oder `ncu -u --target minor` + `npm install`
4. `npm ci` → `npm run validate` (muss grün sein) → `npm run build` → Dev-Smoke
5. Bericht mit aktualisierten und ausgeklammerten Paketen; bei Test-/Lint-Fixes kurz dokumentieren
