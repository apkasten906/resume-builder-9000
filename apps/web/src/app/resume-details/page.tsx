import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResumeDetailsClient } from '@/components/resume-details/ResumeDetailsClient';

interface ResumeDetailsPageProps {
  readonly searchParams?: { id?: string };
}

export default function ResumeDetailsPage({
  searchParams,
}: ResumeDetailsPageProps): React.ReactElement {
  const uploadId = searchParams?.id ?? '';

  if (!uploadId) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select a resume upload from your dashboard to view its parsed details.
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return <ResumeDetailsClient uploadId={uploadId} />;
}
