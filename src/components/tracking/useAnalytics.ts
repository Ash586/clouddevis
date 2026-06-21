'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { track, loadPlausible } from '@/lib/analytics';

export function useAnalytics() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadPlausible();
  }, []);

  useEffect(() => {
    const fire = () => track('page_view', { path: pathname });
    fire();
  }, [pathname]);

  return { track };
}

export function useTrackEvent() {
  return useCallback((event: string, props?: Record<string, string | number | boolean>) => {
    track(event, props);
  }, []);
}

export function usePageTracking() {
  const pathname = usePathname();
  const prev = useRef('');

  useEffect(() => {
    if (prev.current !== pathname) {
      prev.current = pathname;
    }
  }, [pathname]);
}

export function useExitIntent() {
  const fired = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fired.current) return;
      if (e.clientY <= 0) {
        fired.current = true;
        track('Exit Intent');
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, []);
}

export function useScrollDepth() {
  const maxDepth = useRef(0);
  const milestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);
      if (pct > maxDepth.current) maxDepth.current = pct;
      [25, 50, 75, 100].forEach((m) => {
        if (maxDepth.current >= m && !milestones.current.has(m)) {
          milestones.current.add(m);
          track('Scroll Depth', { percentage: m });
        }
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
}