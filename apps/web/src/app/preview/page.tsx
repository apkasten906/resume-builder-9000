'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toaster';

const PreviewPage: React.FC = () => {
  async function download(): Promise<void> {
    const res = await fetch('/api/resume/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '# Resume\n\n- Bullet\n' }),
    });
    if (!res.ok) {
      toast({ title: 'Download failed' });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.md';
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Preview</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-[2fr_1fr] gap-6">
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-semibold mb-2">Firstname Lastname</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              City · Email · Phone · LinkedIn
            </div>
            <h3 className="font-semibold mb-1">Summary</h3>
            <p className="text-sm mb-3">
              Experienced engineer with focus on Next.js, Node.js, and ATS-friendly resume
              generation.
            </p>
            <h3 className="font-semibold mb-1">Experience</h3>
            <ul className="text-sm list-disc pl-4 space-y-1">
              <li>Built RB9K tailoring engine and UI.</li>
              <li>Implemented robust E2E test coverage.</li>
              <li>Drove performance improvements and accessibility compliance.</li>
            </ul>
            <h3 className="font-semibold mt-3 mb-1">Skills</h3>
            <p className="text-sm">TypeScript, React, Next.js, Node.js, SQLite, Playwright</p>
          </div>
          <div className="space-y-3">
            <Button onClick={download}>Download</Button>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Customize sections in Tailor before downloading.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewPage;
