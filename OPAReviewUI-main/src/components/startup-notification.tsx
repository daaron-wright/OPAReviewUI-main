'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { createToastContent } from './toast-content';

const STARTUP_TOAST_MESSAGE =
  "Based on a high number of similar recommendation exceeding a certain threshold, please review the 'New Trade Name' journey, and respond to feedback.";

export function StartupNotification(): null {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;

    toast.info(createToastContent('alarm', STARTUP_TOAST_MESSAGE), {
      position: 'top-right',
      autoClose: 7000,
    });
  }, []);

  return null;
}
