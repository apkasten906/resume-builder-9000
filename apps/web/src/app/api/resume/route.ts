import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route to forward multipart/form-data uploads to the backend API.
 * Accepts the browser POST from `/api/resume` and forwards to
 * `${API_BASE}/api/resumes` while preserving the body and headers.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const API_BASE = process.env.API_BASE || 'http://localhost:4000';

  try {
    // Forward the incoming request body directly to the backend.
    // We use req.body to stream the original multipart payload.
    // Prepare headers to forward. It's important to forward the Content-Type
    // header (including multipart boundary) so multer can parse the body on the backend.
    const headers: Record<string, string> = {};
    const ct = req.headers.get('content-type');
    if (ct) headers['content-type'] = ct;
    const accept = req.headers.get('accept');
    if (accept) headers['accept'] = accept;
    const cookie = req.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;
    const auth = req.headers.get('authorization');
    if (auth) {
      headers['authorization'] = auth;
    } else {
      const sessionCookie = req.cookies.get('session');
      if (sessionCookie) {
        headers['authorization'] = `Bearer ${sessionCookie.value}`;
      }
    }

    const bodyBuffer = Buffer.from(await req.arrayBuffer());

    const backendRes = await fetch(`${API_BASE}/api/resumes`, {
      method: 'POST',
      headers,
      body: bodyBuffer,
    });

    const contentType = backendRes.headers.get('content-type') || 'application/json';
    const body = await backendRes.arrayBuffer();

    return new NextResponse(body, {
      status: backendRes.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Resume proxy error:', err);
    return NextResponse.json({ error: 'Failed to forward resume upload' }, { status: 500 });
  }
}
