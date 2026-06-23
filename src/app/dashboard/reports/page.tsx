'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Period = 'month' | 'quarter' | 'year' | 'custom';

interface Summary {
  totalRevenue: string;
  totalTVA: string;
  totalCount: number;
  avgInvoice: string;
}

interface MonthData {
  month: string;
  revenue: string;
  count: number;
}

interface TypeData {
  type: string;
  count: number;
  total: string;
}

interface StatusData {
  status: string;
  count: number;
}

interface TopClient {
  name: string;
  count: number;
  total: number;
}

interface ReportsData {
  summary: Summary;
  monthly: MonthData[];
  byType: TypeData[];
  byStatus: StatusData[];
  topClients: TopClient[];
}

const TYPE_COLORS: Record<string, string> = {
  DEVIS: 'bg-blue-400/10 text-blue-400',
  FACTURE: 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)]',
  PROFORMA: 'bg-purple-400/10 text-purple-400',
  BC: 'bg-amber-400/10 text-amber-400',
  BR: 'bg-teal-400/10 text-teal-400',
  INTERVENTION: 'bg-rose-400/10 text-rose-400',
  ATTACHEMENT: 'bg-indigo-400/10 text-indigo-400',
};

const PERIODS: { value: Period; labelKey: string }[] = [
  { value: 'month', labelKey: 'thisMonth' },
  { value: 'quarter', labelKey: 'thisQuarter' },
  { value: 'year', labelKey: 'thisYear' },
  { value: 'custom', labelKey: 'custom' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tc = useTranslations('common');

  const [period, setPeriod] = useState<Period>('year');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period === 'custom' && customFrom && customTo) {
        params.set('from', customFrom);
        params.set('to', customTo);
      } else {
        params.set('period', period);
      }

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportCSV = () => {
    if (!data) return;

    const lines: string[] = [];
    lines.push('Type,Count,Total');
    data.byType.forEach(r => lines.push(`${r.type},${r.count},${r.total}`));
    lines.push('');
    lines.push('Status,Count');
    data.byStatus.forEach(r => lines.push(`${r.status},${r.count}`));
    lines.push('');
    lines.push('Month,Revenue,Count');
    data.monthly.forEach(r => lines.push(`${r.month},${r.revenue},${r.count}`));
    lines.push('');
    lines.push('Client,Doc Count,Total Amount');
    data.topClients.forEach(r => lines.push(`${r.name},${r.count},${r.total}`));

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clouddevis-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxMonthlyRevenue = data ? Math.max(...data.monthly.map(m => {
    const val = Number(m.revenue.replace(/\s/g, '').replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }), 1) : 1;

  const parseRevenue = (s: string) => {
    const val = Number(s.replace(/\s/g, '').replace(',', '.'));
    return isNaN(val) ? 0 : val;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--sand)]">{t('title')}</h1>
                <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!data}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {t('exportCSV')}
                </Button>
              </div>

              {/* Period Selector */}
              <Card>
                <div className="flex flex-wrap gap-2">
                  {PERIODS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        period === p.value
                          ? 'bg-[var(--green-2)] text-white shadow-sm'
                          : 'bg-[var(--navy-3)] text-[var(--sand-2)] hover:bg-[var(--navy-4)]'
                      )}
                    >
                      {t(p.labelKey)}
                    </button>
                  ))}
                </div>
                {period === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('from')}</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={e => setCustomFrom(e.target.value)}
                        className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('to')}</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={e => setCustomTo(e.target.value)}
                        className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
                      />
                    </div>
                  </div>
                )}
              </Card>

              {loading ? (
                <div className="text-center py-12 text-[var(--sand-muted)]">{tc('loading')}</div>
              ) : !data ? (
                <div className="text-center py-12 text-[var(--sand-muted)]">{t('noData')}</div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card className="text-center">
                      <p className="text-2xl font-black text-[var(--sand)]">{data.summary.totalRevenue} <span className="text-sm font-normal text-[var(--sand-muted)]">{tc('currency')}</span></p>
                      <p className="text-xs text-[var(--sand-muted)] font-semibold">{t('totalRevenue')}</p>
                    </Card>
                    <Card className="text-center">
                      <p className="text-2xl font-black text-[var(--sand)]">{data.summary.totalTVA} <span className="text-sm font-normal text-[var(--sand-muted)]">{tc('currency')}</span></p>
                      <p className="text-xs text-[var(--sand-muted)] font-semibold">{t('totalTVA')}</p>
                    </Card>
                    <Card className="text-center">
                      <p className="text-2xl font-black text-[var(--sand)]">{data.summary.totalCount}</p>
                      <p className="text-xs text-[var(--sand-muted)] font-semibold">{t('docCount')}</p>
                    </Card>
                    <Card className="text-center">
                      <p className="text-2xl font-black text-[var(--sand)]">{data.summary.avgInvoice} <span className="text-sm font-normal text-[var(--sand-muted)]">{tc('currency')}</span></p>
                      <p className="text-xs text-[var(--sand-muted)] font-semibold">{t('avgInvoice')}</p>
                    </Card>
                  </div>

                  {/* Monthly Revenue Chart */}
                  {data.monthly.length > 0 && (
                    <Card>
                      <h2 className="text-sm font-bold text-[var(--sand-2)] mb-4">{t('monthlyRevenue')}</h2>
                      <div className="flex items-end gap-2 h-48 overflow-x-auto pb-6">
                        {data.monthly.map(m => {
                          const val = parseRevenue(m.revenue);
                          const pct = maxMonthlyRevenue > 0 ? (val / maxMonthlyRevenue) * 100 : 0;
                          const monthLabel = m.month.length === 7 ? `${MONTH_NAMES[parseInt(m.month.split('-')[1]) - 1]} ${m.month.split('-')[0].slice(-2)}` : m.month;
                          return (
                            <div key={m.month} className="flex flex-col items-center min-w-[60px] flex-1">
                              <span className="text-[9px] font-semibold text-[var(--sand-muted)] mb-1 whitespace-nowrap">{val.toLocaleString()}</span>
                              <div className="w-full max-w-[40px] bg-[var(--green-2)] rounded-t-lg transition-all" style={{ height: `${Math.max(4, pct)}%` }} />
                              <span className="text-[10px] font-semibold text-[var(--sand-muted)] mt-2 whitespace-nowrap">{monthLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* By Type Table */}
                    <Card>
                      <h2 className="text-sm font-bold text-[var(--sand-2)] mb-4">{t('byType')}</h2>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[rgba(15,39,71,0.06)]">
                            <th className="text-start py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('type')}</th>
                            <th className="text-end py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{t('count')}</th>
                            <th className="text-end py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('total')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.byType.map(r => (
                            <tr key={r.type} className="border-b border-[rgba(15,39,71,0.04)]">
                              <td className="py-2 px-3">
                                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', TYPE_COLORS[r.type] || 'bg-[var(--navy-3)] text-[var(--sand-2)]')}>
                                  {r.type}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-end text-[var(--sand-2)]">{r.count}</td>
                              <td className="py-2 px-3 text-end font-bold text-[var(--sand)]">{r.total} <span className="text-xs font-normal text-[var(--sand-muted)]">{tc('currency')}</span></td>
                            </tr>
                          ))}
                          {data.byType.length === 0 && (
                            <tr><td colSpan={3} className="py-4 text-center text-[var(--sand-muted)]">{t('noData')}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </Card>

                    {/* By Status Table */}
                    <Card>
                      <h2 className="text-sm font-bold text-[var(--sand-2)] mb-4">{t('byStatus')}</h2>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[rgba(15,39,71,0.06)]">
                            <th className="text-start py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('status')}</th>
                            <th className="text-end py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{t('count')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.byStatus.map(r => (
                            <tr key={r.status} className="border-b border-[rgba(15,39,71,0.04)]">
                              <td className="py-2 px-3">
                                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', TYPE_COLORS[r.status] || 'bg-[var(--navy-3)] text-[var(--sand-2)]')}>
                                  {tc(r.status?.toLowerCase()) || r.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-end font-bold text-[var(--sand)]">{r.count}</td>
                            </tr>
                          ))}
                          {data.byStatus.length === 0 && (
                            <tr><td colSpan={2} className="py-4 text-center text-[var(--sand-muted)]">{t('noData')}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </Card>
                  </div>

                  {/* Top Clients Table */}
                  {data.topClients.length > 0 && (
                    <Card>
                      <h2 className="text-sm font-bold text-[var(--sand-2)] mb-4">{t('topClients')}</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[rgba(15,39,71,0.06)]">
                              <th className="text-start py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('name')}</th>
                              <th className="text-end py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{t('docCount')}</th>
                              <th className="text-end py-2 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('total')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.topClients.map((r, i) => (
                              <tr key={i} className="border-b border-[rgba(15,39,71,0.04)]">
                                <td className="py-2 px-3 font-semibold text-[var(--sand)]">{r.name}</td>
                                <td className="py-2 px-3 text-end text-[var(--sand-2)]">{r.count}</td>
                                <td className="py-2 px-3 text-end font-bold text-[var(--sand)]">{r.total.toLocaleString()} <span className="text-xs font-normal text-[var(--sand-muted)]">{tc('currency')}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
