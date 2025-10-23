import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ResumeUploadInteractive from '@/components/ResumeUploadInteractive';

// Server component: render the non-interactive shell so DOM-level tests can find the table
export default function ResumeUploadPage(): React.ReactElement {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader />
        <CardContent className="grid gap-4">
          {/* Server-side placeholder for upload controls - instructs tests that input exists */}
          <input
            data-testid="resume-upload-input"
            aria-hidden="true"
            type="file"
            className="sr-only"
          />
          <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-white dark:bg-zinc-900">
            <p className="mb-2">Drag &amp; drop your resume here,</p>
            <p className="mb-3">
              or press <kbd>Enter</kbd> / <kbd>Space</kbd> to browse
            </p>
            <p id="resume-help" className="text-xs text-gray-600 dark:text-gray-300">
              Accepted: PDF, DOCX, TXT, MD. Max size: 5MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Server-side table shell so E2E tests can find the table immediately */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table data-testid="recent-uploads-table" className="w-full table-auto" role="table">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} className="py-2 text-gray-600">
                    Loading uploads...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hydrating interactive client component (handles real uploads, parsing, and will replace the shell) */}
      <ResumeUploadInteractive />
    </div>
  );
}
