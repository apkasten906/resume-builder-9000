import { describe, it, expect } from 'vitest';

describe('flags', async () => {
  it('aiTailoring flag is boolean', async () => {
    const { flags } = await import('../../src/lib/flags');
    expect(typeof flags.aiTailoring === 'boolean').toBe(true);
  });
});
