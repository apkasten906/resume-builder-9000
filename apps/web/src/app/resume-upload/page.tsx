import React, { Suspense } from 'react';
import ResumeUploadInteractive from '@/components/ResumeUploadInteractive';

// Server component: render the non-interactive shell so DOM-level tests can find the table
export default function ResumeUploadPage(): React.ReactElement {
  // Keep the server-side page minimal — the interactive client component
  // provides the upload controls and recent-uploads list to avoid duplicate UI.
  return (
    <div className="">
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <ResumeUploadInteractive />
      </Suspense>
    </div>
  );
}
