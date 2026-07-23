'use client';

import { vibrate, isNativePlatform } from '@/lib/native';

export function useHaptics() {
  const isNative = isNativePlatform();

  const impact = async () => {
    if (!isNative) return;
    try {
      vibrate(30);
    } catch {}
  };

  const notification = async () => {
    if (!isNative) return;
    try {
      vibrate(50);
    } catch {}
  };

  const vibrateFn = async (ms: number = 10) => {
    if (!isNative) return;
    try {
      vibrate(ms);
    } catch {}
  };

  return { impact, notification, vibrate: vibrateFn };
}
