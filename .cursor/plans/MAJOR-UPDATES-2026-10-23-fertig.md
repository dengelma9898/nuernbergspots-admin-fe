# Major Dependency Migrationsplan

**Projekt:** nuernbergspots-admin-fe  
**Erstellt:** 2026-10-23  
**Abgeschlossen:** 2026-10-23  
**Status:** fertig  
**Regel:** Maximal 1 Major-Upgrade pro Durchlauf  
**Analyse:** Alle `dependencies` + `devDependencies` aus `package.json` (universell)  
**Sperrregel:** Dieser Plan muss vollständig abgearbeitet sein (`fertig`), bevor der Skill erneut analysiert und ein neues Markdown anlegt

## Übersicht

| Paket      | Current | Target (Latest) | Status | Priorität |
| ---------- | ------- | --------------- | ------ | --------- |
| `firebase` | 12.19.0 | 13.1.0          | done   | hoch      |

**Status-Werte:** `open` | `in-progress` | `done` | `blocked`

## Analyse-Hinweis (2026-10-23)

Universelle Analyse nach Abschluss von `MAJOR-UPDATES-2026-09-14-fertig.md`:

```bash
npm outdated
npx npm-check-updates
```

**Ergebnis:** 1 Major-Kandidat in `dependencies` (`firebase`). Keine Major-Kandidaten in `devDependencies`.

_Hinweis `jsdom`:_ `npm outdated` meldet `30.1.3 → 29.1.1 (Latest)`. Das ist kein Upgrade, sondern ein veralteter Registry-Cache-Eintrag (`npm view jsdom dist-tags` → `latest: 30.1.3`). Kein Major-Kandidat.

Alle übrigen Pakete haben nur Minor/Patch-Updates (Minor/Patch-Skill).

## Durchlauf-Protokoll

### 2026-10-23 — `firebase` (Major 12 → 13)

**Status:** done

#### Breaking Changes (firebase 13.0.0, 2026-10-07)

Alle Breaking Changes betreffen ausschließlich **AI Logic** (`firebase/ai`):

- [x] `TemplateGenerativeModel.generateContent/generateContentStream` nehmen ein `TemplateRequest`-Objekt — `firebase/ai` im Projekt nicht genutzt
- [x] `VertexAIBackend` / `BackendType.VERTEX_AI` entfernt (→ `AgentPlatformBackend`) — nicht genutzt
- [x] `Part` als Discriminated Union, `UnknownPart` — nicht genutzt
- [x] `ChatSession` Interface statt Klasse; entfernte deprecated APIs (`AI.location`, `LiveSession.sendMediaChunks` …) — nicht genutzt
- Minor: Firestore BSON-Typen, Remote-Config-Fix, Auth-Fix (persistierter User bei `auth/quota-exceeded`) — kein Handlungsbedarf

#### Betroffene Bereiche

- [x] `src/lib/firebase.ts` — nutzt `firebase/app`, `firebase/auth` (API unverändert)
- [x] `src/contexts/AuthContext.tsx` — nutzt `firebase/auth` (API unverändert)
- [x] `package.json` — `firebase` auf `^13.1.0`

#### Migrationsschritte

- [x] `npm install firebase@^13.1.0`
- [x] `rm -rf node_modules && npm ci`

#### Validierung

- [x] `npm ci`
- [x] `npm run validate`
- [x] `npm run build`
- [x] Dev-Server / Preview Smoke

#### Notizen

- Peer-Dependencies: keine Konflikte.
- `npm run validate`: 107 Testdateien / 2225 Tests bestanden (9 skipped), 0 Lint-Errors.
- `npm run build` erfolgreich; Preview Smoke `http://localhost:4173/` → HTTP 200.

---

## Abgeschlossen

- `firebase` 12.19.0 → 13.1.0 (2026-10-23)

## Blockiert

_Keine._

## Abschluss

- **Fertig am:** 2026-10-23
- **Ergebnis:** Alle geplanten Major-Upgrades migriert
