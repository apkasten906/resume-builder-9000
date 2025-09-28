// packages/core/src/application.ts
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface Application {
  id: string;
  company: string;
  role: string;
  location?: string;
  stage: 'Prospect' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';
  lastUpdated: string;
  salary?: {
    currency: CurrencyCode;
    base?: number;
    bonus?: number;
    equity?: string;
    notes?: string;
  };
  attachments?: { resumeUrl?: string; coverLetterUrl?: string };
}

/**
 * Creates a new Application object with required fields
 * @param data Partial application data
 * @returns A complete Application object
 */
export function createApplication(
  data: Partial<Application> & Pick<Application, 'company' | 'role'>
): Application {
  return {
    id: data.id || `app-${Date.now()}`,
    company: data.company,
    role: data.role,
    stage: data.stage || 'Prospect',
    lastUpdated: data.lastUpdated || new Date().toISOString(),
    location: data.location,
    salary: data.salary,
    attachments: data.attachments,
  };
}
