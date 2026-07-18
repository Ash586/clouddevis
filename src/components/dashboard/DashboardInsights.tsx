'use client';

// ============================================================
// Dashboard Insights — revenue bar chart (6 months) + top
// clients by cumulative TTC. Pure CSS bars, no chart library.
// Hidden entirely while there is no invoice data.
// ============================================================

import { useTranslations, useLocale } from 'next-intl';
import { BarChart3, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardStats } from './dashboardConstants';

const INTL_LOCALE: Record<string, string> = { fr: 'fr-FR', ar: 'ar-DZ', en: 'en-US' };

function fmtDA(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toLocaleString('fr-DZ', { maximumFractionDigits: 1 }) + ' M';
  }
  if (n >= 10_000) {
    return Math.round(n / 1_000).toLocaleString('fr-DZ') + ' K';
  }
  return Math.round(n).toLocaleString('fr-DZ');
}

interface Props { stats: DashboardStats }

export function DashboardInsights({ stats }: Props) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const locale = useLocale();

  const revenue = stats.monthlyRevenue ?? [];
  const topClients = stats.topClients ?? [];
  const max = Math.max(0, ...revenue.map((m) => m.total));

  if (max === 0 && topClients.length === 0) return null;

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? 'fr-FR', { month: 'short' })
      .format(new Date(y, m - 1, 1));
  };
  const currentKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* ── Revenue chart ── */}
      {max > 0 && (
        <Card className={`p-5 border-[rgba(15,39,71,0.06)] ${topClients.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(37,99,235,0.1)] text-[var(--green-3)]">
                <BarChart3 size={16} />
              </div>
              <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">
                {t('revenueChart')}
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[var(--sand-muted)]">
              max {fmtDA(max)} {tc('currency')}
            </span>
          </div>
          {/* Time axis always flows left→right, even in RTL */}
          <div dir="ltr" className="flex items-end gap-3 h-[140px]">
            {revenue.map((m) => {
              const isCurrent = m.month === currentKey;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
                  {m.total > 0 && (
                    <span className="text-[10px] font-bold text-[var(--sand-2)] tabular-nums truncate max-w-full">
                      {fmtDA(m.total)}
                    </span>
                  )}
                  <div
                    title={`${m.total.toLocaleString('fr-DZ')} ${tc('currency')}`}
                    className={`w-full rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-t from-[var(--green)] to-[var(--green-2)]'
                        : 'bg-[var(--navy-4)] hover:bg-[rgba(37,99,235,0.35)]'
                    }`}
                    style={{ height: `${Math.max(3, (m.total / max) * 100)}%` }}
                  />
                  <span className={`text-[10px] leading-none ${isCurrent ? 'font-bold text-[var(--green-3)]' : 'text-[var(--sand-muted)]'}`}>
                    {monthLabel(m.month)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Top clients ── */}
      {topClients.length > 0 && (
        <Card className={`p-5 border-[rgba(15,39,71,0.06)] ${max > 0 ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--gold-bg)] text-[var(--gold)]">
              <Crown size={16} />
            </div>
            <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">
              {t('topClients')}
            </h2>
          </div>
          <ol className="flex flex-col gap-2.5">
            {topClients.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--navy-3)]">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                    i === 0
                      ? 'bg-[var(--gold-bg)] text-[var(--gold)]'
                      : 'bg-[var(--navy-4)] text-[var(--sand-muted)]'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[var(--sand)] truncate">{c.name}</span>
                  <span className="block text-[11px] text-[var(--sand-muted)]">
                    {c.count} {t('docsShort')}
                  </span>
                </span>
                <span className="text-sm font-extrabold text-[var(--sand)] tabular-nums shrink-0">
                  {fmtDA(c.total)}
                  <span className="text-[10px] font-semibold text-[var(--sand-muted)] ms-1">{tc('currency')}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
