import { describe, it, expect } from 'vitest';
import { parsePdfBuffer } from '../../../apps/api/src/lib/pdf-parser.js';

describe('pdf-parser (stub)', () => {
  it('returns an array for empty buffer', async () => {
    const res = await parsePdfBuffer(Buffer.alloc(0));
    expect(Array.isArray(res)).toBe(true);
  });
});
