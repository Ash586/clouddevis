// ============================================================
// CloudDevis Mobile — Haptic feedback wrapper
// Native haptics on device via @capacitor/haptics; silent no-op
// on the web (plugin throws "not implemented" — we swallow it).
// Keep calls fire-and-forget: haptics must never block the UI.
// ============================================================

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/** Light tap — catalog pills, dock mode switches, chip toggles. */
export function hapticLight(): void {
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Success — item added, document saved. */
export function hapticSuccess(): void {
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

/** Warning — destructive-ish actions (line deleted). */
export function hapticWarning(): void {
  Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
}

/** Error — validation failures, failed API calls. */
export function hapticError(): void {
  Haptics.notification({ type: NotificationType.Error }).catch(() => {});
}
