'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/mobile/lib/useDashboardStats';
import { usePullToRefresh } from '@/mobile/lib/usePullToRefresh';
import { refreshAllData } from '@/mobile/lib/useApiSync';
import { useDocumentStore } from '@/stores/documentStore';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { HomeHeader } from '../components/HomeHeader';
import { StatCards } from '../components/StatCards';
import { RecentDocuments } from '../components/RecentDocuments';
import { cn } from '@/lib/utils';
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

  const { stats, loading: statsLoading, refetch } = useDashboardStats(true);

  const { pull, refreshing, handlers: pullHandlers } = usePullToRefresh(
    useCallback(async () => { await refreshAllData(); refetch(); }, [refetch]),
  );

  const initials = useMemo(() =>
    userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
  [userName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 pb-4 overflow-y-auto"
      {...pullHandlers}
    >
      {/* Pull-to-refresh */}
      {(pull > 0 || refreshing) && (
        <div className="flex items-center justify-center" style={{ height: `${pull}px` }}>
          <Loader2 size={20} className={cn('text-[#2A6B52]', refreshing && 'animate-spin')} style={{ opacity: Math.min(1, pull / 50) }} />
        </div>
      )}

      {/* 1. Hero header */}
      <HomeHeader
        userName={userName}
        userInitials={initials}
        hasNotifications={hasNotifications}
        onNotificationTap={onNotificationTap}
      />

      {/* 2. Stats grid */}
      <StatCards stats={stats} loading={statsLoading} />

      {/* 3. Quick link to full site */}
      <button
        type="button"
        onClick={() => { window.location.href = '/dashboard'; }}
        className="mx-5 flex items-center gap-3 rounded-xl border border-[#E8E1CE] bg-white px-4 py-3 transition-all hover:bg-[#FBF8F2] active:scale-[0.99]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2A6B52]/5 text-[#2A6B52]">
          <Globe size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-[#2A6B52]">{t('settings.fullSite')}</span>
          <span className="block text-[10px] text-[#9AA1B4]">{t('settings.fullSiteHint')}</span>
        </div>
      </button>

      {/* 4. Recent documents */}
      <RecentDocuments
        documents={savedDocuments}
        onDocumentTap={onDocumentTap}
        onSeeAll={onSeeAll}
      />
    </motion.div>
  );
}
