import { NextResponse } from 'next/server';

// Disable caching to ensure fresh data on every request
// Force rebuild timestamp: 2025-10-23
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// API base URL is read inside the handler for testability

type ResumeUploadItem = {
  fileName: string;
  lastUpdated: string;
  id: string;
};

export async function GET(): Promise<NextResponse> {
  const API_BASE = process.env.API_BASE || 'http://localhost:4000';
  try {
    // Call backend API endpoint for resume uploads
    const res = await fetch(`${API_BASE}/api/resumes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Ensure fresh data on every request
      // Optionally forward cookies/auth headers if needed
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }
    type BackendResumeItem = {
      content: string;
      createdAt: string;
      id: string;
    };

    let data: BackendResumeItem[] | { items: BackendResumeItem[] };
    try {
      data = await res.json();
    } catch {
      // If response is not valid JSON, treat as error
      return NextResponse.json({ error: 'Invalid backend response' }, { status: 500 });
    }
    // Map backend response to dashboard format

    let items: ResumeUploadItem[] = [];
    if (Array.isArray(data)) {
      items = data.map((r: BackendResumeItem) => ({
        fileName: r.content,
        lastUpdated: r.createdAt,
        id: r.id,
      }));
    } else if ('items' in data && Array.isArray(data.items)) {
      items = data.items.map((r: BackendResumeItem) => ({
        fileName: r.content,
        lastUpdated: r.createdAt,
        id: r.id,
      }));
    }
    return NextResponse.json({ items }, { status: 200 });
  } catch {
    // Network or fetch error
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
