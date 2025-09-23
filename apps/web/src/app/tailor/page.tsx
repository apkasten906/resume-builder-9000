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
  ];
  const [threshold, setThreshold] = useState(60);
  const [bullets, setBullets] = useState<{ id: string; text: string; score: number }[]>([]);
  const [keywords] = useState<string[]>(['next.js', 'node', 'playwright']);

  async function runTailor(): Promise<void> {
    const res = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullets: sample, keywords }),
    });
    const data = await res.json();
    setBullets(data.items || []);
    toast({ title: 'Tailoring complete', description: 'Scores updated' });
  }

  const filtered = useMemo(() => bullets.filter(b => b.score >= threshold), [bullets, threshold]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Tailoring Engine {flags.aiTailoring && <Badge className="ml-2">AI</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-[1fr_2fr] gap-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold">Score threshold: {threshold}</div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={threshold}
              onChange={e => setThreshold(parseInt(e.target.value))}
            />
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Filter bullets by relevance
            </div>
            <Button onClick={runTailor}>Run Tailor</Button>
          </div>
          <div className="space-y-3">
            {filtered.map(b => (
              <div
                key={b.id}
                className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 flex items-start justify-between"
              >
                <div className="pr-4">{b.text}</div>
                <Badge>{b.score}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TailorPage;
