import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with real database integration
const mockUploads = [
  { fileName: 'resume-2025.pdf', lastUpdated: '2025-09-28T10:00:00Z' },
  { fileName: 'resume-2025-ATS.docx', lastUpdated: '2025-09-15T14:30:00Z' },
];

export async function GET(req: NextRequest): Promise<NextResponse> {
  // In a real app, validate auth and fetch from DB
  return NextResponse.json({ items: mockUploads }, { status: 200 });
}
