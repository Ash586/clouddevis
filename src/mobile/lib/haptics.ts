// ============================================================
// Rakmana Mobile — Haptic feedback wrapper
// Uses native vibrate bridge on Android; silent no-op on web.
// Keep calls fire-and-forget: haptics must never block the UI.
// ============================================================

import { vibrate } from '@/lib/native';

/** Light tap — catalog pills, dock mode switches, chip toggles. */
export function hapticLight(): void {
  vibrate(15);
}

/** Success — item added, document saved. */
export function hapticSuccess(): void {
  vibrate(30);
}

/** Warning — destructive-ish actions (line deleted). */
export function hapticWarning(): void {
  vibrate(40);
}

/** Error — validation failures, failed API calls. */
export function hapticError(): void {
  vibrate(50);
}
