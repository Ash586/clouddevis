'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { track, loadPlausible } from '@/lib/analytics';

export function PageViewTracker() {
  const pathname = usePathname();
  const { user } = useUser();
  const sessionId = useRef(generateSessionId());
  const lastPath = useRef('');

  useEffect(() => {
    // Load Plausible on first mount
    loadPlausible();

    // Skip tracking for API routes, static assets, and admin pages
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/admin')) return;
    // Skip duplicate path tracking
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Fire Plausible pageview
    track('pageview', { path: pathname });

    // Use sendBeacon for reliable fire-and-forget tracking
    const payload = {
      path: pathname,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      locale: document.documentElement.lang || 'fr',
      sessionId: sessionId.current,
      userId: user?.id || null,
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/track/pageview', blob);
    } catch {
      // Fallback to fetch if sendBeacon fails
      fetch('/api/track/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, user]);

  return null; // This component doesn't render anything
}

function generateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('pv_session_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('pv_session_id', id);
  }
  return id;
}
