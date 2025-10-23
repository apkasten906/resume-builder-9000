'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// AuthButton toggles Sign In / Log Out based on authentication status
function AuthButton(): React.ReactElement | null {
  const { authenticated, checking, logout } = useAuth();

  if (checking) {
    return null;
  }
  if (!authenticated) {
    return (
      <Link href="/login" className="text-sm hover:underline">
        Sign in
      </Link>
    );
  }
  return (
    <button
      className="text-sm text-white bg-red-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      onClick={logout}
      aria-label="Log out"
    >
      Log out
    </button>
  );
}

type NavItem = { href: string; label: string };

function cls(...xs: (string | false | undefined)[]): string {
  return xs.filter(Boolean).join(' ');
}

export default function AppShell({
  children,
}: Readonly<React.PropsWithChildren>): React.ReactElement {
  const pathname = usePathname();
  const { authenticated, checking } = useAuth();

  const nav: NavItem[] = [
    { href: '/resume-upload', label: 'Resume Upload' },
    { href: '/job-intake', label: 'Job Intake' },
    { href: '/tailor', label: 'Tailor' },
    { href: '/preview', label: 'Preview & Download' },
    { href: '/applications', label: 'Applications' },
    { href: '/settings', label: 'Settings' },
  ];

  // AC: No menus should appear in the navigation menu if the user is logged out
  const showNavigation = authenticated && !checking;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      <div className={showNavigation ? 'grid lg:grid-cols-[260px_1fr]' : 'grid grid-cols-1'}>
        {showNavigation && (
          <aside className="hidden lg:block border-r border-gray-200 dark:border-zinc-800 p-3">
            <Link
              href="/"
              className="text-xl font-bold mb-6 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Go to Home"
            >
              RB9K
            </Link>
            <nav className="space-y-1">
              {nav.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cls(
                    'block px-3 py-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800',
                    pathname?.startsWith(n.href) && 'bg-white dark:bg-zinc-900 shadow font-semibold'
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}
        <main>
          <header className="sticky top-0 z-10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-3">
              <div className={showNavigation ? 'lg:hidden' : ''}>
                <Link
                  href="/"
                  className="font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Go to Home"
                >
                  RB9K
                </Link>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                ATS-friendly resume tailoring
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/about"
                  className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="About Resume Builder 9000"
                >
                  About
                </Link>
                <AuthButton />
              </div>
            </div>
          </header>
          <div className="p-4 lg:p-6 max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
