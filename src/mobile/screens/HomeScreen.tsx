'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2, FileText, Receipt, Copy } from 'lucide-react';
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
  onNewDevis?: () => void;
  onNewFacture?: () => void;
  onDuplicate?: () => void;
  onNotificationTap?: () => void;
  hasNotifications?: boolean;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function HomeScreen({
  userName,
  onDocumentTap,
  onSeeAll,
  onNewDevis,
  onNewFacture,
  onDuplicate,
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

  const hasSavedDocs = savedDocuments.length > 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 pb-3 overflow-y-auto"
      {...pullHandlers}
    >
      {(pull > 0 || refreshing) && (
        <div className="flex items-center justify-center" style={{ height: `${pull}px` }}>
          <Loader2 size={18} className={cn('text-[#0052CC]', refreshing && 'animate-spin')} style={{ opacity: Math.min(1, pull / 50) }} />
        </div>
      )}

      <motion.div variants={item}>
        <HomeHeader
          userName={userName}
          userInitials={initials}
          hasNotifications={hasNotifications}
          onNotificationTap={onNotificationTap}
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCards stats={stats} loading={statsLoading} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="px-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#718096]">
          Actions rapides
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {onNewDevis && (
            <button
              onClick={onNewDevis}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 transition-all duration-200 hover:border-[#0052CC]/20 hover:shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
              aria-label="Nouveau Devis"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0052CC]/8 text-[#0052CC]">
                <FileText size={18} />
              </div>
              <span className="text-[11px] font-bold text-[#001A4D]">Devis</span>
            </button>
          )}
          {onNewFacture && (
            <button
              onClick={onNewFacture}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 transition-all duration-200 hover:border-[#D4A843]/30 hover:shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#D4A843]/30"
              aria-label="Nouvelle Facture"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4A843]/10 text-[#D4A843]">
                <Receipt size={18} />
              </div>
              <span className="text-[11px] font-bold text-[#001A4D]">Facture</span>
            </button>
          )}
          {onDuplicate && hasSavedDocs && (
            <button
              onClick={onDuplicate}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 transition-all duration-200 hover:border-[#001A4D]/15 hover:shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#001A4D]/20"
              aria-label="Dupliquer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#001A4D]/5 text-[#001A4D]">
                <Copy size={18} />
              </div>
              <span className="text-[11px] font-bold text-[#001A4D]">Dupliquer</span>
            </button>
          )}
          {!onDuplicate && !hasSavedDocs && (
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 transition-all duration-200 hover:border-[#001A4D]/15 hover:shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#001A4D]/20"
              aria-label="Site complet"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#001A4D]/5 text-[#001A4D]">
                <Globe size={18} />
              </div>
              <span className="text-[11px] font-bold text-[#001A4D]">Site web</span>
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <RecentDocuments
          documents={savedDocuments}
          onDocumentTap={onDocumentTap}
          onSeeAll={onSeeAll}
        />
      </motion.div>
    </motion.div>
  );
}
