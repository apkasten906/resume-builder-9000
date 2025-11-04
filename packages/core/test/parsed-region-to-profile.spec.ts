import { describe, it, expect } from 'vitest';
import { parsedRegionsToProfileDraft } from '../src/lib/mapper.js';
import type { ParsedRegion } from '../src/models/parsed-region.js';

describe('parsedRegionsToProfileDraft', () => {
  it('maps empty regions to a draft with userId', () => {
    const regions: ParsedRegion[] = [];
    const draft = parsedRegionsToProfileDraft(regions, 'user-1');
    expect(draft.userId).toBe('user-1');
    expect(Array.isArray(draft.experiences)).toBe(true);
  });
});
