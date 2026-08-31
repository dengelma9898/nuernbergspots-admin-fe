interface ApiClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}

interface RequestOptions {
  body?: BodyInit;
  contentType?: string;
  isFormData?: boolean;
  emptyOnNoContent?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;
  private tokenCache: { token: string | null; expiry: number } | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
  }

  private async getHeaders(contentType?: string): Promise<Headers> {
    let token: string | null;

    // Prüfe zuerst, ob ein gültiger Token im Cache ist
    if (this.tokenCache && this.tokenCache.expiry > Date.now()) {
      token = this.tokenCache.token;
    } else {
      // Token-Caching: Wenn mehrere Requests gleichzeitig kommen, teile den gleichen Token-Request
      // Dies verhindert, dass bei parallelen Requests mehrere Token-Requests gemacht werden
      if (!this.tokenPromise) {
        this.tokenPromise = this.getToken();
        this.tokenPromise
          .then(newToken => {
            // Cache den Token für 50 Minuten (Firebase Tokens sind 1 Stunde gültig)
            if (newToken) {
              this.tokenCache = {
                token: newToken,
                expiry: Date.now() + 50 * 60 * 1000, // 50 Minuten
              };
            }
          })
          .catch(() => {
            // Bei Fehler Cache löschen
            this.tokenCache = null;
          })
          .finally(() => {
            // Reset nach kurzer Zeit, damit neue Requests einen neuen Token-Request starten können
            // wenn der alte abgeschlossen ist
            setTimeout(() => {
              this.tokenPromise = null;
            }, 100);
          });
      }

      token = await this.tokenPromise;
    }

    const headers = new Headers();

    if (contentType) {
      headers.append('Content-Type', contentType);
    }

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<T> {
    try {
      const { body, contentType, isFormData, emptyOnNoContent } = options ?? {};
      const headers = await this.getHeaders(isFormData ? undefined : contentType);

      const fetchOptions: RequestInit = { method, headers };
      if (body !== undefined) {
        fetchOptions.body = body;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, fetchOptions);

      if (!response.ok) {
        const { message, data } = await this.extractErrorMessage(response, response.status);
        const error = new Error(message);
        (error as any).status = response.status;
        // Speichere die vollständige Response-Struktur für Validierungsfehler
        if (data) {
          (error as any).response = { data };
        }
        throw error;
      }

      if (emptyOnNoContent && response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      // Wenn es ein Netzwerkfehler ist (z.B. CORS, Failed to fetch)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error(error.message);
        (networkError as any).isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async getText(endpoint: string): Promise<string> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'GET', headers });

    if (!response.ok) {
      const { message } = await this.extractErrorMessage(response, response.status);
      const error = new Error(message);
      (error as { status?: number }).status = response.status;
      throw error;
    }

    return response.text();
  }

  async post<T>(endpoint: string, data: any, options: { isFormData?: boolean } = {}): Promise<T> {
    const body = options.isFormData ? data : JSON.stringify(data);
    return this.request<T>('POST', endpoint, {
      body,
      contentType: 'application/json',
      isFormData: options.isFormData,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, {
      body: JSON.stringify(data),
      contentType: 'application/json',
    });
  }

  async patch<T>(endpoint: string, data: any, options: { isFormData?: boolean } = {}): Promise<T> {
    const body = options.isFormData ? data : JSON.stringify(data);
    return this.request<T>('PATCH', endpoint, {
      body,
      contentType: 'application/json',
      isFormData: options.isFormData,
    });
  }

  async delete<T = void>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('DELETE', endpoint, {
      body: data ? JSON.stringify(data) : undefined,
      emptyOnNoContent: true,
    });
  }

  private async unwrapEnvelope<T>(promise: Promise<{ data: T }>): Promise<T> {
    const response = await promise;
    return response.data;
  }

  async getData<T>(endpoint: string): Promise<T> {
    return this.unwrapEnvelope(this.get<{ data: T }>(endpoint));
  }

  async postData<T>(
    endpoint: string,
    data: unknown,
    options: { isFormData?: boolean } = {}
  ): Promise<T> {
    return this.unwrapEnvelope(this.post<{ data: T }>(endpoint, data, options));
  }

  async putData<T>(endpoint: string, data: unknown): Promise<T> {
    return this.unwrapEnvelope(this.put<{ data: T }>(endpoint, data));
  }

  async patchData<T>(
    endpoint: string,
    data: unknown,
    options: { isFormData?: boolean } = {}
  ): Promise<T> {
    return this.unwrapEnvelope(this.patch<{ data: T }>(endpoint, data, options));
  }

  async deleteData<T = void>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.delete<{ data: T }>(endpoint, data);
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }
    return undefined as T;
  }

  private async extractErrorMessage(
    response: Response,
    statusCode?: number
  ): Promise<{ message: string; data?: any }> {
    const status = statusCode || response.status;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.clone().json();
        // Unterstütze verschiedene Error-Response-Formate
        let message: string;
        if (Array.isArray(errorData.message)) {
          message = errorData.message.join(', ');
        } else if (errorData.message) {
          message = errorData.message;
        } else if (errorData.error) {
          message = errorData.error;
        } else if (typeof errorData === 'string') {
          message = errorData;
        } else {
          message = `HTTP error! status: ${status}`;
        }
        return { message, data: errorData };
      }
    } catch {
      // Wenn das Parsen fehlschlägt, verwende den Standard-Fehlercode
    }

    // Füge Status-Code zur Fehlermeldung hinzu für bessere Fehlererkennung
    return { message: `HTTP error! status: ${status}` };
  }
}

export default ApiClient;
