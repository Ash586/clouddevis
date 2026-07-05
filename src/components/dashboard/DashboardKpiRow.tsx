'use client';
import { useTranslations } from 'next-intl';
import { Wallet, FileText, Users, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardStats } from './dashboardConstants';

interface Props { stats: DashboardStats; }

export function DashboardKpiRow({ stats }: Props) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  const sentCount = stats.statusBreakdown?.SENT || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* Hero: CA Total */}
      <div className="col-span-2 lg:col-span-1">
        <div className="relative overflow-hidden rounded-2xl p-5 h-full bg-gradient-to-br from-[var(--green-2)] to-[var(--green)] shadow-lg shadow-[rgba(37,99,235,0.2)]">
          <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 text-white mb-3">
              <Wallet size={17} />
            </div>
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-0.5">{t('statTotal')}</p>
            <p className="font-sora font-extrabold text-white text-2xl leading-tight">
              {stats.totalTTC}
              <span className="text-sm font-bold text-white/70 ms-1">{tc('currency')}</span>
            </p>
            <p className="text-[11px] text-white/60 mt-0.5">{t('totalTTC')}</p>
          </div>
        </div>
      </div>

      {/* Factures impayées */}
      <KpiCard
        label={t('statUnpaid')}
        value={sentCount}
        sub={t('statUnpaidSub')}
        icon={<AlertCircle size={17} />}
        color={sentCount > 0 ? 'red' : 'default'}
      />

      {/* Documents */}
      <KpiCard
        label={t('statDocuments')}
        value={stats.totalDocs}
        sub={`+${stats.monthDocs} ${t('statThisMonth')}`}
        icon={<FileText size={17} />}
      />

      {/* Clients */}
      <KpiCard
        label={t('statClients')}
        value={stats.totalClients}
        sub={t('statRegistered')}
        icon={<Users size={17} />}
        color="blue"
      />
    </div>
  );
}

function KpiCard({ label, value, sub, icon, color = 'default' }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color?: 'default' | 'blue' | 'red';
}) {
  const colorMap = {
    default: { iconBg: 'bg-[var(--navy-3)]', iconText: 'text-[var(--sand-muted)]' },
    blue:    { iconBg: 'bg-blue-400/10',      iconText: 'text-blue-400' },
    red:     { iconBg: 'bg-red-400/10',       iconText: 'text-red-400' },
  };
  const c = colorMap[color];
  const isAlert = color === 'red' && Number(value) > 0;

  return (
    <Card className="p-4 sm:p-5 h-full hover:-translate-y-0.5 hover:shadow-lg transition-all">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.iconBg} ${c.iconText} mb-3`}>
        {icon}
      </div>
      <p className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`font-sora font-extrabold leading-tight text-xl ${isAlert ? 'text-red-400' : 'text-[var(--sand)]'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">{sub}</p>}
    </Card>
  );
}
