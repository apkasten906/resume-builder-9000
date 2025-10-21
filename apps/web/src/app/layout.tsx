import './globals.css';
import React from 'react';
import AppShell from '../components/shell/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Resume Builder 9000',
  description: 'Tailor resumes to jobs with ease',
  icons: {
    icon: '/favicon.svg',
  },
};

// TODO: Fix AuthContext to work with SSR/SSG instead of forcing dynamic rendering
// This breaks client-side hydration in E2E tests
// export const dynamic = 'force-dynamic';

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
