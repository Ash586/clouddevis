'use client';

import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { DashboardStats } from '@/mobile/lib/useDashboardStats';

// ── Helpers ───────────────────────────────────────────────────

function formatDA(n: number): string {
  if (n >= 1_000_000) {
    const m = (n / 1_000_000).toLocaleString('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return m + ' M';
  }
  return Math.round(n).toLocaleString('fr-DZ');
}

// ── Single card ───────────────────────────────────────────────

interface CardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  delay: number;
  loading?: boolean;
}

function StatCard({ icon, iconBg, label, value, sub, delay, loading }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className={cn(
        'rounded-2xl p-4',
        'bg-[var(--navy-2)] border border-[var(--border)]',
      )}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        <span className="text-[11px] font-medium text-[var(--sand-muted)] leading-tight">
          {label}
        </span>
      </div>

      {loading ? (
        <div className="h-7 w-14 rounded-lg bg-[var(--navy-3)] animate-pulse" />
      ) : (
        <p
          className="heading text-[22px] text-[var(--sand)] leading-none"
        >
          {value}
        </p>
      )}

      <p className="text-[10px] text-[var(--sand-muted)] mt-1 leading-tight">{sub}</p>
    </motion.div>
  );
}

// ── 2×2 grid ─────────────────────────────────────────────────

interface StatCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function StatCards({ stats, loading }: StatCardsProps) {
  const privacyMode = useUserStore((s) => s.privacyMode);
  const { t } = useMobileI18n();
  const cards: Omit<CardProps, 'loading'>[] = [
    {
      icon: <FileText size={16} strokeWidth={2} className="text-[var(--green-3)]" />,
      iconBg: 'bg-[var(--blue-bg)]',
      label: t('stats.thisMonth'),
      value: String(stats.monthDocs),
      sub: t('stats.docsCreated'),
      delay: 0.04,
    },
    {
      icon: <TrendingUp size={16} strokeWidth={2} className="text-emerald-400" />,
      iconBg: 'bg-[rgba(16,185,129,0.12)]',
      label: t('stats.revenue'),
      value: privacyMode ? '••••' : formatDA(stats.totalTTC),
      sub: t('stats.revenueSub'),
      delay: 0.08,
    },
    {
      icon: <Users size={16} strokeWidth={2} className="text-sky-400" />,
      iconBg: 'bg-[rgba(56,189,248,0.12)]',
      label: t('stats.clients'),
      value: String(stats.totalClients),
      sub: t('stats.clientsSub'),
      delay: 0.12,
    },
    {
      icon: <AlertCircle size={16} strokeWidth={2} className="text-red-400" />,
      iconBg: 'bg-[rgba(239,68,68,0.12)]',
      label: t('stats.unpaid'),
      value: privacyMode ? '••••' : formatDA(stats.unpaidTotal),
      sub: `${stats.unpaidCount} ${t('stats.unpaidSub')}`,
      delay: 0.16,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} loading={loading} />
      ))}
    </div>
  );
}
