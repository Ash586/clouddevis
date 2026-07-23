// ============================================================
// CloudDevis — Native Bridge Module
// Replaces all Capacitor APIs with WebView JS Bridge calls.
// Falls back to web APIs when running in a browser.
// ============================================================

// ── JS Bridge type ───────────────────────────────────────────

interface AndroidBridge {
  downloadFile(base64Data: string, fileName: string): void;
  downloadFileDirect(base64Data: string, fileName: string, mimeType: string): void;
  shareFile(base64Data: string, fileName: string, title: string): void;
  vibrate(milliseconds: number): void;
  setStatusBarColor(color: string): void;
  setNavigationBarColor(color: string): void;
  exitApp(): void;
  goBack(): void;
  isOnline(): boolean;
  getAppVersion(): string;
  getPlatform(): string;
  copyToClipboard(text: string): void;
  openUrl(url: string): void;
  setKeepScreenOn(keep: boolean): void;
  getDeviceInfo(): string;
  onBackPressed?(): void;
  onAppStateChange?(isActive: boolean): void;
}

// ── Platform detection ───────────────────────────────────────

const bridge = (): AndroidBridge | undefined =>
  typeof window !== 'undefined' ? (window as unknown as { AndroidBridge?: AndroidBridge }).AndroidBridge : undefined;

/** Check if running inside the Android WebView. */
export function isNativePlatform(): boolean {
  return !!bridge();
}

/** Returns "android" or "web". */
export function getPlatform(): string {
  return bridge()?.getPlatform() ?? 'web';
}

// ── Network ──────────────────────────────────────────────────

/** Check network status. Uses bridge on Android, navigator.onLine on web. */
export function checkIsOnline(): boolean {
  const b = bridge();
  if (b) return b.isOnline();
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// ── Haptics ──────────────────────────────────────────────────

/** Trigger vibration (ms). No-op on web. */
export function vibrate(ms: number = 50): void {
  bridge()?.vibrate(ms);
}

// ── App lifecycle ────────────────────────────────────────────

type AppStateChangeHandler = (isActive: boolean) => void;
type BackPressHandler = () => void;

const appStateListeners: AppStateChangeHandler[] = [];
const backPressListeners: BackPressHandler[] = [];

/**
 * Register a callback for when Android calls onAppStateChange.
 * On web, uses Page Visibility API as a fallback.
 */
export function addAppStateListener(handler: AppStateChangeHandler): () => void {
  appStateListeners.push(handler);

  // For web fallback, listen to visibilitychange
  if (!bridge()) {
    const onVis = () => {
      const isActive = document.visibilityState === 'visible';
      handler(isActive);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      const idx = appStateListeners.indexOf(handler);
      if (idx >= 0) appStateListeners.splice(idx, 1);
      document.removeEventListener('visibilitychange', onVis);
    };
  }

  return () => {
    const idx = appStateListeners.indexOf(handler);
    if (idx >= 0) appStateListeners.splice(idx, 1);
  };
}

/**
 * Register a callback for Android back button press.
 * On web, no-op.
 */
export function addBackPressListener(handler: BackPressHandler): () => void {
  backPressListeners.push(handler);
  return () => {
    const idx = backPressListeners.indexOf(handler);
    if (idx >= 0) backPressListeners.splice(idx, 1);
  };
}

// Set up global callbacks that Android's evaluateJavascript calls
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__cdBackPress = () => {
    backPressListeners.forEach((h) => h());
    return true;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__cdAppStateChange = (isActive: boolean) => {
    appStateListeners.forEach((h) => h(isActive));
  };
}

// ── Exit / Back ──────────────────────────────────────────────

export function exitApp(): void {
  bridge()?.exitApp();
}

export function goBack(): void {
  bridge()?.goBack();
}

// ── File / Share ─────────────────────────────────────────────

/** Download a file via Android DownloadManager. Falls back to anchor download on web. */
export function nativeDownloadFile(base64: string, fileName: string): boolean {
  const b = bridge();
  if (b) {
    b.downloadFile(base64, fileName);
    return true;
  }
  return false;
}

/** Share a file via Android Intent. Returns true if native share was used. */
export function nativeShareFile(base64: string, fileName: string, title: string): boolean {
  const b = bridge();
  if (b) {
    b.shareFile(base64, fileName, title);
    return true;
  }
  return false;
}

/** Open a file directly via Android Intent. */
export function nativeOpenFile(base64: string, fileName: string, mimeType: string): boolean {
  const b = bridge();
  if (b) {
    b.downloadFileDirect(base64, fileName, mimeType);
    return true;
  }
  return false;
}

/** Open URL in external browser on Android, or window.open on web. */
export function nativeOpenUrl(url: string): void {
  const b = bridge();
  if (b) {
    b.openUrl(url);
  } else {
    window.open(url, '_blank');
  }
}

// ── Clipboard ────────────────────────────────────────────────

export function nativeCopyToClipboard(text: string): void {
  bridge()?.copyToClipboard(text);
}

// ── Screen ───────────────────────────────────────────────────

export function nativeSetKeepScreenOn(keep: boolean): void {
  bridge()?.setKeepScreenOn(keep);
}

// ── Device info ──────────────────────────────────────────────

export interface DeviceInfo {
  model: string;
  brand: string;
  sdk: number;
  release: string;
}

export function nativeGetDeviceInfo(): DeviceInfo | null {
  const raw = bridge()?.getDeviceInfo();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DeviceInfo;
  } catch {
    return null;
  }
}

// ── App version ──────────────────────────────────────────────

export function nativeGetAppVersion(): string {
  return bridge()?.getAppVersion() ?? '1.0.0';
}

// ── Status/Nav bar colors ────────────────────────────────────

export function nativeSetStatusBarColor(hex: string): void {
  bridge()?.setStatusBarColor(hex);
}

export function nativeSetNavigationBarColor(hex: string): void {
  bridge()?.setNavigationBarColor(hex);
}
