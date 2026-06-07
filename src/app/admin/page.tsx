'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Users, FileText, UsersRound, TrendingUp, Clock } from 'lucide-react';

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    usersToday: number;
    totalDocs: number;
    docsThisMonth: number;
    totalClients: number;
    activeTrialUsers: number;
    activeBasicUsers: number;
    activeProUsers: number;
  };
  docTypeBreakdown: { type: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; country: string; subscription: string; mode: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!data) return <div className="text-center py-20 text-slate-400">{t('error')}</div>;

  const statCards = [
    { label: t('stats.totalUsers'), value: data.stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('stats.totalDocs'), value: data.stats.totalDocs, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('stats.totalClients'), value: data.stats.totalClients, icon: UsersRound, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('stats.newThisMonth'), value: data.stats.newUsersThisMonth, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const subCards = [
    { label: 'TRIAL', value: data.stats.activeTrialUsers, color: 'text-amber-600' },
    { label: 'BASIC', value: data.stats.activeBasicUsers, color: 'text-blue-600' },
    { label: 'PRO', value: data.stats.activeProUsers, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">{t('nav.dashboard')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map(card => (
          <Card key={card.label} className="p-4">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-900">{card.value.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* Subscription Breakdown */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('stats.subscriptions')}</h2>
        <div className="grid grid-cols-3 gap-4">
          {subCards.map(sub => (
            <div key={sub.label} className="text-center">
              <p className={`text-2xl font-black ${sub.color}`}>{sub.value}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{sub.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Document Type Breakdown */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('stats.docTypes')}</h2>
        <div className="space-y-3">
          {data.docTypeBreakdown.map(dt => {
            const max = Math.max(...data.docTypeBreakdown.map(d => d.count), 1);
            return (
              <div key={dt.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{dt.type}</span>
                  <span className="text-slate-400">{dt.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(dt.count / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Users */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('stats.recentUsers')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-400 text-xs font-semibold">
                <th className="pb-2">{t('table.name')}</th>
                <th className="pb-2">{t('table.email')}</th>
                <th className="pb-2">{t('table.country')}</th>
                <th className="pb-2">{t('table.subscription')}</th>
                <th className="pb-2">{t('table.date')}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map(u => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="py-2.5 font-semibold text-slate-800">{u.name}</td>
                  <td className="py-2.5 text-slate-500">{u.email}</td>
                  <td className="py-2.5 text-slate-500">{u.country}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.subscription === 'PRO' ? 'bg-emerald-50 text-emerald-600' : u.subscription === 'BASIC' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                      {u.subscription}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
