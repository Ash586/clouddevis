'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Handles the Android hardware back button on /dashboard pages.
 * Goes back in history if possible, or returns to the mobile app shell.
 * Never calls App.exitApp — exit is only handled by MobileShell.
 */
export function DashboardBackHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    import('@capacitor/app').then(({ App }) => {
      const handle = App.addListener('backButton', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/app';
        }
      });
      cleanup = () => { void handle.then((h) => h.remove()); };
    });

    return () => { cleanup?.(); };
  }, []);

  return null;
}
