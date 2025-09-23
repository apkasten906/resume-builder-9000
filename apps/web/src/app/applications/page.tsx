'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TRow, TCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toaster';

type AppRow = { id: string; company: string; role: string; stage: string; lastUpdated: string };

const ApplicationsPage: React.FC = () => {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [query, setQuery] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  async function load(): Promise<void> {
    const res = await fetch('/api/applications');
    const data = await res.json();
    setRows(data.items || []);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => rows.filter(r => (r.company + r.role).toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  async function add(): Promise<void> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, role }),
    });
    if (!res.ok) {
      toast({ title: 'Add failed' });
      return;
    }
    setCompany('');
    setRole('');
    await load();
    toast({ title: 'Application added', description: `${company} — ${role}` });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              label="Filter"
              placeholder="Search company or role..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Input label="Company" value={company} onChange={e => setCompany(e.target.value)} />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input label="Role" value={role} onChange={e => setRole(e.target.value)} />
              <Button onClick={add} disabled={!company || !role}>
                Add
              </Button>
            </div>
          </div>
          <Table>
            {filtered.map(r => (
              <TRow key={r.id}>
                <TCell className="font-semibold">{r.company}</TCell>
                <TCell>{r.role}</TCell>
                <TCell>
                  <Badge>{r.stage}</Badge>
                </TCell>
                <TCell className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(r.lastUpdated).toLocaleString()}
                </TCell>
              </TRow>
            ))}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsPage;
