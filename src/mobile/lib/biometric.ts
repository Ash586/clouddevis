// ============================================================
// Rakmana Mobile — Biometric Auth Wrapper
// Wraps @aparajita/capacitor-biometric-auth with graceful
// fallbacks for web/desktop where the plugin is unavailable.
// ============================================================

import { Capacitor } from '@capacitor/core';

// ── Types ─────────────────────────────────────────────────────

export interface BiometryInfo {
  available: boolean;
  /** e.g. "fingerprint", "face", "iris", "" */
  type: string;
}

// ── Helpers ───────────────────────────────────────────────────

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Returns biometry availability and type label (for UI). */
export async function checkBiometry(): Promise<BiometryInfo> {
  if (!isNative()) return { available: false, type: '' };

  try {
    const { BiometricAuth, BiometryType } = await import(
      '@aparajita/capacitor-biometric-auth'
    );
    const result = await BiometricAuth.checkBiometry();
    if (!result.isAvailable) return { available: false, type: '' };

    const typeMap: Record<number, string> = {
      [BiometryType.fingerprintAuthentication]: 'fingerprint',
      [BiometryType.faceAuthentication]: 'face',
      [BiometryType.irisAuthentication]: 'iris',
      [BiometryType.touchId]: 'fingerprint',
      [BiometryType.faceId]: 'face',
    };
    const type = typeMap[result.biometryType] ?? 'fingerprint';
    return { available: true, type };
  } catch {
    return { available: false, type: '' };
  }
}

/**
 * Prompt the user for biometric authentication.
 * Returns true on success, false on cancellation/failure.
 */
export async function authenticate(reason: string): Promise<boolean> {
  if (!isNative()) return true; // On web, skip

  try {
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'إلغاء',
      allowDeviceCredential: true, // PIN fallback
    });
    return true;
  } catch {
    return false;
  }
}
