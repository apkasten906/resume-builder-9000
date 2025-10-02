import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../src/app/page';

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url === '/api/auth/me') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ authenticated: false, user: null }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  }) as unknown as typeof fetch;
});

afterEach(() => {
  (global.fetch as Mock).mockClear();
});

describe('Home page unauthenticated', () => {
  it('renders Get Started view when not signed in', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Welcome to Resume Builder 9000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });
  });
});
