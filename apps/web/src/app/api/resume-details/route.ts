import { NextRequest, NextResponse } from 'next/server';
import { buildAuthHeaders } from './utils';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const uploadId = req.nextUrl.searchParams.get('id');
  if (!uploadId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const apiBase = process.env.API_BASE || 'http://localhost:4000';
  const headers = buildAuthHeaders(req);

  const parsedFieldsResponse = await fetch(`${apiBase}/api/resumes/${uploadId}/parsed-fields`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (parsedFieldsResponse.status === 401) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!parsedFieldsResponse.ok) {
    const errorPayload = await parsedFieldsResponse.json().catch(() => ({}));
    return NextResponse.json(errorPayload || { error: 'Failed to load parsed resume' }, {
      status: parsedFieldsResponse.status,
    });
  }

  const parsedPayload = await parsedFieldsResponse.json();
  const parsedFields = parsedPayload.parsedFields ?? parsedPayload;
  const history = parsedPayload.history ?? [];

  const resumeResponse = await fetch(`${apiBase}/api/resumes/${uploadId}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!resumeResponse.ok) {
    const resumeError = await resumeResponse.json().catch(() => ({}));
    return NextResponse.json(
      {
        parsedFields,
        history,
        resume: null,
        resumeError,
      },
      { status: resumeResponse.status }
    );
  }

  const resume = await resumeResponse.json();
  return NextResponse.json({ parsedFields, history, resume }, { status: 200 });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const uploadId = req.nextUrl.searchParams.get('id');
  if (!uploadId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const apiBase = process.env.API_BASE || 'http://localhost:4000';
  const headers = buildAuthHeaders(req);

  const body = await req.json();

  const response = await fetch(`${apiBase}/api/resumes/${uploadId}/parsed-fields`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const parsedFields = data?.parsedFields ?? data;
  const history = data?.history ?? [];
  return NextResponse.json({ parsedFields, history }, { status: response.status });
}
