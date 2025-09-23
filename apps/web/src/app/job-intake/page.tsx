'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { z } from 'zod';
import { toast } from '@/components/ui/toaster';

const jdSchema = z.object({ text: z.string().min(10, 'Please paste a longer job description') });

type ParsedJD = {
  title?: string;
  company?: string;
  location?: string;
  requirements?: string[];
  keywords?: string[];
};

const JobIntakePage: React.FC = () => {
  const [jd, setJd] = useState('');
  const [parsed, setParsed] = useState<ParsedJD | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function parse(): Promise<void> {
    const v = jdSchema.safeParse({ text: jd });
    if (!v.success) {
      setError(v.error.issues[0].message);
      return;
    }
    setError(undefined);
    const res = await fetch('/api/jd/parse', {
      method: 'POST',
      body: JSON.stringify({ text: jd }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      toast({ title: 'Parse failed' });
      return;
    }
    const data = await res.json();
    setParsed(data);
    toast({ title: 'JD parsed', description: 'Extracted role, company, and keywords' });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Description Intake</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea
            label="Paste JD"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJd(e.target.value)}
            error={error}
          />
          <Button onClick={parse}>Parse</Button>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed JD</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Role</div>
              <div className="font-semibold">{parsed.title}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Company</div>
              <div className="font-semibold">{parsed.company}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-semibold">{parsed.location}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-semibold mb-2">Requirements</div>
              <ul className="list-disc pl-4 space-y-1">
                {parsed.requirements?.map(r => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Keywords</div>
              <div className="flex gap-2 flex-wrap">
                {parsed.keywords?.map(k => (
                  <Badge key={k}>{k}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobIntakePage;
