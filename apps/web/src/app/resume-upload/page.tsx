'use client';
import React, { useRef, useState, DragEvent, KeyboardEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { validateFile } from './resume-upload-utils';
import { toast } from '@/components/ui/toaster';

type Parsed = { summary?: string; experience?: string[]; skills?: string[] };

export default function ResumeUploadPage(): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  async function parse(): Promise<void> {
    if (!file) return;
    // Prevent reading very large files into memory
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 5MB.');
      setFile(null);
      return;
    }
    // Call your JD parser via our proxy (reuses your existing API)
    const text = await file.text();
    const res = await fetch('/api/jd/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      toast({ title: 'Parse failed' });
      return;
    }
    const data = (await res.json()) as {
      title?: string;
      requirements?: string[];
      keywords?: string[];
    };
    setParsed({
      summary: data.title,
      experience: data.requirements ?? [],
      skills: data.keywords ?? [],
    });
    toast({ title: 'Resume parsed', description: 'Extracted summary, experience, skills' });
  }

  function handleDragOver(e: DragEvent<HTMLButtonElement>): void {
    e.preventDefault();
  }
  function handleDrop(e: DragEvent<HTMLButtonElement>): void {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  }
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Visually hidden input remains the real control */}
          <input
            ref={inputRef}
            id="resumeFile"
            data-testid="resume-upload-input"
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            aria-invalid={!!error}
            onChange={e => onFiles(e.currentTarget.files)}
          />

          {/* Accessible drop area: now a button for proper interactivity */}
          <button
            type="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            aria-describedby="resume-help"
            className="border-2 border-dashed rounded-2xl p-8 text-center bg-white dark:bg-zinc-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            onClick={() => inputRef.current?.click()}
          >
            <p className="mb-2">Drag &amp; drop your resume here,</p>
            <p className="mb-3">
              or press <kbd>Enter</kbd> / <kbd>Space</kbd> to browse
            </p>
            <p id="resume-help" className="text-xs text-gray-600 dark:text-gray-300">
              Accepted: PDF, DOCX, TXT, MD. Max size: 5MB.
            </p>
          </button>

          {/* Error/selection feedback with SR-friendly announcements */}
          <output aria-live="polite" className="min-h-[1rem] block">
            {error && (
              <div data-testid="resume-upload-error" className="text-red-600 mt-2" role="alert">
                {error}
              </div>
            )}
            {file && !error && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Selected: <Badge>{file.name}</Badge>
              </div>
            )}
          </output>

          <div>
            <Button onClick={parse} disabled={!file}>
              Parse
            </Button>
          </div>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Results</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <h4 className="font-semibold mb-2">Summary</h4>
              <p data-testid="parsed-summary" className="text-sm">
                {parsed.summary}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Experience</h4>
              <ul data-testid="parsed-experience" className="list-disc pl-4 space-y-1">
                {parsed.experience?.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Skills</h4>
              <div data-testid="parsed-skills" className="flex gap-2 flex-wrap">
                {parsed.skills?.map(s => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
