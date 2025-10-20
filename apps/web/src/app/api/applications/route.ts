import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Forward the auth token or session cookie to the backend API
  const authHeader = req.headers.get('authorization');
  const sessionCookie = req.cookies.get('session');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Set Authorization header from highest priority to lowest
  if (authHeader) {
    // If there's an Authorization header, use that
    headers['Authorization'] = authHeader;
  } else if (sessionCookie) {
    // If there's a session cookie, convert it to Bearer token
    headers['Authorization'] = `Bearer ${sessionCookie.value}`;
  }

  const res = await fetch(`${process.env.API_BASE}/applications`, {
    headers,
    credentials: 'include' as RequestCredentials,
  });

  const data = await res.json().catch(() => ({ items: [] }));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();

  // Forward the auth token or session cookie to the backend API
  const authHeader = req.headers.get('authorization');
  const sessionCookie = req.cookies.get('session');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Set Authorization header from highest priority to lowest
  if (authHeader) {
    // If there's an Authorization header, use that
    headers['Authorization'] = authHeader;
  } else if (sessionCookie) {
    // If there's a session cookie, convert it to Bearer token
    headers['Authorization'] = `Bearer ${sessionCookie.value}`;
  }

  const res = await fetch(`${process.env.API_BASE}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include' as RequestCredentials,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
