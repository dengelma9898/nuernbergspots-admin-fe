export interface ApiResponse<T> {
  data: T;
}

/**
 * Entpackt die Daten aus einer API-Antwort
 * @param response Die API-Antwort mit der Struktur { data: T }
 * @returns Die entpackten Daten
 */
export function unwrapData<T>(response: ApiResponse<T>): T {
  return response.data;
} 