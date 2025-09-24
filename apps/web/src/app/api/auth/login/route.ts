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

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));

  if (res.ok && data?.token) {
    // Set the session cookie and redirect to /applications
    const response = NextResponse.redirect(new URL('/applications', req.url));
    response.cookies.set('session', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set to true in production with HTTPS
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } else {
    // Redirect back to login with error param
    const url = new URL('/login', req.url);
    url.searchParams.set('error', 'invalid');
    return NextResponse.redirect(url);
  }
}
