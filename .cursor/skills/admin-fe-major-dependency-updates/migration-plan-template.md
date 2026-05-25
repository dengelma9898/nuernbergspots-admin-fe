# Major Dependency Migrationsplan

**Projekt:** nuernbergspots-admin-fe  
**Erstellt:** YYYY-MM-DD  
**Status:** in-progress  
**Regel:** Maximal 1 Major-Upgrade pro Durchlauf  
**Analyse:** Alle `dependencies` + `devDependencies` aus `package.json` (universell)  
**Sperrregel:** Dieser Plan muss vollständig abgearbeitet sein (`fertig`), bevor der Skill erneut analysiert und ein neues Markdown anlegt

## Übersicht

| Paket             | Current | Target (Latest) | Status | Priorität |
| ----------------- | ------- | --------------- | ------ | --------- |
| `example-package` | 1.2.3   | 2.0.0           | open   | hoch      |

**Status-Werte:** `open` | `in-progress` | `done` | `blocked`

## Durchlauf-Protokoll

### YYYY-MM-DD — `paket-name` (Major X → Y)

**Status:** in-progress | done | blocked

#### Breaking Changes

- [ ] Punkt aus Changelog/Migration Guide

#### Betroffene Bereiche

- [ ] Datei/Modul — Kurzbeschreibung

#### Migrationsschritte

- [ ] Schritt 1
- [ ] Schritt 2

#### Validierung

- [ ] `npm ci`
- [ ] `npm run validate`
- [ ] `npm run build`
- [ ] Dev-Server / Preview Smoke

#### Notizen

- Peer-Dependencies, Rollback-Gründe, Follow-ups

---

## Abgeschlossen

<!-- Einträge hierher verschieben wenn done -->

## Blockiert

<!-- Pakete die nicht migriert werden konnten — mit Begründung -->

## Abschluss

<!-- Nur ausfüllen wenn alle Einträge done oder bewusst blocked sind -->

- **Fertig am:** YYYY-MM-DD
- **Ergebnis:** Alle geplanten Major-Upgrades migriert (oder dokumentiert blockiert)
