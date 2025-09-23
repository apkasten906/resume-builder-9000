'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { flags } from '@/lib/flags';

const SettingsPage: React.FC = () => {
  const [ai, setAi] = useState(!!flags.aiTailoring);
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-zinc-800 p-3">
            <div>
              <div className="font-semibold">AI Tailoring</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Experimental semantic scoring in the Tailor page
              </div>
            </div>
            <button
              onClick={() => setAi(x => !x)}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-300"
            >
              <span
                className={[
                  'inline-block h-6 w-6 transform rounded-full bg-white transition',
                  ai ? 'translate-x-7' : 'translate-x-1',
                ].join(' ')}
              />
            </button>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            Current flag: {ai ? <Badge>ON</Badge> : <Badge>OFF</Badge>} — controlled by{' '}
            <code>NEXT_PUBLIC_FEATURE_AI_TAILORING</code> at build time.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
