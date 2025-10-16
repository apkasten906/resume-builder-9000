import { describe, it, expect } from 'vitest';
import {
  PASSWORD_POLICY_RULES,
  evaluatePassword,
  validatePassword,
} from '../auth/passwordPolicy.js';

describe('passwordPolicy', () => {
  it('validates a strong password successfully', () => {
    const password = 'ValidPassword1!#';
    const result = evaluatePassword(password);

    expect(result.valid).toBe(true);
    expect(result.score).toBe(1);
    expect(result.requirements.every(requirement => requirement.met)).toBe(true);
    expect(validatePassword(password)).toBe(true);
  });

  it('flags unmet requirements for a weak password', () => {
    const password = 'weak';
    const result = evaluatePassword(password);

    expect(result.valid).toBe(false);
    expect(result.score).toBeLessThan(0.5);

    const unmetRules = result.requirements.filter(requirement => !requirement.met).map(r => r.id);
    expect(unmetRules).toEqual(
      expect.arrayContaining(['length', 'uppercase', 'number', 'special'])
    );
    expect(validatePassword(password)).toBe(false);
  });

  it('exposes stable requirement metadata', () => {
    const ids = PASSWORD_POLICY_RULES.map(req => req.id);
    const labels = PASSWORD_POLICY_RULES.map(req => req.label);

    expect(new Set(ids).size).toBe(ids.length);
    expect(labels.every(label => typeof label === 'string' && label.length > 0)).toBe(true);
  });
});
