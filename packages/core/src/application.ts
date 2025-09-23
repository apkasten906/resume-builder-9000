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
