'use client';
import React, { useRef, useState, useEffect, DragEvent, KeyboardEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { validateFile } from '@/app/resume-upload/resume-upload-utils';
import { toast } from '@/components/ui/toaster';
import { API } from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type UploadItem = { fileName: string; lastUpdated: string; id: string };

function RecentUploadsClient(): React.ReactElement {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [uploadsError, setUploadsError] = useState<string | null>(null);

  async function fetchUploads(): Promise<void> {
    setUploadsLoading(true);
    setUploadsError(null);
    try {
      const res = await API.uploads.get<{ items: UploadItem[] }>('');
      setUploads(res.items || []);
    } catch {
      setUploadsError(
        'Apologies! We are having trouble retrieving your uploaded resumes right now.'
      );
      setUploads([]);
    } finally {
      setUploadsLoading(false);
    }
  }

  useEffect(() => {
    // fetch on mount
    fetchUploads();

    // Listen for custom event when a new upload is completed
    function handleUploadsChanged(): void {
      fetchUploads();
    }
    window.addEventListener('rb9k:uploads:changed', handleUploadsChanged);

    return (): void => {
      window.removeEventListener('rb9k:uploads:changed', handleUploadsChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Uploaded Resumes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <table data-testid="recent-uploads-table" className="w-full table-fixed" role="table">
            <colgroup>
              <col style={{ width: '72%' }} />
              <col style={{ width: '28%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {uploadsLoading ? (
                <tr>
                  <td role="cell" colSpan={2} className="py-2">
                    <div role="status" aria-live="polite">
                      Loading uploads...
                    </div>
                  </td>
                </tr>
              ) : uploadsError ? (
                <tr>
                  <td role="cell" colSpan={2} className="py-2 text-red-600">
                    {uploadsError}
                  </td>
                </tr>
              ) : uploads.length === 0 ? (
                <tr>
                  <td role="cell" colSpan={2} className="py-2 text-gray-600">
                    No uploads yet.
                  </td>
                </tr>
              ) : (
                uploads.map(u => (
                  <tr key={u.id} role="row">
                    <td role="cell" className="py-2">
                      <a
                        data-testid={`resume-link-${u.id}`}
                        href={`/resume-details?id=${u.id}`}
                        className="block max-w-full hover:underline"
                        title={u.fileName}
                      >
                        <span
                          data-testid={`resume-name-${u.id}`}
                          className="truncate block max-w-[100%]"
                          style={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {u.fileName}
                        </span>
                      </a>
                    </td>
                    <td role="cell" className="py-2 text-sm text-gray-600">
                      <span data-testid={`resume-date-${u.id}`}>
                        {new Date(u.lastUpdated).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResumeUploadInteractive(): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{
    summary?: string;
    experience?: string[];
    skills?: string[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

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
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        setError('File is too large. Maximum allowed size is 5MB.');
        setFile(null);
        return;
      }

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

      // After successful upload, trigger a client-side event so RecentUploadsClient can refetch if desired
      // We'll dispatch a simple CustomEvent; RecentUploadsClient could listen for this in a future enhancement.
      window.dispatchEvent(new CustomEvent('rb9k:uploads:changed'));
    } catch (error_) {
      setError('Failed to parse resume. Please try again or check your file format.');
      // keep console error for debugging server/dev only
      // eslint-disable-next-line no-console
      console.error('Parse error:', error_);
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
    <ProtectedRoute>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
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
              <Button
                data-testid="parse-button"
                aria-label="Upload Resume (Parse)"
                onClick={parse}
                disabled={!file || loading}
              >
                {loading ? 'Uploading...' : 'Upload Resume'}
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

        {/* Client-side Recent Uploads (will hydrate over the server-rendered table shell) */}
        <RecentUploadsClient />
      </div>
    </ProtectedRoute>
  );
}
