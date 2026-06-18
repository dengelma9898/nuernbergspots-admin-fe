# Major Dependency Migrationsplan

**Projekt:** nuernbergspots-admin-fe  
**Erstellt:** 2026-05-29  
**Status:** fertig  
**Regel:** Maximal 1 Major-Upgrade pro Durchlauf  
**Analyse:** Alle `dependencies` + `devDependencies` aus `package.json` (universell)  
**Sperrregel:** Dieser Plan muss vollständig abgearbeitet sein (`fertig`), bevor der Skill erneut analysiert und ein neues Markdown anlegt

## Übersicht

| Paket | Current | Target (Latest) | Status | Priorität |
| ----- | ------- | --------------- | ------ | --------- |
| —     | —       | —               | —      | —         |

**Keine Major-Kandidaten** — siehe Analyse-Hinweis unten.

**Status-Werte:** `open` | `in-progress` | `done` | `blocked`

## Analyse-Hinweis (2026-05-29)

Universelle Analyse nach Abschluss von `MAJOR-UPDATES-2026-05-25-fertig.md`:

```bash
npm outdated
npx npm-check-updates
```

**Ergebnis:** Kein Paket in `dependencies` oder `devDependencies` hat eine **Latest**-Version mit anderer **Major** als **Current**. Alle Einträge sind Minor- oder Patch-Upgrades innerhalb des installierten Major.

| Paket                     | Current | Latest  | Art   |
| ------------------------- | ------- | ------- | ----- |
| `@tanstack/react-virtual` | 3.13.25 | 3.13.26 | Patch |
| `eslint`                  | 10.4.0  | 10.4.1  | Patch |
| `firebase`                | 12.13.0 | 12.14.0 | Minor |
| `lucide-react`            | 1.16.0  | 1.17.0  | Minor |
| `react-router-dom`        | 7.15.1  | 7.16.0  | Minor |
| `typescript-eslint`       | 8.59.4  | 8.60.0  | Minor |

Minor/Patch-Updates gehören zum Skill [admin-fe-update-dependencies](../skills/admin-fe-update-dependencies/SKILL.md), nicht zu diesem Major-Plan.

## Durchlauf-Protokoll

### 2026-05-29 — Kein Major-Upgrade erforderlich

**Status:** done (Analyse-only)

#### Breaking Changes

- Keine — kein Paket zur Migration ausgewählt.

#### Migrationsschritte

- [x] Gate: kein `*-in-progress.md` vorhanden
- [x] `npm outdated` + `npx npm-check-updates` für alle deps/devDeps
- [x] Plan angelegt und sofort abgeschlossen (0 offene Major-Einträge)

#### Validierung

Kein Paket-Upgrade in diesem Durchlauf — bestehende Installation unverändert:

- [x] Projekt bereits auf letztem Major-Stand (vgl. Plan 2026-05-25: `eslint` 9→10)
- [ ] `npm ci` — nicht erforderlich (keine Änderung)
- [ ] `npm run validate` — nicht erforderlich (keine Änderung)
- [ ] `npm run build` — nicht erforderlich (keine Änderung)

#### Notizen

- Nächste Major-Analyse erst nach Bedarf / wenn neue Majors erscheinen — dann neuer `MAJOR-UPDATES-*-in-progress.md` nach Gate-Regel.
- Für verfügbare Minor/Patch: `admin-fe-update-dependencies` Skill nutzen.

---

## Abgeschlossen

- **2026-05-29** — Universelle Analyse: 0 Major-Kandidaten

## Blockiert

<!-- keine -->

## Abschluss

- **Fertig am:** 2026-05-29
- **Ergebnis:** Keine Major-Upgrades offen. Projekt-Dependencies sind auf dem jeweiligen Latest-Major; 6 Pakete haben nur Minor/Patch-Updates verfügbar.
