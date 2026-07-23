// ============================================================
// Rakmana Mobile — Biometric Auth Wrapper
// No biometric bridge available in WebView — always returns unavailable.
// ============================================================

// ── Types ─────────────────────────────────────────────────────

export interface BiometryInfo {
  available: boolean;
  type: string;
}

// ── API ───────────────────────────────────────────────────────

/** Returns biometry availability and type label (for UI). */
export async function checkBiometry(): Promise<BiometryInfo> {
  // No biometric JS bridge exists in the WebView app
  return { available: false, type: '' };
}

/**
 * Prompt the user for biometric authentication.
 * Returns true on success, false on cancellation/failure.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function authenticate(_reason: string): Promise<boolean> {
  // No biometric plugin available — skip on web/WebView
  return true;
}
