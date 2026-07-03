'use client';

// ============================================================
// CloudDevis Mobile — Native app entry (/app)
// The Capacitor webview loads THIS route: MobileShell rendered
// full-bleed, no phone frame, no preview chrome. The old /mobile
// route remains a browser-preview wrapper for development.
// ============================================================

import { MobileShell } from '@/mobile/components/MobileShell';

export default function NativeAppPage() {
  return <MobileShell />;
}
