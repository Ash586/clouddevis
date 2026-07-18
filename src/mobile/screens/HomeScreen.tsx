'use client';

// ============================================================
// Rakmana Mobile — Home Screen
// Composed layout: Header → Stats → Quick Actions → Recent Docs
// Stats fetched from /api/dashboard; falls back to local store.
// ============================================================

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStats } from '@/mobile/lib/useDashboardStats';
import { usePullToRefresh } from '@/mobile/lib/usePullToRefresh';
import { refreshAllData } from '@/mobile/lib/useApiSync';
import { useDocumentStore } from '@/stores/documentStore';
import { HomeHeader } from '../components/HomeHeader';
import { StatCards } from '../components/StatCards';
import { RevenueTrend } from '../components/RevenueTrend';
import { RecentDocuments } from '../components/RecentDocuments';
import type { Document } from '@/mobile/types';

interface HomeScreenProps {
  userName: string;
  onDocumentTap?: (doc: Document) => void;
  onSeeAll?: () => void;
  onNotificationTap?: () => void;
  hasNotifications?: boolean;
}

export function HomeScreen({
  userName,
  onDocumentTap,
  onSeeAll,
  onNotificationTap,
  hasNotifications = false,
}: HomeScreenProps) {
  const savedDocuments = useDocumentStore((s) => s.savedDocuments);

  // ── Stats from API (falls back to local on error) ──────────
  const { stats, loading: statsLoading, refetch } = useDashboardStats(true);

  // ── Pull-to-refresh ───────────────────────────────────────
  const { pull, refreshing, handlers: pullHandlers } = usePullToRefresh(
    useCallback(async () => { await refreshAllData(); refetch(); }, [refetch]),
  );

  // ── User initials ──────────────────────────────────────────
  const initials = useMemo(() =>
    userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
  [userName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 pb-4 overflow-y-auto"
      {...pullHandlers}
    >
      {/* Pull-to-refresh indicator */}
      {(pull > 0 || refreshing) && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: `${pull}px` }}
        >
          <Loader2
            size={20}
            className={cn(
              'text-[var(--green-2)]',
              refreshing && 'animate-spin',
            )}
            style={{ opacity: Math.min(1, pull / 50) }}
          />
        </div>
      )}
      {/* 1. Header */}
      <HomeHeader
        userName={userName}
        userInitials={initials}
        hasNotifications={hasNotifications}
        onNotificationTap={onNotificationTap}
      />

      {/* 2. Stats 2×2 grid */}
      <StatCards stats={stats} loading={statsLoading} />

      {/* 2b. Revenue mini-chart (hidden when no invoices in 6 months) */}
      <RevenueTrend />

      {/* 3. Recent documents — FAB handles creation (no QuickActions duplication) */}
      <RecentDocuments
        documents={savedDocuments}
        onDocumentTap={onDocumentTap}
        onSeeAll={onSeeAll}
      />
    </motion.div>
  );
}
