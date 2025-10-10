import { NextRequest, NextResponse } from 'next/server';

async function forwardVerification(token: string): Promise<NextResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  const response = await fetch(`${apiBase}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    const nextResponse = NextResponse.json({ success: true, ...data });

    if (data?.token) {
      nextResponse.cookies.set('session', data.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return nextResponse;
  }

  const payload =
    typeof data === 'object' && data !== null ? data : { error: 'Email verification failed.' };

  return NextResponse.json(payload, { status: response.status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token : undefined;

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
  }

  return forwardVerification(token);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
  }

  return forwardVerification(token);
}
