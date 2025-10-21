import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Handle form POST (Content-Type: application/x-www-form-urlencoded or multipart/form-data)
  let email = '';
  let password = '';
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } else {
    const formData = await req.formData();
    email = formData.get('email') as string;
    password = formData.get('password') as string;
  }

  // TEST MODE: Check for test header to simulate 403 unverified email response
  const testMode = req.headers.get('x-test-mode');
  if (testMode === 'unverified-email') {
    return NextResponse.json(
      { error: 'Email not verified', requiresEmailConfirmation: true },
      { status: 403 }
    );
  }

  const apiBase = process.env.API_BASE || 'http://localhost:4000';
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    // Set the session cookie and return JSON success (don't redirect for AJAX calls)
    const response = NextResponse.json({ success: true, authenticated: true });

    // In production, token won't be in response body for security, but cookie is still set by API
    if (data?.token) {
      response.cookies.set('session', data.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Set to true in production with HTTPS
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    return response;
  }

  const status = res.status || 401;
  const errorPayload =
    typeof data === 'object' && data !== null ? data : { error: 'Invalid email or password.' };

  return NextResponse.json(errorPayload, { status });
}
