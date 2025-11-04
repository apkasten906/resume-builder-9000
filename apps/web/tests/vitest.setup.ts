import type { Mock } from 'vitest';
// Helper to mock signed-in state for tests
export function mockSignedIn(
  user: { id: string; name: string; email: string } = {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
  }
): void {
  (global.fetch as Mock).mockImplementationOnce((url: string) => {
    if (url.endsWith('/api/auth/me')) {
      return Promise.resolve(
        new Response(JSON.stringify({ authenticated: true, user }), { status: 200 })
      );
    }
    return Promise.resolve(new Response('', { status: 404 }));
  });
}
// apps/web/tests/vitest.setup.ts
import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Default network stubs for web unit tests.
// By default we assume "signed-out". Individual tests can override using
//   (global.fetch as unknown as vi.Mock).mockImplementationOnce(() => Promise.resolve(new Response(...)))
beforeEach(() => {
  vi.restoreAllMocks();

  vi.spyOn(global, 'fetch').mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if ('url' in input) {
        url = input.url;
      } else {
        url = '';
      }
      const method = (init?.method || 'GET').toUpperCase();

      // Auth status probe (AuthProvider calls this on mount)
      if (url.endsWith('/api/auth/me')) {
        // Default: signed-out. Tests that need "signed-in" should mockImplementationOnce before render.
        return new Response(JSON.stringify({ authenticated: false, user: null }), { status: 200 });
      }

      // Logout route
      if (url.endsWith('/api/auth/logout') && method === 'POST') {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Example data endpoint used by Home
      if (url.endsWith('/api/applications')) {
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      }

      // Fallback
      return new Response('', { status: 404 });
    }
  );
});

afterEach(() => {
  vi.clearAllMocks();
});
