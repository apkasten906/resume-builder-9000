'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

type ThemeChoice = 'light' | 'dark' | 'brand-emerald';

export default function StyleGuidePage(): React.ReactElement {
  const [theme, setTheme] = React.useState<ThemeChoice>('light');

  React.useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.classList.remove('dark');
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (theme === 'brand-emerald') {
      root.setAttribute('data-theme', 'brand-emerald');
    }
  }, [theme]);

  const colors: Array<{ name: string; token: string }> = [
    { name: 'Background', token: '--background' },
    { name: 'Foreground', token: '--foreground' },
    { name: 'Primary', token: '--primary' },
    { name: 'Secondary', token: '--secondary' },
    { name: 'Accent', token: '--accent' },
    { name: 'Muted', token: '--muted' },
    { name: 'Destructive', token: '--destructive' },
    { name: 'Success', token: '--success' },
    { name: 'Warning', token: '--warning' },
    { name: 'Info', token: '--info' },
  ];

  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Style Guide</h1>
        <div className="flex items-center gap-2 rounded-2xl border p-1">
          {(['light', 'dark', 'brand-emerald'] as ThemeChoice[]).map(name => (
            <button
              key={name}
              onClick={() => setTheme(name)}
              className={`px-3 py-1.5 rounded-xl text-sm transition ${
                theme === name ? 'bg-primary text-primary-foreground shadow-soft' : 'hover:bg-muted'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {colors.map(c => (
            <div key={c.token} className="rounded-xl border p-3 shadow-soft">
              <div
                className="h-16 rounded-md"
                style={{ backgroundColor: `hsl(var(${c.token}))` }}
              />
              <div className="mt-2 text-sm font-medium">{c.name}</div>
              <div className="text-xs opacity-70">{c.token}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primitives</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Badge>Badge</Badge>
          <Input placeholder="Input" className="max-w-xs" />
        </CardContent>
      </Card>
      <div className="p-3 rounded-xl bg-card text-card-foreground border border-border ring-2 ring-ring">
        semantic tokens are live ✨
      </div>
    </main>
  );
}
