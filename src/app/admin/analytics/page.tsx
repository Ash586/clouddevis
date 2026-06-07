'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { MobileTable } from '@/components/mobile/MobileTable';
import {
  TrendingUp, Users, FileText, Globe,
  BarChart3, Activity, Eye, MousePointerClick,
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: { date: string; count: number; artisans: number; enterprises: number }[];
  docTrend: { date: string; count: number; revenue: number }[];
  countryBreakdown: { country: string; count: number }[];
  topUsers: { id: string; name: string; email: string; docCount: number }[];
  systemMetrics: { date: string; users: number; docs: number; revenue: number }[];
  docStatusBreakdown: { status: string; count: number }[];
  visitorStats: { totalPageViews: number; uniqueSessions: number; avgPageViewsPerSession: number };
  topPages: { path: string; count: number }[];
  conversion: { totalUsersInPeriod: number; paidUsersInPeriod: number; conversionRate: number };
  period: string;
}

export default function AdminAnalyticsPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const periods = [
    { value: '7d', label: t('analytics.period.7d') },
    { value: '30d', label: t('analytics.period.30d') },
    { value: '90d', label: t('analytics.period.90d') },
    { value: 'year', label: t('analytics.period.year') },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400">{t('error')}</div>;

  const totalUsersGrowth = data.userGrowth.reduce((s, d) => s + d.count, 0);
  const totalDocsCreated = data.docTrend.reduce((s, d) => s + d.count, 0);
  const totalRevenue = data.docTrend.reduce((s, d) => s + d.revenue, 0);
  const avgDailyDocs = data.docTrend.length ? Math.round(totalDocsCreated / data.docTrend.length) : 0;

  const maxUserCount = Math.max(...data.userGrowth.map(d => d.count), 1);
  const maxDocCount = Math.max(...data.docTrend.map(d => d.count), 1);
  const maxCountryCount = Math.max(...data.countryBreakdown.map(c => c.count), 1);
  const maxPageCount = Math.max(...data.topPages.map(p => p.count), 1);

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-amber-50 text-amber-600',
    ACCEPTED: 'bg-emerald-50 text-emerald-600',
    PROGRESS: 'bg-blue-50 text-blue-600',
    DELIVERED: 'bg-purple-50 text-purple-600',
  };

  const userColumns = [
    { key: 'name', label: t('table.name') },
    { key: 'email', label: t('table.email') },
    { key: 'docCount', label: t('table.docs') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">{t('nav.analytics')}</h1>
        <div className="flex gap-2">
          {periods.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${period === p.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="p-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
          <p className="text-2xl font-black text-slate-900">{totalUsersGrowth.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('analytics.newUsers')}</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3"><FileText className="w-5 h-5 text-emerald-600" /></div>
          <p className="text-2xl font-black text-slate-900">{totalDocsCreated.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('analytics.newDocs')}</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
          <p className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString()} DA</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('analytics.revenue')}</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3"><Activity className="w-5 h-5 text-purple-600" /></div>
          <p className="text-2xl font-black text-slate-900">{avgDailyDocs}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t('analytics.avgDaily')}</p>
        </Card>
      </div>

      {/* Visitor Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="p-4">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-3"><Eye className="w-5 h-5 text-cyan-600" /></div>
          <p className="text-2xl font-black text-slate-900">{data.visitorStats.totalPageViews.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Page Views</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3"><MousePointerClick className="w-5 h-5 text-indigo-600" /></div>
          <p className="text-2xl font-black text-slate-900">{data.visitorStats.uniqueSessions.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Sessions uniques</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-3"><MousePointerClick className="w-5 h-5 text-rose-600" /></div>
          <p className="text-2xl font-black text-slate-900">{data.visitorStats.avgPageViewsPerSession}</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Pages / session</p>
        </Card>
        <Card className="p-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
          <p className="text-2xl font-black text-slate-900">{data.conversion.conversionRate}%</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Taux de conversion</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* User Growth Chart */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.userGrowth')}</h2>
          <div className="space-y-2">
            {data.userGrowth.slice(-14).map(d => {
              const pct = maxUserCount > 0 ? (d.count / maxUserCount) * 100 : 0;
              return (
                <div key={d.date}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">{new Date(d.date).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">{d.count}</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Document Trend Chart */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.docTrend')}</h2>
          <div className="space-y-2">
            {data.docTrend.slice(-14).map(d => {
              const pct = maxDocCount > 0 ? (d.count / maxDocCount) * 100 : 0;
              return (
                <div key={d.date}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">{new Date(d.date).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">{d.count}</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Country Breakdown & Doc Status */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.countries')}</h2>
          <div className="space-y-3">
            {data.countryBreakdown.map(c => {
              const pct = maxCountryCount > 0 ? (c.count / maxCountryCount) * 100 : 0;
              return (
                <div key={c.country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700 capitalize">{c.country}</span>
                    <span className="text-slate-400">{c.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {data.countryBreakdown.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">{t('analytics.noCountryData')}</p>
            )}
          </div>
        </Card>

        {/* Doc Status */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.docStatus')}</h2>
          <div className="space-y-3">
            {['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'].map(status => {
              const found = data.docStatusBreakdown.find(d => d.status === status);
              const count = found ? found.count : 0;
              const total = data.docStatusBreakdown.reduce((s, d) => s + d.count, 0) || 1;
              const pct = (count / total) * 100;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
                      {status}
                    </span>
                    <span className="text-slate-400">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Pages */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Pages les plus visitées</h2>
        {data.topPages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
        ) : (
          <div className="space-y-2">
            {data.topPages.map(p => {
              const pct = maxPageCount > 0 ? (p.count / maxPageCount) * 100 : 0;
              return (
                <div key={p.path}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700 font-mono text-xs">{p.path}</span>
                    <span className="text-slate-400">{p.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Conversion */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Conversion</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-slate-900">{data.conversion.totalUsersInPeriod}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Nouveaux utilisateurs</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600">{data.conversion.paidUsersInPeriod}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Payants</p>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-600">{data.conversion.conversionRate}%</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Taux de conversion</p>
          </div>
        </div>
      </Card>

      {/* Top Users */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('analytics.topUsers')}</h2>
        <MobileTable columns={userColumns} data={data.topUsers} keyField="id" />
      </Card>
    </div>
  );
}
