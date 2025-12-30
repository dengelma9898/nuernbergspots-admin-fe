interface ApiClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}

class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
  }

  private async getHeaders(contentType?: string): Promise<Headers> {
    const token = await this.getToken();
    const headers = new Headers();

    if (contentType) {
      headers.append('Content-Type', contentType);
    }

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
      });

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

  async post<T>(endpoint: string, data: any, options: { isFormData?: boolean } = {}): Promise<T> {
    try {
      const headers = await this.getHeaders(options.isFormData ? undefined : 'application/json');
      const body = options.isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      });

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

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = await this.getHeaders('application/json');
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

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

  async patch<T>(endpoint: string, data: any, options: { isFormData?: boolean } = {}): Promise<T> {
    const headers = await this.getHeaders(options.isFormData ? undefined : 'application/json');
    const body = options.isFormData ? data : JSON.stringify(data);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers,
        body,
      });

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

  async delete<T = void>(endpoint: string, data?: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const options: RequestInit = {
        method: 'DELETE',
        headers,
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);

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

      if (response.status === 204) {
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

  private async extractErrorMessage(response: Response, statusCode?: number): Promise<{ message: string; data?: any }> {
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
