import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { mockSignedIn } from './vitest.setup';

let userAuthenticated = true;

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url === '/api/auth/me') {
      if (userAuthenticated) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 1, name: 'Test User' } }),
        });
      } else {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: null }),
        });
      }
    }
    if (url === '/api/auth/logout') {
      userAuthenticated = false;
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  }) as unknown as typeof fetch;
});

afterEach(() => {
  (global.fetch as Mock).mockClear();
  userAuthenticated = true;
});

function TestLogoutComponent(): React.ReactElement {
  const { authenticated, checking, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{authenticated ? 'signed-in' : 'signed-out'}</span>
      <span data-testid="checking">{checking ? 'checking' : 'ready'}</span>
      <button onClick={logout} data-testid="logout-btn">
        Log out
      </button>
    </div>
  );
}

describe('AuthProvider logout flow', () => {
  it('logs out and updates authentication state', async () => {
    (global.fetch as Mock).mockImplementationOnce((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ authenticated: true, user: { id: 1, name: 'Test User' } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    mockSignedIn({ id: '1', name: 'Test User', email: 'test@example.com' });
    render(
      <AuthProvider>
        <TestLogoutComponent />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-in'));
    screen.getByTestId('logout-btn').click();
    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-out'));
  });
});
// Test only asserts authentication state change after logout
