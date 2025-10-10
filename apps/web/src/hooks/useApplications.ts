/**
 * Ultra-Clean Hook - Convention over Configuration
 */

import { useState, useEffect } from 'react';
import {
  API,
  type Application,
  type ApplicationsResponse,
  type CreateApplicationRequest,
} from '../lib/api-client';

interface UseApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createApplication: (data: CreateApplicationRequest) => Promise<Application>;
}

export function useApplications(): UseApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.applications.get<ApplicationsResponse>();
      setApplications(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (data: CreateApplicationRequest): Promise<Application> => {
    const result = await API.applications.post<CreateApplicationRequest, Application>(data);
    await fetchApplications(); // Refresh list
    return result;
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    createApplication,
  };
}
