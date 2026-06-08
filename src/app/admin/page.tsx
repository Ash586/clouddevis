'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  stats: {
    totalUsers: number; newUsersThisMonth: number; usersToday: number;
    totalDocs: number; docsThisMonth: number; totalClients: number;
    activeTrialUsers: number; activeBasicUsers: number; activeProUsers: number;
  };
  docTypeBreakdown: { type: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; country: string; subscription: string; mode: string; createdAt: string }[];
}

interface AnalyticsData {
  visitorStats: { totalPageViews: number; uniqueSessions: number };
  countryBreakdown: { country: string; count: number }[];
}

interface LogEntry {
  action: string; entity: string; details: string; adminName: string; userName: string; createdAt: string; ipAddress: string;
}

const card = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px' };

const colors = {
  green: '#4ade80', greenBg: 'rgba(74,222,128,0.10)',
  amber: '#fbbf24', amberBg: 'rgba(251,191,36,0.10)',
  red: '#f87171', redBg: 'rgba(248,113,113,0.10)',
  blue: '#4a9eff', blueBg: 'rgba(74,158,255,0.10)',
};

export default function AdminDashboardPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [system, setSystem] = useState<{ counts: Record<string, number>; activity: { errorCount: number; loginCount: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/analytics').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/logs?limit=5').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/system').then(r => r.ok ? r.json() : null),
    ]).then(([dash, a, l, s]) => {
      setDashData(dash);
      setAnalytics(a);
      setLogs(l?.logs || []);
      setSystem(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = dashData?.stats;
  const totalActive = (stats?.activeBasicUsers || 0) + (stats?.activeProUsers || 0);
  const totalSubs = totalActive + (stats?.activeTrialUsers || 0);
  const conversionRate = totalSubs > 0 ? Math.round((totalActive / totalSubs) * 100) : 0;
  const revenue = ((stats?.activeProUsers || 0) * 2000 + (stats?.activeBasicUsers || 0) * 1000).toLocaleString();
  const countryData = analytics?.countryBreakdown || [];
  const totalCountryViews = countryData.reduce((s, c) => s + c.count, 0) || 1;
  const errorCount = system?.activity?.errorCount ?? 0;
  const recentUsers = dashData?.recentUsers || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #656a73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const MetricBox = ({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor?: string }) => (
    <div style={card}>
      <p style={{ fontSize: 10, color: '#656a73', fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, fontWeight: 500, marginTop: 2, color: subColor || '#a1a5ad' }}>{sub}</p>
    </div>
  );

  const countryColors: Record<string, string> = {
    algerie: '#185FA5', algeria: '#185FA5',
    tunisie: '#1D9E75', tunisia: '#1D9E75',
    maroc: '#EF9F27', morocco: '#EF9F27',
    france: '#656a73',
  };

  const actionDotColors: Record<string, string> = {
    CREATE: colors.green, LOGIN: colors.green,
    UPDATE: colors.blue,
    DELETE: colors.red, ERROR: colors.red,
  };

  const subPills: Record<string, { bg: string; color: string; label: string }> = {
    PRO: { bg: colors.greenBg, color: colors.green, label: 'Pro' },
    BASIC: { bg: colors.blueBg, color: colors.blue, label: 'Basic' },
    TRIAL: { bg: colors.blueBg, color: colors.blue, label: 'Essai' },
    EXPIRED: { bg: colors.amberBg, color: colors.amber, label: 'Expiré' },
    FREE: { bg: '#282c38', color: '#a1a5ad', label: 'Free' },
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'à l\'instant';
    if (m < 60) return `il y a ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    const days = Math.floor(h / 24);
    return days === 1 ? 'hier' : `il y a ${days}j`;
  };

  const logDesc = (log: LogEntry) => {
    const actor = log.adminName || log.userName || 'Système';
    switch (log.action) {
      case 'CREATE': return `Nouveau compte — ${actor}`;
      case 'UPDATE': return `Modification — ${log.entity} par ${actor}`;
      case 'DELETE': return `Suppression — ${log.entity} par ${actor}`;
      case 'LOGIN': return `Connexion — ${actor}`;
      case 'ERROR': return `Erreur ${log.entity} — ${log.details || actor}`;
      default: return `${log.action} sur ${log.entity} — ${actor}`;
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* ── Top badge bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, ...card }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#1d202a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, color: '#e8ebf0' }}>CD</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e8ebf0' }}>CloudDevis — Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#282c38', color: '#a1a5ad', border: '0.5px solid rgba(255,255,255,0.08)' }}>Next.js 16 + PostgreSQL</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: colors.greenBg, color: colors.green }}>Prêt</span>
        </div>
      </div>

      {/* ── Top metrics grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        <MetricBox label="Utilisateurs" value={stats?.totalUsers?.toLocaleString() ?? '—'} sub={`+${stats?.newUsersThisMonth ?? 0} ce mois`} subColor={colors.green} />
        <MetricBox label="Documents" value={stats?.totalDocs?.toLocaleString() ?? '—'} sub={`+${stats?.docsThisMonth ?? 0} ce mois`} subColor={colors.green} />
        <MetricBox label="Revenus" value={`${revenue} DA`} sub="MRR estimé" subColor={colors.green} />
        <MetricBox label="Visiteurs" value={(analytics?.visitorStats?.totalPageViews ?? 0).toLocaleString()} sub={`${analytics?.visitorStats?.uniqueSessions ?? 0} sessions`} subColor={colors.amber} />
      </div>

      {/* ── Secondary metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
        <MetricBox label="Abonnements actifs" value={totalActive.toLocaleString()} sub={`${conversionRate}% taux conv.`} subColor={colors.green} />
        <MetricBox label="En période d'essai" value={(stats?.activeTrialUsers ?? 0).toLocaleString()} sub="14 jours restants moy." subColor={colors.green} />
        <MetricBox label="Erreurs système" value={String(errorCount)} sub={errorCount > 0 ? 'À investiguer' : 'Aucune erreur'} subColor={errorCount > 0 ? colors.amber : colors.green} />
      </div>

      {/* ── Country breakdown ── */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#656a73', marginBottom: 8 }}>🌍 Pays d'origine</p>
        <div style={card}>
          {countryData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {countryData.slice(0, 6).map(c => {
                const pct = Math.round((c.count / totalCountryViews) * 100);
                const color = countryColors[c.country.toLowerCase()] || colors.blue;
                return (
                  <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#656a73', width: 80, textAlign: 'right', flexShrink: 0 }}>{c.country}</span>
                    <div style={{ flex: 1, height: 6, background: '#1d202a', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, width: 36, textAlign: 'right', color }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#656a73', textAlign: 'center', padding: '12px 0' }}>Aucune donnée</p>
          )}
        </div>
      </div>

      {/* ── Recent users ── */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#656a73', marginBottom: 8 }}>👥 Utilisateurs récents</p>
        <div style={card}>
          {recentUsers.length > 0 ? (
            <div>
              {recentUsers.slice(0, 5).map(u => {
                const pill = subPills[u.subscription] || subPills.FREE;
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, background: '#1d202a', color: '#a1a5ad' }}>
                      {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#e8ebf0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: '#656a73', margin: 0 }}>{u.country} · {u.mode}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: pill.bg, color: pill.color }}>{pill.label}</span>
                    <span style={{ fontSize: 11, color: '#656a73', flexShrink: 0 }}>{u.createdAt}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#656a73', textAlign: 'center', padding: '12px 0' }}>Aucun utilisateur récent</p>
          )}
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#656a73', marginBottom: 8 }}>📋 Activité système récente</p>
        <div style={card}>
          {logs.length > 0 ? (
            <div>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < logs.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: actionDotColors[log.action] || '#656a73' }} />
                  <p style={{ fontSize: 12, color: '#a1a5ad', flex: 1, margin: 0 }}>{logDesc(log)}</p>
                  <span style={{ fontSize: 11, color: '#656a73', flexShrink: 0 }}>{timeAgo(log.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#656a73', textAlign: 'center', padding: '12px 0' }}>Aucune activité récente</p>
          )}
        </div>
      </div>
    </div>
  );
}
