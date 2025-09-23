import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  const response = NextResponse.json(data, { status: res.status });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);
  return response;
}
