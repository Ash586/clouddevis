'use client';

import { FileText, Clock, Banknote, AlertTriangle, TrendingUp } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { DashboardStats } from '@/mobile/lib/useDashboardStats';

interface StatCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4">
      <div className="pd-skeleton mb-3 h-10 w-10 rounded-xl" />
      <div className="pd-skeleton mb-2 h-3 w-16 rounded" />
      <div className="pd-skeleton h-6 w-10 rounded" />
    </div>
  );
}

export function StatCards({ stats, loading }: StatCardsProps) {
  const { t } = useMobileI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-5">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: FileText,
      label: t('stats.docsCreated'),
      value: stats?.monthDocs ?? 0,
      color: '#2563EB',
      bgColor: '#2563EB',
    },
    {
      icon: Banknote,
      label: t('stats.revenue'),
      value: `${(stats?.totalTTC ?? 0).toLocaleString('fr-DZ')}`,
      suffix: 'DA',
      color: '#D4A843',
      bgColor: '#D4A843',
    },
    {
      icon: AlertTriangle,
      label: t('stats.unpaid'),
      value: stats?.unpaidCount ?? 0,
      color: '#E8542E',
      bgColor: '#E8542E',
    },
    {
      icon: Clock,
      label: t('stats.drafts'),
      value: stats?.draftCount ?? 0,
      color: '#1E40AF',
      bgColor: '#1E40AF',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${card.bgColor}10` }}
            >
              <Icon size={20} style={{ color: card.color }} />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#33425C]">
              {card.label}
            </div>
            <div className="mt-1 text-2xl font-bold text-[#2563EB]" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
              {card.value}{card.suffix && <span className="text-xs font-medium text-[#5A6B85] ml-1">{card.suffix}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
