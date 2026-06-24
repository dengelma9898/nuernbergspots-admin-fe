---
name: Ponytail Phase 4 — API-Response-Layer
overview: 'Eliminiert unwrapData()-Boilerplate: ApiClient entpackt { data: T }-Envelopes; apiUtils.ts wird entfernt. Alle Services, LocationSearch und Jest-Mocks migrieren. Voraussetzung: Phase 3. Verifikation: npm run test && npm run build && npm run start:dev.'
todos:
  - id: design-unwrap-strategy
    content: 'Strategie: getData/postData-Methoden vs. automatisches Unwrap in bestehenden Methoden festlegen'
    status: pending
  - id: extend-api-client
    content: 'ApiClient um Envelope-Unwrap erweitern (nur { data: T }, Rest unverändert)'
    status: pending
  - id: migrate-services
    content: 'Alle src/services/* + LocationSearch.tsx: unwrapData/ApiResponse-Imports entfernen'
    status: pending
  - id: migrate-test-mocks
    content: 'jest.mock apiUtils in Service-Tests und LocationSearch.test entfernen/anpassen'
    status: pending
  - id: delete-api-utils
    content: 'src/lib/apiUtils.ts löschen'
    status: pending
  - id: verify-phase4
    content: 'npm run test && npm run build && npm run start:dev; Listen-Seiten laden Daten'
    status: pending
isProject: false
---

# Plan: Ponytail Phase 4 — API-Response-Layer vereinfachen

**Master-Plan:** [PONYTAIL-AUDIT-in-progress.md](./PONYTAIL-AUDIT-in-progress.md)  
**Vorgänger:** [ponytail_phase3_api_errors.plan.md](./ponytail_phase3_api_errors.plan.md)  
**Nachfolger:** [ponytail_phase5_wrappers.plan.md](./ponytail_phase5_wrappers.plan.md)

## Ziel

`unwrapData(response)` in 25+ Services durch zentrale Logik im `ApiClient` ersetzen.

## Verifikation (Pflicht)

```bash
npm run test
npm run build
npm run start:dev
```

Manuell: Events-, Businesses- und News-Listen laden Daten korrekt.

---

## 1. Design-Entscheidung

**Empfohlen:** Explizite Methoden (klarer als Magic für alle Responses):

```ts
async getData<T>(endpoint: string): Promise<T>
async postData<T>(endpoint: string, body: unknown, options?): Promise<T>
// analog patchData, putData, deleteData
```

- Intern: `const json = await response.json(); return json.data as T`
- Bestehende `get<T>()` etc. **behalten** für Raw-Responses (z. B. wenn kein Envelope).

**Alternative:** Option `{ unwrap: true }` an bestehende Methoden — nur wenn weniger Call-Site-Änderungen.

---

## 2. Betroffene Dateien

### Services (alle mit `unwrapData`)

```
src/services/*.ts  (25 Dateien)
```

Auszug: `eventService`, `businessService`, `newsService`, `userService`, `curatedSpotService`, …

### Komponenten

- [`src/components/ui/LocationSearch.tsx`](../../src/components/ui/LocationSearch.tsx)

### Zu löschen

- [`src/lib/apiUtils.ts`](../../src/lib/apiUtils.ts)

### Test-Mocks entfernen

Grep: `jest.mock('../../lib/apiUtils')` bzw. `@/lib/apiUtils` in:

- `src/services/__tests__/*.test.ts`
- `src/components/ui/__tests__/LocationSearch.test.tsx`

---

## 3. Migrations-Muster

**Vorher:**

```ts
const response = await api.get<ApiResponse<Event[]>>(endpoints.events);
return unwrapData(response);
```

**Nachher:**

```ts
return api.getData<Event[]>(endpoints.events);
```

Spezialfälle beibehalten:

- `eventService` CSV-Import mit explizitem Cast
- `legalDocumentService` mit Array-Fallback
- Endpoints die **kein** `{ data }` zurückgeben → weiter `get<T>()` nutzen

---

## 4. Reihenfolge der Umsetzung

1. `ApiClient` erweitern + Unit-Verhalten via bestehende Service-Tests absichern
2. Services in einem Durchgang migrieren (ein Commit)
3. `apiUtils.ts` löschen
4. `grep -r "apiUtils\|unwrapData" src/` → 0 Treffer

---

## Erfolgskriterien

- Kein Import von `apiUtils` / `unwrapData` in `src/`
- Alle Service-Tests grün
- API-Fehlerstruktur (`error.response.data`) unverändert — nur Envelope-Handling wandert
