'use client';

import { useEffect } from 'react';
import { isNativePlatform, addBackPressListener } from '@/lib/native';

/**
 * Handles the Android hardware back button on /dashboard pages.
 * Goes back in history if possible, or returns to the mobile app shell.
 * Never calls App.exitApp — exit is only handled by MobileShell.
 */
export function DashboardBackHandler() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    const removeListener = addBackPressListener(() => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/app';
      }
    });

    return () => { removeListener(); };
  }, []);

  return null;
}
