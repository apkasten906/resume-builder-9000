import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Check for session cookie and return user info if valid
  const session = req.cookies.get('session')?.value;
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  // Forward to backend API for validation
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  const res = await fetch(`${apiBase}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${session}` },
  });
  if (!res.ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const data = await res.json();
  return NextResponse.json({ authenticated: true, user: data }, { status: 200 });
}
