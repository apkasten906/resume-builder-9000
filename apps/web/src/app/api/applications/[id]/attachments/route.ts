import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const body = await req.json();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/applications/${params.id}/attachments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include' as RequestCredentials,
    }
  );
  return NextResponse.json(await res.json(), { status: res.status });
}
