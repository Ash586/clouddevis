'use client';

import { FileText, Clock, Banknote, AlertTriangle } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { DashboardStats } from '@/mobile/lib/useDashboardStats';

interface StatCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3.5">
      <div className="pd-skeleton mb-2.5 h-8 w-8 rounded-lg" />
      <div className="pd-skeleton mb-1.5 h-2.5 w-14 rounded" />
      <div className="pd-skeleton h-5 w-8 rounded" />
    </div>
  );
}

export function StatCards({ stats, loading }: StatCardsProps) {
  const { t } = useMobileI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 px-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString('fr-DZ');

  const cards = [
    { icon: FileText, label: t('stats.docsCreated'), value: fmt(stats?.monthDocs ?? 0), color: '#0052CC' },
    { icon: Banknote, label: t('stats.revenue'), value: fmt(stats?.totalTTC ?? 0), suffix: 'DA', color: '#D4A843' },
    { icon: AlertTriangle, label: t('stats.unpaid'), value: fmt(stats?.unpaidCount ?? 0), color: '#DC3545' },
    { icon: Clock, label: t('stats.drafts'), value: fmt(stats?.draftCount ?? 0), color: '#001A4D' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3.5 transition-all duration-200 hover:border-[#0052CC]/15 hover:shadow-sm active:scale-[0.98]"
          >
            <div
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${card.color}10` }}
            >
              <Icon size={17} style={{ color: card.color }} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              {card.label}
            </div>
            <div className="mt-0.5 text-xl font-extrabold tracking-tight text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {card.value}{card.suffix && <span className="text-[10px] font-semibold text-[#718096] ml-0.5">{card.suffix}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
