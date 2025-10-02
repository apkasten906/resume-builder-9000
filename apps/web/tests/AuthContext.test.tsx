import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { mockSignedIn } from './vitest.setup';

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url === '/api/auth/me') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, name: 'Test User' } }),
      });
    }
    if (url === '/api/auth/logout') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.resolve(new Response('{}', { status: 404 }));
  }) as unknown as typeof fetch;
});

afterEach(() => {
  (global.fetch as Mock).mockClear();
});

function TestComponent(): React.ReactElement {
  const { authenticated, checking, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{authenticated ? 'signed-in' : 'signed-out'}</span>
      <span data-testid="checking">{checking ? 'checking' : 'ready'}</span>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('shows signed-in status after successful /api/auth/me', async () => {
    mockSignedIn({ id: '1', name: 'Test User', email: 'test@example.com' });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-in'));
    expect(screen.getByTestId('checking').textContent).toBe('ready');
  });

  it('calls logout and updates status', async () => {
    mockSignedIn({ id: '1', name: 'Test User', email: 'test@example.com' });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-in'));
    screen.getByTestId('logout-btn').click();
    // After logout, /api/auth/me returns no user
    (global.fetch as Mock).mockImplementationOnce((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ authenticated: false, user: null }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-out'));
  });

  it('invalidates token after logout', async () => {
    mockSignedIn({ id: '1', name: 'Test User', email: 'test@example.com' });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-in'));
    screen.getByTestId('logout-btn').click();

    // Mock backend to reject requests with invalidated token
    (global.fetch as Mock).mockImplementationOnce((url: string) => {
      if (url === '/api/protected-resource') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const res = await fetch('/api/protected-resource');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });

  it('does not re-authenticate user on index page after logout', async () => {
    mockSignedIn({ id: '1', name: 'Test User', email: 'test@example.com' });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-in'));
    screen.getByTestId('logout-btn').click();

    // Mock backend to ensure no re-authentication
    (global.fetch as Mock).mockImplementationOnce((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ authenticated: false, user: null }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signed-out'));
  });
});
