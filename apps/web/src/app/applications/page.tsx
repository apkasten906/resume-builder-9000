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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the auth token from localStorage if available (for testing)
  useEffect(() => {
    // Attempt to retrieve auth token from localStorage (used by tests)
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  async function load(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      // Include Authorization header if token exists
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/applications', { headers });

      if (res.ok) {
        const data = await res.json();
        setRows(data.items || []);
      } else {
        const errorMessage = `Error ${res.status}: ${res.statusText}`;
        setError(errorMessage);
        console.error('Failed to load applications:', errorMessage);
        toast({
          title: 'Failed to load applications',
          description: errorMessage,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading applications:', err);
      toast({
        title: 'Failed to load applications',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [authToken]); // Reload when authToken changes

  const filtered = useMemo(
    () => rows.filter(r => (r.company + r.role).toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  async function add(): Promise<void> {
    try {
      setIsLoading(true);
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      // Include Authorization header if token exists
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({ company, role }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const errorMessage = `Error ${res.status}: ${errorText || res.statusText}`;
        toast({
          title: 'Failed to add application',
          description: errorMessage,
        });
        return;
      }

      // Success
      const savedCompany = company;
      const savedRole = role;

      // Reset form
      setCompany('');
      setRole('');

      // Reload the list
      await load();

      toast({
        title: 'Application added',
        description: `${savedCompany} — ${savedRole}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: 'Failed to add application',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Function to render the content based on state
  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading applications...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 font-semibold">Error loading applications</p>
          <p className="text-gray-500 mt-2">{error}</p>
          <Button className="mt-4" onClick={load}>
            Try Again
          </Button>
        </div>
      );
    }

    if (rows.length > 0) {
      return (
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
      );
    }

    return (
      <div className="text-center py-8 text-gray-500">
        No applications found. Add your first application above.
      </div>
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Applications</CardTitle>
          <Button variant="secondary" size="sm" onClick={load}>
            Refresh
          </Button>
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
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsPage;
