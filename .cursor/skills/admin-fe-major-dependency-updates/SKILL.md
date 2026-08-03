---
name: admin-fe-major-dependency-updates
description: Analysiert alle npm-Dependencies und devDependencies im admin-fe-Projekt auf Major-Upgrades, führt sie über einen Migrationsplan MAJOR-UPDATES-<Datum>-<status> schrittweise aus (max. ein Paket pro Durchlauf) und validiert wie Minor/Patch-Updates. Nutze diesen Skill bei Major-Upgrades, npm outdated, Breaking-Change-Migrationen oder wenn der User Major-Updates im Nürnbergspots Admin Frontend anfordert. Bestehende in-progress-Pläne müssen vollständig abgearbeitet sein, bevor ein neuer Plan entsteht.
---

# Admin-FE Major Dependency Updates

Skill für das **nuernbergspots-admin-fe** Repository. Ergänzt [admin-fe-update-dependencies](../admin-fe-update-dependencies/SKILL.md) (Minor/Patch). Folgt `.cursorrules`, `CONSTITUTION.md` und `package.json`.

## Scope

| Erlaubt                                                                         | Verboten                                                                    |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Alle** `dependencies` und `devDependencies` aus `package.json` prüfen         | Nur einzelne Pakete analysieren und Rest ignorieren                         |
| **Ein** Major-Upgrade pro Skill-Durchlauf                                       | Mehrere Major-Upgrades gleichzeitig                                         |
| Migrationsplan als Markdown pflegen                                             | Neues Markdown / `npm outdated`-Neuanalyse, solange `in-progress` existiert |
| Neuen Plan erst nach vollständig abgearbeitetem Plan (`fertig`)                 | `--force`, `--legacy-peer-deps` als Dauerlösung                             |
| Code-/Config-Anpassungen für Breaking Changes                                   | Neue `overrides`/`resolutions` ohne dokumentierte Begründung                |
| Lint-/Test-Fixes für grünes `validate`                                          | Tests deaktivieren oder überspringen                                        |
| Bestehende `overrides.protobufjs` nur bei dokumentierter Notwendigkeit anfassen | E2E in diesem Skill (nur `validate` + Build + Dev-Smoke)                    |

## Migrationsplan-Datei

**Speicherort:** `.cursor/plans/`

**Dateiname:** `MAJOR-UPDATES-<YYYY-MM-DD>-<status>.md`

| Status        | Bedeutung                                                            |
| ------------- | -------------------------------------------------------------------- |
| `in-progress` | Offene Major-Migrationen — **exklusiv diese Datei bearbeiten**       |
| `fertig`      | Plan vollständig abgearbeitet — erst dann darf neu analysiert werden |

### Sperrregel: Ein Plan zur Zeit

**Vor jeder Analyse zuerst prüfen:**

```bash
ls .cursor/plans/MAJOR-UPDATES-*-in-progress.md 2>/dev/null
```

| Situation                                    | Aktion                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `*-in-progress.md` existiert                 | **Nur** diesen Plan weiterbearbeiten — **kein** `npm outdated` für Neuanlage, **kein** neues Markdown |
| Kein `in-progress`, aber alter `*-fertig.md` | Plan ist abgeschlossen — **dann** universelle Analyse erlaubt                                         |
| Kein Plan vorhanden                          | Universelle Analyse → neuen Plan anlegen                                                              |

Ein neues Markdown (`MAJOR-UPDATES-<datum>-in-progress.md`) darf **nur** entstehen, wenn:

1. **Keine** Datei `MAJOR-UPDATES-*-in-progress.md` existiert, **und**
2. Der letzte Plan (falls vorhanden) als `*-fertig.md` abgeschlossen ist — d. h. alle Einträge sind `done` oder bewusst `blocked` mit Begründung.

### Datei-Lebenszyklus

1. **Gate:** Existiert `MAJOR-UPDATES-*-in-progress.md`? → Ja: Plan fortsetzen, Analyse stoppen
2. **Gate bestanden:** Universelle Analyse (siehe unten) → alle Major-Kandidaten erfassen
3. Neue Datei `MAJOR-UPDATES-<heute>-in-progress.md` anlegen — **vollständige** Liste aller Major-Kandidaten
4. **Während der Arbeit:** Plan nach jedem Schritt aktualisieren (Status, Notizen, Breaking Changes)
5. **Abschluss:** Wenn alle Einträge `done` oder `blocked` → umbenennen zu `MAJOR-UPDATES-<heute>-fertig.md` → erst **danach** wieder universelle Analyse für einen **neuen** Plan erlaubt

### Universelle Analyse (nur bei Gate bestanden)

Alle Projekt-Dependencies prüfen — nicht nur vom User genannte Pakete:

```bash
npm outdated
```

Für **jedes** Paket in `package.json` → `dependencies` **und** `devDependencies`:

- **Current** vs **Wanted** vs **Latest**
- Major-Kandidat: **Latest** hat andere **Major** als **Current**
- Keine Major-Kandidaten aus der Liste weglassen
- Transitive Majors nur dokumentieren, wenn sie direktes Upgrade-Ziel sind

Optional zur Vollständigkeit:

```bash
npx npm-check-updates
# Nur zur Analyse — nicht -u ausführen
```

Ergebnis: **eine** Plan-Tabelle mit **allen** Major-Kandidaten des Projekts.

Plan-Template: [migration-plan-template.md](migration-plan-template.md)

## Pflicht: Tests und validate müssen grün sein

**Kein Major-Upgrade abschließen, solange `npm run validate` fehlschlägt.**

Reihenfolge in `validate`: `type-check` → `lint` → `format:check` → `test` (Jest).

| Schritt                         | Pflicht        | Bei Fehler                                     |
| ------------------------------- | -------------- | ---------------------------------------------- |
| `npm test` / `validate` (Tests) | **Ja — immer** | Tests oder Code fixen; ggf. Paket zurücksetzen |
| `npm run lint` (Errors)         | **Ja**         | Code oder ESLint-Config anpassen               |
| `npm run format:check`          | **Ja**         | `npm run format` ausführen                     |
| `npm run build`                 | **Ja**         | TypeScript-/Build-Fehler beheben               |

Lint-Warnungen blockieren `validate` nicht. ESLint-**Errors** müssen behoben werden.

## Voraussetzungen

- Node.js **>= 22** (`engines` in `package.json`)
- Dependencies installiert: `npm ci`
- Keine parallelen lokalen Dev-Server auf Port 5173

## Workflow

```
Major-Upgrade (ein Paket):
- [ ] Schritt 0: Migrationsplan laden oder anlegen
- [ ] Schritt 1: Nächstes offenes Paket wählen (max. 1)
- [ ] Schritt 2: Breaking Changes recherchieren
- [ ] Schritt 3: Upgrade durchführen
- [ ] Schritt 4: Migration im Code/Config
- [ ] Schritt 5: Frische Installation
- [ ] Schritt 6: Validierung (validate + build + dev smoke)
- [ ] Schritt 7: Plan aktualisieren; fertig oder nächstes Paket planen
```

### Schritt 0: Migrationsplan (Gate zuerst)

```bash
ls .cursor/plans/MAJOR-UPDATES-*-in-progress.md 2>/dev/null
```

**Falls `in-progress` existiert:**

- Plan-Datei lesen
- Nächstes Paket mit Status `open` wählen
- **Nicht** erneut `npm outdated` für Plan-Neuanlage
- **Nicht** neues Markdown erstellen — auch wenn User nur ein einzelnes Paket nennt

**Falls kein `in-progress` (Plan abgeschlossen oder erstmals):**

```bash
npm outdated
```

- Universelle Analyse aller `dependencies` + `devDependencies`
- Alle Major-Kandidaten in **eine** neue Plan-Datei aufnehmen
- Priorität festlegen (Peer-Deps, Sicherheit, Blocker zuerst)

### Schritt 1: Ein Paket wählen

- **Nur ein** Paket mit Status `open` oder `in-progress` bearbeiten
- In der Plan-Datei als `in-progress` markieren
- Alle anderen Major-Pakete **nicht** anfassen

### Schritt 2: Breaking Changes recherchieren

Vor dem Upgrade dokumentieren in der Plan-Datei:

- Changelog / Migration Guide (npm, GitHub Releases)
- Betroffene Dateien im Repo (`grep`, Imports, Config)
- Peer-Dependency-Anforderungen

### Schritt 3: Upgrade durchführen

Einzelnes Paket auf neue Major:

```bash
npm install <paket>@<neue-major-version>
# oder gezielt in package.json setzen, dann:
npm install
```

**Regeln:**

- Kein zweites Major-Paket in derselben Session committen/updaten
- `overrides`/`resolutions` nur mit Begründung im Plan — kein pauschaler Workaround

### Schritt 4: Migration

- Breaking Changes im Anwendungscode, Tests und Config beheben
- `.cursorrules` einhalten (Glassmorphism, Skeleton Loading, API-Guards, …)
- Fortschritt und offene Punkte in der Plan-Datei notieren

### Schritt 5: Frische Installation

```bash
rm -rf node_modules
npm ci
```

### Schritt 6: Validierung

Reihenfolge strikt einhalten. Bei Fehler: stoppen, beheben oder Upgrade rückgängig machen.

**6a — Vollständige Qualitätsprüfung** (Pflicht):

```bash
npm run validate
```

Bei `format:check`-Fehler: `npm run format` → erneut prüfen.

**6b — Production Build:**

```bash
npm run build
```

Optional: `npm run build:dev`, `npm run build:prd`

**6c — Dev-Server Smoke:**

```bash
npm run start:dev
# curl -sf -o /dev/null http://localhost:5173/
# Prozess beenden

# Alternativ:
npm run build && npm run preview
# curl http://localhost:4173/
```

**Nicht** in diesem Skill: `npm run test:e2e`

### Schritt 7: Plan aktualisieren und Abschluss

In der Plan-Datei für das bearbeitete Paket:

- Status → `done`
- Version `alt → neu`, Migrationsschritte, Validierung checklist

**Wenn noch `open`-Einträge existieren:**

- Plan `in-progress` lassen
- User informieren: nächstes Paket beim nächsten Durchlauf — **nicht** sofort das nächste Major starten

**Wenn alle Einträge `done` oder `blocked`:**

- Datei umbenennen: `MAJOR-UPDATES-<datum>-fertig.md`
- Abschlussbericht: Migration **fertig**
- Hinweis: Erst ab diesem Zeitpunkt ist eine **neue** universelle Analyse und ein neues Markdown erlaubt

## Bericht an den User

```markdown
## Major-Dependency-Update Bericht

### Migrationsplan

- Datei: `.cursor/plans/MAJOR-UPDATES-<datum>-<status>.md`
- Gesamtstatus: in-progress | **fertig**

### Dieser Durchlauf (1 Major)

- `paket`: `alt` → `neu`
- Breaking Changes: [Kurzfassung]
- Migration: [Was geändert wurde]

### Offen (nächste Durchläufe)

- `paket`: current → latest — [Grund/Priorität]

### Validierung

- [x] npm ci
- [x] npm run validate
- [x] npm run build
- [x] Dev-Server / Preview Smoke

### Hinweise

- [Peer-Deps, manuelle Follow-ups]
```

Wenn **fertig**: explizit schreiben, dass der Migrationsplan vollständig abgearbeitet ist — erst dann kann der Skill das Projekt erneut analysieren und einen neuen Plan anlegen.

Wenn **in-progress**: explizit schreiben, dass der bestehende Plan Vorrang hat und keine Neuanalyse stattfindet.

## Projekt-Referenz

| Bereich           | Pfad / Befehl                                          |
| ----------------- | ------------------------------------------------------ |
| Minor/Patch-Skill | `.cursor/skills/admin-fe-update-dependencies/SKILL.md` |
| Migrationspläne   | `.cursor/plans/MAJOR-UPDATES-*.md`                     |
| Scripts           | `package.json` → `validate`, `build`, `start:dev`      |
| Tests             | `src/**/__tests__/*`, `npm test`                       |
| CI                | `.github/workflows/firebase-deploy-dev.yml`            |
| Coding-Standards  | `.cursorrules`                                         |
| Test-Doku         | `CONSTITUTION.md`                                      |

## Fehlerbehebung

1. **Peer-Dependency-Konflikt** → Changelog/Peers des Major-Pakets prüfen; ggf. abhängige Pakete **separat** als eigenes Major in den Plan aufnehmen — nicht parallel upgraden
2. **Test-Failure** → Betroffenes Paket und Migration Guide; Tests anpassen, nicht deaktivieren
3. **Build-Failure (TypeScript)** → `@types/*`-Major ggf. als separates Plan-Item
4. **Upgrade nicht lösbar** → Paket in Plan auf `blocked` setzen, Begründung dokumentieren, Rollback; nächstes Paket **nicht** in derselben Session starten
5. **Lint-Errors (react-hooks v7 Compiler)** → Wie Minor-Skill: nur `rules-of-hooks` + `exhaustive-deps`; Compiler-Regeln nicht pauschal aktivieren

## Beispiel-Aufrufe

**User:** „Prüfe alle Dependencies auf Major-Upgrades."

Agent:

1. Gate: `MAJOR-UPDATES-*-in-progress.md` suchen
2. Falls vorhanden → Plan fortsetzen, **keine** Neuanalyse
3. Falls nicht → `npm outdated` für **alle** deps/devDeps → Plan mit **kompletter** Major-Liste anlegen
4. **Ein** Paket migrieren → validieren → Plan aktualisieren

**User:** „Bitte React auf die nächste Major upgraden." (Plan `in-progress` existiert bereits)

Agent:

1. Bestehenden Plan laden — **kein** neues Markdown, **kein** erneutes `npm outdated`
2. React nur bearbeiten, wenn in der Plan-Tabelle als `open`/`in-progress` geführt
3. Falls React nicht im Plan → User informieren: zuerst aktuellen Plan abarbeiten, dann Neuanalyse
4. **Nur React** in diesem Durchlauf migrieren → validieren → Plan aktualisieren
