import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const API_BASE = process.env.API_BASE || 'http://localhost:4000';

  try {
    const res = await fetch(`${API_BASE}/api/resumes/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch resume: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resume from backend' }, { status: 500 });
  }
}
