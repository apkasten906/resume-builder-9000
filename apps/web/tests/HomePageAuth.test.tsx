import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../src/app/page';
import { AuthProvider } from '../src/context/AuthContext';
import { mockSignedIn } from './vitest.setup';

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url === '/api/auth/me') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ authenticated: false, user: null }),
      });
    }
    return Promise.resolve(new Response('{}', { status: 404 }));
  }) as unknown as typeof fetch;
});

afterEach(() => {
  (global.fetch as Mock).mockClear();
});

describe('Home page unauthenticated', () => {
  describe('Home page authenticated', () => {
    it('renders signed-in view when signed in', async () => {
      mockSignedIn({ id: '1', name: 'Test User', email: 'test@example.com' });
      render(
        <AuthProvider>
          <Home />
        </AuthProvider>
      );
      await waitFor(() => {
        expect(screen.getByText('Welcome to Resume Builder 9000')).toBeInTheDocument();
        // Add more assertions for signed-in UI if needed
      });
    });
  });
  it('renders Get Started view when not signed in', async () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Welcome to Resume Builder 9000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });
  });
});
