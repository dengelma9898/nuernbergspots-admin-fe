# API Dokumentation

## Übersicht

Diese Dokumentation beschreibt alle API-Endpoints, die vom Nürnbergspots Admin Frontend verwendet werden.

## Base Configuration

- **Base URL**: Über `VITE_API_BASE_URL` Environment Variable konfiguriert
- **Authentication**: Bearer Token (Firebase Auth)
- **Content-Type**: `application/json` (Standard), `multipart/form-data` (File Uploads)

## Authentication

Alle API-Aufrufe erfordern einen gültigen Firebase Authentication Token im Authorization Header:

```
Authorization: Bearer <firebase-token>
```

## Response Format

Alle API-Responses folgen einem einheitlichen Format:

```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
```

## Business Management API

### GET /businesses

**Beschreibung**: Lädt alle Geschäfte
**Response**: `BusinessResponse[]`

### GET /businesses/:id

**Beschreibung**: Lädt ein spezifisches Geschäft
**Parameter**:

- `id`: Business ID
  **Response**: `BusinessResponse`

### POST /businesses

**Beschreibung**: Erstellt ein neues Geschäft
**Body**: `Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>`
**Response**: `BusinessResponse`

### PATCH /businesses/:id

**Beschreibung**: Aktualisiert ein Geschäft
**Parameter**:

- `id`: Business ID
  **Body**: `Partial<Business>`
  **Response**: `BusinessResponse`

### DELETE /businesses/:id

**Beschreibung**: Löscht ein Geschäft (Soft Delete)
**Parameter**:

- `id`: Business ID
  **Response**: `void`

### GET /businesses/pending-approvals/count

**Beschreibung**: Anzahl der Geschäfte, die auf Genehmigung warten
**Response**: `{ count: number }`

### GET /businesses/category/:categoryId

**Beschreibung**: Lädt Geschäfte nach Kategorie
**Parameter**:

- `categoryId`: Kategorie ID
  **Response**: `BusinessResponse[]`

### GET /businesses/nearby

**Beschreibung**: Lädt Geschäfte in der Nähe
**Query Parameters**:

- `latitude`: number
- `longitude`: number
- `radiusKm`: number
  **Response**: `BusinessResponse[]`

### PUT /businesses/:id/images

**Beschreibung**: Aktualisiert Geschäfts-Bilder
**Parameter**:

- `id`: Business ID
  **Body**: `{ imageUrls: string[] }`
  **Response**: `BusinessResponse`

### POST /businesses/:id/images

**Beschreibung**: Upload neue Geschäfts-Bilder
**Parameter**:

- `id`: Business ID
  **Body**: `FormData` mit `images` Files
  **Response**: `BusinessResponse`

### PUT /businesses/:id/logo

**Beschreibung**: Setzt Geschäfts-Logo
**Parameter**:

- `id`: Business ID
  **Body**: `{ logoUrl: string }`
  **Response**: `BusinessResponse`

### POST /businesses/:id/logo

**Beschreibung**: Upload Geschäfts-Logo
**Parameter**:

- `id`: Business ID
  **Body**: `FormData` mit `file`
  **Response**: `BusinessResponse`

### GET /businesses/customer-scans

**Beschreibung**: Lädt Kundenscans aller Geschäfte
**Response**: `BusinessCustomerScans[]`

## User Management API

### GET /users/business-users

**Beschreibung**: Lädt alle Business-Benutzer
**Response**: `User[]`

### GET /users/business-users/review-count

**Beschreibung**: Anzahl der Benutzer in Überprüfung
**Response**: `{ count: number }`

### GET /users/:id

**Beschreibung**: Lädt einen spezifischen Benutzer
**Parameter**:

- `id`: User ID
  **Response**: `User`

### PATCH /users/:id

**Beschreibung**: Aktualisiert einen Benutzer
**Parameter**:

- `id`: User ID
  **Body**: `Partial<User>`
  **Response**: `User`

### DELETE /users/:id

**Beschreibung**: Löscht einen Benutzer
**Parameter**:

- `id`: User ID
  **Response**: `void`

## Event Management API

### GET /events

**Beschreibung**: Lädt alle Veranstaltungen
**Response**: `Event[]`

### GET /events/:id

**Beschreibung**: Lädt eine spezifische Veranstaltung
**Parameter**:

- `id`: Event ID
  **Response**: `Event`

### POST /events

**Beschreibung**: Erstellt eine neue Veranstaltung
**Body**: `Omit<Event, 'id' | 'createdAt' | 'updatedAt'>`
**Response**: `Event`

### PATCH /events/:id

**Beschreibung**: Aktualisiert eine Veranstaltung
**Parameter**:

- `id`: Event ID
  **Body**: `Partial<Event>`
  **Response**: `Event`

### DELETE /events/:id

**Beschreibung**: Löscht eine Veranstaltung
**Parameter**:

- `id`: Event ID
  **Response**: `void`

### GET /events/categories

**Beschreibung**: Lädt alle Event-Kategorien
**Response**: `EventCategory[]`

### POST /events/:id/images

**Beschreibung**: Upload Event-Bilder
**Parameter**:

- `id`: Event ID
  **Body**: `FormData` mit `images` Files
  **Response**: `Event`

## Analytics API

### GET /analytics/business-performance

**Beschreibung**: Lädt Business-Performance Daten
**Query Parameters** (optional):

- `startDate`: ISO Date String
- `endDate`: ISO Date String
- `businessId`: Business ID
  **Response**: `BusinessAnalytics[]`

### GET /analytics/user-engagement

**Beschreibung**: Lädt Benutzer-Engagement Daten
**Response**: `UserEngagementData`

### GET /analytics/scan-statistics

**Beschreibung**: Lädt Scan-Statistiken
**Response**: `ScanStatistics`

## Contact Management API

### GET /contacts/requests

**Beschreibung**: Lädt alle Kontaktanfragen
**Response**: `ContactRequest[]`

### GET /contacts/requests/open/count

**Beschreibung**: Anzahl offener Kontaktanfragen
**Response**: `{ count: number }`

### GET /contacts/requests/:id

**Beschreibung**: Lädt eine spezifische Kontaktanfrage
**Parameter**:

- `id`: Request ID
  **Response**: `ContactRequest`

### PATCH /contacts/requests/:id

**Beschreibung**: Aktualisiert eine Kontaktanfrage
**Parameter**:

- `id`: Request ID
  **Body**: `Partial<ContactRequest>`
  **Response**: `ContactRequest`

## Job Management API

### GET /jobs/offers

**Beschreibung**: Lädt alle Stellenanzeigen
**Response**: `JobOffer[]`

### POST /jobs/offers

**Beschreibung**: Erstellt eine neue Stellenanzeige
**Body**: `Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>`
**Response**: `JobOffer`

### GET /jobs/categories

**Beschreibung**: Lädt alle Job-Kategorien
**Response**: `JobCategory[]`

## Keyword Management API

### GET /keywords

**Beschreibung**: Lädt alle Keywords
**Response**: `Keyword[]`

### POST /keywords

**Beschreibung**: Erstellt ein neues Keyword
**Body**: `Omit<Keyword, 'id'>`
**Response**: `Keyword`

### DELETE /keywords/:id

**Beschreibung**: Löscht ein Keyword
**Parameter**:

- `id`: Keyword ID
  **Response**: `void`

## Error Handling

### Standard Error Codes

- `400`: Bad Request - Ungültige Anfrage
- `401`: Unauthorized - Nicht authentifiziert
- `403`: Forbidden - Keine Berechtigung
- `404`: Not Found - Ressource nicht gefunden
- `409`: Conflict - Konflikt (z.B. Duplicate)
- `422`: Unprocessable Entity - Validierungsfehler
- `500`: Internal Server Error - Server-Fehler

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
}
```

## Rate Limiting

- Standard: 100 Requests pro Minute pro Benutzer
- File Uploads: 10 Requests pro Minute pro Benutzer
- Analytics: 50 Requests pro Minute pro Benutzer

## File Upload Constraints

- **Maximale Dateigröße**: 10MB pro Datei
- **Unterstützte Formate**: JPG, PNG, WebP
- **Maximale Anzahl**: 10 Dateien pro Request
