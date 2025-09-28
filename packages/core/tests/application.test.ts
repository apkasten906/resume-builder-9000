import { describe, it, expect } from 'vitest';
import { Application, CurrencyCode, createApplication } from '../src/application.js';

describe('Application Model', () => {
  it('should allow creating a valid Application object with minimal fields', () => {
    // Create a minimal valid Application object
    const minimalApp: Application = {
      id: '123',
      company: 'Test Company',
      role: 'Software Developer',
      stage: 'Applied',
      lastUpdated: new Date().toISOString(),
    };

    // Verify structure
    expect(minimalApp).toHaveProperty('id');
    expect(minimalApp).toHaveProperty('company');
    expect(minimalApp).toHaveProperty('role');
    expect(minimalApp).toHaveProperty('stage');
    expect(minimalApp).toHaveProperty('lastUpdated');
  });

  it('should allow creating an Application with all optional properties', () => {
    // Create a complete Application object with all optional fields
    const completeApp: Application = {
      id: '456',
      company: 'Full Example Corp',
      role: 'Senior Developer',
      location: 'Remote',
      stage: 'Interview',
      lastUpdated: new Date().toISOString(),
      salary: {
        currency: 'USD',
        base: 120000,
        bonus: 20000,
        equity: '10000 RSUs',
        notes: 'Annual bonus based on performance',
      },
      attachments: {
        resumeUrl: 'https://example.com/resume.pdf',
        coverLetterUrl: 'https://example.com/cover.pdf',
      },
    };

    // Verify all fields exist with proper types
    expect(completeApp.location).toBe('Remote');
    expect(completeApp.salary?.currency).toBe('USD');
    expect(completeApp.salary?.base).toBe(120000);
    expect(completeApp.salary?.bonus).toBe(20000);
    expect(completeApp.salary?.equity).toBe('10000 RSUs');
    expect(completeApp.salary?.notes).toBe('Annual bonus based on performance');
    expect(completeApp.attachments?.resumeUrl).toBe('https://example.com/resume.pdf');
    expect(completeApp.attachments?.coverLetterUrl).toBe('https://example.com/cover.pdf');
  });

  it('should support all defined application stages', () => {
    // Create application objects with different stages
    const stages: Array<Application['stage']> = [
      'Prospect',
      'Applied',
      'Interview',
      'Offer',
      'Rejected',
      'Accepted',
    ];

    // Verify each stage works in a valid Application object
    stages.forEach(stage => {
      const app: Application = {
        id: `stage-${stage}`,
        company: 'Stage Test Inc',
        role: 'Developer',
        stage,
        lastUpdated: new Date().toISOString(),
      };
      expect(app.stage).toBe(stage);
    });
  });

  it('should support all currency code values', () => {
    // Create objects with different currency codes
    const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

    // Verify each currency works in a valid salary object
    currencies.forEach(currency => {
      const app: Application = {
        id: `currency-${currency}`,
        company: 'Currency Test Inc',
        role: 'Developer',
        stage: 'Offer',
        lastUpdated: new Date().toISOString(),
        salary: {
          currency,
          base: 100000,
        },
      };
      expect(app.salary?.currency).toBe(currency);
    });
  });

  it('should handle salary object with only currency', () => {
    const app: Application = {
      id: 'salary-test',
      company: 'Salary Test Inc',
      role: 'Developer',
      stage: 'Offer',
      lastUpdated: new Date().toISOString(),
      salary: {
        currency: 'USD',
      },
    };

    expect(app.salary?.currency).toBe('USD');
    expect(app.salary?.base).toBeUndefined();
    expect(app.salary?.bonus).toBeUndefined();
    expect(app.salary?.equity).toBeUndefined();
    expect(app.salary?.notes).toBeUndefined();
  });

  it('should handle attachments object with only resumeUrl', () => {
    const app: Application = {
      id: 'attachment-test-1',
      company: 'Attachment Test Inc',
      role: 'Developer',
      stage: 'Applied',
      lastUpdated: new Date().toISOString(),
      attachments: {
        resumeUrl: 'https://example.com/resume.pdf',
      },
    };

    expect(app.attachments?.resumeUrl).toBe('https://example.com/resume.pdf');
    expect(app.attachments?.coverLetterUrl).toBeUndefined();
  });

  it('should handle attachments object with only coverLetterUrl', () => {
    const app: Application = {
      id: 'attachment-test-2',
      company: 'Attachment Test Inc',
      role: 'Developer',
      stage: 'Applied',
      lastUpdated: new Date().toISOString(),
      attachments: {
        coverLetterUrl: 'https://example.com/cover.pdf',
      },
    };

    expect(app.attachments?.coverLetterUrl).toBe('https://example.com/cover.pdf');
    expect(app.attachments?.resumeUrl).toBeUndefined();
  });

  describe('createApplication', () => {
    it('should create an application with minimal required fields', () => {
      const app = createApplication({
        company: 'New Company',
        role: 'Software Developer',
      });

      expect(app.company).toBe('New Company');
      expect(app.role).toBe('Software Developer');
      expect(app.stage).toBe('Prospect'); // Default value
      expect(app.id).toContain('app-'); // Generated ID
      expect(app.lastUpdated).toBeDefined(); // Generated timestamp
      expect(app.location).toBeUndefined();
      expect(app.salary).toBeUndefined();
      expect(app.attachments).toBeUndefined();
    });

    it('should preserve all provided fields', () => {
      const now = new Date().toISOString();
      const app = createApplication({
        id: 'custom-id',
        company: 'Test Company',
        role: 'Developer',
        stage: 'Interview',
        lastUpdated: now,
        location: 'Remote',
        salary: {
          currency: 'EUR',
          base: 90000,
        },
        attachments: {
          resumeUrl: 'https://example.com/resume.pdf',
        },
      });

      expect(app.id).toBe('custom-id');
      expect(app.company).toBe('Test Company');
      expect(app.role).toBe('Developer');
      expect(app.stage).toBe('Interview');
      expect(app.lastUpdated).toBe(now);
      expect(app.location).toBe('Remote');
      expect(app.salary?.currency).toBe('EUR');
      expect(app.salary?.base).toBe(90000);
      expect(app.attachments?.resumeUrl).toBe('https://example.com/resume.pdf');
    });
  });
});
