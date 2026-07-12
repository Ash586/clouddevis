'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/dgi';
import { IFU_THRESHOLD } from '@/lib/fiscal';
import type { FiscalSummary } from '@/lib/fiscal';
import {
  Calendar, TrendingUp, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight, Receipt, Landmark, Scale,
} from 'lucide-react';

export function FiscalPanel() {
  const t = useTranslations('fiscal');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [data, setData] = useState<FiscalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dgi/obligations?year=${year}`);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, [year]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-6 pt-6 pb-24 md:pb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[var(--navy-4)] rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-[var(--navy-4)] rounded-2xl" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const nextDeadline = data.g50Deadlines.find(d => !d.isPast);
  const daysUntilDeadline = nextDeadline
    ? Math.ceil((new Date(nextDeadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 5;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-6 pt-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-[var(--sand)]">{t('title')}</h1>
          <p className="text-xs text-[var(--sand-muted)] mt-0.5">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setYear(y => y - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--sand-muted)] hover:text-[var(--sand)] hover:border-[var(--border-2)] transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-[var(--sand)] min-w-[50px] text-center">{year}</span>
          <button
            type="button"
            onClick={() => setYear(y => y + 1)}
            disabled={year >= new Date().getFullYear()}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--sand-muted)] hover:text-[var(--sand)] hover:border-[var(--border-2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard
          icon={TrendingUp}
          label={t('totalRevenue')}
          value={formatCurrency(data.totalRevenue)}
          sub={t('invoiceCount', { count: data.invoiceCount })}
          color="text-[var(--green-3)]"
          bgColor="bg-[var(--green-glow)]"
        />
        <KpiCard
          icon={Landmark}
          label={t('tvaCollected')}
          value={formatCurrency(data.totalTVACollected)}
          sub={t('timbrePaid', { amount: formatCurrency(data.totalTimbrePaid) })}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
        <KpiCard
          icon={Scale}
          label={t('taxRegime')}
          value={t(data.regime === 'reel' ? 'regimeReel' : 'regimeForfaitaire')}
          sub={t('ifuThreshold', { amount: '8 000 000' })}
          color={data.regime === 'reel' ? 'text-amber-400' : 'text-[var(--green-3)]'}
          bgColor={data.regime === 'reel' ? 'bg-amber-400/10' : 'bg-[var(--green-glow)]'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* IFU Progress */}
        <div className="lg:col-span-2">
          <Card className="p-5 border-[rgba(15,39,71,0.06)]">
            <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-4">
              {t('ifuProgressTitle')}
            </h2>
            <div className="mb-3">
              <div className="flex items-end justify-between mb-2">
                <span className="text-xl font-bold text-[var(--sand)]">
                  {formatCurrency(data.totalRevenue)}
                </span>
                <span className="text-xs text-[var(--sand-muted)]">
                  / {formatCurrency(IFU_THRESHOLD)}
                </span>
              </div>
              <div className="h-3 bg-[var(--navy-4)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    data.ifuProgress >= 90 ? 'bg-red-400' :
                    data.ifuProgress >= 70 ? 'bg-amber-400' : 'bg-[var(--green-3)]'
                  }`}
                  style={{ width: `${data.ifuProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--sand-muted)] mt-2">
                {data.ifuProgress >= 100
                  ? t('ifuExceeded')
                  : t('ifuRemaining', { amount: formatCurrency(IFU_THRESHOLD - data.totalRevenue) })}
              </p>
            </div>

            {/* Monthly revenue mini-chart */}
            <h3 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mt-5 mb-3">
              {t('monthlyRevenue')}
            </h3>
            <MonthlyChart revenues={data.monthlyRevenues} />
          </Card>
        </div>

        {/* G50 Calendar */}
        <div className="lg:col-span-1">
          <Card className="p-5 border-[rgba(15,39,71,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-[var(--sand-muted)]" />
              <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">
                {t('g50Title')}
              </h2>
            </div>

            {/* Next deadline alert */}
            {nextDeadline && daysUntilDeadline !== null && (
              <div className={`flex items-start gap-3 p-3 rounded-xl mb-4 ${
                isUrgent ? 'bg-red-400/10 border border-red-400/20' : 'bg-amber-400/10 border border-amber-400/20'
              }`}>
                <AlertTriangle size={16} className={isUrgent ? 'text-red-400 mt-0.5' : 'text-amber-400 mt-0.5'} />
                <div>
                  <p className={`text-xs font-bold ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
                    {t('nextDeadline')}
                  </p>
                  <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">
                    {nextDeadline.label} — {t('daysLeft', { days: daysUntilDeadline })}
                  </p>
                </div>
              </div>
            )}

            {/* Deadline list */}
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
              {data.g50Deadlines.map(d => (
                <div
                  key={d.month}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs ${
                    d.isCurrentMonth
                      ? 'bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.18)]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {d.isPast ? (
                      <CheckCircle2 size={13} className="text-[var(--green-3)]" />
                    ) : (
                      <Receipt size={13} className="text-[var(--sand-muted)]" />
                    )}
                    <span className={d.isPast ? 'text-[var(--sand-muted)]' : 'text-[var(--sand)] font-medium'}>
                      {d.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--sand-muted)]">
                    {new Date(d.dueDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="p-4 border-[rgba(15,39,71,0.06)]">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
          <Icon size={16} className={color} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{label}</p>
          <p className={`text-base font-bold ${color} mt-0.5 truncate`}>{value}</p>
          <p className="text-[11px] text-[var(--sand-muted)] mt-0.5 truncate">{sub}</p>
        </div>
      </div>
    </Card>
  );
}

function MonthlyChart({ revenues }: { revenues: number[] }) {
  const max = Math.max(...revenues, 1);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const currentMonth = new Date().getMonth();

  return (
    <div className="flex items-end gap-1.5 h-24">
      {revenues.map((r, i) => {
        const pct = Math.max(4, (r / max) * 100);
        const isCurrent = i === currentMonth;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-sm transition-all ${
                isCurrent ? 'bg-[var(--green-3)]' : r > 0 ? 'bg-blue-400/60' : 'bg-[var(--navy-4)]'
              }`}
              style={{ height: `${pct}%` }}
              title={formatCurrency(r)}
            />
            <span className={`text-[9px] ${isCurrent ? 'text-[var(--green-3)] font-bold' : 'text-[var(--sand-muted)]'}`}>
              {months[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
