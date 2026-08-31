# Backend-Spec: Events Admin-Liste (Pagination & Filter)

**Stand:** 31.08.2026  
**Implementiert im Backend:** `GET /events` (paginierter Modus, siehe `backend/CONSTITUTION.md` §5.6)  
**Kontext:** Admin-FE `/events`  
**Ziel:** Server liefert nur relevante Daten → schnellerer Load, weniger Memory, Filter ohne Main-Thread-Block

---

## Problem

| Heute                                 | Auswirkung                   |
| ------------------------------------- | ---------------------------- |
| `GET /events` liefert **alle** Events | ~3.900 Objekte pro Request   |
| `GET /events/pending` zusätzlich      | Doppelter Merge im Client    |
| Filter in `filterEvents()` (FE)       | O(n) bei jedem Filterwechsel |

Virtualisierung im FE ist erledigt (DOM ok). **Nächster Engpass: Datenmenge.**

---

## Vorschlag

### Endpoint (implementiert)

```
GET /events?page=1&limit=50&…
```

Zusätzlich: `GET /events/count`, `GET /events/export` (CSV, nur Admin).

**Auth:** `admin` / `super_admin` (wie `/events/pending`)

---

## Query-Parameter

1:1 zu bestehenden FE-URL-Params (`useEventListFilters`):

| Param      | Werte                                            | Bedeutung                                            |
| ---------- | ------------------------------------------------ | ---------------------------------------------------- |
| `q`        | string                                           | Titelsuche (case-insensitive, contains)              |
| `status`   | `past` \| `running` \| `future`                  | Laufzeit-Status (aus `dailyTimeSlots` / `monthYear`) |
| `approval` | `pending` \| `active`                            | Moderation (`status === PENDING` vs. sonst)          |
| `category` | UUID \| `no-category`                            | Kategorie-Filter                                     |
| `date`     | `with-date` \| `no-date`                         | Hat Datum vs. ohne                                   |
| `time`     | `week` \| `month`                                | Zeitraum-Modus                                       |
| `week`     | `1`–`53`                                         | Kalenderwoche (nur wenn `time=week`)                 |
| `month`    | `yyyy-MM`                                        | Monat (nur wenn `time=month`)                        |
| `page`     | number (default `1`)                             | Seite                                                |
| `limit`    | number (default `50`, max `100`)                 | Seitengröße                                          |
| `sort`     | `startDate` \| `updatedAt` (default `startDate`) | Sortierung                                           |
| `order`    | `asc` \| `desc` (default `desc`)                 | Richtung                                             |

**Status-Logik** (wie FE `filterEvents`):

- `past`: letzter Slot/Monat in der Vergangenheit
- `running`: heute zwischen erstem und letztem Slot
- `future`: erster Slot/Monat in der Zukunft
- Events ohne Datum: nur bei `status` leer/`all` — sonst ausschließen

**Moderation:** Pending-Events in dieselbe Liste integrieren (nicht separater Merge im FE).

---

## Response

```json
{
  "data": [/* Event[] — bestehendes Event-Schema */],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 3847,
    "totalPages": 77,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "facets": {
    "pendingCount": 12,
    "monthOptions": [{ "key": "2026-08", "label": "August 2026" }]
  }
}
```

### `facets` (optional, Phase 2)

| Feld           | Zweck                                         |
| -------------- | --------------------------------------------- |
| `pendingCount` | Badge im Header — kein `events.filter()` mehr |
| `monthOptions` | Monats-Dropdown — kein Scan aller Slots im FE |

---

## Zusatz-Endpoints

| Endpoint                                   | Zweck                                                    |
| ------------------------------------------ | -------------------------------------------------------- |
| `GET /events/admin/count?approval=pending` | Nur Zähler (leichtgewichtig)                             |
| `GET /events/admin/export?…`               | CSV mit gleichen Filtern (async/stream für große Mengen) |

`GET /events` und `GET /events/pending` **beibehalten** (Abwärtskompatibilität). Admin-FE stellt schrittweise um.

---

## Akzeptanzkriterien

- [ ] `GET /events/admin?limit=50` < **500 ms** p95 bei ~4.000 Events
- [ ] Alle Filter kombinierbar, Ergebnis = aktuelles FE-Verhalten
- [ ] `total` korrekt bei allen Filter-Kombinationen
- [ ] Pending-Events für Admins sichtbar, für normale User 403 auf `/admin`
- [ ] Pagination stabil bei Sortierung nach `startDate` (keine Duplikate/Lücken beim Blättern)
- [ ] Bestehende `Event`-Response unverändert (kein Breaking Change)

---

## Phasen

### Phase 1 — MVP (blockiert FE-Umstellung)

- `GET /events/admin` mit Pagination + allen Filtern
- `meta.total`, `meta.hasNextPage`
- Pending in Ergebnis integriert

### Phase 2 — Komfort

- `facets.pendingCount`, `facets.monthOptions`
- `GET /events/admin/export`

### Phase 3 — Optional

- Cursor-basierte Pagination (`cursor` statt `page`) für sehr große Datenmengen
- Volltext-Index auf `title` + `description`

---

## FE-Integration (nach Backend)

1. `eventService.getEventsList(params)` — ersetzt `getEvents()` + `getPendingEvents()` auf `/events`
2. URL-Params 1:1 an API durchreichen
3. Client-`filterEvents()` entfernen — nur noch Anzeige + Virtualisierung
4. `getMonthOptions()` → `facets.monthOptions`
5. Infinite Scroll oder „Mehr laden" statt alle Seiten auf einmal

**Bestehende URL-Struktur bleibt:** `?q=…&status=future&approval=pending&page=2`

---

## Offene Fragen ans Backend

1. Index auf `title`, `categoryId`, `status`, Startdatum vorhanden/planbar?
2. `sort=startDate` — welches Feld bei `monthYear`-only Events?
3. Export als Sync-Response oder Job + Download-URL?
