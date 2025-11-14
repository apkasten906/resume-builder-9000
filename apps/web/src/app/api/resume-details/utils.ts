import type { NextRequest } from 'next/server';

export function buildAuthHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers.Authorization = authHeader;
    return headers;
  }

  const sessionCookie = req.cookies.get('session');
  if (sessionCookie) {
    headers.Authorization = `Bearer ${sessionCookie.value}`;
  }

  return headers;
}
