'use client';
import { useState, useEffect } from 'react';
import { API, Application } from '../lib/api-client';
import { Table, TRow, TCell } from '../components/ui/Table';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../hooks/useApplications';

type User = {
  id?: string;
  name?: string;
  email?: string;
};
type ResumeUpload = { fileName: string; lastUpdated: string; id: string };

export default function Home(): React.ReactElement {
  const { authenticated, checking } = useAuth();
  const { applications } = useApplications();
  const [user] = useState<User | null>({ name: 'User' }); // Simplified for now
  const [uploads, setUploads] = useState<ResumeUpload[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  // Fetch uploads from API
  useEffect((): void => {
    let ignore = false;
    async function fetchUploads(): Promise<void> {
      setUploadsLoading(true);
      setUploadsError(null);
      try {
        const res = await API.uploads.get<{ items: ResumeUpload[] }>('');
        if (!ignore) {
          setUploads(res.items || []);
        }
      } catch {
        if (!ignore) {
          setUploadsError('Failed to load uploads.');
        }
      } finally {
        if (!ignore) setUploadsLoading(false);
      }
    }
    fetchUploads();
    // No cleanup needed
  }, []);
  const [insights, setInsights] = useState<string[]>([]);

  // Compute insights when applications change
  useEffect(() => {
    if (!authenticated || !applications) return;

    const insightsArr: string[] = [];

    if (uploads.length > 0) {
      const lastUpload = new Date(uploads[0].lastUpdated);
      const now = new Date();
      const months =
        (now.getFullYear() - lastUpload.getFullYear()) * 12 +
        (now.getMonth() - lastUpload.getMonth());
      if (months >= 3) {
        insightsArr.push(
          "You haven't updated your resume in 3 months - refresh now for better results"
        );
      }
    }
    if (applications.some((a: Application) => a.status === 'Interview')) {
      insightsArr.push('You have applications in interview stage');
    }
    if (applications.length > 0) {
      insightsArr.push('Consider tailoring your resume for new job postings');
    }
    setInsights(insightsArr);
  }, [authenticated, applications, uploads]);

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

  // Not authenticated → signed-out hero (unchanged)
  if (!authenticated) {
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

  // Authenticated → dashboard (unchanged)
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
            <div className="bg-white rounded-lg shadow p-4 min-h-[120px] overflow-hidden">
              {uploadsLoading && <div className="text-gray-500">Loading uploads...</div>}
              {!uploadsLoading && uploadsError && (
                <div className="text-red-600">{uploadsError}</div>
              )}
              {!uploadsLoading && !uploadsError && (
                <Table tableClassName="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: '72%' }} />
                    <col style={{ width: '28%' }} />
                  </colgroup>
                  {uploads.slice(0, 10).map(upload => (
                    <TRow key={upload.id}>
                      <TCell className="font-semibold truncate">
                        <a
                          href={`/resume-upload?id=${upload.id}`}
                          title={upload.fileName}
                          className="text-blue-600 underline block truncate"
                          style={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {upload.fileName}
                        </a>
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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
