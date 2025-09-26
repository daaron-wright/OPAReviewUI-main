/**
 * Root layout component for the Next.js application
 */

import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Real Beneficiary State Machine Visualizer',
  description: 'Interactive visualization of Abu Dhabi DED Real Beneficiary Declaration Service state machine',
  keywords: ['state machine', 'visualization', 'workflow', 'Abu Dhabi', 'DED'],
  authors: [{ name: 'DED Abu Dhabi' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

/**
 * Root layout wrapper with global styles and metadata
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
