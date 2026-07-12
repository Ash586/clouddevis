'use client';

import { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { ImpactStyle } from '@capacitor/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { impact } = useHaptics();
  const hapticFired = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop ?? 0 > 0) return;
    startY.current = e.touches[0].clientY;
    hapticFired.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    if (containerRef.current?.scrollTop ?? 0 > 0) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      const newPull = Math.min(diff * 0.5, threshold + 20);
      if (newPull >= threshold && !hapticFired.current) {
        impact(ImpactStyle.Medium);
        hapticFired.current = true;
      }
      setPull(newPull);
    }
  }, [refreshing, threshold, impact]);

  const handleTouchEnd = useCallback(async () => {
    if (pull >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPull(0);
  }, [pull, threshold, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-y-auto"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pull > 0 || refreshing ? (refreshing ? 48 : pull) : 0, opacity: pull > 0 || refreshing ? 1 : 0 }}
      >
        <RefreshCw
          size={20}
          className={`text-[var(--sand-muted)] ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: !refreshing ? `rotate(${pull * 3}deg)` : undefined }}
        />
      </div>
      {children}
    </div>
  );
}
