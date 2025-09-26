/**
 * Client-side providers wrapper
 * Separates client components from server layout
 */
'use client';

import { ReactNode } from 'react';
import { ReviewProvider } from '@/context/review-context';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps): JSX.Element {
  return (
    <ReviewProvider>
      {children}
    </ReviewProvider>
  );
}
