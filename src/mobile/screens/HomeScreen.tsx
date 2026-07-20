'use client';

// ============================================================
// Rakmana Mobile — Home Screen
// Composed layout: Header → Stats → Quick Actions → Recent Docs
// Stats fetched from /api/dashboard; falls back to local store.
// ============================================================

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStats } from '@/mobile/lib/useDashboardStats';
import { usePullToRefresh } from '@/mobile/lib/usePullToRefresh';
import { refreshAllData } from '@/mobile/lib/useApiSync';
import { useDocumentStore } from '@/stores/documentStore';
import { useMobileI18n } from '@/mobile/lib/i18n';
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
  const { t } = useMobileI18n();

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

      {/* 2c. Full site shortcut */}
      <button
        type="button"
        onClick={() => { window.location.href = '/dashboard'; }}
        className="mx-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--navy-2)] border border-[var(--border)] active:scale-[0.98] transition-transform"
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--green-bg)] flex items-center justify-center shrink-0">
          <Globe size={18} className="text-[var(--green-2)]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-[var(--sand)]">{t('settings.fullSite')}</span>
          <span className="block text-[10px] text-[var(--sand-muted)]">{t('settings.fullSiteHint')}</span>
        </div>
      </button>

      {/* 3. Recent documents — FAB handles creation (no QuickActions duplication) */}
      <RecentDocuments
        documents={savedDocuments}
        onDocumentTap={onDocumentTap}
        onSeeAll={onSeeAll}
      />
    </motion.div>
  );
}
