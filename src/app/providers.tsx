/**
 * Client-side providers for the application
 * Wraps the app with necessary context providers
 */
'use client';

import { ReactNode } from 'react';
import { ReviewProvider } from '@/context/review-context';

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ReviewProvider>
      {children}
    </ReviewProvider>
  );
}
