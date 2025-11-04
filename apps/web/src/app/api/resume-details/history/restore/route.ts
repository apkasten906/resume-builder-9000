import { NextRequest, NextResponse } from 'next/server';
import { buildAuthHeaders } from '../../utils';

interface RestorePayload {
  readonly uploadId?: string;
  readonly historyId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: RestorePayload;
  try {
    body = (await req.json()) as RestorePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { uploadId, historyId } = body;
  if (!uploadId || !historyId) {
    return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 });
  }

  const apiBase = process.env.API_BASE || 'http://localhost:4000';
  const headers = {
    ...(buildAuthHeaders(req) as Record<string, string>),
    'Content-Type': 'application/json',
  };

  const response = await fetch(
    `${apiBase}/api/resumes/${uploadId}/parsed-fields/history/${historyId}/restore`,
    {
      method: 'POST',
      headers,
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const parsedFields = data?.parsedFields ?? data;
  const history = data?.history ?? [];
  return NextResponse.json({ parsedFields, history }, { status: response.status });
}
