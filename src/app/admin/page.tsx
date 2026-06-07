'use client';

import { useEffect, useState } from 'react';

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
  recentUsers: { id: string; name: string; email: string; country: string; subscription: string; mode: string; createdAt: string }[];
}

interface AnalyticsData {
  countryBreakdown: { country: string; count: number }[];
  visitorStats: { totalPageViews: number; uniqueSessions: number };
}

interface LogsData {
  logs: { action: string; entity: string; details: string; adminName: string; userName: string; createdAt: string; ipAddress: string }[];
}

interface SystemData {
  counts: { users: number; documents: number; clients: number; admins: number };
  activity: { errorCount: number; loginCount: number };
}

export default function AdminDashboardPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/analytics').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/logs?limit=5').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/system').then(r => r.ok ? r.json() : null),
    ]).then(([dash, analytics, logs, system]) => {
      setDashData(dash);
      setAnalyticsData(analytics);
      setLogsData(logs);
      setSystemData(system);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!dashData) {
    return <div className="text-center py-20 text-sm text-slate-400">Erreur de chargement</div>;
  }

  const { stats, recentUsers } = dashData;
  const totalActive = stats.activeBasicUsers + stats.activeProUsers;
  const totalSubs = totalActive + stats.activeTrialUsers;
  const conversionRate = totalSubs > 0 ? Math.round((totalActive / totalSubs) * 100) : 0;
  const errorCount = systemData?.activity?.errorCount ?? 0;

  const countryData = analyticsData?.countryBreakdown || [];
  const totalCountryViews = countryData.reduce((sum, c) => sum + c.count, 0) || 1;
  const countryColors: Record<string, string> = {
    algerie: '#185FA5', algeria: '#185FA5',
    tunisie: '#1D9E75', tunisia: '#1D9E75',
    maroc: '#EF9F27', morocco: '#EF9F27',
    france: '#888780',
  };

  const logDotColors: Record<string, string> = {
    CREATE: '#1D9E75', LOGIN: '#1D9E75',
    UPDATE: '#185FA5',
    DELETE: '#E24B4A', ERROR: '#E24B4A',
  };

  function getLogDescription(log: LogsData['logs'][0]): string {
    const actor = log.adminName || log.userName || 'Système';
    switch (log.action) {
      case 'CREATE': return `Nouveau compte — ${actor}`;
      case 'UPDATE': return `Modification — ${log.entity} par ${actor}`;
      case 'DELETE': return `Suppression — ${log.entity} par ${actor}`;
      case 'LOGIN': return `Connexion — ${actor}`;
      case 'LOGOUT': return `Déconnexion — ${actor}`;
      case 'ERROR': return `Erreur ${log.entity} — ${log.details || actor}`;
      default: return `${log.action} sur ${log.entity} — ${actor}`;
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return `il y a ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `il y a ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'hier';
    return `il y a ${days}j`;
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const avatarColors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-red-100 text-red-600'];
  const subPills: Record<string, { bg: string; text: string; label: string }> = {
    PRO: { bg: 'bg-emerald-50 text-emerald-600', text: 'Pro', label: 'Pro' },
    BASIC: { bg: 'bg-blue-50 text-blue-600', text: 'Basic', label: 'Essai' },
    TRIAL: { bg: 'bg-blue-50 text-blue-600', text: 'Essai', label: 'Essai' },
    EXPIRED: { bg: 'bg-amber-50 text-amber-600', text: 'Expiré', label: 'Expiré' },
    FREE: { bg: 'bg-slate-100 text-slate-500', text: 'Free', label: 'Free' },
  };

  return (
    <div className="max-w-5xl">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">CD</span>
          </div>
          <span className="text-sm font-bold text-slate-900">CloudDevis — Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Next.js 16 + PostgreSQL</span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Prêt</span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Juin 2026</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'users', label: 'Utilisateurs' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'logs', label: 'Logs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== OVERVIEW TAB ========== */}
      {activeTab === 'overview' && (
        <>
          {/* Main KPIs - 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
            <MetricCard label="Utilisateurs" value={stats.totalUsers.toLocaleString()} sub={`+${stats.newUsersThisMonth} ce mois`} subColor="text-emerald-500" />
            <MetricCard label="Documents" value={stats.totalDocs.toLocaleString()} sub={`+${stats.docsThisMonth} ce mois`} subColor="text-emerald-500" />
            <MetricCard label="Revenus" value={`${(stats.activeProUsers * 2000 + stats.activeBasicUsers * 1000).toLocaleString()} DA`} sub="MRR estimé" subColor="text-emerald-500" />
            <MetricCard label="Visiteurs" value={(analyticsData?.visitorStats?.totalPageViews ?? 0).toLocaleString()} sub={`${analyticsData?.visitorStats?.uniqueSessions ?? 0} sessions`} subColor="text-amber-500" />
          </div>

          {/* Sub KPIs - 3 columns */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <MetricCard label="Abonnements actifs" value={totalActive.toLocaleString()} sub={`${conversionRate}% taux conv.`} subColor="text-emerald-500" />
            <MetricCard label="En période d'essai" value={stats.activeTrialUsers.toLocaleString()} sub="14 jours restants moy." subColor="text-emerald-500" />
            <MetricCard label="Erreurs système" value={String(errorCount)} sub={errorCount > 0 ? 'À investiguer' : 'Aucune erreur'} subColor={errorCount > 0 ? 'text-amber-500' : 'text-emerald-500'} />
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🌍 Distribution géographique des visiteurs</h3>
            {countryData.length > 0 ? (
              <div className="flex flex-col gap-2">
                {countryData.slice(0, 6).map(c => {
                  const pct = Math.round((c.count / totalCountryViews) * 100);
                  const color = countryColors[c.country.toLowerCase()] || '#6366f1';
                  return (
                    <div key={c.country} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20 text-right flex-shrink-0">{c.country}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs font-medium w-10 text-right" style={{ color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Aucune donnée</p>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">👥 Utilisateurs récents</h3>
            <div>
              {recentUsers.slice(0, 5).map(u => {
                const pill = subPills[u.subscription] || subPills.FREE;
                return (
                  <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[u.name.charCodeAt(0) % avatarColors.length]}`}>
                      {getInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.country} · {u.mode}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pill.bg}`}>{pill.label}</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">{u.createdAt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Activity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">📋 Activité système récente</h3>
            {logsData && logsData.logs.length > 0 ? (
              <div>
                {logsData.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: logDotColors[log.action] || '#888780' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">{getLogDescription(log)}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {timeAgo(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </>
      )}

      {/* ========== USERS TAB ========== */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">👥 Liste des utilisateurs</h3>
          <div>
            {recentUsers.map(u => {
              const pill = subPills[u.subscription] || subPills.FREE;
              return (
                <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[u.name.charCodeAt(0) % avatarColors.length]}`}>
                    {getInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email} · {u.country}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pill.bg}`}>{pill.label}</span>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">{u.createdAt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== ANALYTICS TAB ========== */}
      {activeTab === 'analytics' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard label="Pages vues" value={(analyticsData?.visitorStats?.totalPageViews ?? 0).toLocaleString()} sub="Total" subColor="text-emerald-500" />
            <MetricCard label="Sessions uniques" value={(analyticsData?.visitorStats?.uniqueSessions ?? 0).toLocaleString()} sub="Uniques" subColor="text-emerald-500" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🌍 Pays d&apos;origine</h3>
            {countryData.length > 0 ? (
              <div className="flex flex-col gap-2">
                {countryData.map(c => {
                  const pct = Math.round((c.count / totalCountryViews) * 100);
                  const color = countryColors[c.country.toLowerCase()] || '#6366f1';
                  return (
                    <div key={c.country} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20 text-right flex-shrink-0">{c.country}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs font-medium w-10 text-right" style={{ color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </div>
      )}

      {/* ========== LOGS TAB ========== */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">📋 Journaux d&apos;activité</h3>
          {logsData && logsData.logs.length > 0 ? (
            <div>
              {logsData.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: logDotColors[log.action] || '#888780' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">{log.action}</span> sur <span className="font-semibold">{log.entity}</span>
                    </p>
                    {log.details && <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>}
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">Aucune activité</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Metric Card ── */
function MetricCard({ label, value, sub, subColor = 'text-emerald-500' }: {
  label: string; value: string; sub: string; subColor?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className={`text-[11px] font-medium mt-1 ${subColor}`}>{sub}</p>
    </div>
  );
}
