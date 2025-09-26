/**
 * Combined client-side providers wrapper
 * Handles all app-level client providers in one place
 */
'use client';

import { ReactNode } from 'react';
import { ReviewProvider } from '@/context/review-context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return (
    <ReviewProvider>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg rounded-lg"
        bodyClassName="text-sm font-medium"
        progressClassName="bg-white"
        style={{ zIndex: 9999 }}
      />
    </ReviewProvider>
  );
}
