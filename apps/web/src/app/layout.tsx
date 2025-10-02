import './globals.css';
import React from 'react';
import AppShell from '../components/shell/AppShell';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Resume Builder 9000',
  description: 'Tailor resumes to jobs with ease',
};

import { AuthProvider } from '../context/AuthContext';
const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
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
