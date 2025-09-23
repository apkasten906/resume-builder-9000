import { describe, it, expect } from 'vitest';
import { authService } from '../../src/services/authService';

describe('authService', () => {
  it('returns token for valid credentials', async () => {
    const res = await authService.login('user@example.com', 'ValidPassword1!');
    expect(res).toBeTruthy();
    expect(res?.token).toBeTypeOf('string');
  });

  it('returns null for invalid credentials', async () => {
    const res = await authService.login('nope@example.com', 'bad');
    expect(res).toBeNull();
  });
});
