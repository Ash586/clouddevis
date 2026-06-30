'use client';

// CloudDevis Mobile — pull-to-refresh hook
// Touch-driven: pull down from the top of a scroll container past a
// threshold to trigger an async refresh. Returns the live pull distance
// (for a spinner) and the touch handlers to spread on the scroll element.

import { useCallback, useRef, useState } from 'react';

const THRESHOLD = 70;  // px past which release triggers refresh
const MAX_PULL = 110;  // px clamp for the rubber-band

export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    startY.current = e.currentTarget.scrollTop <= 0 && !refreshing ? e.touches[0].clientY : null;
  }, [refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(MAX_PULL, dy * 0.5)); // damped
    else { startY.current = null; setPull(0); }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try { await onRefresh(); } finally { setRefreshing(false); setPull(0); }
    } else {
      setPull(0);
    }
  }, [pull, refreshing, onRefresh]);

  return { pull, refreshing, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
}
