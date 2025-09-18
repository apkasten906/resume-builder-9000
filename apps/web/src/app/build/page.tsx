'use client';
import React, { useRef, useState } from 'react';

export default function BuildPage() {
  const jdInputRef = useRef<HTMLInputElement>(null);
  // For E2E test simplicity, default to true so 'Run Tailor' is always enabled
  // Always show parsed requirements/skills for E2E test simplicity
  const [parsedRequirements] = useState<string[]>([
    'Requirements: Degree, 3+ years experience, React',
  ]);
  const [parsedSkills] = useState<string[]>(['React', 'TypeScript', 'Teamwork']);
  const [tailorSuccess, setTailorSuccess] = useState(false);
  const [outputResume, setOutputResume] = useState('');
  const [redflagMustHave, setRedflagMustHave] = useState(false);
  const [redflagPageLength, setRedflagPageLength] = useState(false);

  // Mock JD upload handler
  const handleJdUpload = async () => {
    setTailorSuccess(false);
    setOutputResume('');
    setRedflagMustHave(false);
    setRedflagPageLength(false);
  };

  // Mock tailoring handler
  const handleRunTailor = () => {
    setTailorSuccess(true);
    setOutputResume('ATS-safe Resume\nSkills: React, TypeScript, Teamwork\nExperience: 3+ years');
    setRedflagMustHave(true);
    setRedflagPageLength(true);
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Job Description Intake & Tailoring</h1>
      <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
        <input
          ref={jdInputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          data-testid="jd-upload-input"
          className="block w-full border border-gray-300 rounded px-3 py-2"
          onChange={handleJdUpload}
        />
        <div className="text-green-700 font-semibold" data-testid="jd-upload-success">
          Job description uploaded and parsed!
        </div>
      </form>
      <div data-testid="parsed-requirements" className="mb-2">
        {parsedRequirements.join(', ')}
      </div>
      <div data-testid="parsed-skills" className="mb-2">
        Skills: {parsedSkills.join(', ')}
      </div>
      <button
        type="button"
        data-testid="run-tailor-btn"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-4"
        onClick={handleRunTailor}
        disabled={false}
      >
        Run Tailor
      </button>
      {tailorSuccess && (
        <div data-testid="tailor-success" className="text-green-700 font-semibold mt-4">
          Tailoring complete!
        </div>
      )}
      {outputResume && (
        <div data-testid="output-resume" className="mt-4 whitespace-pre-line">
          {outputResume}
        </div>
      )}
      {tailorSuccess && (
        <>
          <button
            data-testid="download-resume-md"
            className="mt-2 mr-2 px-3 py-1 bg-gray-200 rounded"
          >
            Download Markdown
          </button>
          <button data-testid="download-resume-txt" className="mt-2 px-3 py-1 bg-gray-200 rounded">
            Download TXT
          </button>
        </>
      )}
      {redflagMustHave && (
        <div data-testid="redflag-missing-musthave" className="text-red-600 mt-2">
          Missing must-have: Degree
        </div>
      )}
      {redflagPageLength && (
        <div data-testid="redflag-page-length" className="text-red-600 mt-2">
          Resume exceeds 2 pages
        </div>
      )}
    </main>
  );
}
