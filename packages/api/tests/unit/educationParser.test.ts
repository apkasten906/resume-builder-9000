import { describe, it, expect } from 'vitest';
import { parseEducationString } from '../../src/utils/educationParser.js';

describe('educationParser', () => {
  it('parses dash-separated institution and degree', () => {
    const parsed = parseEducationString('University of Examples - B.S. Computer Science, 2019');
    expect(parsed.institution).toBe('University of Examples');
    expect(parsed.degree).toBe('B.S. Computer Science');
    expect(parsed.graduationDate).toBe('2019');
  });

  it('parses comma-separated institution and degree', () => {
    const parsed = parseEducationString('State College, B.A. History, 2015');
    expect(parsed.institution).toBe('State College');
    expect(parsed.degree).toBe('B.A. History');
    expect(parsed.graduationDate).toBe('2015');
  });

  it('falls back to institution when format unknown', () => {
    const parsed = parseEducationString('Some Unknown Education Format');
    expect(parsed.institution).toBe('Some Unknown Education Format');
  });
});
