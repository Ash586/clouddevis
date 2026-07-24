// ============================================================
// Rakmana Mobile — In-App Update Service
// Downloads APK on Android via JS Bridge or opens in browser.
// ============================================================

import { logger } from '@/lib/logger';
import { isNativePlatform, nativeOpenUrl } from '@/lib/native';

/**
 * Download and install an APK update.
 * - Android WebView: opens in system browser
 * - Browser: opens in a new tab
 */
export async function downloadAndInstallAPK(apkUrl: string): Promise<void> {
  if (!apkUrl) {
    logger.error('No APK URL provided for update');
    return;
  }

  if (isNativePlatform()) {
    nativeOpenUrl(apkUrl);
    return;
  }

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

function compareVersions(a: string, b: string): number {
  const parse = (v: string) => v.split('.').map(Number);
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}
