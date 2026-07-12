// ============================================================
// Rakmana Mobile — In-App Update Service
// Downloads APK on Capacitor and opens it for installation.
// On browser: opens the download URL in a new tab.
// ============================================================

import { logger } from '@/lib/logger';

/**
 * Download and install an APK update.
 * - Capacitor (Android): downloads APK to cache, opens via Browser for install
 * - Browser: opens the URL in a new tab
 */
export async function downloadAndInstallAPK(apkUrl: string): Promise<void> {
  if (!apkUrl) {
    logger.error('No APK URL provided for update');
    return;
  }

  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import('@capacitor/browser');
      // Open the APK URL in the system browser.
      // Android will download it and prompt for installation.
      await Browser.open({ url: apkUrl });
      return;
    }
  } catch {
    // Capacitor not available — fall through to browser
  }

  // Browser fallback
  window.open(apkUrl, '_blank');
}

/**
 * Check if a newer version is available.
 * Returns the update info or null if up-to-date.
 */
export async function checkForUpdate(currentVersion: string): Promise<{
  needsUpdate: boolean;
  version: string;
  apkUrl: string;
  releaseNotes: string;
} | null> {
  try {
    const res = await fetch('/api/mobile/version');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.minVersion) return null;

    const isOutdated = compareVersions(currentVersion, data.minVersion) < 0;
    return {
      needsUpdate: isOutdated,
      version: data.minVersion,
      apkUrl: data.apkUrl ?? '',
      releaseNotes: data.releaseNotes ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Compare semver strings. Returns negative if a < b, 0 if equal, positive if a > b.
 */
function compareVersions(a: string, b: string): number {
  const parse = (v: string) => v.split('.').map(Number);
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}
