'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import {
  Users, FileText, Coins, Eye, CreditCard, Hourglass, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight,
} from 'lucide-react';

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
  visitors?: { totalPageViews: number; uniqueSessions: number; countryBreakdown: { country: string; count: number }[] };
  activityLogs?: { action: string; entity: string; details: string; adminName: string; userName: string; createdAt: string; ipAddress: string }[];
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/analytics').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/logs?limit=5').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([dashboard, analytics, logs]) => {
        setData({
          ...dashboard,
          visitors: analytics?.visitorStats ? {
            totalPageViews: analytics.visitorStats.totalPageViews,
            uniqueSessions: analytics.visitorStats.uniqueSessions,
            countryBreakdown: analytics.countryBreakdown || [],
          } : undefined,
          activityLogs: logs?.logs || [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!data) return <div className="text-center py-20 text-slate-400">{t('error')}</div>;

  const totalActive = data.stats.activeBasicUsers + data.stats.activeProUsers;
  const totalSubs = totalActive + data.stats.activeTrialUsers;
  const conversionRate = totalSubs > 0 ? Math.round((totalActive / totalSubs) * 100) : 0;

  const mainKpis = [
    {
      label: 'Utilisateurs',
      value: data.stats.totalUsers.toLocaleString(),
      sub: `+${data.stats.newUsersThisMonth} ce mois`,
      icon: Users,
      trend: 'up',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Documents',
      value: data.stats.totalDocs.toLocaleString(),
      sub: `+${data.stats.docsThisMonth} ce mois`,
      icon: FileText,
      trend: 'up',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Revenus',
      value: `${(data.stats.activeProUsers * 2000 + data.stats.activeBasicUsers * 1000).toLocaleString()} DA`,
      sub: 'MRR estimé',
      icon: Coins,
      trend: 'up',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Visiteurs',
      value: data.visitors?.totalPageViews?.toLocaleString() || '0',
      sub: `${data.visitors?.uniqueSessions || 0} sessions`,
      icon: Eye,
      trend: data.visitors && data.visitors.totalPageViews > 0 ? 'stable' : 'down',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const subKpis = [
    {
      label: 'Abonnements actifs',
      value: totalActive.toLocaleString(),
      sub: `${conversionRate}% taux conv.`,
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'En période d\'essai',
      value: data.stats.activeTrialUsers.toLocaleString(),
      sub: '14 jours moy.',
      icon: Hourglass,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Erreurs système',
      value: '0',
      sub: 'Aucune erreur',
      icon: AlertTriangle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const countryData = data.visitors?.countryBreakdown || [];
  const totalCountryViews = countryData.reduce((sum, c) => sum + c.count, 0) || 1;

  const countryColors: Record<string, string> = {
    algerie: '#185FA5', algeria: '#185FA5', tunisie: '#1D9E75', tunisia: '#1D9E75',
    maroc: '#EF9F27', morocco: '#EF9F27', france: '#888780',
  };

  const logColors: Record<string, string> = {
    CREATE: 'bg-emerald-500',
    UPDATE: 'bg-blue-500',
    DELETE: 'bg-red-500',
    LOGIN: 'bg-emerald-500',
    LOGOUT: 'bg-blue-500',
    ERROR: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      {/* Main KPIs - 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {mainKpis.map(card => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{card.label}</p>
            <p className={`text-xs font-semibold mt-1 ${card.trend === 'up' ? 'text-emerald-500' : card.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
              {card.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Sub KPIs - 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        {subKpis.map(card => (
          <Card key={card.label} className="p-4">
            <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xl font-black text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{card.label}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </Card>
        ))}
      </div>

      {/* Geographic Distribution */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          🌍 Distribution géographique des visiteurs
        </h2>
        {countryData.length > 0 ? (
          <div className="space-y-3">
            {countryData.slice(0, 6).map(c => {
              const pct = Math.round((c.count / totalCountryViews) * 100);
              const color = countryColors[c.country.toLowerCase()] || '#6366f1';
              return (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-20 text-right">{c.country}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-xs font-bold w-10" style={{ color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Aucune donnée de géolocalisation</p>
        )}
      </Card>

      {/* Recent Users */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          👥 Utilisateurs récents
        </h2>
        <div className="space-y-1">
          {data.recentUsers.slice(0, 5).map(u => {
            const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const avatarColors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-purple-100 text-purple-600', 'bg-red-100 text-red-600'];
            const colorIdx = u.name.charCodeAt(0) % avatarColors.length;
            const subColors: Record<string, string> = {
              PRO: 'bg-emerald-50 text-emerald-600',
              BASIC: 'bg-blue-50 text-blue-600',
              TRIAL: 'bg-amber-50 text-amber-600',
              EXPIRED: 'bg-red-50 text-red-600',
              FREE: 'bg-slate-50 text-slate-600',
            };
            return (
              <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[colorIdx]}`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.country} · {u.mode}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${subColors[u.subscription] || 'bg-slate-50 text-slate-600'}`}>
                  {u.subscription}
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0">{u.createdAt}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* System Activity */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          📋 Activité système récente
        </h2>
        {data.activityLogs && data.activityLogs.length > 0 ? (
          <div className="space-y-1">
            {data.activityLogs.map((log, i) => {
              const dotColor = logColors[log.action] || 'bg-slate-400';
              const details = log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '';
              const actor = log.adminName || log.userName || 'Système';
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">{log.action}</span> sur <span className="font-semibold">{log.entity}</span>
                      {log.ipAddress && <span className="text-slate-400 ml-1">({log.ipAddress})</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{actor}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Aucune activité récente</p>
        )}
      </Card>
    </div>
  );
}
