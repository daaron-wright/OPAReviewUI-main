/**
 * Toast notification provider component
 * Because Master Jedi Barney demands FANCY notifications
 */
'use client';

import { ToastContainer } from 'react-toastify';

export function ToastProvider(): JSX.Element {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        zIndex: 9999,
      }}
      toastStyle={{
        backgroundColor: '#ffffff',
        color: '#000000',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    />
  );
}
