'use client';
import React, { useRef, useState, useEffect, DragEvent, KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ParsedRegion } from './ResumePreviewOverlay';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { validateFile } from '@/app/resume-upload/resume-upload-utils';
import { toast } from '@/components/ui/toaster';
import { API } from '@/lib/api-client';
import ReviewSavePanel from './ReviewSavePanel';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Education } from '@rb9k/core';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
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
                uploads.slice(0, 10).map(u => (
                  <tr key={u.id} role="row">
                    <td role="cell" className="py-2">
                      <a
                        data-testid={`resume-link-${u.id}`}
                        href={`/resume-upload?id=${u.id}`}
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

function formatEducationItem(item: Education | string | null | undefined): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  const parts: string[] = [];
  if (item.degree) parts.push(String(item.degree));
  if (item.institution) parts.push(String(item.institution));
  const main = parts.join(', ');
  const extras: string[] = [];
  if (item.graduationDate) extras.push(String(item.graduationDate));
  if (item.highlights) {
    if (Array.isArray(item.highlights)) extras.push(item.highlights.join('; '));
    else extras.push(String(item.highlights));
  }
  return [main, extras.filter(Boolean).join(' — ')].filter(Boolean).join(' — ');
}

function formatGenericItem(
  item: Record<string, unknown> | string | null | undefined,
  fields: string[] = ['name', 'title', 'issuer', 'organization', 'date']
): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  const values: string[] = [];
  for (const f of fields) {
    const v: unknown = (item as Record<string, unknown>)[f];
    if (v !== undefined && v !== null) values.push(String(v));
  }
  return values.join(', ');
}

function hasPersonalDetails(pd: Record<string, unknown> | undefined | null): boolean {
  if (!pd) return false;
  const name = pd['name'];
  const email = pd['email'];
  const phone = pd['phone'];
  const address = pd['address'];
  const profession = pd['profession'];
  const websites = pd['websites'];
  if (name || email || phone || address || profession) return true;
  if (Array.isArray(websites) && (websites as unknown[]).length > 0) return true;
  return false;
}

export default function ResumeUploadInteractive(): React.ReactElement {
  const searchParams = useSearchParams();
  const resumeId = searchParams?.get('id');

  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{
    summary?: string;
    experience?: string[];
    skills?: string[];
    personalDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      profession?: string;
      websites?: string[];
    };
    education?: string[];
    awards?: string[];
    certifications?: string[];
  } | null>(null);
  const [parsedRegions, setParsedRegions] = useState<ParsedRegion[] | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const [pageHeight, setPageHeight] = useState<number>(1100);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch resume details when ID is present in query params
  useEffect(() => {
    if (!resumeId) return;

    async function fetchResumeDetails(): Promise<void> {
      setLoadingDetails(true);
      setError(null);
      try {
        const resume = await API.resumes.get<{
          id: string;
          content: string;
          resumeData: {
            summary?: string;
            experience?: Array<{ title: string; company?: string } | string>;
            skills?: Array<{ name: string } | string>;
            personalDetails?: {
              name?: string;
              email?: string;
              phone?: string;
              address?: string;
              profession?: string;
              websites?: string[];
            };
            education?: Array<Education | string>;
            awards?: string[];
            certifications?: string[];
          };
          createdAt: string;
        }>(resumeId ?? '');

        if (resume.resumeData) {
          // Normalize experience to string array
          const experienceArray =
            resume.resumeData.experience?.map(exp =>
              typeof exp === 'string'
                ? exp
                : `${exp.title}${exp.company ? ` at ${exp.company}` : ''}`
            ) ?? [];

          // Normalize skills to string array
          const skillsArray =
            resume.resumeData.skills?.map(skill =>
              typeof skill === 'string' ? skill : skill.name
            ) ?? [];

          setParsed({
            summary: resume.resumeData.summary,
            experience: experienceArray,
            skills: skillsArray,
            personalDetails: resume.resumeData.personalDetails ?? {},
            education: (resume.resumeData.education ?? []).map(e => formatEducationItem(e)),
            awards: (resume.resumeData.awards ?? []).map(a =>
              formatGenericItem(a, ['name', 'issuer', 'date'])
            ),
            certifications: (resume.resumeData.certifications ?? []).map(c =>
              formatGenericItem(c, ['name', 'organization', 'date'])
            ),
          });
        }
      } catch (err) {
        setError('Failed to load resume details. Please try again.');
        // eslint-disable-next-line no-console
        console.error('Failed to fetch resume:', err);
      } finally {
        setLoadingDetails(false);
      }
    }

    fetchResumeDetails();
  }, [resumeId]);

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
      formData.append('resume', file);
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
        personalDetails: data.personalDetails ?? {},
        education: (data.education ?? []).map((e: unknown) =>
          formatEducationItem(e as Education | string)
        ),
        awards: (data.awards ?? []).map((a: unknown) =>
          formatGenericItem(a as Record<string, unknown> | string, ['name', 'issuer', 'date'])
        ),
        certifications: (data.certifications ?? []).map((c: unknown) =>
          formatGenericItem(c as Record<string, unknown> | string, ['name', 'organization', 'date'])
        ),
      });

      // If parser returned structured regions (for review), store them and page dims
      if (Array.isArray(data.regions)) {
        setParsedRegions(data.regions);
        if (typeof data.pageWidth === 'number') setPageWidth(data.pageWidth);
        if (typeof data.pageHeight === 'number') setPageHeight(data.pageHeight);
      } else {
        setParsedRegions(null);
      }
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
        {loadingDetails && (
          <Card>
            <CardContent className="py-6">
              <div className="text-center text-gray-600" role="status" aria-live="polite">
                Loading resume details...
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingDetails && (
          <>
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
                    <div
                      data-testid="resume-upload-error"
                      className="text-red-600 mt-2"
                      role="alert"
                    >
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
                <CardContent className="space-y-6">
                  {/* Personal Details */}
                  {parsed.personalDetails && hasPersonalDetails(parsed.personalDetails) && (
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Personal Details</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        {parsed.personalDetails.name && (
                          <div data-testid="parsed-name">
                            <span className="font-medium">Name:</span> {parsed.personalDetails.name}
                          </div>
                        )}
                        {parsed.personalDetails.profession && (
                          <div data-testid="parsed-profession">
                            <span className="font-medium">Profession:</span>{' '}
                            {parsed.personalDetails.profession}
                          </div>
                        )}
                        {parsed.personalDetails.email && (
                          <div data-testid="parsed-email">
                            <span className="font-medium">Email:</span>{' '}
                            {parsed.personalDetails.email}
                          </div>
                        )}
                        {parsed.personalDetails.phone && (
                          <div data-testid="parsed-phone">
                            <span className="font-medium">Phone:</span>{' '}
                            {parsed.personalDetails.phone}
                          </div>
                        )}
                        {parsed.personalDetails.address && (
                          <div data-testid="parsed-address" className="md:col-span-2">
                            <span className="font-medium">Address:</span>{' '}
                            {parsed.personalDetails.address}
                          </div>
                        )}
                        {parsed.personalDetails.websites &&
                          parsed.personalDetails.websites.length > 0 && (
                            <div data-testid="parsed-websites" className="md:col-span-2">
                              <span className="font-medium">Websites:</span>{' '}
                              {parsed.personalDetails.websites.join(', ')}
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Summary</h4>
                    <p data-testid="parsed-summary" className="text-sm">
                      {parsed.summary}
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Experience</h4>
                    <ul
                      data-testid="parsed-experience"
                      className="list-disc pl-4 space-y-1 text-sm"
                    >
                      {parsed.experience?.map((x, idx) => (
                        <li key={idx}>{x}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Education */}
                  {parsed.education &&
                    parsed.education.length > 0 &&
                    parsed.education[0] !== 'No education found.' && (
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Education</h4>
                        <ul
                          data-testid="parsed-education"
                          className="list-disc pl-4 space-y-1 text-sm"
                        >
                          {parsed.education.map((edu, idx) => (
                            <li key={idx}>{edu}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-2 text-lg">Skills</h4>
                    <div data-testid="parsed-skills" className="flex gap-2 flex-wrap">
                      {parsed.skills?.map((s, idx) => (
                        <Badge key={idx}>{s}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Awards */}
                  {parsed.awards && parsed.awards.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">Awards & Honors</h4>
                      <ul data-testid="parsed-awards" className="list-disc pl-4 space-y-1 text-sm">
                        {parsed.awards.map((award, idx) => (
                          <li key={idx}>{award}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certifications */}
                  {parsed.certifications && parsed.certifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">Certifications</h4>
                      <ul
                        data-testid="parsed-certifications"
                        className="list-disc pl-4 space-y-1 text-sm"
                      >
                        {parsed.certifications.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {parsedRegions && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Parsed Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewSavePanel
                    initialRegions={parsedRegions ?? []}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    onSaved={() => {
                      toast({ title: 'Saved', description: 'Resume draft saved' });
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Client-side Recent Uploads (will hydrate over the server-rendered table shell) */}
            <RecentUploadsClient />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
