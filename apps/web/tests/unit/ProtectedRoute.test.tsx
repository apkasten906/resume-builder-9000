/**
 * Unit tests for the ProtectedRoute component
 * Tests the client-side route protection logic
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import React from 'react';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: (): {
    push: typeof mockPush;
    replace: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  } => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: (): ReturnType<typeof mockUseAuth> => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state when checking authentication', () => {
    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: true,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading spinner
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to home page when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: false,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should trigger redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders protected content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      authenticated: true,
      checking: false,
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should render protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // Should not show loading state
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('does not redirect while authentication is being checked', () => {
    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: true,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not redirect while still checking
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('transitions from checking to authenticated state', async () => {
    // Start with checking state
    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: true,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Simulate authentication check completing successfully
    mockUseAuth.mockReturnValue({
      authenticated: true,
      checking: false,
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should now show protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('transitions from checking to unauthenticated state', async () => {
    // Start with checking state
    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: true,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Simulate authentication check completing - user not authenticated
    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: false,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should trigger redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders complex child components when authenticated', () => {
    mockUseAuth.mockReturnValue({
      authenticated: true,
      checking: false,
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>
          <h1>Complex Component</h1>
          <p>With multiple elements</p>
          <button>Action Button</button>
        </div>
      </ProtectedRoute>
    );

    // Should render all child elements
    expect(screen.getByText('Complex Component')).toBeInTheDocument();
    expect(screen.getByText('With multiple elements')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  test('logs redirect action when redirecting unauthenticated user', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockUseAuth.mockReturnValue({
      authenticated: false,
      checking: false,
      user: null,
      refreshAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ProtectedRoute: User not authenticated, redirecting to home page')
      );
    });

    consoleSpy.mockRestore();
  });
});
