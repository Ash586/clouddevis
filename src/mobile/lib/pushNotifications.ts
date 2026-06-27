// ============================================================
// CloudDevis Mobile — Push Notifications Service
// Wraps @capacitor/push-notifications with:
//   - Permission request (Android 13+ POST_NOTIFICATIONS)
//   - FCM token registration → /api/user/push-token
//   - Foreground notification listener (in-app toast)
//   - Notification-tap routing (open relevant document)
// ============================================================

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import type { Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';

// ── Types ─────────────────────────────────────────────────────

export interface NotificationPayload {
  /** Document ID to open when tapped */
  documentId?: string;
  /** 'invoice_paid' | 'invoice_approved' | 'devis_accepted' | 'reminder' */
  type?: string;
  /** Extra key/value pairs from FCM data */
  [key: string]: string | undefined;
}

type NotificationTapHandler = (payload: NotificationPayload) => void;
type ForegroundHandler = (title: string, body: string, payload: NotificationPayload) => void;

// ── Internal state ────────────────────────────────────────────

let onTap: NotificationTapHandler | null = null;
let onForeground: ForegroundHandler | null = null;
let initialized = false;

// ── Helpers ───────────────────────────────────────────────────

function extractPayload(notification: PushNotificationSchema): NotificationPayload {
  const data = notification.data as Record<string, string> | undefined;
  return {
    documentId: data?.documentId,
    type: data?.type,
    ...data,
  };
}

async function registerToken(token: string): Promise<void> {
  try {
    await fetch('/api/user/push-token', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Capacitor.getPlatform() }),
    });
  } catch {
    // Non-fatal — token will re-register on next app open
  }
}

// ── Public API ────────────────────────────────────────────────

/**
 * Call once on app startup (after auth confirmed).
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initPushNotifications(opts: {
  onTap?: NotificationTapHandler;
  onForeground?: ForegroundHandler;
}): Promise<boolean> {
  // Only on real Android/iOS — skip in browser
  if (!Capacitor.isNativePlatform()) return false;
  if (initialized) return true;

  onTap = opts.onTap ?? null;
  onForeground = opts.onForeground ?? null;

  // ── 1. Request permission ──
  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== 'granted') return false;

  // ── 2. Register with FCM ──
  await PushNotifications.register();

  // ── 3. FCM token received → send to server ──
  PushNotifications.addListener('registration', (token: Token) => {
    void registerToken(token.value);
  });

  // ── 4. Registration error ──
  PushNotifications.addListener('registrationError', () => {
    // Silently ignore — graceful degradation
  });

  // ── 5. Foreground notification received ──
  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    const payload = extractPayload(notification);
    onForeground?.(
      notification.title ?? 'CloudDevis',
      notification.body ?? '',
      payload,
    );
  });

  // ── 6. User tapped a notification ──
  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    const payload = extractPayload(action.notification);
    onTap?.(payload);
  });

  initialized = true;
  return true;
}

/**
 * Remove all listeners (call on logout).
 */
export async function teardownPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await PushNotifications.removeAllListeners();
  initialized = false;
  onTap = null;
  onForeground = null;
}
