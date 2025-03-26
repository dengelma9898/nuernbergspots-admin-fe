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
      throw new Error(`HTTP error! status: ${response.status}`);
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders('application/json');

    console.log('patch: data', JSON.stringify(data));
    console.log('patch: headers', headers.get('Content-Type'));
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}

export default ApiClient; 