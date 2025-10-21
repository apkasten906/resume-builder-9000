'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute component that redirects unauthenticated users to the home page.
 *
 * Usage: Wrap any page content that requires authentication with this component.
 *
 * @example
 * export default function MyProtectedPage(): ReactElement {
 *   return (
 *     <ProtectedRoute>
 *       <div>Protected content here</div>
 *     </ProtectedRoute>
 *   );
 * }
 */
export function ProtectedRoute({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement | null {
  const { authenticated, checking } = useAuth();
  const router = useRouter();
  const mountCheckDone = useRef(false);

  // First useEffect: Check on mount (runs once)
  useEffect(() => {
    if (!mountCheckDone.current && !checking && !authenticated) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔒 ProtectedRoute: Mount check - redirecting unauthenticated user');
      }
      router.push('/');
      mountCheckDone.current = true;
    }
  }, []); // Empty deps - only runs on mount

  // Second useEffect: Watch for auth state changes
  useEffect(() => {
    // Only redirect once we've finished checking auth state
    if (!checking && !authenticated) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔒 ProtectedRoute: Auth state changed - redirecting to home page');
      }
      router.push('/');
    }
  }, [authenticated, checking, router]);

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  // The redirect will happen via the useEffect above
  if (!authenticated) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
