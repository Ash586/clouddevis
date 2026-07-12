'use client';

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export function useHaptics() {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style });
    } catch {}
  };

  const notification = async (type: NotificationType = NotificationType.Success) => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type });
    } catch {}
  };

  const vibrate = async (ms: number = 10) => {
    if (!isNative) return;
    try {
      await Haptics.vibrate({ duration: ms });
    } catch {}
  };

  return { impact, notification, vibrate };
}
