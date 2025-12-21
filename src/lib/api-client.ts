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
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any, options: { isFormData?: boolean } = {}): Promise<T> {
    const headers = await this.getHeaders(options.isFormData ? undefined : 'application/json');
    const body = options.isFormData ? data : JSON.stringify(data);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders('application/json');
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response);
      throw new Error(errorMessage);
    }

    return response.json();
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
        const errorMessage = await this.extractErrorMessage(response, response.status);
        const error = new Error(errorMessage);
        (error as any).status = response.status;
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
      const errorMessage = await this.extractErrorMessage(response);
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async extractErrorMessage(response: Response, statusCode?: number): Promise<string> {
    const status = statusCode || response.status;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        // Unterstütze verschiedene Error-Response-Formate
        if (errorData.message) {
          return errorData.message;
        }
        if (errorData.error) {
          return errorData.error;
        }
        if (typeof errorData === 'string') {
          return errorData;
        }
      }
    } catch {
      // Wenn das Parsen fehlschlägt, verwende den Standard-Fehlercode
    }
    
    // Füge Status-Code zur Fehlermeldung hinzu für bessere Fehlererkennung
    return `HTTP error! status: ${status}`;
  }
}

export default ApiClient;
