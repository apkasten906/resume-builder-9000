import { NextResponse } from 'next/server';

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
      // Optionally forward cookies/auth headers if needed
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }
    type BackendResumeItem = {
      fileName: string;
      lastUpdated: string;
      id: string;
    };

    let data: BackendResumeItem[] | { items: BackendResumeItem[] };
    try {
      data = await res.json();
    } catch {
      // If response is not valid JSON, treat as error
      return NextResponse.json({ error: 'Invalid backend response' }, { status: 500 });
    }
    // Backend already returns the correct format, just pass through

    let items: ResumeUploadItem[] = [];
    if (Array.isArray(data)) {
      items = data;
    } else if ('items' in data && Array.isArray(data.items)) {
      items = data.items;
    }
    return NextResponse.json({ items }, { status: 200 });
  } catch {
    // Network or fetch error
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}
