'use client';
import React, { useRef, useState } from 'react';

export default function ResumeUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parsed, setParsed] = useState<null | {
    summary: string;
    experience: string[];
    skills: string[];
  }>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    setParsed(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // Only allow PDF, DOCX, TXT
    if (!/(pdf|docx|txt)$/i.test(file.name.split('.').pop() || '')) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setUploading(true);
    try {
      // Simulate upload and parsing (replace with real API call)
      await new Promise(res => setTimeout(res, 1000));
      // Fake parsed data for demo
      setParsed({
        summary: 'Summary: Experienced software engineer with a focus on resume parsing.',
        experience: ['Company A: Senior Engineer (2020-2023)', 'Company B: Developer (2017-2020)'],
        skills: ['TypeScript', 'Node.js', 'React', 'Resume Parsing'],
      });
      setSuccess(true);
    } catch {
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
          accept=".pdf,.docx,.txt"
          data-testid="resume-upload-input"
          className="block w-full border border-gray-300 rounded px-3 py-2"
          onChange={handleFileChange}
          aria-label="Resume file input"
          disabled={uploading}
        />
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
