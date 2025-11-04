import type { ParsedResumeUpdateRequest, ResumeDetailsApiResponse } from '@/types/resume-details';

/**
 * Type-Safe API Service Generator
 * Extracts types directly from Next.js API routes
 */

// Generic HTTP client
class TypeSafeHTTPClient {
  constructor(private readonly baseURL: string) {}

  async get<T>(endpoint: string = ''): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`GET ${this.baseURL}${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async post<TRequest, TResponse>(data: TRequest, endpoint: string = ''): Promise<TResponse> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`POST ${this.baseURL}${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async put<TRequest, TResponse>(data: TRequest, endpoint: string = ''): Promise<TResponse> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`PUT ${this.baseURL}${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async delete(endpoint: string = ''): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`DELETE ${this.baseURL}${endpoint}: ${response.statusText}`);
    }
  }
}

// Factory function for creating API clients
export function createAPIClient(routeName: string): TypeSafeHTTPClient {
  return new TypeSafeHTTPClient(`/api/${routeName}`);
}

// Pre-built clients for existing routes
export const API = {
  applications: createAPIClient('applications'),
  auth: createAPIClient('auth'),
  uploads: createAPIClient('uploads'),
  resume: createAPIClient('resume'),
  resumeDetails: createAPIClient('resume-details'),
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

export type { ParsedResumeUpdateRequest, ResumeDetailsApiResponse };
