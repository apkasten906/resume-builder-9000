'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

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

  const refreshAuth = useCallback(async (): Promise<void> => {
    setChecking(true);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setAuthenticated(false);
        setUser(null);
        return;
      }
      const data = (await res.json()) as MeResponse;
      setAuthenticated(Boolean(data?.authenticated));
      setUser(data?.user ?? null);
    } catch {
      setAuthenticated(false);
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    await refreshAuth(); // sets authenticated=false and user=null
  }, [refreshAuth]);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({ authenticated, checking, user, refreshAuth, logout }),
    [authenticated, checking, user, refreshAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
