import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume Builder 9000',
  description: 'Create tailored, ATS-friendly resumes',
};

import type { ReactElement, ReactNode } from 'react';
export default function RootLayout({
  children,
}: Readonly<{
  readonly children: ReactNode;
}>): ReactElement {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-100">
          <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Resume Builder 9000</h1>
              <nav>
                <ul className="flex gap-4">
                  <li>
                    <a href="/" className="hover:underline">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/build" className="hover:underline">
                      Create Resume
                    </a>
                  </li>
                  <li>
                    <a href="/resume-upload" className="hover:underline">
                      Resume Upload
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="hover:underline">
                      About
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </header>
          <div className="container mx-auto p-6">{children}</div>
          <footer className="bg-gray-800 text-white py-6 mt-auto">
            <div className="container mx-auto text-center">
              <p>© {new Date().getFullYear()} Resume Builder 9000. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
