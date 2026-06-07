'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

interface ReportData {
  revenue: { total: string; tva: string; docCount: number };
  userGrowth: { month: string; count: number }[];
  docByType: { type: string; count: number; revenue: number }[];
  subscriptionBreakdown: { status: string; count: number }[];
}

export default function AdminReportsPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const periods = [
    { value: 'month', label: t('reports.period.month') },
    { value: 'quarter', label: t('reports.period.quarter') },
    { value: 'year', label: t('reports.period.year') },
  ];

  const typeLabels: Record<string, string> = {
    DEVIS: 'Devis',
    FACTURE: 'Facture',
    PROFORMA: 'Proforma',
    BC: 'Bon de Commande',
    BR: 'Bon de Réception',
  };

  const statusColors: Record<string, string> = {
    TRIAL: 'text-amber-600 bg-amber-50',
    BASIC: 'text-blue-600 bg-blue-50',
    PRO: 'text-emerald-600 bg-emerald-50',
    FREE: 'text-slate-600 bg-slate-50',
    EXPIRED: 'text-red-600 bg-red-50',
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400">{t('error')}</div>;

  const maxGrowth = Math.max(...data.userGrowth.map(g => g.count), 1);
  const maxDocs = Math.max(...data.docByType.map(d => d.count), 1);
  const totalSubs = data.subscriptionBreakdown.reduce((s, sb) => s + sb.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">{t('nav.reports')}</h1>
        <div className="flex gap-2">
          {periods.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${period === p.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="p-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
          <p className="text-lg font-black text-slate-900">{data.revenue.total} DA</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('reports.totalRevenue')}</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3"><FileText className="w-5 h-5 text-blue-600" /></div>
          <p className="text-lg font-black text-slate-900">{data.revenue.docCount}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('reports.totalDocs')}</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
          <p className="text-lg font-black text-slate-900">{data.revenue.tva} DA</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('reports.totalTva')}</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3"><Users className="w-5 h-5 text-purple-600" /></div>
          <p className="text-lg font-black text-slate-900">{data.userGrowth.reduce((s, g) => s + g.count, 0)}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('reports.newUsers')}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* User Growth */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('reports.userGrowth')}</h2>
          <div className="space-y-2">
            {data.userGrowth.map(g => (
              <div key={g.month}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">{g.month}</span>
                  <span className="font-bold text-slate-700">{g.count}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(g.count / maxGrowth) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Document Type Breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('reports.docByType')}</h2>
          <div className="space-y-3">
            {data.docByType.map(d => (
              <div key={d.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{typeLabels[d.type] || d.type}</span>
                  <span className="text-slate-400">{d.count} — {d.revenue.toLocaleString()} DA</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(d.count / maxDocs) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('reports.subBreakdown')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {data.subscriptionBreakdown.map(sb => (
            <div key={sb.status} className="text-center p-4 rounded-xl bg-slate-50">
              <p className={`text-lg font-black ${(statusColors[sb.status] || 'text-slate-600').split(' ')[0]}`}>
                {sb.count}
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{sb.status}</p>
              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(statusColors[sb.status] || 'bg-slate-400').split(' ')[0].replace('text-', 'bg-')}`}
                  style={{ width: `${(sb.count / totalSubs) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
