import { NextRequest, NextResponse } from 'next/server';

const AUTH_SESSION_COOKIE_NAME = 'session';

/** Narrow type for env var to avoid accidental undefined concatenation */
function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';
  return base.replace(/\/+$/, '');
}

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json<{ ok: true }>({ ok: true });

  // Try server-side invalidation (best-effort)
  const session = _req.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (session) {
    try {
      await fetch(`${getApiBase()}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session}` },
      });
    } catch {
      // ignore network errors; we still clear the cookie
    }
  }

  // IMPORTANT: delete with same path/attrs you used to set it
  res.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  res.cookies.delete({ name: AUTH_SESSION_COOKIE_NAME, path: '/' });

  return res;
}
