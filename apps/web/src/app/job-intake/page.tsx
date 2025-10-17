'use client';
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { z } from 'zod';
import { toast } from '@/components/ui/toaster';
import { validateFile } from './job-intake-utils';
import {
  API,
  type ParseJobDescriptionRequest,
  type ParseJobDescriptionResponse,
} from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const jdSchema = z.object({ text: z.string().min(10, 'Please paste a longer job description') });

type ParsedJD = {
  title?: string;
  company?: string;
  location?: string;
  requirements?: string[];
  keywords?: string[];
  mustHaves?: string[];
  niceToHaves?: string[];
};

const JobIntakePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [jd, setJd] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [parsed, setParsed] = useState<ParsedJD | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to render must-have requirements
  const renderMustHaveRequirements = (parsed: ParsedJD): React.ReactNode => {
    if (parsed.mustHaves?.length) {
      return parsed.mustHaves.map((r: string) => (
        <li key={r} className="text-amber-700 dark:text-amber-500">
          {r}
        </li>
      ));
    } else if (parsed.requirements?.length) {
      return parsed.requirements
        .slice(0, Math.max(2, Math.floor(parsed.requirements.length / 2)))
        .map((r: string) => (
          <li key={r} className="text-amber-700 dark:text-amber-500">
            {r}
          </li>
        ));
    } else {
      return <li className="text-gray-500">None detected</li>;
    }
  };

  // Helper function to render nice-to-have requirements
  const renderNiceToHaveRequirements = (parsed: ParsedJD): React.ReactNode => {
    if (parsed.niceToHaves?.length) {
      return parsed.niceToHaves.map((r: string) => <li key={r}>{r}</li>);
    } else if (parsed.requirements?.length) {
      return parsed.requirements
        .slice(Math.max(2, Math.floor(parsed.requirements.length / 2)))
        .map((r: string) => <li key={r}>{r}</li>);
    } else {
      return <li className="text-gray-500">None detected</li>;
    }
  };

  async function parseText(): Promise<void> {
    setIsLoading(true);
    const v = jdSchema.safeParse({ text: jd });
    if (!v.success) {
      setError(v.error.issues[0].message);
      setIsLoading(false);
      return;
    }
    setError('');
    try {
      const data = await API.jobDescription.post<
        ParseJobDescriptionRequest,
        ParseJobDescriptionResponse
      >({ text: jd }, '/parse');
      setParsed(data);
      toast({ title: 'JD parsed', description: 'Extracted role, company, and keywords' });
    } catch (error) {
      console.error('Parse error:', error);
      toast({ title: 'Parse error', description: 'An error occurred while parsing' });
    } finally {
      setIsLoading(false);
    }
  }

  async function parseFile(): Promise<void> {
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await file.text();
      const data = await API.jobDescription.post<
        ParseJobDescriptionRequest,
        ParseJobDescriptionResponse
      >({ text, fileName: file.name }, '/parse');
      setParsed(data);
      toast({ title: 'JD parsed', description: 'Extracted role, company, and keywords from file' });
    } catch (error) {
      console.error('File parse error:', error);
      toast({ title: 'Parse error', description: 'An error occurred while parsing the file' });
    } finally {
      setIsLoading(false);
    }
  }

  // Function now inlined in the button component

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = e.target.files;
    handleFiles(files);
  }

  function handleFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;
    const f = files[0];
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  }

  function triggerFileSelect(): void {
    inputRef.current?.click();
  }

  // Function now inlined in the button component

  return (
    <ProtectedRoute>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description Intake</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 mb-4">
              <button
                onClick={() => setActiveTab('paste')}
                className={[
                  'px-3 py-2 rounded-t-2xl',
                  activeTab === 'paste'
                    ? 'bg-white dark:bg-zinc-900 shadow font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800',
                ].join(' ')}
              >
                Paste Text
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={[
                  'px-3 py-2 rounded-t-2xl',
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-zinc-900 shadow font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800',
                ].join(' ')}
              >
                Upload File
              </button>
            </div>

            {activeTab === 'paste' ? (
              <>
                <Textarea
                  data-testid="jd-paste-textarea"
                  label="Paste JD"
                  placeholder="Paste the job description here..."
                  value={jd}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJd(e.target.value)}
                  error={error}
                />
                <Button onClick={parseText} disabled={isLoading || jd.length < 10}>
                  {isLoading ? 'Parsing...' : 'Parse'}
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onDrop={(e: React.DragEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer?.files;
                    handleFiles(files);
                  }}
                  onDragOver={(e: React.DragEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl p-8 text-center w-full hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                  onClick={triggerFileSelect}
                  aria-label="Upload job description file"
                  data-testid="jd-upload-dropzone"
                >
                  <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={onFileChange}
                    data-testid="jd-upload-input"
                  />
                  <div className="text-gray-500 dark:text-gray-400">
                    {file ? (
                      <div>
                        <p className="font-medium">Selected file:</p>
                        <p className="text-blue-600 dark:text-blue-400">{file.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Drag and drop your file here</p>
                        <p>or click to browse (PDF, DOCX, TXT, MD)</p>
                      </div>
                    )}
                  </div>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </button>
                <Button onClick={parseFile} disabled={isLoading || !file}>
                  {isLoading ? 'Parsing...' : 'Parse File'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {parsed && (
          <Card>
            <CardHeader>
              <CardTitle>Parsed JD</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Role</div>
                <div className="font-semibold">{parsed.title || 'Not detected'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-semibold">{parsed.company || 'Not detected'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-semibold">{parsed.location || 'Not detected'}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-semibold mb-2">Must-Have Requirements</div>
                <ul className="list-disc pl-4 space-y-1">{renderMustHaveRequirements(parsed)}</ul>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-semibold mb-2">Nice-to-Have Requirements</div>
                <ul className="list-disc pl-4 space-y-1">{renderNiceToHaveRequirements(parsed)}</ul>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Keywords</div>
                <div className="flex gap-2 flex-wrap">
                  {parsed.keywords?.length ? (
                    parsed.keywords.map((k: string) => (
                      <Badge
                        key={k}
                        className="bg-gray-200 text-gray-900 dark:bg-zinc-800 dark:text-gray-100"
                      >
                        {k}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No keywords detected</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default JobIntakePage;
