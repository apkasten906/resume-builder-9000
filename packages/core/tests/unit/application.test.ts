import { describe, it, expect } from 'vitest';
import type { Application } from '../../src/application';

describe('Application model', () => {
  it('basic shape compiles and runtime checks pass', () => {
    const app: Application = {
      id: 'a1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'Applied',
      lastUpdated: new Date().toISOString(),
      salary: { currency: 'EUR', base: 80000 },
    };
    expect(app.company).toBe('Acme');
    expect(app.salary?.currency).toBe('EUR');
  });
});
