# Phase 2: Konkrete Implementierungsdetails

## Übersicht

Phase 2 umfasst drei Hauptaufgaben:
1. **Retry-Mechanismus für Netzwerkfehler**
2. **Kontext-spezifische Fehlermeldungen**
3. **Erfolgsmeldungen verbessern**

---

## Aufgabe 1: Retry-Mechanismus für Netzwerkfehler

### Was wird implementiert?

**Ziel:** Bei Netzwerkfehlern soll ein Retry-Button angezeigt werden, damit der User die Aktion erneut versuchen kann.

**Vorher:**
```typescript
catch (error) {
  showUserFriendlyError(error, toast);
  // User sieht Fehlermeldung, aber keine Möglichkeit zum Retry
}
```

**Nachher:**
```typescript
catch (error) {
  const friendlyError = getUserFriendlyError(error);
  if (friendlyError.isRetryable) {
    // Zeige Toast mit Retry-Button
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      action: {
        label: 'Erneut versuchen',
        onClick: () => retryAction()
      }
    });
  } else {
    showUserFriendlyError(error, toast);
  }
}
```

### Konkrete Umsetzung:

1. **Erweitere `UserFriendlyError` Interface:**
```typescript
export interface UserFriendlyError {
  title: string;
  message: string;
  actionHint?: string;
  isRetryable: boolean; // NEU
  retryAction?: () => void; // NEU
}
```

2. **Erweitere `getUserFriendlyError()` Funktion:**
```typescript
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  // ... bestehende Logik ...
  
  // Netzwerkfehler sind retryable
  if (isNetworkError(error)) {
    return {
      title: 'Netzwerkfehler',
      message: 'Es konnte keine Verbindung zum Server hergestellt werden.',
      actionHint: 'Überprüfe deine Internetverbindung und versuche es erneut.',
      isRetryable: true,
    };
  }
  
  // 5XX Server-Fehler sind retryable
  if (isServerError(error)) {
    return {
      title: 'Server hat Probleme',
      message: 'Der Server hat gerade technische Probleme.',
      actionHint: 'Bitte versuche es in ein paar Minuten nochmal.',
      isRetryable: true,
    };
  }
  
  // 4XX Client-Fehler sind NICHT retryable
  return {
    // ... bestehende Logik ...
    isRetryable: false,
  };
}
```

3. **Erweitere `showUserFriendlyError()` Funktion:**
```typescript
export function showUserFriendlyError(
  error: unknown,
  toast: typeof import('sonner').toast,
  retryAction?: () => void
): void {
  const friendlyError = getUserFriendlyError(error);
  
  if (friendlyError.isRetryable && retryAction) {
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      action: {
        label: 'Erneut versuchen',
        onClick: retryAction
      },
      duration: 10000, // Länger sichtbar für Retry-Option
    });
  } else {
    toast.error(friendlyError.title, {
      description: friendlyError.message,
      duration: 5000,
    });
  }
}
```

4. **Verwendung in Komponenten:**
```typescript
const loadData = async () => {
  try {
    const data = await service.getData();
    setData(data);
  } catch (error) {
    console.error('Fehler beim Laden:', error);
    showUserFriendlyError(error, toast, () => loadData());
  }
};
```

### Betroffene Komponenten:

- Alle Komponenten mit API-Calls, die Netzwerkfehler haben können
- Besonders wichtig bei:
  - `ChatMessages.tsx` - Nachrichten senden
  - `EditBusiness.tsx` - Geschäft speichern
  - `EventCategoryList.tsx` - Kategorien laden
  - `JobOfferForm.tsx` - Stellenangebot speichern
  - Alle anderen Formulare mit API-Calls

---

## Aufgabe 2: Kontext-spezifische Fehlermeldungen

### Was wird implementiert?

**Ziel:** Fehlermeldungen sollen den Kontext der Aktion enthalten, damit der User weiß, WAS genau schiefgelaufen ist.

**Vorher:**
```typescript
catch (error) {
  showUserFriendlyError(error, toast);
  // User sieht: "Netzwerkfehler"
  // Aber nicht: "Beim Speichern des Geschäfts ist ein Netzwerkfehler aufgetreten"
}
```

**Nachher:**
```typescript
catch (error) {
  showUserFriendlyError(error, toast, undefined, 'save-business');
  // User sieht: "Fehler beim Speichern des Geschäfts"
  //             "Netzwerkfehler - Es konnte keine Verbindung zum Server hergestellt werden."
}
```

### Konkrete Umsetzung:

1. **Erweitere `getUserFriendlyError()` Funktion:**
```typescript
export type ErrorContext = 
  | 'load-business'
  | 'save-business'
  | 'delete-business'
  | 'load-event'
  | 'save-event'
  | 'delete-event'
  | 'load-chatroom'
  | 'send-message'
  | 'upload-image'
  | 'load-categories'
  | 'save-category'
  | 'delete-category'
  | 'load-job-offer'
  | 'save-job-offer'
  | 'delete-job-offer'
  | 'load-advent-calendar'
  | 'save-advent-calendar'
  | 'delete-advent-calendar'
  | 'load-news'
  | 'save-news'
  | 'delete-news'
  | 'load-users'
  | 'block-user'
  | 'unblock-user'
  | 'load-contact-requests'
  | 'respond-contact-request'
  | 'load-keywords'
  | 'save-keyword'
  | 'delete-keyword'
  | 'load-legal-document'
  | 'save-legal-document'
  | 'generic';

export function getUserFriendlyError(
  error: unknown,
  context?: ErrorContext
): UserFriendlyError {
  const baseError = getUserFriendlyErrorBase(error);
  
  if (!context || context === 'generic') {
    return baseError;
  }
  
  const contextMessages: Record<ErrorContext, string> = {
    'load-business': 'Fehler beim Laden des Geschäfts',
    'save-business': 'Fehler beim Speichern des Geschäfts',
    'delete-business': 'Fehler beim Löschen des Geschäfts',
    'load-event': 'Fehler beim Laden des Events',
    'save-event': 'Fehler beim Speichern des Events',
    'delete-event': 'Fehler beim Löschen des Events',
    'load-chatroom': 'Fehler beim Laden des Chatrooms',
    'send-message': 'Fehler beim Senden der Nachricht',
    'upload-image': 'Fehler beim Hochladen des Bildes',
    'load-categories': 'Fehler beim Laden der Kategorien',
    'save-category': 'Fehler beim Speichern der Kategorie',
    'delete-category': 'Fehler beim Löschen der Kategorie',
    'load-job-offer': 'Fehler beim Laden des Stellenangebots',
    'save-job-offer': 'Fehler beim Speichern des Stellenangebots',
    'delete-job-offer': 'Fehler beim Löschen des Stellenangebots',
    'load-advent-calendar': 'Fehler beim Laden des Adventskalenders',
    'save-advent-calendar': 'Fehler beim Speichern des Adventskalenders',
    'delete-advent-calendar': 'Fehler beim Löschen des Adventskalenders',
    'load-news': 'Fehler beim Laden der News',
    'save-news': 'Fehler beim Speichern der News',
    'delete-news': 'Fehler beim Löschen der News',
    'load-users': 'Fehler beim Laden der Benutzer',
    'block-user': 'Fehler beim Blockieren des Benutzers',
    'unblock-user': 'Fehler beim Entsperren des Benutzers',
    'load-contact-requests': 'Fehler beim Laden der Kontaktanfragen',
    'respond-contact-request': 'Fehler beim Beantworten der Kontaktanfrage',
    'load-keywords': 'Fehler beim Laden der Keywords',
    'save-keyword': 'Fehler beim Speichern des Keywords',
    'delete-keyword': 'Fehler beim Löschen des Keywords',
    'load-legal-document': 'Fehler beim Laden des Dokuments',
    'save-legal-document': 'Fehler beim Speichern des Dokuments',
    'generic': '',
  };
  
  return {
    ...baseError,
    title: `${contextMessages[context]}: ${baseError.title}`,
  };
}
```

2. **Erweitere `showUserFriendlyError()` Funktion:**
```typescript
export function showUserFriendlyError(
  error: unknown,
  toast: typeof import('sonner').toast,
  retryAction?: () => void,
  context?: ErrorContext
): void {
  const friendlyError = getUserFriendlyError(error, context);
  
  // ... bestehende Retry-Logik ...
}
```

3. **Verwendung in Komponenten:**
```typescript
// Vorher
catch (error) {
  showUserFriendlyError(error, toast);
}

// Nachher
catch (error) {
  showUserFriendlyError(error, toast, () => saveBusiness(), 'save-business');
}
```

### Betroffene Komponenten:

- Alle Komponenten mit API-Calls sollten einen passenden Kontext verwenden
- Wichtig bei:
  - `EditBusiness.tsx` - 'save-business', 'load-business', 'delete-business'
  - `ChatMessages.tsx` - 'send-message', 'load-chatroom'
  - `EventCategoryList.tsx` - 'load-categories', 'save-category', 'delete-category'
  - `JobOfferForm.tsx` - 'save-job-offer', 'load-job-offer'
  - Alle anderen Formulare mit API-Calls

---

## Aufgabe 3: Erfolgsmeldungen verbessern

### Was wird implementiert?

**Ziel:** Erfolgsmeldungen sollen konkret und hilfreich sein, mit optionalen "Rückgängig"-Optionen und nächsten Schritten.

**Vorher:**
```typescript
toast.success('Geschäft gespeichert');
// User sieht: "Geschäft gespeichert"
// Aber nicht: "Geschäft 'Mein Geschäft' wurde erfolgreich gespeichert"
// Und nicht: "Du kannst jetzt weitere Details hinzufügen"
```

**Nachher:**
```typescript
toast.success('Geschäft gespeichert', {
  description: `"${business.name}" wurde erfolgreich gespeichert.`,
  action: {
    label: 'Rückgängig',
    onClick: () => undoAction()
  }
});
// User sieht: "Geschäft gespeichert"
//             ""Mein Geschäft" wurde erfolgreich gespeichert."
//             [Rückgängig-Button]
```

### Konkrete Umsetzung:

1. **Erstelle `showSuccessMessage()` Utility-Funktion:**
```typescript
export interface SuccessMessageOptions {
  title: string;
  description?: string;
  undoAction?: () => void;
  nextSteps?: string[];
}

export function showSuccessMessage(
  toast: typeof import('sonner').toast,
  options: SuccessMessageOptions
): void {
  const { title, description, undoAction, nextSteps } = options;
  
  toast.success(title, {
    description: description,
    action: undoAction ? {
      label: 'Rückgängig',
      onClick: undoAction
    } : undefined,
    duration: undoAction ? 10000 : 5000, // Länger sichtbar für Undo-Option
  });
  
  // Optional: Zeige nächste Schritte als separaten Toast
  if (nextSteps && nextSteps.length > 0) {
    setTimeout(() => {
      toast.info('Nächste Schritte', {
        description: nextSteps.join('\n'),
        duration: 8000,
      });
    }, 1000);
  }
}
```

2. **Verwendung in Komponenten:**
```typescript
// Vorher
toast.success('Geschäft gespeichert');

// Nachher
showSuccessMessage(toast, {
  title: 'Geschäft gespeichert',
  description: `"${business.name}" wurde erfolgreich gespeichert.`,
  undoAction: () => {
    // Rückgängig-Logik
    deleteBusiness(business.id);
  },
  nextSteps: [
    'Du kannst jetzt weitere Details hinzufügen',
    'Oder Bilder hochladen'
  ]
});
```

### Beispiele für verschiedene Aktionen:

#### Beispiel 1: Geschäft speichern
```typescript
showSuccessMessage(toast, {
  title: 'Geschäft gespeichert',
  description: `"${business.name}" wurde erfolgreich gespeichert.`,
  undoAction: () => deleteBusiness(business.id),
  nextSteps: [
    'Du kannst jetzt weitere Details hinzufügen',
    'Oder Bilder hochladen'
  ]
});
```

#### Beispiel 2: Nachricht senden
```typescript
showSuccessMessage(toast, {
  title: 'Nachricht gesendet',
  description: 'Deine Nachricht wurde erfolgreich gesendet.',
  // Kein Undo bei Nachrichten (nicht sinnvoll)
});
```

#### Beispiel 3: Kategorie löschen
```typescript
showSuccessMessage(toast, {
  title: 'Kategorie gelöscht',
  description: `"${category.name}" wurde erfolgreich gelöscht.`,
  undoAction: () => restoreCategory(category),
});
```

### Betroffene Komponenten:

- Alle Komponenten mit `toast.success()` Aufrufen
- Besonders wichtig bei:
  - `EditBusiness.tsx` - Geschäft speichern/löschen
  - `ChatMessages.tsx` - Nachricht senden
  - `EventCategoryList.tsx` - Kategorie speichern/löschen
  - `JobOfferForm.tsx` - Stellenangebot speichern
  - Alle anderen Formulare mit Erfolgsmeldungen

---

## Konkrete Umsetzungsschritte

### Schritt 1: Erweitere `errorUtils.ts`
1. Erweitere `UserFriendlyError` Interface um `isRetryable` und `retryAction`
2. Erweitere `getUserFriendlyError()` um Kontext-Parameter
3. Erweitere `showUserFriendlyError()` um Retry- und Kontext-Parameter
4. Erstelle `showSuccessMessage()` Funktion

### Schritt 2: Migriere Komponenten
1. Beginne mit den wichtigsten Komponenten (EditBusiness, ChatMessages, etc.)
2. Füge Retry-Mechanismus hinzu wo sinnvoll
3. Füge Kontext-Parameter hinzu
4. Ersetze `toast.success()` durch `showSuccessMessage()`

### Schritt 3: Teste die Implementierung
1. Teste Retry-Mechanismus bei Netzwerkfehlern
2. Teste Kontext-spezifische Fehlermeldungen
3. Teste verbesserte Erfolgsmeldungen

---

## Geschätzter Aufwand

- **Aufgabe 1 (Retry-Mechanismus)**: ~2-3 Stunden
- **Aufgabe 2 (Kontext-spezifische Fehlermeldungen)**: ~3-4 Stunden
- **Aufgabe 3 (Erfolgsmeldungen verbessern)**: ~2-3 Stunden

**Gesamt**: ~7-10 Stunden

