import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let email = '';
  let password = '';
  let confirmPassword = '';
  let fullName: string | undefined;

  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json();
    email = body.email;
    password = body.password;
    confirmPassword = body.confirmPassword;
    fullName = body.fullName;
  } else {
    const formData = await req.formData();
    email = (formData.get('email') as string) ?? '';
    password = (formData.get('password') as string) ?? '';
    confirmPassword = (formData.get('confirmPassword') as string) ?? '';
    fullName = formData.get('fullName') as string | undefined;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  const response = await fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword, fullName }),
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    const nextResponse = NextResponse.json({ success: true, user: data.user });

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

  return NextResponse.json(data ?? { error: 'Registration failed' }, { status: response.status });
}
