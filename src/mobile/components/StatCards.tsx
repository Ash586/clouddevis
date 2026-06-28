'use client';

import { FileText, Users, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/mobile/lib/useDashboardStats';

// ── Helpers ───────────────────────────────────────────────────

function formatDA(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + ' k';
  return n.toFixed(0);
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
  const cards: Omit<CardProps, 'loading'>[] = [
    {
      icon: <FileText size={16} strokeWidth={2} className="text-[var(--green-3)]" />,
      iconBg: 'bg-[var(--blue-bg)]',
      label: 'Ce mois',
      value: String(stats.monthDocs),
      sub: 'documents créés',
      delay: 0.04,
    },
    {
      icon: <TrendingUp size={16} strokeWidth={2} className="text-emerald-400" />,
      iconBg: 'bg-[rgba(16,185,129,0.12)]',
      label: "Chiffre d'affaires",
      value: formatDA(stats.totalTTC),
      sub: 'DA total TTC',
      delay: 0.08,
    },
    {
      icon: <Users size={16} strokeWidth={2} className="text-sky-400" />,
      iconBg: 'bg-[rgba(56,189,248,0.12)]',
      label: 'Clients',
      value: String(stats.totalClients),
      sub: 'enregistrés',
      delay: 0.12,
    },
    {
      icon: <Clock size={16} strokeWidth={2} className="text-amber-400" />,
      iconBg: 'bg-[rgba(251,191,36,0.12)]',
      label: 'Brouillons',
      value: String(stats.draftCount),
      sub: 'en attente',
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
