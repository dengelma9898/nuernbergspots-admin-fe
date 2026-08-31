# UX-Audit: Events-Liste (`/events`)

**Datum:** 30.08.2026  
**URL:** http://localhost:5173/events  
**Scope:** Fokussierter Seiten-Audit (nicht vollständige App-Battery)  
**Referenzen:** `.cursorrules` (Page-Fallbacks, Mobile-First, Skeleton), `CONSTITUTION.md`

---

## Persona

**Rolle:** Community-/Event-Managerin bei Nürnbergspots  
**Tech-Level:** Mittel — nutzt Admin täglich, kennt Fachbegriffe wie „Freigabe“, aber nicht interne Filter-Logik  
**Kontext:** Unter Zeitdruck, prüft Events auf Freigabe, bearbeitet CSV-Importe, erzeugt Social-Media-Bilder  
**Gerät:** Primär Desktop (1440×900), gelegentlich Handy unterwegs

**First-Time-User-Linse:** Eine neue Mitarbeiterin ohne Einweisung versteht die fünf Filter-Dropdowns und „Mehrfachauswahl“ nicht ohne Rückfragen.

---

```
═══════════════════════════════════════════════════════════
VERDICT: Fail

Persona: event-manager-nuernbergspots
Surfaces audited: 1 / 1 Route (+ Detail-Navigation kurz geprüft)
Interaction Manifest: complete (8 Kern-Interaktionen)

Hard Gates: console errors [0], warnings [0*], network 5xx [0*], 403/404 auth [0*],
  layout-collapse [0], axe Critical [1], axe Serious [1]
Performance (on /events): LCP [n/a nach Reload], FCP [0.57s], CLS [0] — Schwellen 4.0s / 0.25 / 500ms

Findings:
  Critical: 1    High: 5    Medium: 8    Low: 2

Self-critique pass: Drafted: 20  Kept: 16  Generic: 3  Duplicate: 1

Time per phase: Phase 3 ~8m / Total ~12m
Manifest plausibility: 8 entries, median gap ~15s, 6 Screenshots

TOP 5 (ranked by impact × ease):
  1. F-H1 — Filter umbenennen (Zeiträume-Doppelung) — größter Verständnis-Blocker
  2. F-H3 — Filter-Truncation auf Desktop beheben — sofort sichtbar kaputt
  3. F-C1 — axe Select-Trigger mit aria-label — Hard-Gate Critical
  4. F-M6 — Aktive Filter + „Alle zurücksetzen“ — Self-Service ohne Rätselraten
  5. F-M1 — Mehrfachauswahl-Icon von Bild-Icon trennen — verhindert Fehlklicks
═══════════════════════════════════════════════════════════
```

\* Console/Network nicht vollständig über DevTools-Stream ausgelesen; während der Interaktion keine sichtbaren Fehler oder Blocker beobachtet.

---

## Kurzfassung

Die Events-Seite ist **funktional solide** (Suche, URL-synchrone Filter, Skeleton, Monatsgruppierung, Bulk-Aktionen), aber **für neue Nutzer nicht selbsterklärend**. Das Hauptproblem sind **fünf Filter in einer Zeile mit überlappenden Begriffen** („Zeiträume“ zweimal, „Alle Events“ für Datums-Vollständigkeit) plus **abgeschnittene Labels** auf Desktop mit offener Sidebar. Accessibility-Hard-Gates (axe Critical/Serious) schlagen fehl. **Must-fix** vor dem „self-explanatory“-Anspruch: Filter-Beschriftungen, Truncation-Layout, a11y an Selects/Badges.

---

## Interaction Manifest — `/events`

```
Persona: Event-Managerin, mittleres Tech-Level, zeitgeknapp

[✓] 13:38:01 Seite geladen, Skeleton → Event-Grid (Screenshot: page-2026-08-30T11-38-14)
[✓] 13:38:20 Suche „Weihnachtsmarkt“ getippt → URL ?q=…, Empty-State „Keine Events gefunden“
[✓] 13:38:35 Status-Filter geöffnet → Optionen: Vergangen/Laufend/Zukünftig
[✓] 13:38:42 „Zukünftige Events“ gewählt → URL ?status=future, Liste gefiltert
[✓] 13:39:05 Mehrfachauswahl → Header wechselt, Banner „Auswahlmodus aktiv…“
[✓] 13:39:12 Datums-Filter geöffnet → „Alle Events / Mit Datum / Ohne Datum“ (Label unklar)
[✓] 13:39:30 Abbrechen → Normalmodus wiederhergestellt
[✓] 13:39:50 Details-Klick → Navigation zu /events/:id?status=future (Round-Trip Filter in URL erhalten)
```

---

## Was gut funktioniert

| Bereich               | Beobachtung                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| **Ladezustand**       | `EventListSkeleton` statt leerem Screen — entspricht `.cursorrules`             |
| **Struktur**          | Monatsgruppierung (`Dezember 2026`, …) gibt Orientierung                        |
| **Suche**             | Placeholder „Nach Event-Namen suchen…“ ist klar; URL-Param `q`                  |
| **Filter-Persistenz** | Filter in URL (`status`, `approval`, `category`, …) — teilbar & bookmarkbar     |
| **Karten-Inhalt**     | Titel, Datum, Kategorie-Badge, Status, Ort, Aktionen pro Event                  |
| **Bulk-Flow**         | Auswahlmodus mit Banner-Hinweis „Nur aktuelle und zukünftige Events auswählbar“ |
| **Mobile**            | Filter volle Breite, keine horizontale Overflow bei 375px                       |
| **Primary CTA**       | „Event hinzufügen“ visuell hervorgehoben                                        |

---

## Filter & Optionen — Kontext fehlt (Kernthema)

Die Seite hat **fünf Dropdowns neben der Suche**. Für erfahrene Nutzer ok, für Erstnutzer verwirrend:

| Aktuelles Label             | Was es wirklich tut                                            | Problem                                                | Empfohlene Bezeichnung                                                          |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Alle Zeiträume (Status)** | Filtert nach Event-**Laufzeit**: vergangen / läuft / zukünftig | Wort „Zeiträume“ kollidiert mit Kalender-Filter        | **„Event-Status“** — Optionen: „Alle · Beendet · Läuft · Kommend“               |
| **Alle Freigaben**          | Moderation: ausstehend vs. freigegeben                         | „Freigegeben“ vs. Event-Status „Kommend“ verwechselbar | **„Moderation“** — „Alle · Ausstehend · Freigegeben“ + Kurz-Hinweis im Dropdown |
| **Alle Kategorien**         | App-Event-Kategorie                                            | Ok                                                     | Beibehalten; „Ohne Kategorie“ ist gut                                           |
| **Alle Zeiträume**          | Kalender-**Eingrenzung**: KW oder Monat                        | Zweites „Zeiträume“ — Hauptursache Verwirrung          | **„Zeitraum eingrenzen“** — „Gesamt · Kalenderwoche · Monat“                    |
| **Alle Events**             | Ob Event ein **Datum** hat oder nicht                          | „Alle Events“ auf einer Event-Liste ist tautologisch   | **„Datumsangabe“** — „Alle · Mit Datum · Nur Monat/ohne Tag · Ohne Datum“       |

**Zusätzlich:** Placeholder in Code (`Zeitraum-Status`, `Datum filtern`) werden in der UI **nicht** gezeigt, weil der Default-Wert `all` als langer SelectItem-Text gerendert wird — siehe `EventListFilters.tsx` Zeilen 67–137.

---

## Findings (priorisiert)

### F-C1 · Critical · Accessibility · Select-Trigger ohne Namen

- **Surface:** `/events`, Desktop 1440×900
- **Reproduce:** axe-core injizieren → `button-name` Critical (5× `[role=combobox]` / SelectTrigger)
- **Observed:** Screenreader sieht Buttons ohne zuverlässigen accessible name
- **Expected:** Jeder Filter hat `aria-label` passend zum Placeholder
- **Evidence:** axe `button-name`, Targets u. a. SelectTrigger in `EventListFilters.tsx`
- **Suspected location:** `src/components/events/EventListFilters.tsx:67-138`
- **Smallest patch:** Pro `SelectTrigger` explizites `aria-label`, z. B. `aria-label="Event-Status filtern"`; Default-Optionen kürzen (s. F-H1)

---

### F-H1 · High · Interaction · Doppeltes „Zeiträume“

- **Persona:** Neue Mitarbeiterin wählt falschen Filter
- **Reproduce:** Seite öffnen → beide Dropdowns „Zeiträume“ vergleichen
- **Observed:** Zwei semantisch verschiedene Dimensionen, gleiches Wort
- **Expected:** Eindeutige Labels (s. Tabelle oben)
- **Suspected location:** `EventListFilters.tsx:67-111`
- **Smallest patch:** SelectItem-Texte + Placeholder umbenennen; optional `Label`-Komponente links neben jeder Gruppe statt nur Trigger-Text

---

### F-H2 · High · Interaction · „Alle Events“ = Datums-Vollständigkeit

- **Reproduce:** Fünftes Dropdown öffnen → „Mit Datum / Ohne Datum“
- **Observed:** Label suggeriert „alle Events in der Liste“, nicht „Hat Event ein Datum?“
- **Expected:** Klare Datums-Vollständigkeits-Filter
- **Suspected location:** `EventListFilters.tsx:129-137`, `useEventListFilters.ts:23`
- **Smallest patch:** Trigger-Placeholder `Datumsangabe filtern`, Optionen wie oben; Tooltip: „Events ohne festes Datum finden (z. B. Monats-Events)“

---

### F-H3 · High · Visual · Filter-Labels abgeschnitten (Desktop + Sidebar)

- **Surface:** 1440×900, Sidebar expanded
- **Reproduce:** `/events` mit Standard-Filtern — Trigger zeigen „Alle Zeiträume (St…“, „Alle Frei…“, „Mehrfachauswah…“
- **Observed:** Text truncation in schmaler Filter-Zeile trotz viel Leerraum rechts
- **Expected:** Volle Labels lesbar oder Filter in zweite Zeile / Filter-Panel
- **Evidence:** Screenshots `page-2026-08-30T11-38-37`, `11-39-23`
- **Suspected location:** `EventListFilters.tsx:57` (`flex-row` + feste `w-[180px]`), `EventListHeader.tsx:75`
- **Smallest patch:** `flex-wrap`, Trigger `min-w-0` + `truncate` mit `title`, oder Filter unter Suche in 2-Zeilen-Grid (`grid-cols-2 lg:grid-cols-3`)

---

### F-H4 · High · Accessibility · Kontrast Kategorie-Badge

- **Reproduce:** axe → `color-contrast` Serious auf `<span class="truncate">Kultur</span>`
- **Observed:** Weißer Text auf hellem Kategorie-Hintergrund
- **Expected:** WCAG AA Kontrast
- **Suspected location:** `EventListCard.tsx:302-308` (`color: '#fff'` fix)
- **Smallest patch:** Kontrastfarbe aus `category.colorCode` berechnen (hell/dunkel Text) oder Badge mit `border` + dunklem Text statt Vollfläche

---

### F-H5 · High · Feedback · Leerer Zustand ohne nächsten Schritt

- **Reproduce:** Suche ohne Treffer (z. B. „Weihnachtsmarkt“)
- **Observed:** Nur „Keine Events gefunden.“ — kein Hinweis auf aktive Filter, kein CTA
- **Expected:** `.cursorrules` Page-Fallbacks: Erklärung + Handlung (Filter zurücksetzen / Event anlegen)
- **Suspected location:** `EventList.tsx:180-188`
- **Smallest patch:** Empty-State mit „0 Treffer für ‚…‘“, Button „Filter zurücksetzen“, Link „Event hinzufügen“

---

### F-M1 · Medium · Interaction · Mehrfachauswahl = Bild-Icon

- **Observed:** `Mehrfachauswahl` und `Bild generieren` nutzen beide `ImageIcon`
- **Expected:** Auswahl = Checkbox/List-Icon
- **Suspected location:** `EventListHeader.tsx:129`
- **Smallest patch:** `CheckSquare` oder `Layers` für Mehrfachauswahl

---

### F-M2 · Medium · Interaction · „Bild generieren“ undecipherable

- **Observed:** Öffnet `/events/image-editor` mit ausgewählten Events — ohne Erklärung
- **Expected:** Kurzbeschreibung oder Tooltip
- **Suspected location:** `EventListHeader.tsx:105-112`, `useEventBulkSelection.ts:90-108`
- **Smallest patch:** Label „Social-Bild erstellen“ + `title="Ausgewählte Events im Bild-Editor öffnen"`

---

### F-M4 · Medium · Interaction · CSV Export Scope unklar

- **Observed:** Exportiert `displayFilteredEvents`, Toast nennt Anzahl — aber Button-Label nicht
- **Expected:** Nutzer weiß: nur sichtbare/filterbare Events
- **Suspected location:** `EventList.tsx:98-116`, `EventListHeader.tsx:141-148`
- **Smallest patch:** „CSV Export (gefiltert)“ oder Subtext unter Button

---

### F-M5 · Medium · Visual · „Promoted“ auf Deutsch

- **Observed:** Badge „Promoted“ / „Promoted Event“ auf Karten
- **Expected:** Durchgängig Deutsch, z. B. „Hervorgehoben“
- **Suspected location:** `EventListCard.tsx:245-266, 362-366`
- **Smallest patch:** String ersetzen

---

### F-M6 · Medium · Interaction · Keine Filter-Zusammenfassung / Reset

- **Observed:** `?status=future` aktiv, aber kein Chip „Status: Zukünftig ✕“
- **Expected:** Aktive Filter sichtbar + „Alle Filter zurücksetzen“
- **Suspected location:** `EventListFilters.tsx`, `useEventListFilters.ts`
- **Smallest patch:** Chip-Leiste unter Filtern; Reset setzt alle Params + `q` zurück

---

### F-M7 · Medium · Mobile · Header frisst Viewport

- **Surface:** 375×812
- **Observed:** 5 volle Breite Buttons + Suche + 5 Filter, bevor erste Karte sichtbar
- **Expected:** Mobile-first: Primary CTA + Overflow-Menü für Sekundäraktionen
- **Evidence:** Screenshot `page-2026-08-30T11-39-48`
- **Smallest patch:** `DropdownMenu` „Mehr“ für CSV Import/Export/Aktualisieren/Mehrfachauswahl

---

### F-M8 · Medium · Interaction · Pending-Badge nicht klickbar

- **Observed:** Badge „X ausstehend“ im Header bei `pendingModerationCount`
- **Expected:** Klick setzt `approval=pending` Filter
- **Suspected location:** `EventListHeader.tsx:67-74`, `EventList.tsx:132-149`
- **Smallest patch:** Badge als Button mit `onClick={() => setApprovalFilter('pending')}`

---

### F-M9 · Medium · Interaction · Icon-only Aktionen auf Karten

- **Observed:** Kopieren nur Icon; Löschen mit Text — inkonsistent
- **Expected:** Gleiche Erkennbarkeit oder einheitlich Icon + sr-only (Copy hat nur `title`)
- **Suspected location:** `EventListCard.tsx:454-467`
- **Smallest patch:** `aria-label="Event kopieren"` (falls axe auf Copy zielt) oder sichtbares „Kopieren“

---

### F-C2 · Medium · Architecture · Keine Virtualisierung bei vielen Events

- **Observed:** Hunderte Karten gleichzeitig im DOM (~1500+ interaktive Nodes)
- **Expected:** Flüssiges Scrollen auch bei 1000+ Events
- **Suspected location:** `EventListMonthGroup.tsx:40-58`
- **Smallest patch:** `@tanstack/react-virtual` oder Pagination („50 pro Seite“)

---

### F-L1 · Low · Navigation · Doppelte Zurück-Navigation

- **Observed:** Pfeil „Zurück zum Dashboard“ + Breadcrumb `Dashboard > Events`
- **Smallest patch:** Pfeil entfernen oder auf `navigate(-1)` / letzte Filter-URL

---

### F-L2 · Low · Visual · Auswahl-Banner truncated

- **Observed:** „Auswahlmodus aktiv – Nur aktuelle und…“ abgeschnitten
- **Suspected location:** `EventListSelectionBanner.tsx:20-28`
- **Smallest patch:** `flex-wrap`, kürzerer Text oder Icon-only auf schmal

---

## Perfection Roadmap

### Quick Wins (24–48 h)

1. Filter umbenennen (F-H1, F-H2)
2. `aria-label` an SelectTriggers (F-C1)
3. Mehrfachauswahl-Icon tauschen (F-M1)
4. „Promoted“ → „Hervorgehoben“ (F-M5)
5. Empty-State mit Reset-CTA (F-H5)
6. Filter `flex-wrap` / zweite Zeile (F-H3)

### Structural (1–2 Wochen)

1. Aktive Filter-Chips + Reset (F-M6)
2. Kategorie-Badge Kontrastlogik (F-H4)
3. Mobile Header als Overflow-Menü (F-M7)
4. Klickbarer Pending-Badge (F-M8)

### Advanced Polish (post-launch)

1. List-Virtualisierung (F-C2)
2. Inline-Hilfe unter Filterzeile (collapsible „Was bedeuten die Filter?“)
3. Playwright Killer-Flows für Filter-URL-Sync und Empty-State

---

## Hold this in your hands

Die Events-Seite fühlt sich an wie ein **Werkzeugkasten, dessen Etiketten halb abgerubbelt sind**: unter der Haube ist viel drin (Suche, URL-Filter, Bulk-Bildeditor, CSV), aber man muss raten, welcher Schalter „Zeiträume“ gemeint ist und warum der Bild-Button plötzlich Mehrfachauswahl heißt. Mit klareren Namen, sichtbaren aktiven Filtern und einem Layout, das Labels nicht abschneidet, wäre das ein Admin-Panel, dem man auch nach Monaten Pause noch selbstbewusst die Hand anvertraut — jetzt eher ein Panel für Leute, die schon einmal eingewiesen wurden.

---

## Fix-and-verify

**16 Findings** (1 Critical, 5 High). Soll ich die Quick Wins (Filter-Labels, aria-labels, Empty-State, Icon-Fix) direkt im Code umsetzen und erneut verifizieren?

---

## Re-Verifikation (30.08.2026, nach Quick Wins)

**Umgesetzt:**

| Finding                    | Status                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| F-H1 Filter umbenennen     | ✓ Event-Status, Moderation, Zeitraum eingrenzen, Datumsangabe       |
| F-H3 Filter-Truncation     | ✓ flex-wrap + zweite Zeile; keine abgeschnittenen Labels bei 1440px |
| F-C1 axe Select aria-label | ✓ `button-name` Critical behoben (0 Violations)                     |
| F-H5 Empty-State + Reset   | ✓ Kontexttext + „Filter zurücksetzen“ + „Event hinzufügen“          |
| F-M1 Mehrfachauswahl-Icon  | ✓ CheckSquare statt ImageIcon                                       |
| F-M5 Promoted → Deutsch    | ✓ „Hervorgehoben“ / „Hervorgehobenes Event“                         |

**Validate:** `npm run validate` grün (2058 Tests passed)

**Verbleibend (nicht Teil Quick Wins):**

- F-H4 axe `color-contrast` Serious (Kategorie-Badges) — Hard-Gate weiterhin rot
- F-M6 Filter-Chips, F-M7 Mobile-Overflow-Menü, F-M8 Pending-Badge klickbar, F-C2 Virtualisierung

**Neues Verdict nach Quick Wins:** Conditional Pass (Critical behoben; ein Serious a11y-Thema offen)
