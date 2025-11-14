/**
 * Type-Safe API Service Generator
 * Extracts types directly from Next.js API routes
 */

// Generic HTTP client
class TypeSafeHTTPClient {
  constructor(private readonly baseURL: string) {}

  /**
   * Constructs a full URL by ensuring exactly one slash between baseURL and endpoint
   */
  private buildURL(endpoint: string): string {
    if (!endpoint) return this.baseURL;

    // Remove trailing slash from baseURL and leading slash from endpoint, then join with exactly one slash
    const base = this.baseURL.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${base}/${path}`;
  }

  async get<T>(endpoint: string = ''): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GET ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  async post<TRequest, TResponse>(data: TRequest, endpoint: string = ''): Promise<TResponse> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`POST ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  async put<TRequest, TResponse>(data: TRequest, endpoint: string = ''): Promise<TResponse> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`PUT ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  async delete(endpoint: string = ''): Promise<void> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`DELETE ${url}: ${response.statusText}`);
    }
  }
}

// Factory function for creating API clients
export function createAPIClient(routeName: string): TypeSafeHTTPClient {
  // Prefer explicit public API base when provided (NEXT_PUBLIC_API_BASE).
  // When running in local dev and the env var is not set, fall back to
  // the API dev server at http://localhost:4002 so the client can talk
  // directly to the backend when the Next dev server isn't proxying /api.
  const envBase = process.env.NEXT_PUBLIC_API_BASE || '';
  const defaultDevBase =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:4002'
      : '';
  const basePrefix = envBase || defaultDevBase;
  let base: string;
  if (basePrefix) {
    base = `${basePrefix.replace(/\/$/, '')}/api/${routeName}`;
  } else {
    base = `/api/${routeName}`;
  }
  return new TypeSafeHTTPClient(base);
}

// Pre-built clients for existing routes
export const API = {
  applications: createAPIClient('applications'),
  auth: createAPIClient('auth'),
  uploads: createAPIClient('resumes'), // Maps to GET /api/resumes for listing uploads
  resumes: createAPIClient('resumes'), // For direct access to /api/resumes/:id
  resume: createAPIClient('resume'),
  tailor: createAPIClient('tailor'),
  jobDescription: createAPIClient('jobDescription'),
} as const;

// Types extracted from your API routes
export interface Application {
  id: string;
  company: string;
  status: string;
  lastUpdated: string;
}

export interface ApplicationsResponse {
  items: Application[];
}

export interface CreateApplicationRequest {
  company: string;
  status: string;
}

// Auth endpoint types
export interface MeResponse {
  user: {
    id: string;
    email: string;
  } | null;
  authenticated: boolean;
}

// Job Description Parse endpoint types
export interface ParseJobDescriptionRequest {
  text: string;
  fileName?: string;
}

export interface ParseJobDescriptionResponse {
  title?: string;
  company?: string;
  requirements?: string[];
  keywords?: string[];
}
