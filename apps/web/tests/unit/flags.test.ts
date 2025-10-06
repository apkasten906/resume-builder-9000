import { describe, it, expect } from 'vitest';

describe('flags', () => {
  it('aiTailoring flag is boolean', async () => {
    // Arrange
    const { flags } = await import('../../src/lib/flags');

    // Act & Assert
    expect(typeof flags.aiTailoring === 'boolean').toBe(true);
  });
});
