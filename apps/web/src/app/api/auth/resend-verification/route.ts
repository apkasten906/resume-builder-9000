import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email : undefined;

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

  try {
    const response = await fetch(`${apiBase}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return NextResponse.json({ success: true, ...data });
    }

    return NextResponse.json(data ?? { error: 'Failed to resend verification email.' }, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to authentication service.' },
      { status: 500 }
    );
  }
}
