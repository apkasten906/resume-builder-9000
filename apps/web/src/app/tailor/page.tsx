'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { flags } from '@/lib/flags';
import { toast } from '@/components/ui/toaster';

const TailorPage: React.FC = () => {
  const sample = [
    'Built Next.js resume tool with ATS-friendly sections',
    'Optimized Node.js API with SQLite and caching',
    'Implemented Playwright E2E coverage',
    'Led Agile ceremonies and stakeholder alignment',
    'Developed TypeScript interfaces to ensure type safety across the application',
    'Integrated CI/CD pipelines using GitHub Actions for automated testing and deployment',
  ];
  
  const [threshold, setThreshold] = useState(60);
  const [bullets, setBullets] = useState<
    { id: string; text: string; score: number; keywords?: string[] }[]
  >([]);
  const [keywords] = useState<string[]>([
    'next.js',
    'typescript',
    'playwright',
    'ci/cd',
    'github actions',
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function runTailor(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets: sample, keywords }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to tailor resume');
      }
      
      const data = await res.json();
      
      // Add keywords to each bullet for better UI display
      const enhancedBullets = (data.items || []).map(
        (bullet: { id: string; text: string; score: number }) => ({
          ...bullet,
          keywords: keywords.filter(keyword =>
            bullet.text.toLowerCase().includes(keyword.toLowerCase())
          ),
        })
      );
      
      setBullets(enhancedBullets);
      toast({ 
        title: 'Tailoring complete',
        description: 'Your resume has been tailored to match the job requirements.',
      });
    } catch (error) {
      console.error('Error during tailoring:', error);
      toast({
        title: 'Error',
        description: 'Failed to tailor resume. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = useMemo(
    () => bullets.filter(b => b.score >= threshold / 100),
    [bullets, threshold]
  );

  // Helper function to determine the badge color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 0.85) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 0.7) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  // Function to render bullets based on filter state
  const renderBullets = (): React.ReactNode => {
    if (filtered.length > 0) {
      return filtered.map(b => (
        <div
          key={b.id}
          className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start justify-between"
        >
          <div className="pr-4">
            <p>{b.text}</p>
            {b.keywords && b.keywords.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {b.keywords.map(keyword => (
                  <Badge 
                    key={`${b.id}-${keyword}`} 
                    className="text-xs bg-gray-100"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div 
            className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(b.score)}`}
          >
            {Math.round(b.score * 100)}%
          </div>
        </div>
      ));
    } else if (bullets.length > 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          No bullets match the current threshold. Try lowering the threshold.
        </div>
      );
    } else {
      return (
        <div className="text-center py-6 text-gray-500">
          Click "Run Tailor" to analyze your resume bullets.
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Tailor Your Resume</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {'Tailoring Engine '}
            {flags.aiTailoring && <Badge className="ml-2 bg-blue-100 text-blue-800">AI</Badge>}
          </CardTitle>
          <div className="text-sm text-gray-500 mt-1">
            Optimize your resume bullets to match job requirements
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-[1fr_2fr] gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold mb-2">Score threshold: {threshold}%</div>
              <input
                type="range"
                className="w-full"
                min={0}
                max={100}
                step={5}
                value={threshold}
                onChange={e => setThreshold(parseInt(e.target.value))}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Filter bullets by relevance score
              </div>
            </div>
            
            <Button onClick={runTailor} disabled={isLoading} className="w-full">
              {isLoading ? 'Processing...' : 'Run Tailor'}
            </Button>
            
            <div className="text-sm mt-4">
              <h3 className="font-medium mb-2">Current Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <Badge key={keyword} className="bg-gray-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">{renderBullets()}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TailorPage;
