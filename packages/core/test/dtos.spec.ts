import { describe, it, expect } from 'vitest';
import ParsedRegionSchema from '../src/dtos/parsed-region.dto.js';
import ResumeUploadSchema from '../src/dtos/resume-upload.dto.js';

describe('DTO validation', () => {
  it('validates a minimal parsed region', () => {
    const obj = { page: 0, text: 'hello' };
    const parsed = ParsedRegionSchema.parse(obj);
    expect(parsed.page).toBe(0);
    expect(parsed.text).toBe('hello');
  });

  it('rejects invalid parsed region', () => {
    const bad = { page: -1, text: 123 } as unknown;
    expect(() => ParsedRegionSchema.parse(bad as unknown as object)).toThrow();
  });

  it('validates resume upload payload', () => {
    const payload = { userId: 'u1', regions: [{ page: 0, text: 'a' }] };
    const parsed = ResumeUploadSchema.parse(payload);
    expect(parsed.regions.length).toBe(1);
  });
});
