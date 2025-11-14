import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || 'http://localhost:4002';

/**
 * POST /api/resume - Proxy to backend /api/resumes for resume upload and parsing
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the FormData from the request
    const formData = await request.formData();

    // Forward the FormData to the backend
    const response = await fetch(`${API_BASE}/api/resumes`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let fetch set it with the boundary
      headers: {
        // Forward cookies for authentication
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying resume upload:', error);
    return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
  }
}
