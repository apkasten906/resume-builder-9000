'use client';
import React, { useRef, useState } from 'react';

import type { ReactElement } from 'react';
import { validateFile, logPlaywrightDebug } from './resume-upload-utils';
export default function ResumeUploadPage(): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parsed, setParsed] = useState<null | {
    summary: string;
    experience: string[];
    skills: string[];
  }>(null);
  const [debug, setDebug] = useState<string | null>(null);

  // ...existing code...

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setError(null);
    setSuccess(false);
    setParsed(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const isPlaywright =
        typeof window !== 'undefined' &&
        window.navigator.userAgent.toLowerCase().includes('playwright');
      const res = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
        headers: isPlaywright ? { 'x-dev-e2e-test': 'true' } : undefined,
      });
      let debugInfo = '';
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        debugInfo = `Error: ${JSON.stringify(data)}`;
        setDebug(debugInfo);
        logPlaywrightDebug(debugInfo);
        // Show a visible error if backend returns empty error object
        if (!data.error || Object.keys(data).length === 0) {
          setError(
            'Resume upload failed: No response from backend. Please check backend logs or E2E mode.'
          );
        } else {
          setError(data.error || debugInfo || 'Failed to upload or parse resume.');
        }
        return;
      }
      const data = await res.json();
      debugInfo = `Success: ${JSON.stringify(data)}`;
      setDebug(debugInfo);
      logPlaywrightDebug(debugInfo);
      // Assume backend returns { summary, experience, skills }
      setParsed({
        summary: data.summary,
        experience: data.experience,
        skills: data.skills,
      });
      setSuccess(true);
    } catch (err) {
      setDebug(`Exception: ${err instanceof Error ? err.stack || err.message : String(err)}`);
      setError('Failed to upload or parse resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Upload Your Resume</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={e => e.preventDefault()}
        aria-label="Resume upload form"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          data-testid="resume-upload-input"
          className="block w-full border border-gray-300 rounded px-3 py-2"
          onChange={handleFileChange}
          aria-label="Resume file input"
          aria-describedby="resume-upload-desc"
          disabled={uploading}
        />
        <div id="resume-upload-desc" className="text-sm text-gray-500">
          Accepted formats: PDF, DOCX, TXT, MD. Max size: 5MB.
        </div>
        {uploading && <div className="text-blue-600">Uploading...</div>}
        {error && (
          <div className="text-red-600" data-testid="resume-upload-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <output
            className="text-green-700 font-semibold"
            data-testid="resume-upload-success"
            aria-live="polite"
          >
            Resume uploaded and parsed successfully!
          </output>
        )}
      </form>
      {debug && (
        <pre
          data-testid="resume-upload-debug"
          style={{ color: '#888', fontSize: 12, marginTop: 8 }}
        >
          {debug}
        </pre>
      )}
      {parsed && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Parsed Resume Data</h2>
          <div data-testid="parsed-summary" className="mb-2">
            {parsed.summary}
          </div>
          <div data-testid="parsed-experience" className="mb-2">
            <strong>Experience:</strong>
            <ul className="list-disc ml-6">
              {parsed.experience.map(exp => (
                <li key={exp}>{exp}</li>
              ))}
            </ul>
          </div>
          <div data-testid="parsed-skills">
            <strong>Skills:</strong> {parsed.skills.join(', ')}
          </div>
        </section>
      )}
    </main>
  );
}
