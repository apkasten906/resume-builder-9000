'use client';
import React, { useRef, useState, DragEvent, KeyboardEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { validateFile } from './resume-upload-utils';
import { toast } from '@/components/ui/toaster';
import { API } from '@/lib/api-client';

export default function ResumeUploadPage(): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{
    summary?: string;
    experience?: string[];
    skills?: string[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  // Dashboard uploads state for refresh
  const [uploads, setUploads] = useState<
    Array<{ fileName: string; lastUpdated: string; id: string }>
  >([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState<string | null>(null);

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

    setLoading(true);
    setError(null);

    try {
      // Prevent reading very large files into memory
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        setError('File is too large. Maximum allowed size is 5MB.');
        setFile(null);
        return;
      }

      // Upload file to backend (multipart/form-data)
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        setError(errJson.error || 'Failed to upload/parse resume.');
        setLoading(false);
        return;
      }
      const data = await uploadRes.json();
      setParsed({
        summary: data.summary,
        experience: data.experience ?? [],
        skills: data.skills ?? [],
      });
      toast({ title: 'Resume parsed', description: 'Extracted summary, experience, skills' });

      // Refresh dashboard uploads after successful upload
      setUploadsLoading(true);
      setUploadsError(null);
      try {
        const res = await API.uploads.get<{
          items: Array<{ fileName: string; lastUpdated: string; id: string }>;
        }>('');
        setUploads(res.items || []);
      } catch {
        // Use user-friendly, actionable message from story
        setUploadsError(
          'Apologies! We are having trouble retrieving your uploaded resumes right now.'
        );
      } finally {
        setUploadsLoading(false);
      }
    } catch (error) {
      setError('Failed to parse resume. Please try again or check your file format.');
      console.error('Parse error:', error);
    } finally {
      setLoading(false);
    }
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
            tabIndex={loading ? -1 : 0}
            onKeyDown={loading ? undefined : handleKeyDown}
            onDragOver={loading ? undefined : handleDragOver}
            onDrop={loading ? undefined : handleDrop}
            aria-describedby="resume-help"
            className={`border-2 border-dashed rounded-2xl p-8 text-center bg-white dark:bg-zinc-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={
              loading
                ? undefined
                : (): void => {
                    inputRef.current?.click();
                  }
            }
            disabled={loading}
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
            <Button onClick={parse} disabled={!file || loading} data-testid="parse-button">
              {loading ? 'Uploading...' : 'Upload Resume'}
            </Button>

            {/* Live region for upload status so screen readers announce progress */}
            <div aria-live="polite" className="sr-only">
              {loading ? 'Uploading resume, please wait.' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optionally show dashboard uploads after parse */}
      {(uploadsLoading || uploadsError || uploads.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Resume Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadsLoading && <div className="text-gray-500">Loading uploads...</div>}
            {uploadsError && <div className="text-red-600">{uploadsError}</div>}
            {!uploadsLoading && !uploadsError && (
              <ul className="list-disc pl-4">
                {uploads.slice(0, 10).map(u => (
                  <li key={u.id} className="text-sm">
                    {u.fileName}{' '}
                    <span className="text-xs text-gray-500">
                      ({new Date(u.lastUpdated).toLocaleDateString()})
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {!uploadsLoading && !uploadsError && uploads.length === 0 && (
              <div className="text-gray-500">No uploads found.</div>
            )}
          </CardContent>
        </Card>
      )}

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
