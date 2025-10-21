'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type Resume = {
  id: string;
  name: string;
  dateCreated: string;
};

export default function OutputPage(): React.ReactElement {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<
    { name: string; url: string; format: string }[]
  >([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);

  // Fetch available resumes
  useEffect(() => {
    async function fetchResumes(): Promise<void> {
      try {
        // In a real app, this would call your API
        // For now, we'll use dummy data
        const dummyResumes = [
          { id: '1', name: 'Software Engineer Resume', dateCreated: '2025-09-20' },
          { id: '2', name: 'Product Manager Resume', dateCreated: '2025-09-22' },
          { id: '3', name: 'Data Scientist Resume', dateCreated: '2025-09-25' },
        ];
        setResumes(dummyResumes);
        setSelectedResumeId(dummyResumes[0].id);
      } catch (error) {
        console.error('Error fetching resumes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resumes. Please try again.',
        });
      }
    }

    fetchResumes();
  }, []);

  const handleGenerateOutput = async (): Promise<void> => {
    if (!selectedResumeId) {
      toast({
        title: 'Error',
        description: 'Please select a resume first.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedFiles([]);
    setRedFlags([]);

    try {
      // In a real app, this would call your API endpoint
      // Simulating API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sample response data
      const files = [
        {
          name: `Resume_${selectedResumeId}.pdf`,
          url: '#', // In a real app, this would be a download URL
          format: 'PDF',
        },
        {
          name: `Resume_${selectedResumeId}.docx`,
          url: '#', // In a real app, this would be a download URL
          format: 'DOCX',
        },
      ];

      const flags = [
        'Resume is 3 pages long, consider condensing to 2 pages for better readability',
        'Missing keywords: Docker, Kubernetes',
        'Education section could be moved to the end to prioritize experience',
      ];

      setGeneratedFiles(files);
      setRedFlags(flags);

      toast({
        title: 'Generation Complete',
        description: 'Your resume files are ready for download.',
      });
    } catch (error) {
      console.error('Error generating output:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate resume. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, filename: string): void => {
    // In a real app, this would trigger the download
    // For now, we'll just show a toast
    toast({
      title: 'Download Started',
      description: `Downloading ${filename}...`,
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Generate Output</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Resume Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label htmlFor="resumeSelect" className="block text-sm font-medium mb-2">
                  Select Resume
                </label>
                <select
                  id="resumeSelect"
                  name="resumeId"
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 dark:border-zinc-700"
                >
                  {resumes.map(resume => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name} (Created: {new Date(resume.dateCreated).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={handleGenerateOutput} disabled={isGenerating || !selectedResumeId}>
                {isGenerating ? 'Generating...' : 'Generate Resume'}
              </Button>
            </CardContent>
          </Card>

          {generatedFiles.length > 0 && (
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Generated Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedFiles.map(file => (
                    <div key={file.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="mr-2">{file.format}</Badge>
                        <span>{file.name}</span>
                      </div>
                      <Button onClick={() => handleDownload(file.url, file.name)} className="ml-4">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {redFlags.length > 0 && (
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>Red Flags</span>
                  <Badge className="ml-2 bg-red-100 text-red-800">{redFlags.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {redFlags.map(flag => (
                    <li
                      key={flag}
                      className="flex items-start rounded-md p-2 bg-red-50 dark:bg-red-900/20"
                    >
                      <span className="text-red-600 dark:text-red-400">{flag}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
