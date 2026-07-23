// ============================================================
// Rakmana Mobile — Push Notifications Service
// Push notifications are not available in the WebView app.
// This module is a no-op stub that gracefully degrades.
// ============================================================

// ── Types ─────────────────────────────────────────────────────

export interface NotificationPayload {
  documentId?: string;
  type?: string;
  [key: string]: string | undefined;
}

type NotificationTapHandler = (payload: NotificationPayload) => void;
type ForegroundHandler = (title: string, body: string, payload: NotificationPayload) => void;

// ── Public API ────────────────────────────────────────────────

/**
 * Call once on app startup (after auth confirmed).
 * Returns false — push notifications require Firebase SDK + native plugin.
 */
export async function initPushNotifications(
  _opts: { onTap?: NotificationTapHandler; onForeground?: ForegroundHandler }
): Promise<boolean> {
  // Push notifications not available in WebView app
  return false;
}

/**
 * Remove all listeners (call on logout).
 */
export async function teardownPushNotifications(): Promise<void> {
  // No-op
}
