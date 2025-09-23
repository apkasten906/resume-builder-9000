import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/resume/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition':
        res.headers.get('content-disposition') || 'attachment; filename="resume.md"',
    },
  });
}
