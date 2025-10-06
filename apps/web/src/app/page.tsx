'use client';
import React, { useEffect, useState } from 'react';
import { Table, TRow, TCell } from '../components/ui/Table';
import { useAuth } from '../context/AuthContext';

type Application = { id: string; company: string; status: string; lastUpdated: string };
type ResumeUpload = { fileName: string; lastUpdated: string };
type User = { name?: string };

export default function Home(): React.ReactElement {
  const { authenticated, checking } = useAuth();
  const [user] = useState<User | null>({ name: 'User' }); // Simplified for now
  const [applications, setApplications] = useState<Application[]>([]);
  const [uploads, setUploads] = useState<ResumeUpload[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (!authenticated) return;
    async function fetchData(): Promise<void> {
      try {
        const appsRes = await fetch('/api/applications');
        const appsData = await appsRes.json();
        const currentApplications = appsData.items || [];
        setApplications(currentApplications);

        const insightsArr: string[] = [];
        // Use local variables instead of state to prevent infinite loop
        const currentUploads = [
          { fileName: 'resume-2025.pdf', lastUpdated: '2025-09-28T10:00:00Z' },
          { fileName: 'resume-2025-ATS.docx', lastUpdated: '2025-09-15T14:30:00Z' },
        ];
        setUploads(currentUploads);

        if (currentUploads.length > 0) {
          const lastUpload = new Date(currentUploads[0].lastUpdated);
          const now = new Date();
          const months =
            (now.getFullYear() - lastUpload.getFullYear()) * 12 +
            (now.getMonth() - lastUpload.getMonth());
          if (months >= 3)
            insightsArr.push(
              'You haven’t updated your resume in 3 months—refresh now for better results'
            );
        }
        if (currentApplications.some((a: Application) => a.status === 'Awaiting Feedback')) {
          insightsArr.push('You have applications awaiting feedback');
        }
        if (currentApplications.length > 0) {
          insightsArr.push('Consider tailoring your resume for new job postings');
        }
        setInsights(insightsArr);
      } finally {
        // No need for loading state
      }
    }
    fetchData();
  }, [authenticated]); // Only depend on authenticated - removing uploads/applications to prevent infinite loop

  // Show loading state while checking authentication
  if (checking) {
    // Show loading view while authentication is being checked
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-4">Welcome to Resume Builder 9000</h2>
        <p className="text-lg mb-6 text-center max-w-xl">
          Create tailored, ATS-friendly resumes that help you stand out from the crowd and land your
          dream job.
        </p>
        <button
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            window.location.href = '/login';
          }}
          aria-label="Get Started"
        >
          Get Started
        </button>
      </div>
    );
  }

  if (!authenticated) {
    // Explicitly show signed-out view if not authenticated
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-4">Welcome to Resume Builder 9000</h2>
        <p className="text-lg mb-6 text-center max-w-xl">
          Create tailored, ATS-friendly resumes that help you stand out from the crowd and land your
          dream job.
        </p>
        <button
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            window.location.href = '/login';
          }}
          aria-label="Get Started"
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <h2 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h2>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Actionable Insights</h3>
          <ul className="list-disc pl-5">
            {insights.map(msg => (
              <li key={msg}>{msg}</li>
            ))}
            {insights.length === 0 && <li>No insights at this time.</li>}
          </ul>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Recent Applications</h3>
            <Table>
              {applications.slice(0, 10).map(app => (
                <TRow key={app.id}>
                  <TCell className="font-semibold">
                    <button
                      type="button"
                      disabled
                      className="text-blue-600 underline cursor-not-allowed bg-transparent p-0 border-none"
                      title="Details page coming soon"
                      aria-label="Application details link placeholder"
                    >
                      {app.company}
                    </button>
                  </TCell>
                  <TCell>{app.status}</TCell>
                  <TCell className="text-xs text-gray-500">
                    {new Date(app.lastUpdated).toLocaleDateString()}
                  </TCell>
                </TRow>
              ))}
              {applications.length === 0 && (
                <TRow>
                  <td colSpan={3} className="text-gray-500">
                    No applications found.
                  </td>
                </TRow>
              )}
            </Table>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Recent Resume Uploads</h3>
            <Table>
              {uploads.slice(0, 10).map(upload => (
                <TRow key={upload.fileName}>
                  <TCell className="font-semibold">
                    <button
                      type="button"
                      disabled
                      className="text-blue-600 underline cursor-not-allowed bg-transparent p-0 border-none"
                      title="Resume details page coming soon"
                      aria-label="Resume details link placeholder"
                    >
                      {upload.fileName}
                    </button>
                  </TCell>
                  <TCell className="text-xs text-gray-500">
                    {new Date(upload.lastUpdated).toLocaleDateString()}
                  </TCell>
                </TRow>
              ))}
              {uploads.length === 0 && (
                <TRow>
                  <td colSpan={2} className="text-gray-500">
                    No uploads found.
                  </td>
                </TRow>
              )}
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}
