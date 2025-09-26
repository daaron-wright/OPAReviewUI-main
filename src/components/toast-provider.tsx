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
      theme="dark"
      style={{
        zIndex: 9999,
      }}
      toastStyle={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      progressStyle={{
        background: 'rgba(255, 255, 255, 0.9)',
      }}
    />
  );
}
