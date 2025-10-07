'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';

export type User = {
  id?: string;
  email?: string;
  name?: string;
  roles?: string[];
} | null;

type MeResponse = {
  authenticated: boolean;
  user?: User;
};

export interface AuthContextValue {
  authenticated: boolean;
  checking: boolean;
  user: User;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  // Debug logging for state changes (reduced to prevent spam)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 AuthContext: authenticated=${authenticated}, checking=${checking}`);
    }
  }, [authenticated, checking]);

  // Request deduplication: prevent multiple concurrent auth requests
  const refreshAuthPromiseRef = useRef<Promise<void> | null>(null);
  const effectRunCount = useRef(0);

  const refreshAuth = useCallback(async (): Promise<void> => {
    // If there's already a request in progress, return that promise
    if (refreshAuthPromiseRef.current) {
      console.log('🔄 AuthContext: Reusing existing auth request (preventing duplicate)');
      return refreshAuthPromiseRef.current;
    }

    console.log('🚀 AuthContext: Starting new auth check (manual refresh)');
    setChecking(true);
    // Ensure authenticated is false while checking to prevent navigation flash
    setAuthenticated(false);

    // Create new auth request promise
    const authRequest = async (): Promise<void> => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const isAuthenticated = !!data.authenticated;
          setAuthenticated(isAuthenticated);
          setChecking(false);
        } else {
          setAuthenticated(false);
          setChecking(false);
        }
      } catch (error) {
        console.error('AuthContext: Auth check failed', error);
        setAuthenticated(false);
        setChecking(false);
      } finally {
        console.log('✅ AuthContext: Manual auth refresh completed');
        // Clear the promise reference when complete
        refreshAuthPromiseRef.current = null;
      }
    };

    const authPromise = authRequest();
    // Store the promise to prevent duplicate requests
    refreshAuthPromiseRef.current = authPromise;
    return authPromise;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    // Clear the auth promise first to prevent interference
    refreshAuthPromiseRef.current = null;

    // Immediately set authenticated to false to prevent race conditions
    setAuthenticated(false);
    setChecking(false);

    try {
      // Call the logout API with credentials to ensure cookies are sent
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Logout API returned error status:', response.status);
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    }

    // Redirect to root page after logout to prevent 401 errors on protected pages
    router.push('/');
  }, [router]);

  // Single useEffect for initial auth check - prevents race conditions
  useEffect(() => {
    effectRunCount.current += 1;
    console.log(
      `🏁 AuthContext: useEffect running - initial auth check (run #${effectRunCount.current})`
    );

    // If there's already a request in progress, skip this effect
    if (refreshAuthPromiseRef.current) {
      console.log('🔄 AuthContext: Skipping effect - auth request already in progress');
      return;
    }

    console.log('🚀 AuthContext: Starting new auth check from useEffect');
    setChecking(true);
    setAuthenticated(false);

    // Create and execute auth request directly in useEffect
    const authRequest = async (): Promise<void> => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const isAuthenticated = !!data.authenticated;
          setAuthenticated(isAuthenticated);
          setChecking(false);
        } else {
          setAuthenticated(false);
          setChecking(false);
        }
      } catch (error) {
        console.error('AuthContext: Auth check failed', error);
        setAuthenticated(false);
        setChecking(false);
      } finally {
        console.log('✅ AuthContext: Auth check completed');
        refreshAuthPromiseRef.current = null;
      }
    };

    const authPromise = authRequest();
    refreshAuthPromiseRef.current = authPromise;
  }, []); // Empty dependency array - only run on mount

  const contextValue = React.useMemo(
    () => ({
      authenticated,
      checking,
      user,
      refreshAuth,
      logout,
    }),
    [authenticated, checking, user] // refreshAuth and logout are stable callbacks
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
